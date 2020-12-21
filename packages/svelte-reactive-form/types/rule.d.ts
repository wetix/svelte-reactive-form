import type { ValidationFunction } from "./types";
export declare const defineRule: (ruleName: string, cb: ValidationFunction) => void;
export declare const resolveRule: (ruleName: string) => ValidationFunction;
