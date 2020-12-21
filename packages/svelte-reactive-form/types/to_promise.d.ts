declare const toPromise: <T>(fn: Function) => (...args: any[]) => Promise<T>;
export default toPromise;
