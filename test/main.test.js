import Polyfill from '../src/polyfill';
import { NextStorage, sessionStorage, localStorage } from '../src/main';

/** @type {NextStorage} */
let storage;
/** @type {Polyfill} */
let polyfill;
beforeEach(() => {
  polyfill = new Polyfill();
  polyfill.obj = {
    posts: JSON.stringify([{ id: 1, title: 'json-server', author: 'typicode' }]),
    comments: JSON.stringify([{ id: 1, body: 'some comment', postId: 1 }]),
    profile: JSON.stringify({ name: 'typicode' }),
  };
  storage = new NextStorage(polyfill);
});

test(`set`, () => {
  storage.set('test', { name: 'test' });
  expect(storage.get('test')).toEqual({ name: 'test' });
});

test(`delete`, () => {
  storage.delete('posts');
  expect(storage.length).toBe(2);
});

test(`has`, () => {
  expect(storage.has('posts')).toBeTruthy();
  storage.delete('posts');
  expect(storage.has('posts')).toBeFalsy();
});

test(`get`, () => {
  expect(storage.get('posts')).toEqual([{ id: 1, title: 'json-server', author: 'typicode' }]);
});

test(`keys`, () => {
  expect(storage.keys()).toEqual(['posts', 'comments', 'profile']);
});

test(`values`, () => {
  expect(storage.values()).toEqual([
    [{ id: 1, title: 'json-server', author: 'typicode' }],
    [{ id: 1, body: 'some comment', postId: 1 }],
    { name: 'typicode' },
  ]);
});

test(`entries`, () => {
  expect(storage.entries()).toEqual([
    ['posts', [{ id: 1, title: 'json-server', author: 'typicode' }]],
    ['comments', [{ id: 1, body: 'some comment', postId: 1 }]],
    ['profile', { name: 'typicode' }],
  ]);
});

test(`getAll`, () => {
  expect(storage.getAll()).toEqual({
    posts: [{ id: 1, title: 'json-server', author: 'typicode' }],
    comments: [{ id: 1, body: 'some comment', postId: 1 }],
    profile: { name: 'typicode' },
  });
});

test(`clear`, () => {
  expect(storage.length).toBe(3);
  storage.clear();
  expect(storage.length).toBe(0);
});

test(`length`, () => {
  expect(storage.length).toBe(3);
  storage.set('test', { name: 'test' });
  expect(storage.length).toBe(4);
});

test(`merge`, () => {
  storage.merge('profile', { age: 14 });
  expect(storage.get('profile')).toEqual({
    name: 'typicode',
    age: 14,
  });
});

/*
 * 深特性测试
 */
const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));
test(`set 超时`, async () => {
  storage.set('test', { name: 'zhangsan' }, { expirationTime: 100 });
  await wait(200);
  expect(storage.get('test')).toBeUndefined();
});

test(`merge and null`, async () => {
  storage.set('test', { name: 1 });
  storage.merge('test', null);
  expect(storage.get('test')).toBeNull();
});

test(`testing`, () => {
  // 默认为node环境没有window，为false
  expect(storage.testing()).toBeFalsy();
  globalThis.window = {
    localStorage: new Polyfill(),
  };
  expect(storage.testing()).toBeTruthy();
  globalThis.window = null;
});

test(`isStorage`, () => {
  expect(storage.isStorage({ get: () => {} })).toBeFalsy();
  globalThis.window = {
    localStorage: new Polyfill(),
  };
  expect(storage.isStorage(window.localStorage)).toBeTruthy();
  globalThis.window = null;
});

test(`constructor`, () => {
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

test(`get default`, () => {
  storage.clear();
  expect(storage.get('test', 'test')).toBe('test');
});
