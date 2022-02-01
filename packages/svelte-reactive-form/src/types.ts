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

export type ErrorCallback = (errors: Record<string, any>, e: Event) => any;

export type NodeElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

type Success = true;
type Error = string;
export type ValidationResult = Success | Error;

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
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
  rules?: RuleExpression;
};

export type FieldOption = {
  defaultValue?: any;
  rules?: RuleExpression;
  validateOnMount?: boolean;
  handleChange?: (state: FieldState, node: Element) => void;
};

export interface FormControl<F = Record<string, any>> {
  register: <T>(path: string, option?: RegisterOption<T>) => Readable<FieldState>;
  unregister: (path: string) => void;
  setValue: (e: Event | string, val?: any) => void;
  getValue: (path: string) => any;
  getValues: () => F;
  setError: (path: string, values: string[]) => void;
  setTouched: (path: string, state: boolean) => void;
  reset: (values?: Fields) => void;
}

type FieldErrors = Readable<Fields>;

type UseField = (
  node: HTMLElement,
  option?: FieldOption
) => { update(v: FieldOption): void; destroy(): void };

export interface Form<T> extends Readable<FormState>, FormControl<T> {
  control: Readable<FormControl<T>>;
  field: UseField;
  errors: FieldErrors;
  validate: (paths?: string | Array<string>) => Promise<{ valid: boolean; data: T }>;
  onSubmit: (
    success: (data: T, e: Event) => void,
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
  validate: <T>(
    value: any,
    params?: string[],
    ctx?: FormControl<T>
  ) => Promise<ValidationResult>;
  params: any[];
};

export type ResetFormOption = {
  errors: boolean;
  dirtyFields: boolean;
};

export type Field = [FieldStateStore, ValidationRule[], { bail: boolean }];
