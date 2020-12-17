const toPromise = <T>(fn: Function) => {
  return function (...args: any[]) {
    const value = fn.apply(null, args);
    if (value && typeof value.then === "function") {
      return value as Promise<T>;
    }
    if (typeof value === "function") {
      return Promise.resolve<T>(value.apply(null, args));
    }
    return Promise.resolve<T>(value);
  };
};

export default toPromise;
