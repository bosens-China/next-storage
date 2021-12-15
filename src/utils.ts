export const isObject = (obj: any): obj is object => {
  return (typeof obj === 'object' && obj) || typeof obj === 'function';
};

export const isArray = (arr: any): arr is Array<any> => {
  return Object.prototype.toString.call(arr) === '[object Array]';
};

export const isExpired = (time: number) => {
  const t = new Date().valueOf();
  return t > time;
};

export const each = <T>(arr: Array<T>, fn: (value: T) => void) => {
  for (let i = 0, len = arr.length; i < len; i++) {
    const value = arr[i]!;
    fn(value);
  }
};

export const assign = <T, R>(src: T, ...rest: Array<R>) => {
  if (src == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  const obj = Object(src);
  for (let i = 0, len = rest.length; i < len; i++) {
    const value = rest[i]!;
    if (value == null) {
      continue;
    }
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        obj[key] = value[key];
      }
    }
  }
  return obj as T & R;
};

export const merge = <T, R>(src: T, ...rest: Array<R>) => {
  const target = isObject(src) ? src : ({} as Record<any, any>);
  for (let i = 0; i < rest.length; i++) {
    const value = rest[i];
    // 不能为undefined和null
    if (value == null) {
      continue;
    }
    for (const key in value) {
      const current = target[key];
      const copy = value[key];
      // 防止出现重复引用
      if (target === copy) {
        continue;
      }
      let clone;
      if (isObject(copy)) {
        if (isArray(copy)) {
          clone = isArray(current) ? current : [];
        } else {
          clone = isObject(current) ? current : {};
        }
        target[key] = merge(clone, copy);
      } else if (copy !== undefined) {
        target[key] = copy;
      }
    }
  }
  return target as T & R;
};

export const omitArray = <T>(arr: Array<T>, keys: Array<T>) => {
  if (!isArray(arr)) {
    throw new Error(`Arr must be an array!`);
  }
  const target = Array.prototype.slice.call(arr, 0);
  for (let i = 0; i < keys.length; i++) {
    const index = target.indexOf(keys[i]!);
    if (index > -1) {
      target.splice(index, 1);
    }
  }
  return target as Array<T>;
};
