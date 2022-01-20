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
export declare type ErrorCallback = (errors: Record<string, any>, e: Event) => any;
export declare type NodeElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
declare type Success = true;
declare type Error = string;
export declare type ValidationResult = Success | Error;
export declare type ValidationFunction = (...args: any[]) => ValidationResult | Promise<ValidationResult>;
export declare type Validator = string | ValidationFunction;
export declare type RuleExpression = string | Array<Validator> | Record<string, Validator> | Record<string, any>;
export declare type RegisterOption<T> = {
    defaultValue?: T;
    bail?: boolean;
    validateOnBlur?: boolean;
    validateOnMount?: boolean;
    rules?: RuleExpression;
};
export declare type FieldOption = {
    defaultValue?: any;
    rules?: RuleExpression;
    validateOnMount?: boolean;
    handleChange?: (state: FieldState, node: Element) => void;
};
export interface FormControl {
    register: <T>(path: string, option?: RegisterOption<T>) => Readable<FieldState>;
    unregister: (path: string) => void;
    setValue: (path: string, value: any) => void;
    getValue: (path: string) => any;
    getValues: () => Record<string, any>;
    setError: (path: string, values: string[]) => void;
    setTouched: (path: string, state: boolean) => void;
    reset: (values?: Fields) => void;
}
declare type FieldErrors = Readable<Fields>;
declare type UseField = (node: HTMLElement, option?: FieldOption) => {
    update(v: FieldOption): void;
    destroy(): void;
};
export interface Form<T> extends Readable<FormState>, FormControl {
    control: Readable<FormControl>;
    field: UseField;
    errors: FieldErrors;
    validate: (paths?: string | Array<string>) => Promise<{
        valid: boolean;
        data: T;
    }>;
    onSubmit: (success: (data: T, e: Event) => void, error?: ErrorCallback) => (e: Event) => void;
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
    validate: (value: any, params?: string[], ctx?: FormControl) => Promise<ValidationResult>;
    params: any[];
};
export declare type ResetFormOption = {
    errors: boolean;
    dirtyFields: boolean;
};
export declare type Field = [FieldStateStore, ValidationRule[], {
    bail: boolean;
}];
export {};
