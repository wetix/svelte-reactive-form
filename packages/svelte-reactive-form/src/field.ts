import { get } from "svelte/store";
import type {
  FieldState,
  FieldStateStore,
  ValidationRule,
  ValidationResult,
  FormControl,
} from "./types";

const _debouncePromise = <T>(
  cb: Function,
  ms = 0
): ((...args: any[]) => Promise<T>) => {
  let timer: NodeJS.Timeout;

  return (...args: any[]) => {
    // Run the function after a certain amount of time
    clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(cb(...args)), ms);
    });
  };
};

export class FieldData {
  name: string;
  validators: ValidationRule[];
  store: FieldStateStore;
  timeout?: NodeJS.Timeout;
  bail: boolean = false;
  validate: (ctx: FormControl, newState: Partial<FieldState>) => any;

  constructor(
    name: string,
    store: FieldStateStore,
    validators: ValidationRule[]
  ) {
    this.name = name;
    this.store = store;
    this.validators = validators;
    this.validate = _debouncePromise(this._validate.bind(this), 100);
  }

  private _validate(ctx: FormControl, newState: Partial<FieldState>) {
    const promises: Promise<ValidationResult>[] = [];

    let state = get(this.store);
    state = Object.assign(state, newState);
    const { value } = state;
    const len = this.validators.length;
    if (len === 0) {
      state = Object.assign(state, { errors: [], valid: true });
      this.store.set(state);
      return Promise.resolve(state);
    }

    this.store.set(
      Object.assign(state, {
        // dirty: v.dirty ? true : soft ? false : true,
        errors: [],
        pending: true,
        value,
      })
    );

    let i = 0;
    for (i = 0; i < len; i++) {
      const { validate, params } = this.validators[i];
      promises.push(validate(value, params, ctx));
    }

    if (this.bail) {
      return new Promise(async (resolve) => {
        for (i = 0; i < len; i++) {
          const result = await promises[i];
          if (typeof result === "string") {
            this.store.update((v: FieldState) =>
              Object.assign(v, {
                pending: false,
                errors: [result],
                valid: false,
              })
            );
            resolve(<FieldState>get(this.store));
            return;
          }
        }

        this.store.update((v: FieldState) =>
          Object.assign(v, {
            pending: false,
            errors: [],
            valid: true,
          })
        );
        resolve(<FieldState>get(this.store));
      });
    }

    return Promise.all(promises).then((result: ValidationResult[]) => {
      const errors = <string[]>(
        result.filter((v: ValidationResult) => v !== true)
      );

      const valid = errors.length === 0;
      this.store.update((v: FieldState) =>
        Object.assign(v, { pending: false, errors, valid })
      );

      return Promise.resolve(<FieldState>get(this.store));
    });
  }

  destroy() {
    this.validators = [];
    this.store.destroy();
  }
}
