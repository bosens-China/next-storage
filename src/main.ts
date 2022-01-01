/* eslint-disable @typescript-eslint/indent */
import { isObject, isExpired, each, merge, assign, omitArray } from './utils';
import Polyfill from './polyfill';

interface Option {
  expirationTime: number;
}

type Type = 'session' | 'local' | Storage;

type Value =
  | {
      expirationTime: number;
      __value: any;
    }
  | object
  | string;

const beOverdue = Symbol('beOverdue');
export class NextStorage {
  private storage: Storage;
  constructor(type?: Type) {
    if (this.isStorage(type)) {
      this.storage = type;
      return;
    }
    if (!this.testing()) {
      this.storage = new Polyfill();
      return;
    }

    let storage = window.localStorage;
    if (type === 'session') {
      storage = window.sessionStorage;
    }

    this.storage = storage;
  }

  set(key: string, value: any, options: Partial<Option> = {}) {
    let { expirationTime = 0 } = options;
    let obj: Value;

    expirationTime = ~~expirationTime || 0;
    if (expirationTime) {
      obj = {
        expirationTime: new Date().valueOf() + expirationTime,
        __value: value,
      };
    } else {
      obj = value;
    }
    this.storage.setItem(key, JSON.stringify(obj));
    return this;
  }

  delete(key: string) {
    this.storage.removeItem(key);
    return this;
  }

  has(key: string) {
    const keys = this.keys();
    return keys.indexOf(key) !== -1;
  }

  private _get<T>(key: string) {
    const value = this.storage.getItem(key);
    if (typeof value !== 'string') {
      return undefined;
    }
    try {
      const obj = JSON.parse(value) as Value;
      if (!isObject(obj)) {
        return obj as unknown as T;
      }
      // 如果过期，清空时间
      if ('expirationTime' in obj && isExpired(obj.expirationTime)) {
        return beOverdue;
      }
      if ('expirationTime' in obj) {
        return obj.__value;
      }
      return obj as unknown as T;
    } catch {
      return undefined;
    }
  }

  get<T = unknown>(key: string, defaultValue?: T): T {
    const value = this._get(key);
    if (value === beOverdue) {
      this.delete(key);
      return defaultValue as T;
    }
    return value === undefined ? defaultValue : value;
  }

  keys() {
    const keys: Array<string> = [];
    for (let i = 0; i < this.length; i++) {
      const key = this.storage.key(i)!;
      keys.push(key);
    }
    return keys;
  }

  values() {
    const keys = this.keys();
    const values: Array<unknown> = [];
    each(keys, (key) => {
      const value = this._get(key);
      // 如果不是过期加入
      if (value !== beOverdue) {
        values.push(value);
      }
    });

    return values;
  }

  entries() {
    const values: Array<[string, unknown]> = [];
    const keys = this.keys();
    each(keys, (key) => {
      const value = this._get(key);
      if (value !== beOverdue) {
        values.push([key, value]);
      }
    });

    return values;
  }

  getAll() {
    const all = this.entries();
    const obj: Record<string, unknown> = {};
    each(all, ([key, value]) => {
      obj[key] = value;
    });
    return obj;
  }

  clear() {
    this.storage.clear();
    return this;
  }

  get length() {
    return this.storage.length;
  }

  merge(key: string, value: any, options: Partial<Option & { deep: boolean }> = {}) {
    const src = this.get(key);
    const dest = value;
    /*
     * 如果源或者本次需要覆盖的值不是object，则直接使用value的值进行覆盖
     */
    if (!isObject(src) || !isObject(dest)) {
      return this.set(key, dest, options);
    }
    let fn = Object.assign ? Object.assign : assign;
    if (options.deep) {
      fn = merge;
    }
    return this.set(key, fn(src, dest), options);
  }

  /*
   * 检测当前环境下是否可用
   * html5 localStorage error with Safari: "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made to add something to storage that exceeded the quota."
   * https://stackoverflow.com/questions/14555347/html5-localstorage-error-with-safari-quota-exceeded-err-dom-exception-22-an
   * 额外判断window.localStorage !== 'undefined' && window.localStorage 是为了出现 window.localStorage = null
   */
  private testing() {
    if (
      typeof window !== 'undefined' &&
      window &&
      typeof window.localStorage !== 'undefined' &&
      window.localStorage &&
      this.isStorage(window.localStorage)
    ) {
      const key = `${NextStorage.name}__test`;
      try {
        // 检测写入
        window.localStorage.setItem(key, 'test');
        window.localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  /*
   * 在非window情况下，不能通过instanceof Storage判断，直接通过鸭子类型验证
   */
  private isStorage(storage?: Type): storage is Storage {
    if (!isObject(storage)) {
      return false;
    }
    const keys = omitArray(Object.getOwnPropertyNames(Polyfill.prototype), ['constructor']);
    return keys.every((key) => key in storage);
  }
}

export const localStorage = new NextStorage('local');
export const sessionStorage = new NextStorage('session');
