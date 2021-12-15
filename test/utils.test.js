import { isObject, isExpired, each, isArray, assign, merge, omitArray } from '../src/utils';

test(`isObject`, () => {
  expect(isObject(null)).toBeFalsy();
  expect(isObject(1)).toBeFalsy();
  expect(isObject('1')).toBeFalsy();
  expect(isObject(false)).toBeFalsy();
  expect(isObject(undefined)).toBeFalsy();
  expect(isObject(() => {})).toBeTruthy();
  expect(isObject({})).toBeTruthy();
  expect(isObject([])).toBeTruthy();
});

test(`isExpired`, () => {
  const now = new Date().valueOf();
  expect(isExpired(now)).toBeFalsy();
  expect(isExpired(now + 1)).toBeFalsy();
  expect(isExpired(now - 1)).toBeTruthy();
});

test(`each`, () => {
  const arr = [1, 2, 3];
  const fn = jest.fn((x) => x);
  each(arr, fn);
  expect(fn.mock.calls).toEqual([[1], [2], [3]]);
  expect(fn.mock.results.map((f) => f.value)).toEqual([1, 2, 3]);
});

test(`isArray`, () => {
  expect(isArray([])).toBeTruthy();
  expect(isArray(new Set())).toBeFalsy();
});

test(`assign`, () => {
  expect(() => assign(null)).toThrow();
  expect(assign({}, { name: 1 })).toEqual({ name: 1 });
  const obj = { age: 1 };
  assign(obj, { age: 2, name: 'zhangsan' });
  expect(obj).toEqual({ age: 2, name: 'zhangsan' });
});

describe(`merge jest`, () => {
  test(`merge one`, () => {
    const users = {
      data: [{ user: 'barney' }, { user: 'fred' }],
    };
    const ages = {
      data: [{ age: 36 }, { age: 40 }],
    };
    expect(merge(users, ages)).toEqual({
      data: [
        { user: 'barney', age: 36 },
        { user: 'fred', age: 40 },
      ],
    });
  });

  test(`merge tow`, () => {
    const obj1 = {
      a: 1,
      b: { b1: 1, b2: 2 },
    };

    const obj2 = {
      b: { b1: 3, b3: 4 },
      c: 3,
    };

    const obj3 = {
      d: 4,
    };
    expect(merge(obj1, obj2, obj3)).toEqual({
      a: 1,
      b: { b1: 3, b2: 2, b3: 4 },
      c: 3,
      d: 4,
    });

    expect(merge(1, { name: 'zhangsan' })).toEqual({ name: 'zhangsan' });
  });

  test(`merge three`, () => {
    const obj1 = {
      a: 1,
      b: {
        c: 2,
      },
    };

    const obj2 = {
      b: {
        c: [5],
      },
    };
    expect(merge(obj1, obj2)).toEqual({
      a: 1,
      b: {
        c: [5],
      },
    });
  });
  test(`merge repeat`, () => {
    const a = {};
    const b = { name: a };
    a.name = b;
    const c = merge(a, b);

    expect(c).toEqual({ name: b });
  });
});

test(`omitArray`, () => {
  const value = [1, 2, 3];
  expect(omitArray(value, [1])).toEqual([2, 3]);
  expect(value).toEqual([1, 2, 3]);
});
