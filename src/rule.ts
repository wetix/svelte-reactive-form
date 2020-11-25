import type { ValidationFunction } from "./types";

const RULES: Record<string, ValidationFunction> = {};

export const defineRule = (ruleName: string, cb: ValidationFunction) => {
  RULES[ruleName] = cb;
};

export const resolveRule = (ruleName: string) => {
  return RULES[ruleName];
};
