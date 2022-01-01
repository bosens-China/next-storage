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

模块暴露了三个 Api，其中 sessionStorage、localStorage 为了方便使用而单独暴露的跟 `window.sessionStorage`、`window.localStorage` 相对应。

```js
localStorage.get('test');
localStorage.has('test');
// ...
```

下面就重点介绍 NextStorage

> `sessionStorage` 与 `localStorage` 相似，不同之处在于 `localStorage` 里面存储的数据没有过期时间设置，而存储在 `sessionStorage` 里面的数据在页面会话结束时会被清除。

### NextStorage

NextStorage 为一个构建类，具体 api 如下

#### constructor(type?: Type):void

- type: `'session' | 'local' | Storage`
- required: `false`

type 指定 Storage 运行的环境

- session： `window.sessionStorage`;
- local：`window.localStorage`;

> 如果你有其他用途可以传递自定义的 Storage 对象，只要确保它具有以下值
>
> - length
> - setItem
> - getItem
> - removeItem
> - clear
> - key
>   细心观察，你可以发现所要求的值与 `window.sessionStorage`、`window.localStorage` api 相同，如果你想借鉴下，可以查看 [polyfill.ts](/src/polyfill.ts)

#### set(key: string, value: any, options?: {expirationTime?: number}):this

| 字段名称       | 类型     | 是否必填 | 描述                                                                                                          |
| -------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| key            | `string` | `true`   | 储存的字段名称                                                                                                |
| value          | `any`    | `true`   | 储存字段的值                                                                                                  |
| expirationTime | `number` | `false`  | 设置超时时间，如果为 `0` 则表示没有超时时间，单位为毫秒，例如`{expirationTime: 1000}`则表示超时时间为 1s 后。 |

#### delete(key: string):this

删除对应的字段名称

#### has(key: string):boolean

字段名称是否存在

#### get\<T>(key: string, defaultValue?: T): T

返回指定 key 的值，如果不存在返回 `defaultValue` 设置的值

```js
import { localStorage } from '@boses/next-storage';
console.log(localStorage.get('test', 'test'));
// 因为设置了defaultValue，返回test
```

#### keys():Array\<string>

返回所有的 keys 信息

#### values():Array\<unknown>

返回所有储存值

#### entries():Array<[string, unknown]>

类似 `Object.entries` ，返回所有字段的名称和值

```js
import { localStorage } from '@boses/next-storage';
localStorage.set('test', { age: 1 });
console.log(localStorage.entries());
// [['test', {age: 1}]]
```

### getAll():Record<string, unknown>

返回所有的键值对数据。

```js
import { localStorage } from '@boses/next-storage';
localStorage.set('test', { age: 1 });
console.log(localStorage.getAll());
// {test: { age: 1 }}
```

#### clear():this

清空所有储存信息

#### length:number

返回已储存数据的 length

#### merge(key: string, value: any, options: {expirationTime?: number, deep?: boolean }):this

| 字段名称       | 类型      | 是否必填 | 描述                                                                                                        |
| -------------- | --------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| key            | `string`  | `true`   | key 为需要设置储存字段的名称                                                                                |
| value          | `any`     | `true`   | value 为设置储存字段的值                                                                                    |
| expirationTime | `number`  | `false`  | 设置超时时间，如果为 `0` 则表示没有超时时间，单位为毫秒，例如`{expirationTime: 1000}`则表示超时时间为 1s 后 |
| deep           | `boolean` | `false`  | 指定是否为 `deep` 模式，默认为`false`。当`deep`为`false`时，效果与 `Object.assign` 相同                     |

- 浅合并

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

- 深合并

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

### 在 node 中使用

NextStorage 是可以接收自定义 Storage 的，基于这个我们可以很轻松实现 node 本地版的 localStorage

```js

import fs from 'fs';
import path from 'path';
import os from 'os';
import { NextStorage } from '@boses/next-storage';

const filePath = path.join(os.homedir(), '.info');
class Local implements Storage {
  private obj: Record<string, string>;

  constructor() {
    const json = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
    try {
      this.obj = JSON.parse(json) || {};
    } catch {
      this.obj = {};
    }
  }

  get length() {
    return Object.keys(this.obj).length;
  }

  setItem(key: string, value: string) {
    this.obj[key] = String(value);
  }

  getItem(key: string) {
    return this.obj[key] || null;
  }

  removeItem(key: string) {
    delete this.obj[key];
  }

  clear() {
    this.obj = {};
  }

  key(index: number) {
    return Object.keys(this.obj)[index] || null;
  }

  saveData() {
    fs.writeFileSync(filePath, JSON.stringify(this.obj, null, 2));
  }
}

const localStorage = new NextStorage(new Local());
// ...
// localStorage.get();
```

## 其他

如果你有好的建议或者问题可以在 [Issues](https://github.com/bosens-China/next-storage/issues) 进行讨论。

[MIT License](/License)
