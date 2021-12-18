/**
 * Transform the callback to a promise
 *
 * @param fn function can be async or not async
 * @returns Async function
 */
export declare const toPromise: <T>(fn: Function) => (...args: any[]) => Promise<T>;
/**
 * Patch an object with the nested key value
 *
 * @param data the source object
 * @param key the object key we want to append
 * @param value the value of the object's key
 * @returns new source object
 *
 * ### Example
 * ```js
 * normalizeObject({ z: 440.056 }, "a[0].b.c[2]", "hello world!")
 * ```
 */
export declare const normalizeObject: (src: Record<string, any>, key: string, value: any) => Record<string, any>;
