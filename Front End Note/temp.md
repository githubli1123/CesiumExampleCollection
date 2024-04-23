## 图片资源问题

在开发环境下（vite 运行）可以显示图片，但在打包后的生产环境下就不可以。

深层原因：工程化的不理解

vite 运行时：执行的是打包代码，图片路径是打包后的图片路径。

问题就在于：vite运行时是执行打包代码，但我们代码中写的是相对于源码的路径，不是打包后可以访问的路径。那么方法自然出来：设法把图片路径转换为图片打包路径。

vite 自动转换路径：

1. CSS 中的静态路径
2. img 中的 src（静态路径）
3. `import()` 语句
4. URL



解决方法：

1. 将图片资源 import 到 需要使用的地方 	`import img from './assets/image.jpg';`。问题：不方便，需要依次导入。

2. 将图片资源放到源码目录下的 public 目录下，vite 会自动打包 public 目录下的资源和使用了 public资源的路径。问题：文件指纹丢失。

3. 动态导入，优化方法一。问题：有一大推图片和js文件，打包结果不好看，网络请求过多。

   ```ts
   import(`./assets/${val}.jpg`).then((res)=>{
   	path.value = res.default;
   })
   
   // 生成的 1-447c06c7.js
   const s = '/assets/1-447c06c7.jpg';
   export { s as default };
   ```

4. URL对象是 JavaScript 中的原生对象，但在 vite 中有特殊含义。详情看：[Static Asset Handling | Vite (vitejs.dev)](https://vitejs.dev/guide/assets.html#new-url-url-import-meta-url)

   ```ts
   export const getImgeUrl = (name: string) => {
       return new URL(`../assets/imgs/${name}`, import.meta.url).href;
   };
   ```

相关问题也详细阅读这篇文章：[Vite静态资源处理——动态引入图片](https://blog.csdn.net/qq_16525279/article/details/129587479)



## import 与 import( )

[一文了解js中导入模块import、import()和require()的区别 - 掘金 (juejin.cn)](https://juejin.cn/post/7205487413350498360)

`import` 和 `import()` 函数是 ES6 新增的两种语法，它们都用于在 JavaScript 中导入模块。虽然它们的作用相同，但它们的语法和用法有所不同。

`import` 是 ES6 中用于在静态环境中导入模块的 **关键字** ，它是在代码加载阶段执行的。`import` 的语法如下：

```js
import defaultExport from "module-name";
import * as name from "module-name";
import { export1 } from "module-name";
import { export1 as alias1 } from "module-name";
import { export1 , export2 } from "module-name";
import { export1 , export2 as alias2 , [...] } from "module-name";
import defaultExport, { export1 [ , [...] ] } from "module-name";
import defaultExport, * as name from "module-name";
```

通过 `import` 导入的模块，可以直接访问其导出的变量和函数。例如：

```js
import { foo } from './moduleA';
foo(); // 调用模块 A 导出的函数 foo
```

`import()` 是 ES6 中用于在 **动态环境中导入模块的 函数 **，它是在运行时执行的，而不是在代码加载阶段执行。`import()` 函数的语法如下：

```js
import(moduleName)
  .then((module) => {
    // 使用模块中的内容
  })
  .catch((error) => {
    // 处理错误
  });
```

`import()` 函数返回一个 Promise，可以在 Promise 的 `then` 方法中使用导入的模块。与 `import` 不同，`import()` 可以动态地加载模块，即可以在运行时根据需要动态加载模块，而不需要在代码加载阶段就加载所有模块。

每个文件中调用 `import()` 函数时，都会创建一个新的 `Promise`，这个 `Promise` 表示将要加载并解析对应的模块，因此每个文件都会获得一个不同的模块实例。但是，实际上整个应用程序只有一个 `module.js` 模块的实例。

这是因为，当第一个文件调用 `import()` 函数时，会开始加载并解析 `module.js` 模块，当第二个文件调用 `import()` 函数时，由于该模块已经被加载并解析过了，因此不会重新加载并解析，而是直接返回已经加载并解析好的模块实例。这也意味着，如果在应用程序中多次调用 `import()` 函数来导入同一个模块，只有第一次调用会执行真正的加载和解析操作，后续调用都会直接返回缓存的模块实例。

需要注意的是，由于 `import()` 是异步的，因此在模块加载完成之前，模块中导出的变量或函数是无法使用的。因此，在使用 `import()` 导入模块时，需要使用 `Promise` 或 `async/await` 等机制来处理异步操作。



## 使用WebGL时的跨域问题

在该路径下 `CodeResource&Note - book WebGL Programming Guide\practice\05\04纹理矩形.html` 的文件中，设置图片资源的代码中有两种写法

```js
方法1：
image.src = './rainbow.jpeg';

方法2：
image.src = 
`http://127.0.0.1:5500/CodeResource%26Note%20-%20book%20WebGL%20Programming%20Guide/practice/05/rainbow.jpeg`;`
```

本例子 04纹理矩形.html 是需要在 live server 的插件下打开。

| 是否打开 live server | 打开该文件的方式            | 图片资源设置代码 | 结果         |
| -------------------- | --------------------------- | ---------------- | ------------ |
| 是                   | http（通过live server打开） | 方法1            | 正常         |
| 是                   | http                        | 方法2            | 正常         |
| 是                   | file（直接双击文件打开）    | 方法1            | 报错①跨域    |
| 是                   | file                        | 方法2            | 报错①        |
| 否                   | file                        | 方法1            | 同第三种情况 |

报错①：

```
Uncaught DOMException: Failed to execute 'texImage2D' on 'WebGLRenderingContext': The image element contains cross-origin data, and may not be loaded.
```

未捕获DOMException:在 ` WebGLRenderingContext ` 上执行 ` texImage2D ` 失败：图像元素包含跨域数据，可能未加载。

对于第五种情况我不太理解，使用 file 协议打开，方法1的代码应该会找到图片资源，但还是报跨域错误。可能就是 WebGL 只支持 http 和 https ，不支持 file 协议作为资源获取协议，直接报跨域问题。

🤔其实上面的代码等价于 `<image src='./rainbow.jpeg'>` ，应该不是浏览器的同源策略，是WebGL的同源策略问题，有待进一步探究。