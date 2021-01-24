import type { SvelteComponentTyped } from "svelte";
import type { Readable } from "svelte/store";
import { useForm } from "./form";
import type { RuleExpression, FormControl } from "./types";
import { defineRule, resolveRule } from "./rule";

type FieldProps = {
  name: string;
  control: Readable<FormControl>;
  validateOnMount?: false;
  defaultValue?: any;
  rules?: RuleExpression;
  type?: "hidden" | "text";
};

type FieldSlot = {
  default: {
    pending: boolean;
    valid: boolean;
    errors: string[];
    dirty: boolean;
    touched: boolean;
    value: any;
    onChange:
      | ((e: Event) => void | {})
      | ((e: CustomEvent) => void | {})
      | ((e: any) => void | {});
    onBlur: ((v: any) => void) | void;
  };
};

declare class Field extends SvelteComponentTyped<FieldProps, {}, FieldSlot> {}

export { useForm, Field, defineRule, resolveRule };
