import type { SvelteComponentTyped } from "svelte";
import type { Readable } from "svelte/store";
import { useForm } from "./form";
import type { RuleExpression, FormControl } from "./types";
import { defineRule, resolveRule } from "./rule";

type FieldProps = {
  name: string;
  control: Readable<FormControl>;
  defaultValue?: any;
  rules?: RuleExpression;
  type?: "hidden" | "text";
};

type FieldSlot = {
  default: {};
};

declare class Field extends SvelteComponentTyped<FieldProps, {}, FieldSlot> {}

export { useForm, Field, defineRule, resolveRule };
