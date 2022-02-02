import type { FormControl, ValidationResult } from "svelte-reactive-form/src/types";

/**
 *
 * @param v
 * @returns
 */
export const required = (v: any): ValidationResult => {
  if (v === null) return "This field is required.";
  if (v === undefined) return "This field is required.";
  if (v === 0) return "This field is required.";
  if (v === "") return "This field is required.";
  if (Array.isArray(v) && v.length === 0) return "This field is required.";
  return true;
};

/**
 * Validate the value is alphanumeric
 * @param v
 * @returns
 */
export const alphaNum = (v: string): ValidationResult => {
  return /^[a-z0-9]+$/i.test(v) || "The field is not alphanumeric.";
};

/**
 *
 * @param v
 * @param param1
 * @returns
 */
export const between = (v: any, [min, max]: string[]): ValidationResult => {
  return (v > min && v < max) || `The field is not between ${min} and ${max}.`;
};

/**
 *
 * @param v
 * @returns
 */
export const url = (v: string): ValidationResult => {
  return (
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/.test(
      v
    ) || "This field is not url."
  );
};

/**
 *
 * @param v
 * @returns
 */
export const unique = <T>(v: T[]): ValidationResult => {
  const map = new Map();
  for (let i = 0; v.length; i++) {
    if (map.has(v)) return "This field is not unique.";
    map.set(v, true);
  }
  return true;
};

/**
 * Check both field are equals
 *
 * @param {any} v
 * @param param1
 * @param {FormControl} ctx
 * @returns {ValidationResult}
 */
export const same = (v: any, [name]: string[], ctx: FormControl): ValidationResult => {
  return v !== ctx.getValue(name)
    ? `The field must have the same vaue as ${name} `
    : true;
};

/**
 *
 * @param v
 * @returns
 */
export const email = (v: string): ValidationResult =>
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    v
  ) || "This field must be a valid email.";

/**
 *
 * @param v
 * @param list
 * @returns
 */
export const contains = <T>(v: T, list: T[]): ValidationResult => {
  return (
    list.includes(v) || `This field doesn't have valid value (such as ${list.join(", ")})`
  );
};

/**
 *
 * @param val
 * @param param1
 * @returns
 */
export const minLength = (val: any, [min]: [number]): ValidationResult => {
  if (Array.isArray(val) && val.length < min) {
    return `Array must contains ${min} items.`;
  }
  const typeOfVal = typeof val;
  switch (typeOfVal) {
    case "string":
      return (
        val.length >= Number(min) || `This field must be at least ${min} characters.`
      );
    case "number":
  }
  return "invalid data type for minLength";
};

/**
 *
 * @param v
 * @param param1
 * @returns
 */
export const max = (v: any, [len]: [string]): ValidationResult => {
  const l = parseFloat(len);
  const value = isNaN(v) ? v.length : parseFloat(v);
  return value < l || `This field must be less than ${length} characters.`;
};

/**
 *
 * @param v
 * @param param1
 * @returns
 */
export const min = (v: any, [len]: [string]): ValidationResult => {
  const l = parseFloat(len);
  const value = isNaN(v) ? v.length : parseFloat(v);
  return value >= l || `This field must be at least ${l} characters.`;
};

/**
 *
 * @param v
 * @returns
 */
export const integer = (v: string): ValidationResult => {
  return /^\d+$/.test(v) || "The field is not an integer";
};
