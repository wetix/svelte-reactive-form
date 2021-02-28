import type {
  FormControl,
  ValidationResult,
} from "../../svelte-reactive-form/src/types";
export declare const required: (v: any) => ValidationResult;
export declare const alphaNum: (v: string) => ValidationResult;
export declare const between: (
  v: any,
  [min, max]: string[]
) => ValidationResult;
export declare const url: (v: string) => ValidationResult;
export declare const unique: <T>(v: T[]) => ValidationResult;
export declare const same: (
  v: any,
  [field]: string[],
  ctx: FormControl
) => ValidationResult;
export declare const email: (v: string) => ValidationResult;
export declare const contains: <T>(v: T, list: T[]) => ValidationResult;
export declare const minLength: (val: any, [min]: [number]) => ValidationResult;
export declare const max: (v: any, [len]: [string]) => ValidationResult;
export declare const min: (v: any, [len]: [string]) => ValidationResult;
export declare const integer: (v: string) => ValidationResult;
