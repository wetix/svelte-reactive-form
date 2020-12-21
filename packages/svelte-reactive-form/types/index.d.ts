import type { SvelteComponentTyped } from "svelte";
import type { Readable } from "svelte/store";
import type { useForm } from "./form";
import type { RuleExpression, FormControl } from "./types";
import type { defineRule, resolveRule } from "./rule";

type FieldProps = {
  name: string;
  defaultValue: any;
  control: Readable<FormControl>;
  rules: RuleExpression;
  type: "hidden" | "text";
};

type FieldSlot = {
  default: {};
};

declare class Field extends SvelteComponentTyped<FieldProps, {}, FieldSlot> {}

export { useForm, Field, defineRule, resolveRule };
