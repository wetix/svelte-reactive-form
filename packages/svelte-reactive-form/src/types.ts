import type { Readable, Writable } from "svelte/store";

export type Fields = Record<string, any>;

export type FieldValue = any;

interface Resolver {
  validate(data: any): Promise<any>;
}

export type Config = {
  resolver?: Resolver;
  validateOnChange?: boolean;
};

export type SuccessCallback = (
  data: Record<string, any>,
  // errors: { [key: string]: string | boolean },
  e: Event
) => any;

export type ErrorCallback = (errors: Record<string, any>, e: Event) => any;

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

export type RegisterOption<T> = {
  defaultValue?: T;
  bail?: boolean;
  validateOnMount?: boolean;
  rules?: RuleExpression;
};

export type FieldOption = {
  defaultValue?: any;
  rules?: RuleExpression;
  validateOnMount?: boolean;
  handleChange?: (state: FieldState, node: Element) => void;
};

export interface FormControl {
  register: <T>(
    path: string,
    option?: RegisterOption<T>
  ) => Readable<FieldState>;
  unregister: (path: string) => void;
  setValue: (path: string, value: any) => void;
  getValue: (path: string) => any;
  getValues: () => Record<string, any>;
  setError: (path: string, values: string[]) => void;
  setTouched: (path: string, state: boolean) => void;
  reset: (values?: Fields) => void;
}

declare interface FieldErrors extends Readable<Fields> {}

type UseField = (
  node: HTMLElement,
  option?: FieldOption
) => { update(v: FieldOption): void; destroy(): void };

export interface Form extends Readable<FormState>, FormControl {
  control: Readable<FormControl>;
  field: UseField;
  errors: FieldErrors;
  validate: (
    paths?: string | Array<string>
  ) => Promise<{ valid: boolean; data: object }>;
  onSubmit: (
    success: SuccessCallback,
    error?: ErrorCallback
  ) => (e: Event) => void;
}

export type FormState = {
  pending: boolean;
  submitting: boolean;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
};

export type FieldState = {
  defaultValue: any;
  value: any;
  pending: boolean;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
  errors: string[];
};

export interface FieldStateStore extends Writable<FieldState> {
  destroy(): void;
}

export type ValidationRule = {
  name: string;
  validate: (...args: any) => Promise<ValidationResult>;
  params: any[];
};

export type ResetFormOption = {
  errors: boolean;
  dirtyFields: boolean;
};

export type Field = [FieldStateStore, ValidationRule[]];
