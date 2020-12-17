import type { ValidationFunction } from "./types";

let RULES: Record<string, ValidationFunction> = {};

export const defineRule = (ruleName: string, cb: ValidationFunction) => {
  if (!cb) console.warn("[svelte-reactive-form] invalid rule function");
  RULES[ruleName] = cb;
};

export const resolveRule = (ruleName: string) => {
  const cb = RULES[ruleName];
  if (!cb) console.warn(`[svelte-reactive-form] invalid rule name ${ruleName}`);
  return cb;
};
