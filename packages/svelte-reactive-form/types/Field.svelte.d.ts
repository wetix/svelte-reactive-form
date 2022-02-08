import type { SvelteComponentTyped } from "svelte";
import type { Readable } from "svelte/store";
import type { RuleExpression, FormControl } from "./types";

type FieldProps = {
  name: string;
  control: Readable<FormControl>;
  validateOnMount?: boolean;
  bail?: boolean;
  defaultValue?: any;
  rules?: RuleExpression;
  type?: "none" | "hidden" | "text";
};

type FieldSlot = {
  default: {
    pending: boolean;
    valid: boolean;
    errors: string[];
    dirty: boolean;
    touched: boolean;
    value: any;
    onChange(e: Event | CustomEvent | any): void;
    onFocus(): void;
    onBlur(): void;
  };
};

declare class Field extends SvelteComponentTyped<FieldProps, {}, FieldSlot> {}

export default Field;
