import type { Readable, Writable } from "svelte/store";
export declare type Fields = Record<string, any>;
export declare type FieldValue = any;
interface Resolver {
    validate(data: any): Promise<any>;
}
export declare type Config = {
    resolver?: Resolver;
    validateOnChange?: boolean;
};
export declare type SuccessCallback = (data: Record<string, any>, e: Event) => any;
export declare type ErrorCallback = (errors: Record<string, any>, e: Event) => any;
export declare type NodeElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export declare type ValidationResult = boolean | string;
export declare type ValidationFunction = (...args: any[]) => ValidationResult | Promise<ValidationResult>;
export declare type Validator = string | ValidationFunction;
export declare type RuleExpression = string | Array<Validator> | Record<string, Validator> | Record<string, any>;
export declare type RegisterOption<T> = {
    defaultValue?: T;
    rules?: RuleExpression;
};
export declare type FieldOption = {
    rules?: RuleExpression;
    defaultValue?: any;
    handleChange?: (state: FieldState, node: Element) => void;
};
export interface FormControl {
    register: <T>(path: string, option?: RegisterOption<T>) => Readable<FieldState>;
    unregister: (path: string) => void;
    setValue: (path: string, value: any) => void;
    getValue: (path: string) => any;
    setError: (path: string, values: string[]) => void;
    setTouched: (path: string, state: boolean) => void;
    reset: (values?: Fields) => void;
}
declare interface FieldErrors extends Readable<Fields> {
}
declare type UseField = (node: HTMLElement, option?: FieldOption) => {
    update(v: FieldOption): void;
    destroy(): void;
};
export interface Form extends Readable<FormState>, FormControl {
    control: Readable<FormControl>;
    field: UseField;
    errors: FieldErrors;
    validate: (paths?: string | Array<string>) => Promise<{
        valid: boolean;
        data: object;
    }>;
    onSubmit: (success: SuccessCallback, error?: ErrorCallback) => (e: Event) => void;
}
export declare type FormState = {
    pending: boolean;
    submitting: boolean;
    dirty: boolean;
    touched: boolean;
    valid: boolean;
};
export declare type FieldState = {
    defaultValue: any;
    value: any;
    pending: boolean;
    dirty: boolean;
    touched: boolean;
    valid: boolean;
    errors: string[];
};
export interface FieldStateStore extends Writable<FieldState> {
    destroy(): void;
}
export declare type ValidationRule = {
    name: string;
    validate: (...args: any) => Promise<ValidationResult>;
    params: any[];
};
export declare type ResetFormOption = {
    errors: boolean;
    dirtyFields: boolean;
};
export declare type Field = [FieldStateStore, ValidationRule[]];
export {};
