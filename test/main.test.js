import Polyfill from '../src/polyfill';
import { NextStorage, sessionStorage, localStorage } from '../src/main';

/** @type {NextStorage} */
let storage;
/** @type {Polyfill} */
let polyfill;
beforeEach(() => {
  polyfill = new Polyfill();
  storage = new NextStorage(polyfill);
});

const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));

test(`NextStorage set ont`, () => {
  storage.set('test', { name: 'zhangsan' });
  expect(storage.length).toBe(1);
  expect(polyfill.length).toBe(1);
  expect(polyfill.obj).toEqual({ test: JSON.stringify({ name: 'zhangsan' }) });
  expect(storage.get('test')).toEqual({ name: 'zhangsan' });
});
test(`NextStorage set tow`, async () => {
  storage.set('test', { name: 'zhangsan' }, { expirationTime: 100 });
  await wait(200);
  expect(storage.get('test')).toBeUndefined();
  expect(polyfill.obj).toEqual({});
});

test(`NextStorage get`, () => {
  expect(storage.get(`none`, null)).toBeNull();
  expect(storage.set('test', 1).get('test')).toBe(1);
});

test(`NextStorage delete`, () => {
  expect(storage.length).toBe(0);
  storage.delete();
  expect(storage.length).toBe(0);
  storage.set('test', 1);
  expect(storage.length).toBe(1);
  expect(storage.delete('test').length).toBe(0);
});

test(`NextStorage has`, () => {
  expect(storage.has('test')).toBeFalsy();
  expect(storage.set('test', 1).has('test')).toBeTruthy();
  expect(storage.delete('test').has('test')).toBeFalsy();
});

test(`NextStorage keys,values,entries`, () => {
  expect(storage.keys()).toEqual([]);
  expect(storage.values()).toEqual([]);
  expect(storage.entries()).toEqual([]);
  expect(storage.set('test', 1).keys()).toEqual(['test']);
  expect(storage.values()).toEqual([1]);
  expect(storage.entries()).toEqual([['test', 1]]);
});

test(`NextStorage clear`, () => {
  storage.set('a1', 1).set('a2', 2);
  expect(storage.length).toBe(2);
  expect(storage.values()).toEqual([1, 2]);
  storage.clear();
  expect(storage.length).toBe(0);
  expect(storage.keys()).toEqual([]);
});

test(`NextStorage merge`, () => {
  storage.set('test', { name: 'zhangsan' });
  expect(storage.get('test')).toEqual({ name: 'zhangsan' });
  // 追加
  storage.merge('test', { age: 18 });
  expect(storage.get('test')).toEqual({ name: 'zhangsan', age: 18 });
});

test(`NextStorage merge deep`, () => {
  const obj1 = {
    a: 1,
    b: {
      name: 'zhangsan',
      c: 2,
    },
  };
  const obj2 = {
    b: {
      c: [5],
    },
  };
  storage.set('test', obj1);
  storage.merge('test', obj2, { deep: true });
  expect(storage.get('test')).toEqual({
    a: 1,
    b: {
      name: 'zhangsan',
      c: [5],
    },
  });
});

test(`NextStorage merge Not an object`, async () => {
  storage.set('test', 1);
  storage.merge('test', { name: 1 });
  expect(storage.get('test')).toEqual({ name: 1 });
  storage.clear();
  storage.set('test', { name: 1 });
  storage.merge('test', null);
  expect(storage.get('test')).toBeNull();
});

test(`NextStorage merge be overdue`, async () => {
  storage.set('test', { name: 'zhangsan' }, { expirationTime: 100 });
  await wait(200);
  storage.merge('test', { name: 1 });
  expect(storage.get('test')).toEqual({ name: 1 });
});

test(`NextStorage testing`, () => {
  // 默认为node环境没有window，为false
  expect(storage.testing()).toBeFalsy();
  globalThis.window = {
    localStorage: new Polyfill(),
  };
  expect(storage.testing()).toBeTruthy();
  globalThis.window = null;
});

test(`NextStorage isStorage`, () => {
  expect(storage.isStorage({ get: () => {} })).toBeFalsy();
  globalThis.window = {
    localStorage: new Polyfill(),
  };
  expect(storage.isStorage(window.localStorage)).toBeTruthy();
  globalThis.window = null;
});

test(`NextStorage constructor`, () => {
  const fn1 = new Polyfill();
  fn1.name = 'test';
  const storageTest1 = new NextStorage(fn1);
  const storageTest2 = new NextStorage('session');
  expect(storageTest1.storage).toBe(fn1);
  expect(storageTest2.storage.name).toBeUndefined();
});

test(`sessionStorage, localStorage`, () => {
  expect(sessionStorage.storage).toEqual(new Polyfill());
  expect(localStorage.storage).toEqual(new Polyfill());
});
