/**
 * Transform the callback to a promise
 *
 * @param fn function can be async or not async
 * @returns Async function
 */
export const toPromise = <T>(fn: Function) => {
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
export const normalizeObject = (src: Record<string, any>, key: string, value: any) => {
  const data = Object.assign({}, src);
  if (!key) return data;
  const escape = key.match(/^\[(.*)\]$/);
  // split the key by dot
  const queue: [[Record<string, any>, Array<string>]] = [
    [data, escape ? [escape[1]] : key.split(".")]
  ];

  while (queue.length > 0) {
    const first = queue.shift()!;
    const paths = first[1];
    const name = paths.shift()!;
    const result = name.match(/^([a-z\_\.]+)((\[\d+\])+)/i);

    if (result && result.length > 2) {
      const name = result[1];
      // if it's not array, assign it and make it as array
      if (!Array.isArray(first[0][name])) {
        first[0][name] = [];
      }
      let cur = first[0][name] as Array<any>;
      // get array indexes from the key
      const indexs = result[2].replace(/^\[+|\]+$/g, "").split("][");
      while (indexs.length > 0) {
        // convert the the index string to number
        const index = parseInt(indexs.shift()!, 10);
        // if nested index is last position && parent is last position
        if (indexs.length === 0) {
          if (paths.length === 0) {
            cur[index] = value;
          } else {
            if (!cur[index]) {
              cur[index] = {};
            }
          }
        } else if (!cur[index]) {
          // set to empty array if it's undefined
          cur[index] = [];
        }
        cur = cur[index];
      }

      if (paths.length > 0) {
        queue.push([cur, paths]);
      }

      continue;
    }

    if (paths.length === 0) {
      first[0][name] = value;
    } else {
      if (!first[0][name]) {
        first[0][name] = {};
      }
      queue.push([first[0][name], paths]);
    }
  }

  return data;
};
