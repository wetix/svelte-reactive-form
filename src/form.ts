import { writable, get, readable } from "svelte/store";
import type { Writable } from "svelte/store";

import { resolveRule } from "./rule";
import { isObject } from "./assertions";
import toPromise from "./to_promise";
import type {
  Config,
  FieldState,
  FieldOption,
  RuleExpression,
  ValidationRule,
  FormOption,
  OnSubmitCallback,
  FormState,
  ValidationResult,
  ResetFormOption,
} from "./types";

const defaultFieldState = {
  value: "",
  pending: false,
  dirty: false,
  touched: false,
  valid: false,
  errors: [],
};

export const useForm = (
  config?: Config,
  opts: FormOption = { validateOnChange: false }
) => {
  // cache for form fields
  const cache: Map<
    string,
    [Writable<FieldState>, ValidationRule[]]
  > = new Map();

  // global state for form
  const form$ = writable<FormState>({
    dirty: false,
    touched: false,
    pending: false,
    valid: false,
  });

  // errors should be private variable
  const errors$ = writable<Record<string, any>>({});

  const _flattenObject = (obj: object, path: string | null = null): object =>
    Object.keys(obj).reduce((acc: object, key: string, idx: number) => {
      const newPath = [path, key].filter(Boolean).join(".");
      return isObject(obj?.[key])
        ? { ...acc, ..._flattenObject(obj[key], newPath) }
        : { ...acc, [newPath]: obj[key] };
    }, {});

  const flatCfg = _flattenObject(config);
  console.log("config =>", flatCfg);

  const _strToValidator = (rule: string): ValidationRule => {
    const params = rule.split(/:/g);
    const ruleName = params.shift();
    if (!resolveRule(ruleName))
      console.error(
        `[svelte-reactive-form] invalid validation function "${ruleName}"`
      );
    return {
      name: ruleName,
      validate: toPromise<boolean | string>(resolveRule(ruleName)),
      params: params[0] ? params[0].split(",") : [],
    };
  };

  const register = (path: string, rules: RuleExpression) => {
    // FIXME: Accept more indexes instead of hardcoded
    const newPath = path.split(/\[\d+\]$/)[0];
    const idx = parseFloat(path.split(/\[(.*?)\]/)[1]);
    const value = isNaN(idx) ? flatCfg[newPath] : flatCfg[newPath][idx];
    const store$ = writable<FieldState>(
      Object.assign(defaultFieldState, {
        value: value || "",
      })
    );

    let ruleExprs: ValidationRule[] = [];
    const typeOfRule = typeof rules;
    if (typeOfRule === "string") {
      ruleExprs = (rules as string)
        .split("|")
        .map((v: string) => _strToValidator(v));
    } else if (Array.isArray(rules)) {
      ruleExprs = rules.reduce((acc: ValidationRule[], rule: any) => {
        const typeOfVal = typeof rule;
        if (typeOfVal === "string") {
          acc.push(_strToValidator(rule as string));
        } else if (typeOfVal === "function") {
          rule = rule as Function;
          if (rule.name === "")
            console.error(
              "[svelte-reactive-form] validation rule function name is empty"
            );
          acc.push({
            name: rule.name,
            validate: toPromise<boolean | string>(rule as Function),
            params: [],
          });
        }
        return acc;
      }, []);
    } else if (typeOfRule !== null && typeOfRule === "object") {
      ruleExprs = Object.entries(rules as object).reduce(
        (acc: ValidationRule[], cur: [string, any]) => {
          const [ruleName, params] = cur;
          acc.push({
            name: ruleName,
            validate: toPromise<boolean | string>(resolveRule(ruleName)),
            params: Array.isArray(params) ? params : [params],
          });
          return acc;
        },
        []
      );
    } else {
      console.error(
        `[svelte-reactive-form] invalid data type for validation rule ${typeOfRule}`
      );
    }

    cache.set(path, [store$, ruleExprs]);

    return {
      setValue: (value) => {
        setValue(path, value);
      },
      subscribe: store$.subscribe,
    };
  };

  const unregister = (path: string) => {
    if (cache.has(path)) {
      // TODO: clear subscribe pipe
      cache.delete(path);
    }
  };

  const setValue = (path: string, value: any): void => {
    if (cache.has(path)) {
      const [store$, validators] = cache.get(path);
      if (opts.validateOnChange && validators.length > 0) {
        _validate(path, value);
      } else {
        store$.update((v) => Object.assign(v, { dirty: true, value }));
      }
    } else {
      cache.set(path, [
        writable<FieldState>(
          Object.assign(defaultFieldState, {
            dirty: true,
            valid: true,
            value,
          })
        ),
        [],
      ]);
    }
  };

  const setError = (path: string, values: string[]) => {
    errors$.update((v) => Object.assign(v, { [path]: values }));
  };

  const setTouched = (path: string, touched: boolean): void => {
    if (cache.has(path)) {
      const [store$, _] = cache.get(path);
      store$.update((v) => Object.assign(v, { touched }));
    }
  };

  const getValue = <T>(path: string): T | null => {
    if (cache.has(path)) {
      const [store$, _] = cache.get(path);
      const state = get<FieldState>(store$);
      return state.value as T;
    }
    return null;
  };

  const useField = (node: HTMLInputElement, option: FieldOption) => {
    option = Object.assign({ rules: [], defaultValue: "" }, option);
    // const parentNode = node;
    while (!["input", "select", "textarea"].includes(node.type)) {
      // TODO: change to select, textarea etc
      const nodes = node.getElementsByTagName("input");
      if (nodes.length == 0) break;
      node = nodes[0];
    }
    const { name } = node;
    if (name === "") console.error("[svelte-reactive-form] empty field name");
    const state$ = register(node.name, option.rules);

    let onChange = (e: Event) => {
      setValue(name, (e.currentTarget as HTMLInputElement).value);
    };
    let onBlur = (e: Event) => {};

    if (cache.has(node.name)) {
      const [store$, _] = cache.get(node.name);
      onChange = (e: Event) => {
        // store$.update((v) => Object.assign(v, { dirty: true }));
        setValue(name, (e.currentTarget as HTMLInputElement).value);
      };

      onBlur = (e: Event) => {
        // setTouched(node.name, true);
      };

      node.addEventListener("blur", onBlur, { once: true });

      if (
        opts.validateOnChange &&
        (node.nodeName === "INPUT" || node.nodeName === "TEXTAREA")
      ) {
        node.addEventListener("input", onChange);
      } else if (opts.validateOnChange && node.nodeName === "SELECT") {
        node.addEventListener("change", onChange);
      }
    }

    let unsubscribe;
    if (option.onChange) {
      unsubscribe = state$.subscribe((v: FieldState) => {
        option.onChange(v, node);
      });
    }

    return {
      update(v: FieldOption) {
        // if option updated, re-register the validation rules
        register(node.name, v.rules);
      },
      destroy() {
        node.removeEventListener("change", onChange);
        node.removeEventListener("input", onChange);
        node.removeEventListener("blur", onBlur);
        unsubscribe && unsubscribe();
      },
    };
  };

  const onSubmit = (cb: OnSubmitCallback) => async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    let data = {};
    const { elements = [] } = e.currentTarget as HTMLFormElement;
    for (let i = 0, len = elements.length; i < len; i++) {
      const { name, value } = elements[i];
      if (!name) continue;
      if (cache.has(name)) {
        data[name] = value;
        await _validate(name, value);
      }
    }
    return cb(data, get(errors$), e);
  };

  const _validate = (name: string, value: any): Promise<any> => {
    const promises: Promise<ValidationResult>[] = [];
    const [store$, validators] = cache.get(name);
    // const state$ = get(store$);
    // if (!state$.dirty) {
    //   return Promise.resolve();
    // }
    store$.update((v: FieldState) =>
      Object.assign(v, { dirty: true, pending: true, value })
    );
    for (let i = 0, len = validators.length; i < len; i++) {
      const { validate, params } = validators[i];
      promises.push(validate(value, params));
    }
    return Promise.all(promises)
      .then((result: ValidationResult[]) => {
        const errors = result.filter(
          (v: ValidationResult) => v !== true
        ) as string[];
        const valid = errors.length === 0;
        store$.update((v: FieldState) =>
          Object.assign(v, { pending: false, valid, errors })
        );
        setError(name, errors);
      })
      .catch(() => {
        store$.update((v) => Object.assign(v, { pending: false }));
      });
  };

  const validate = async (name?: string | string[]) =>
    new Promise(async (resolve) => {
      const fields = name || Array.from(cache.keys());
      let value: any;
      if (Array.isArray(fields)) {
        const data = {};
        for (let i = 0; i < fields.length; i += 1) {
          value = getValue(fields[i]);
          data[fields[i]] = value;
          if (value !== null) {
            await _validate(fields[i], value);
          }
        }

        return resolve({ data, errors: get(errors$) });
      }
      value = getValue(fields);
      if (value !== null) {
        await _validate(fields, value);
      }
      return resolve({ data: { [fields]: value }, errors: get(errors$) });
    });

  const reset = (values: Record<string, any>, opts?: ResetFormOption) => {
    const options = Object.assign(opts, {
      dirtyFields: false,
      errors: false,
    });
    if (!options.errors) {
      errors$.update((v) => Object.assign(v, {})); // reset errors
    }
    form$.set({
      dirty: false,
      touched: false,
      pending: false,
      valid: false,
    });
    const fields = Array.from(cache.keys());
    for (let i = 0; i < fields.length; i += 1) {
      const [store$, _] = cache.get(fields[i]);
      const state$ = get(store$);
      store$.set(
        Object.assign(defaultFieldState, {
          errors: options.errors ? state$.errors : [],
          value:
            options.dirtyFields && state$.dirty
              ? state$.value
              : values[fields[i]],
        })
      );
    }
  };

  return {
    control: readable(
      {
        register,
        setValue,
        getValue,
        setError,
        reset,
        validate,
        onSubmit,
        setTouched,
      },
      () => {}
    ),
    subscribe: form$.subscribe,
    errors: {
      subscribe: errors$.subscribe,
    },
    field: useField,
    register,
    unregister,
    getValue,
    onSubmit,
    setValue,
    setError,
    reset,
    validate,
    setTouched,
  };
};
