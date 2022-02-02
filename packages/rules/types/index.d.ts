import type { FormControl, ValidationResult } from "svelte-reactive-form/src/types";
/**
 *
 * @param v
 * @returns
 */
export declare const required: (v: any) => ValidationResult;
/**
 * Validate the value is alphanumeric
 * @param v
 * @returns
 */
export declare const alphaNum: (v: string) => ValidationResult;
/**
 *
 * @param v
 * @param param1
 * @returns
 */
export declare const between: (v: any, [min, max]: string[]) => ValidationResult;
/**
 *
 * @param v
 * @returns
 */
export declare const url: (v: string) => ValidationResult;
/**
 *
 * @param v
 * @returns
 */
export declare const unique: <T>(v: T[]) => ValidationResult;
/**
 * Check both field are equals
 *
 * @param {any} v
 * @param param1
 * @param {FormControl} ctx
 * @returns {ValidationResult}
 */
export declare const same: (
  v: any,
  [name]: string[],
  ctx: FormControl
) => ValidationResult;
/**
 *
 * @param v
 * @returns
 */
export declare const email: (v: string) => ValidationResult;
/**
 *
 * @param v
 * @param list
 * @returns
 */
export declare const contains: <T>(v: T, list: T[]) => ValidationResult;
/**
 *
 * @param val
 * @param param1
 * @returns
 */
export declare const minLength: (val: any, [min]: [number]) => ValidationResult;
/**
 *
 * @param v
 * @param param1
 * @returns
 */
export declare const max: (v: any, [len]: [string]) => ValidationResult;
/**
 *
 * @param v
 * @param param1
 * @returns
 */
export declare const min: (v: any, [len]: [string]) => ValidationResult;
/**
 *
 * @param v
 * @returns
 */
export declare const integer: (v: string) => ValidationResult;
