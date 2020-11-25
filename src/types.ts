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

export type Form = {
  control: object;
  register: (path: string, rules: RuleExpression) => Readable<FieldState>;
  setValue: (path: string, value: any) => void;
  setTouched: (path: string, state: boolean) => void;
  reset: (values: Fields) => void;
};

export type FormState = {
  pending: boolean;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
};

export type FieldOption = {
  rules: RuleExpression;
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
