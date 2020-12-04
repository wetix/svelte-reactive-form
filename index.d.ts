import type { SvelteComponentTyped } from "svelte";
import type { Readable } from "svelte/store";

import type { FormControl, RuleExpression } from "./types";
import { useForm } from "./form";
import { defineRule } from "./rule";

interface FieldProps {
  name: string;
  control: Readable<FormControl>;
  defaultValue?: any;
  rules?: RuleExpression;
  type?: "hidden" | "text";
}

declare module "svelte-reactive-form" {
  export declare class Field extends SvelteComponentTyped<FieldProps, {}, {}> {}
}

export { Field, useForm, defineRule };
