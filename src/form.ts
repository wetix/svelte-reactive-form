import { writable, get, readable } from "svelte/store";
import type { Readable } from "svelte/store";

import { resolveRule } from "./rule";
import toPromise from "./to_promise";
import type {
  Config,
  FieldState,
  FieldOption,
  ValidationRule,
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
  FieldStateStore,
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
  const escape = name.match(/^\[(.*)\]$/);
  const queue: [[object, Array<string>]] = [
    [data, escape ? [escape[1]] : name.split(".")],
  ];
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
      if (!first[0][name]) {
        first[0][name] = {};
      }
      queue.push([first[0][name], paths]);
    }
  }

  return data;
};

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

export const useForm = (config: Config = { validateOnChange: true }): Form => {
  // cache for form fields
  const cache: Map<string, [FieldStateStore, ValidationRule[]]> = new Map();

  // global state for form
  const form$ = writable<FormState>(Object.assign({}, defaultFormState));

  // errors should be private variable
  const errors$ = writable<Record<string, any>>({});

  const _useLocalStore = (path: string, state: object) => {
    const { subscribe, set, update } = writable<FieldState>(
      Object.assign({}, defaultFieldState, state)
    );

    let unsubscribe;
    return {
      set,
      update,
      destroy() {
        unsubscribe && unsubscribe();
        cache.delete(path); // clean our cache
      },
      subscribe(
        run: (value: FieldState) => void,
        invalidate?: (value?: FieldState) => void
      ) {
        unsubscribe = subscribe(run, invalidate);
        return () => {
          // prevent memory leak
          unsubscribe();
        };
      },
    };
  };

  const _setStore = (path: string, state: object = {}) => {
    const store$ = _useLocalStore(path, state);
    cache.set(path, [store$, []]);
  };

  const register = <T>(
    path: string,
    option: RegisterOption<T> = {}
  ): Readable<FieldState> => {
    const value = option.defaultValue || "";
    const store$ = _useLocalStore(path, {
      defaultValue: value,
      value,
    });

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
      subscribe: store$.subscribe,
    };
  };

  const unregister = (path: string) => {
    if (cache.has(path)) {
      // clear subscriptions and cache
      cache.get(path)[0].destroy();
      setTimeout(() => {
        cache.delete(path);
      }, 0);
    }
  };

  const setValue = <T>(path: string, value: T): void => {
    if (cache.has(path)) {
      const [store$, validators] = cache.get(path);
      if (config.validateOnChange && validators.length > 0) {
        _validate(path, value);
      } else {
        store$.update((v) => Object.assign(v, { dirty: true, value }));
      }
    } else {
      _setStore(path);
    }
  };

  const setError = (path: string, errors: string[]): void => {
    if (cache.has(path)) {
      const [store$] = cache.get(path);
      store$.update((v: FieldState) => Object.assign(v, { errors }));
    } else {
      _setStore(path, { errors });
    }
    // update field errors
    errors$.update((v) => {
      if (errors.length === 0) {
        if (v[path]) delete v[path];
        if (Object.keys(v).length === 0)
          form$.update((v) => Object.assign(v, { valid: true }));
        return v;
      }

      form$.update((v) => Object.assign(v, { valid: false }));
      return Object.assign(v, { [path]: errors });
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
      return <T>state.value;
    }
    return null;
  };

  const _useField = (node: NodeElement, option: FieldOption = {}) => {
    option = Object.assign({ rules: [], defaultValue: "" }, option);
    const selector = fields.join(",");
    while (!fields.includes(node.nodeName)) {
      const el = <NodeElement>node.querySelector(selector);
      node = el;
      if (el) break;
    }
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
    if (config.validateOnChange) {
      _attachEvent("input", onChange);
      _attachEvent("change", onChange);
    }

    let unsubscribe;
    if (option.handleChange) {
      unsubscribe = state$.subscribe((v: FieldState) => {
        option.handleChange(v, node);
      });
    }

    return {
      destroy() {
        _detachEvents();
        unregister(name);
        unsubscribe && unsubscribe();
      },
    };
  };

  const reset = (values: Fields, option?: ResetFormOption) => {
    const defaultOption = {
      dirtyFields: false,
      errors: false,
    };
    option = Object.assign(defaultOption, option || {});
    if (option.errors) {
      errors$.set({}); // reset errors
    }
    const fields = Array.from(cache.values());
    for (let i = 0, len = fields.length; i < len; i++) {
      const [store$, _] = fields[i];
      store$.update((v) => {
        const { defaultValue } = v;
        return Object.assign({}, defaultFieldState, {
          defaultValue,
          value: defaultValue,
        });
      });
    }
  };

  const useField = (node: NodeElement, option: FieldOption = {}) => {
    let field = _useField(node, option);

    return {
      update(newOption: FieldOption = {}) {
        field.destroy();
        field = _useField(node, newOption);
      },
      destroy() {
        field.destroy();
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
    errors$.set({}); // reset errors
    let data = {},
      valid = true;
    const { elements = [] } = <HTMLFormElement>e.currentTarget;
    for (let i = 0, len = elements.length; i < len; i++) {
      const name = elements[i].name || elements[i].id;
      let value = elements[i].value || "";
      if (!name) continue;
      if (config.resolver) {
        data = _normalizeObject(data, name, value);
        continue;
      }
      // TODO: shouldn't only loop elements, should check cache keys which not exists in elements as well
      if (cache.has(name)) {
        const store = cache.get(name);
        // TODO: check checkbox and radio
        const { nodeName, type } = elements[i];
        switch (type) {
          case "checkbox":
            value = elements[i].checked ? value : "";
            break;
        }

        const result = await _validate(name, value);
        valid = valid && result.valid; // update valid
      }
    }

    if (config.resolver) {
      try {
        await config.resolver.validate(data);
      } catch (e) {
        valid = false;
        errors$.set(<Record<string, any>>e);
      }
    }

    if (valid) {
      await toPromise<void>(successCallback)(data, e);
    } else {
      errorCallback && errorCallback(get(errors$), e);
    }

    // submitting should end only after execute user callback
    form$.update((v) => Object.assign(v, { valid, submitting: false }));
  };

  const _validate = (path: string, value: any): Promise<FieldState> => {
    const promises: Promise<ValidationResult>[] = [];
    if (cache.has(path)) {
      const [store$, validators] = cache.get(path);
      let state = get(store$);

      if (validators.length === 0) {
        state = Object.assign(state, { errors: [], valid: true });
        store$.set(state);
        return Promise.resolve(state);
      }
      form$.update((v) => Object.assign(v, { pending: true, valid: false }));
      store$.update((v: FieldState) =>
        Object.assign(v, { errors: [], dirty: true, pending: true, value })
      );

      for (let i = 0, len = validators.length; i < len; i++) {
        const { validate, params } = validators[i];
        promises.push(validate(value, params));
      }

      return Promise.all(promises).then((result: ValidationResult[]) => {
        const errors = <string[]>(
          result.filter((v: ValidationResult) => v !== true)
        );
        const valid = errors.length === 0;
        store$.update((v: FieldState) =>
          Object.assign(v, { pending: false, errors, valid })
        );
        setError(path, errors);
        return get(store$);
      });
    }
  };

  const validate = (paths: string | string[] = Array.from(cache.keys())) => {
    if (!Array.isArray(paths)) paths = [paths];
    const promises: Promise<FieldState>[] = [];

    let data = {};
    for (let i = 0, len = paths.length; i < len; i++) {
      if (!cache.has(paths[i])) continue;
      const [store$] = cache.get(paths[i]);
      const state = get(store$);
      promises.push(_validate(paths[i], state.value));
      _normalizeObject(data, paths[i], state.value);
    }

    return Promise.all(promises).then((v: FieldState[]) => {
      return {
        valid: v.every((v) => v.valid),
        data,
      };
    });
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
