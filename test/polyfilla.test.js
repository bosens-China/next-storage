import Polyfill from '../src/polyfill';

test(`polyfill setItem`, () => {
  const polyfill = new Polyfill();
  expect(polyfill.length).toBe(0);
  polyfill.setItem('name', 'zhangsan');
  expect(polyfill.length).toBe(1);
  expect(polyfill.obj).toEqual({ name: 'zhangsan' });
});
test(`polyfill getItem`, () => {
  const polyfill = new Polyfill();
  expect(polyfill.obj).toEqual({});
  expect(polyfill.getItem('name')).toBe(null);
  polyfill.setItem('name', 'zhangsan');
  expect(polyfill.getItem('name')).toBe('zhangsan');
});
test(`polyfill removeItem`, () => {
  const polyfill = new Polyfill();
  expect(polyfill.length).toBe(0);
  polyfill.setItem('name', 'zhangsan');
  expect(polyfill.length).toBe(1);
  polyfill.removeItem('name');
  expect(polyfill.length).toBe(0);
});
test(`polyfill clear`, () => {
  const polyfill = new Polyfill();
  expect(polyfill.length).toBe(0);
  polyfill.setItem('name', 'zhangsan');
  expect(polyfill.length).toBe(1);
  polyfill.clear();
  expect(polyfill.length).toBe(0);
  expect(polyfill.obj).toEqual({});
});
test(`polyfill key`, () => {
  const polyfill = new Polyfill();
  expect(polyfill.key(0)).toBe(null);
  polyfill.setItem('name', 'zhangsan');
  expect(polyfill.length).toBe(1);
  expect(polyfill.key(0)).toBe('name');
});
