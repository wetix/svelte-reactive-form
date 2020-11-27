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
  FormControl,
  Form,
  Fields,
  NodeElement,
} from "./types";

const defaultFormState = {
  dirty: false,
  submitting: false,
  touched: false,
  pending: false,
  valid: false,
};

const defaultFieldState = {
  value: "",
  pending: false,
  dirty: false,
  touched: false,
  valid: false,
  errors: [],
};

const fields = ["INPUT", "SELECT", "TEXTAREA"];

export const useForm = (
  config: Config = {},
  opts: FormOption = { validateOnChange: false }
): Form => {
  // cache for form fields
  const cache: Map<
    string,
    [Writable<FieldState>, ValidationRule[]]
  > = new Map();

  // global state for form
  const form$ = writable<FormState>(Object.assign({}, defaultFormState));

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
    const store$ = writable<FieldState>(
      Object.assign(defaultFieldState, {
        value: "",
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
      subscribe(
        run: (value: FieldState) => void,
        invalidate?: (value?: FieldState) => void
      ) {
        const unsubscribe = store$.subscribe(run, invalidate);
        return () => {
          // prevent memory leak
          unsubscribe();
          cache.delete(path); // clean our cache
        };
      },
    };
  };

  const unregister = (path: string) => {
    if (cache.has(path)) {
      // TODO: clear subscribe pipe
      cache.delete(path);
    }
  };

  const setValue = (path: string, value: any) => {
    if (cache.has(path)) {
      const [store$, validators] = cache.get(path);
      if (opts.validateOnChange && validators.length > 0) {
        form$.update((v) => Object.assign(v, { pending: true, valid: false }));
        const promises: Promise<ValidationResult>[] = [];
        store$.update((v: FieldState) =>
          Object.assign(v, { dirty: true, pending: true, value })
        );
        for (let i = 0, len = validators.length; i < len; i++) {
          const { validate, params } = validators[i];
          promises.push(validate(value, params));
        }
        Promise.all(promises).then((result: ValidationResult[]) => {
          const errors = <string[]>(
            result.filter((v: ValidationResult) => v !== true)
          );
          const valid = errors.length === 0;
          store$.update((v: FieldState) =>
            Object.assign(v, { pending: false, errors, valid })
          );
          setError(path, errors);
        });
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
    errors$.update((v) => {
      if (values.length === 0) {
        if (v[path]) delete v[path];
        if (Object.keys(v).length === 0)
          form$.update((v) => Object.assign(v, { valid: true }));
        return v;
      }

      form$.update((v) => Object.assign(v, { valid: false }));
      return Object.assign(v, { [path]: values });
    });
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

  const useField = (node: NodeElement, option?: FieldOption) => {
    option = Object.assign({ rules: [], defaultValue: "" }, option);
    // const parentNode = node;
    const selector = fields.join(",");
    while (!fields.includes(node.nodeName)) {
      // TODO: change to select, textarea etc
      const el = <NodeElement>node.querySelector(selector);
      node = el;
      if (el) break;
    }
    const { name, nodeName } = node;
    if (name === "") console.error("[svelte-reactive-form] empty field name");
    const state$ = register(node.name, option.rules);

    const onChange = (e: Event) => {
      setValue(name, (<HTMLInputElement>e.currentTarget).value);
    };
    const onBlur = (e: Event) => {
      setTouched(node.name, true);
    };

    const listeners: Array<[string, any]> = [];
    const _attachEvent = (
      event: string,
      cb: (e: Event) => void,
      opts?: any
    ) => {
      node.addEventListener(event, cb, opts);
      listeners.push([event, cb]);
    };

    _attachEvent("blur", onBlur, { once: true });
    if (opts.validateOnChange) {
      if (["INPUT", "TEXTAREA"].includes(nodeName))
        _attachEvent("input", onChange);
      else if (nodeName === "SELECT") _attachEvent("change", onChange);
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
        register(name, v.rules);
      },
      destroy() {
        unregister(name);
        for (let i = 0, len = listeners.length; i < len; i++) {
          const [event, cb] = listeners[i];
          node.removeEventListener(event, cb);
        }
        unsubscribe && unsubscribe();
      },
    };
  };

  const onSubmit = (cb: OnSubmitCallback) => async (e: Event) => {
    form$.update((v) => Object.assign(v, { submitting: true }));
    e.preventDefault();
    e.stopPropagation();
    let data = {};
    const { elements = [] } = <HTMLFormElement>e.currentTarget;
    for (let i = 0, len = elements.length; i < len; i++) {
      const { name, value } = elements[i];
      if (!name) continue;
      if (cache.has(name)) {
        data[name] = value;
        await _validate(name, value);
      }
    }
    form$.update((v) => Object.assign(v, { submitting: false }));
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

  const reset = (values: Fields, opts?: ResetFormOption) => {
    const options = Object.assign(opts, {
      dirtyFields: false,
      errors: false,
    });
    if (!options.errors) {
      errors$.update((v) => Object.assign(v, {})); // reset errors
    }
    form$.set(Object.assign({}, defaultFormState));
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
    control: readable<FormControl>(
      {
        register,
        unregister,
        setValue,
        getValue,
        setError,
        setTouched,
        reset,
      },
      () => {}
    ),
    subscribe(
      run: (value: FormState) => void,
      invalidate?: (value?: FormState) => void
    ) {
      const unsubscribe = form$.subscribe(run, invalidate);
      return () => {
        // prevent memory leak
        unsubscribe();
        cache.clear(); // clean our cache
      };
    },
    errors: {
      subscribe: errors$.subscribe,
    },
    field: useField,
    register,
    unregister,
    setValue,
    getValue,
    setError,
    setTouched,
    onSubmit,
    reset,
    validate,
  };
};
