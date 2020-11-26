export const isFunction = (fn: unknown): boolean => typeof fn === "function";

export const isNullOrUndefined = (val: unknown): boolean =>
  val === null || val === undefined;

export const isEmptyArray = (arr: any[]): boolean =>
  Array.isArray(arr) && arr.length === 0;

export const isObject = (obj: unknown): boolean =>
  obj !== null && typeof obj === "object" && !Array.isArray(obj);

export const isPromise = (obj: any): boolean => !!obj?.then;
