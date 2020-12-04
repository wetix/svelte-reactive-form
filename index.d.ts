import type { SvelteComponent } from "svelte/internal";
import type { Readable } from "svelte/store";
import type { FormControl, RuleExpression } from "./types";

export interface FieldProps {
  name: string;
  control: Readable<FormControl>;
  defaultValue?: any;
  rules?: RuleExpression;
  type?: "hidden" | "text";
}

declare class Field extends SvelteComponent<FieldProps> {}

import { useForm } from "./form";
import { defineRule } from "./rule";
export { Field, useForm, defineRule };
