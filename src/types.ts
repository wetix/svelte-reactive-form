import type { Readable } from "svelte/store";

export type Fields = Record<string, any>;

export type FieldValue = any;

export type Config = {
  [name: string]:
    | {
        value: FieldValue;
        defaultValue?: FieldValue;
      }
    | Config;
};

export type FormOption = {
  validateOnChange: boolean;
};

export type OnSubmitCallback = (
  data: Record<string, any>,
  errors: { [key: string]: string | boolean },
  e: Event
) => any;

export type NodeElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export type ValidationResult = boolean | string;

export type ValidationFunction = (
  ...args: any[]
) => ValidationResult | Promise<ValidationResult>;

export type Validator = string | ValidationFunction;

export type RuleExpression =
  | string
  | Array<Validator>
  | Record<string, Validator>
  | Record<string, any>;

export type FieldOption = {
  rules?: RuleExpression;
  defaultValue?: any;
  onChange?: (state: FieldState, node: HTMLElement) => void;
};

export interface FormControl {
  register: (path: string, rules: RuleExpression) => Readable<FieldState>;
  unregister: (path: string) => void;
  setValue: (path: string, value: any) => void;
  getValue: (path: string) => any;
  setError: (path: string, values: string[]) => void;
  setTouched: (path: string, state: boolean) => void;
  reset: (values: Fields) => void;
}

declare interface FieldErrors extends Readable<Fields> {}

type UseField = (
  node: HTMLElement,
  opt?: FieldOption
) => { update(v: FieldOption): void; destroy(): void };

export interface Form extends Readable<FormState>, FormControl {
  control: Readable<FormControl>;
  field: UseField;
  errors: FieldErrors;
  validate: any;
  onSubmit: (
    cb: OnSubmitCallback
  ) => (e: Event) => Promise<[Fields, Fields, Event]>;
}

export type FormState = {
  pending: boolean;
  submitting: boolean;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
};

export type FieldState = {
  value: any;
  pending: boolean;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
  errors: string[];
};

export type ValidationRule = {
  name: string;
  validate: (...args: any) => Promise<ValidationResult>;
  params: any[];
};

export type ResetFormOption = {
  errors: boolean;
  dirtyFields: boolean;
};
