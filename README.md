# nextStorage

下一代 Storage，支持 json 序列化、超时、深浅 merge 等特性

## 快速上手

> 以下全部使用 yarn 替代 npm，如果你想知道两者区别，可以从 [yarn 官方](https://yarn.bootcss.com/docs/migrating-from-npm/) 进行查看

- 安装

```sh
yarn add @boses/next-storage
```

- 使用

```js
import { localStorage } from '@boses/next-storage';
localStorage.set('info', { name: 'zhangsan', age: 17 });
console.log(localStorage.get('info'));
// {name: 'zhangsan', age: 17}
```

## API

`import { NextStorage, sessionStorage, localStorage } from '@boses/next-storage';`

### NextStorage

NextStorage 为一个构建类，具体 api 如下

#### constructor(type?: Type):void

- type: `'session' | 'local' | Storage`
- required: `false`

type 指定 Storage 运行的环境

- session： `window.sessionStorage`;
- local：`window.localStorage`;
- 如果你有其他用途可以传递自定义的 Storage 对象

  只要确保它具有以下值

  - length
  - setItem
  - getItem
  - removeItem
  - clear
  - key

  > 细心观察，你可以发现所要求的值与 `window.sessionStorage`、`window.localStorage` api 相同，如果你想借鉴下，可以查看 [polyfill.ts](/src/polyfill.ts)

#### set(key: string, value: any, options?: {expirationTime?: number}):this

- key

  - type: `string`
  - required: `true`

  储存的字段名称

- value

  - type: `any`
  - required: `true`

  储存字段的值

- expirationTime

  - type: `number`
  - required: `false`

  设置超时时间，如果为 `0` 则表示没有超时时间，单位为毫秒，例如`{expirationTime: 1000}`则表示超时时间为 1s 后。

#### delete(key: string):this

- type: `string`
- required: `true`

删除对应的字段名称

#### has(key: string):boolean

- type: `string`
- required: `true`

字段名称是否存在

#### get\<T>(key: string, defaultValue?: any): T

- key

  - type: `string`
  - required: `true`

  读取指定字段的值

- defaultValue

  - type: `any`
  - required: `false`

  如果字段不存在或者过期返回的默认值

#### keys():Array\<string>

返回所有储存字段名称

#### values():Array\<unknown>

返回所有储存字段值

#### entries():Array<[string, unknown]>

与 `Object.entries` 一致，返回所有的字段的名称和值。

```js
import { localStorage } from '@boses/next-storage';
localStorage.merge('test', { age: 1 });
console.log(localStorage.entries());
// [['test', {age: 1}]]
```

#### clear():this

清空所有储存信息

#### length:number

返回已储存字段的长度

#### merge(key: string, value: any, options: {expirationTime?: number, deep?: boolean }):this

- key

  - type: `string`
  - required: `true`

  key 为需要设置储存字段的名称

- value

  - type: `any`
  - required: `true`

  value 为设置储存字段的值

- expirationTime

  - type: `number`
  - required: `false`

  设置超时时间，如果为 `0` 则表示没有超时时间，单位为毫秒，例如`{expirationTime: 1000}`则表示超时时间为 1s 后。

- deep

  - type: `boolean`
  - required: `false`

  指定是否为 `deep` 模式，默认为`false`。
  当`deep`为`false`时，效果与 `Object.assign` 相同

  ```js
  import { localStorage } from '@boses/next-storage';
  localStorage.set('test', { name: '1' });
  const obj = {
    a: 1,
    name: 'zhangsan',
    b: {
      c: 2,
    },
  };
  localStorage.merge('test', obj);
  console.log(localStorage.get('test'));
  // {
  //  a: 1,
  //  name: 'zhangsan',
  //  b: {
  //    c: 2,
  //  },
  // };
  ```

  如果 `deep` 为 `true`，则会将值进行合并处理，例如：

  ```js
  import { localStorage } from '@boses/next-storage';

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
  localStorage.set('test', obj1);
  localStorage.merge('test', obj2, { deep: true });
  console.log(localStorage.get('test'));
  //  {
  //  a: 1,
  //  b: {
  //    name: 'zhangsan',
  //    c: [5],
  //  },
  // );
  ```

  > 注意，执行 merge 的时候，如果原本没有值或者原来的值不是 `object`，则直接会将 merge 的 `value` 写入。

### sessionStorage，localStorage

看名字你或许就能猜到，它们分别为 `window.sessionStorage`，`window.localStorage`，只不过为了方便使用特意封装的对象，具体 api 与 `NextStorage` 介绍一致。

```js
localStorage.get('test');
localStorage.has('test');
// ...
```

> `sessionStorage` 与 `localStorage` 相似，不同之处在于 `localStorage` 里面存储的数据没有过期时间设置，而存储在 `sessionStorage` 里面的数据在页面会话结束时会被清除。

## 示例

### 设置超时

```js
import { localStorage } from '@boses/next-storage';
localStorage.set('test', { name: 'zhangsan' }, { expirationTime: 100 });
setTimeout(() => {
  console.log(localStorage.get('test'));
  // undefined

  // 也可以设置get defaultValue
  console.log(localStorage.get('test', 'test'));
  // test
}, 200);
```

### 合并值

假设有一个后台，每个用户的 `token` 都需要存储，我们期望统一在 `user` 下面管理，大概是这个样子

```js
user = {
  zhangsan: {
    token: 'xxx',
    time: '2021-11-05',
    // xxx
  },
  lisi: {
    token: 'xxx',
    time: '2021-11-05',
    // xxx
  },
};
```

使用 merge 就可以轻松实现

```js
import { localStorage } from '@boses/next-storage';
localStorage.merge(
  'user',
  {
    xiaoming: {
      token: 'xxx',
      time: '2021-11-05',
      // xxx
    },
  },
  { deep: true },
);
```

## 其他

如果你有好的建议或者问题可以在 [Issues](https://github.com/bosens-China/next-storage/issues) 进行讨论。

[MIT License](/License)
