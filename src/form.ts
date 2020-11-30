import { writable, get, readable } from "svelte/store";
import type { Writable } from "svelte/store";

import { resolveRule } from "./rule";
import { isObject } from "./assertions";
import toPromise from "./to_promise";
import type {
  Config,
  FieldState,
  FieldOption,
  ValidationRule,
  FormOption,
  SuccessCallback,
  FormState,
  ValidationResult,
  ResetFormOption,
  FormControl,
  Form,
  Fields,
  NodeElement,
  RegisterOption,
  ErrorCallback,
} from "./types";

const defaultFormState = {
  dirty: false,
  submitting: false,
  touched: false,
  pending: false,
  valid: false,
};

const defaultFieldState = {
  defaultValue: "",
  value: "",
  pending: false,
  dirty: false,
  touched: false,
  valid: false,
  errors: [],
};

const fields = ["INPUT", "SELECT", "TEXTAREA"];

// TODO: test case for _normalizeObject
const _normalizeObject = (data: object, name: string, value: any) => {
  const queue: [[object, Array<string>]] = [[data, name.split(".")]];
  while (queue.length > 0) {
    const first = queue.shift();
    const paths = first[1];
    const name = paths.shift();
    const result = name.match(/^([a-z\_\.]+)((\[\d+\])+)/i);

    if (result && result.length > 2) {
      const name = result[1];
      // if it's not array, assign it and make it as array
      if (!Array.isArray(first[0][name])) {
        first[0][name] = [];
      }
      let cur = first[0][name];
      const indexs = result[2].replace(/^\[+|\]+$/g, "").split("][");
      while (indexs.length > 0) {
        const index = parseInt(indexs.shift(), 10);
        // if nested index is last position && parent is last position
        if (indexs.length === 0) {
          if (paths.length === 0) {
            cur[index] = value;
          } else {
            if (!cur[index]) {
              cur[index] = {};
            }
          }
        } else if (!cur[index]) {
          // set to empty array if it's undefined
          cur[index] = [];
        }
        cur = cur[index];
      }

      if (paths.length > 0) {
        queue.push([cur, paths]);
      }

      continue;
    }

    if (paths.length === 0) {
      first[0][name] = value;
    } else {
      first[0][name] = {};
      queue.push([first[0][name], paths]);
    }
  }

  return data;
};

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

  const register = <T>(path: string, option: RegisterOption<T> = {}) => {
    const value = option.defaultValue || "";
    const store$ = writable<FieldState>(
      Object.assign({}, defaultFieldState, {
        defaultValue: value,
        value,
      })
    );

    let ruleExprs: ValidationRule[] = [];
    const { rules = [] } = option;
    const typeOfRule = typeof rules;
    if (typeOfRule === "string") {
      ruleExprs = (rules as string)
        .split("|")
        .map((v: string) => _strToValidator(v));
    } else if (Array.isArray(rules)) {
      ruleExprs = rules.reduce((acc: ValidationRule[], rule: any) => {
        const typeOfVal = typeof rule;
        if (typeOfVal === "string") {
          acc.push(_strToValidator(<string>rule));
        } else if (typeOfVal === "function") {
          rule = rule as Function;
          if (rule.name === "")
            console.error(
              "[svelte-reactive-form] validation rule function name is empty"
            );
          acc.push({
            name: rule.name,
            validate: toPromise<boolean | string>(<Function>rule),
            params: [],
          });
        }
        return acc;
      }, []);
    } else if (typeOfRule !== null && typeOfRule === "object") {
      ruleExprs = Object.entries(<object>rules).reduce(
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

  const setValue = <T>(path: string, value: T) => {
    if (cache.has(path)) {
      const [store$, validators] = cache.get(path);
      if (opts.validateOnChange && validators.length > 0) {
        form$.update((v) => Object.assign(v, { pending: true, valid: false }));
        const promises: Promise<ValidationResult>[] = [];
        store$.update((v: FieldState) =>
          Object.assign(v, { errors: [], dirty: true, pending: true, value })
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
      // FIXME: prevent memory leak
      cache.set(path, [
        writable<FieldState>(Object.assign({}, defaultFieldState)),
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

  const useField = (node: NodeElement, option: FieldOption = {}) => {
    option = Object.assign({ rules: [], defaultValue: "" }, option);
    const selector = fields.join(",");
    while (!fields.includes(node.nodeName)) {
      const el = <NodeElement>node.querySelector(selector);
      node = el;
      if (el) break;
    }
    const { nodeName } = node;
    const name = node.name || node.id;
    if (name === "") console.error("[svelte-reactive-form] empty field name");

    const { defaultValue, rules } = option;
    const state$ = register(name, { defaultValue, rules });
    const onChange = (e: Event) => {
      setValue(name, (<HTMLInputElement>e.currentTarget).value);
    };
    const onBlur = (_: Event) => {
      setTouched(name, true);
    };

    if (defaultValue) {
      node.setAttribute("value", defaultValue);
    }
    const listeners: Array<[string, (e: Event) => void]> = [];
    const _attachEvent = (
      event: string,
      cb: (e: Event) => void,
      opts?: object
    ) => {
      node.addEventListener(event, cb, opts);
      listeners.push([event, cb]);
    };

    const _detachEvents = () => {
      for (let i = 0, len = listeners.length; i < len; i++) {
        const [event, cb] = listeners[i];
        node.removeEventListener(event, cb);
      }
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
      update(newOption: FieldOption = {}) {
        // if option updated, re-register the validation rules
        register(name, {
          defaultValue: newOption.defaultValue || "",
          rules: newOption.rules,
        });
      },
      destroy() {
        _detachEvents();
        unregister(name);
        unsubscribe && unsubscribe();
      },
    };
  };

  const onSubmit = (
    successCallback: SuccessCallback,
    errorCallback?: ErrorCallback
  ) => async (e: Event) => {
    form$.update((v) => Object.assign(v, { submitting: true }));
    e.preventDefault();
    e.stopPropagation();
    let data = {},
      // TODO: errors
      // errors = [],
      valid = true;
    const { elements = [] } = <HTMLFormElement>e.currentTarget;
    for (let i = 0, len = elements.length; i < len; i++) {
      const name = elements[i].name || elements[i].id;
      if (!name) continue;
      // TODO: shouldn't only loop elements, should check cache keys which not exists in elements as well
      if (cache.has(name)) {
        // TODO: check checkbox and radio
        let { nodeName, type, value } = elements[i];
        switch (type) {
          case "checkbox":
            value = elements[i].checked ? value : "";
            break;
        }
        data = _normalizeObject(data, name, value);
        const result = await _validate(name, value);
        valid = valid && result.valid; // update valid
      }
    }

    if (valid) {
      await toPromise<void>(successCallback(data, e));
    } else {
      errorCallback && errorCallback(get(errors$), e);
    }

    // submitting should end only after execute user callback
    form$.update((v) => Object.assign(v, { submitting: false }));
  };

  const _validate = (name: string, value: any): Promise<any> => {
    const promises: Promise<ValidationResult>[] = [];
    const [store$, validators] = cache.get(name);
    // const state$ = get(store$);
    // if (!state$.dirty) {
    //   return Promise.resolve();
    // }
    store$.update((v: FieldState) =>
      Object.assign(v, { errors: [], dirty: true, pending: true, value })
    );
    for (let i = 0, len = validators.length; i < len; i++) {
      const { validate, params } = validators[i];
      promises.push(validate(value, params));
    }
    return Promise.all(promises)
      .then((result: ValidationResult[]) => {
        const errors = <string[]>(
          result.filter((v: ValidationResult) => v !== true)
        );
        const valid = errors.length === 0;
        store$.update((v: FieldState) =>
          Object.assign(v, { pending: false, valid, errors })
        );
        setError(name, errors);
        return Promise.resolve({ valid, errors });
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

  const reset = (values: Fields, option?: ResetFormOption) => {
    const defaultOption = {
      dirtyFields: false,
      errors: false,
    };
    if (option) {
      option = Object.assign(defaultOption, option);
      if (!option.errors) {
        errors$.update((v) => Object.assign(v, {})); // reset errors
      }
      const fields = Array.from(cache.keys());
      form$.set(Object.assign({}, defaultFormState));
      for (let i = 0; i < fields.length; i += 1) {
        const [store$, _] = cache.get(fields[i]);
        const state$ = get(store$);
        // FIX: bug, value is not reseting
        store$.set(
          Object.assign({}, defaultFieldState, {
            errors: option.errors ? state$.errors : [],
            value:
              option.dirtyFields && state$.dirty
                ? state$.value
                : values[fields[i]],
          })
        );
      }
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
