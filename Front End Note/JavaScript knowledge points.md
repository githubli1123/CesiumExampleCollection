## 监听变量

原文链接：[如何监听JS变量的变化 | DaraW | Code is Poetry](https://blog.daraw.cn/2016/08/17/how-to-monitor-changes-of-js-variable/)https://blog.daraw.cn/2016/08/17/how-to-monitor-changes-of-js-variable/)

> [如何监听 js 中变量的变化?](https://www.zhihu.com/question/44724640)
> 我现在有这样一个需求，需要监控js的某个变量的改变，如果该变量发生变化，则触发一些事件，不能使用timeinterval之类的定时去监控的方法，不知道有比较好的解决方案么？

这个问题问的很好。

流行的MVVM的JS库/框架都有共同的特点就是数据绑定，在数据变更后响应式的自动进行相关计算并变更DOM展现。所以这个问题也可以理解为**如何实现MVVM库/框架的数据绑定**。

常见的数据绑定的实现有脏值检测，基于ES5的`getter`和`setter`，以及ES已被废弃的`Object.observe`，和ES6中添加的`Proxy`。



### 脏值检测

angular使用的就是脏值检测，原理是比较新值和旧值，当值真的发生改变时再去更改DOM，所以angular中有一个`$digest`。那么为什么在像`ng-click`这样的内置指令在触发后会自动变更呢？原理也很简单，在`ng-click`这样的内置指令中最后追加了`$digest`。

简易的实现一个脏值检测：

```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>two-way binding</title>
    </head>
    <body onload="init()">
        <button ng-click="inc">
            Increase
        </button>
        <button ng-click="reset">
            Reset
        </button>
        <span style="color:red" ng-bind="counter"></span>
        <span style="color:blue" ng-bind="counter"></span>
        <span style="color:green" ng-bind="counter"></span>

        <script type="text/javascript">
            /* 数据模型区开始 */
            var counter = 0;

            function inc() {
                counter++;
            }

            function reset() {
                counter = 0;
            }
            /* 数据模型区结束 */

            /* 绑定关系区开始 */
            function init() {
                bind();
            }

            function bind() {
                var list = document.querySelectorAll("[ng-click]");
                for (var i=0; i<list.length; i++) {
                    list[i].onclick = (function(index) {
                        return function() {
                            window[list[index].getAttribute("ng-click")]();
                            apply();
                        };
                    })(i);
                }
            }

            function apply() {
                var list = document.querySelectorAll("[ng-bind='counter']");
                for (var i=0; i<list.length; i++) {
                    if (list[i].innerHTML != counter) {
                        list[i].innerHTML = counter;
                    }
                }
            }
            /* 绑定关系区结束 */
        </script>
    </body>
</html>
```

这样做的坏处是自己变更数据后，是无法自动改变DOM的，必须要想办法触发`apply()`，所以只能借助`ng-click`的包装，在`ng-click`中包含真实的`click`事件监听并追加脏值检测以判断是否要更新DOM。

另外一个坏处是如果不注意，每次脏值检测会检测大量的数据，而很多数据是没有检测的必要的，容易影响性能。

关于如何实现一个和angular一样的脏值检测，知道原理后还有很多工作要去做，以及如何优化等等。如果有兴趣可以看看民工叔曾经推荐的《Build Your Own Angular.js》，第一章`Scope`便讲了如何实现angular的作用域和脏值检测。对了，上面的例子也是从民工叔的博客稍加修改来的，建议最后去看下原文，链接在参考资料中。



### ES5的`getter`与`setter`

在ES5中新增了一个`Object.defineProperty`，直接在一个对象上定义一个新属性，或者修改一个已经存在的属性， 并返回这个对象。

```
Object.defineProperty(obj, prop, descriptor)
```

其接受的第三个参数可以取`get`和`set`并各自对应一个`getter`和`setter`方法：

```
var a = { zhihu:0 };

Object.defineProperty(a, 'zhihu', {
  get: function() {
    console.log('get：' + zhihu);
    return zhihu;
  },
  set: function(value) {
    zhihu = value;
    console.log('set:' + zhihu);
  }
});

a.zhihu = 2; // set:2
console.log(a.zhihu); // get：2
                      // 2
```

基于ES5的`getter`和`setter`可以说几乎完美符合了要求。为什么要说`几乎`呢？

首先IE8及更低版本IE是无法使用的，而且这个特性是没有`polyfill`的，无法在不支持的平台实现，
这也是基于ES5`getter`和`setter`的Vue.js不支持IE8及更低版本IE的原因。也许有人会提到`avalon`，`avalon`在低版本IE借助`vbscript`一些黑魔法实现了类似的功能。

除此之外，还有一个问题就是修改数组的`length`，直接用索引设置元素如`items[0] = {}`，以及数组的`push`等变异方法是无法触发`setter`的。
如果想要解决这个问题可以参考Vue的做法，在Vue的`observer/array.js`中，Vue直接修改了数组的原型方法：

```
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */

;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  var original = arrayProto[method]
  def(arrayMethods, method, function mutator () {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length
    var args = new Array(i)
    while (i--) {
      args[i] = arguments[i]
    }
    var result = original.apply(this, args)
    var ob = this.__ob__
    var inserted
    switch (method) {
      case 'push':
        inserted = args
        break
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
```

这样重写了原型方法，在执行数组变异方法后依然能够触发视图的更新。

但是这样还是不能解决修改数组的`length`和直接用索引设置元素如`items[0] = {}`的问题，想要解决依然可以参考Vue的做法：
前一个问题可以直接用新的数组代替旧的数组；后一个问题可以为数组拓展一个`$set`方法，在执行修改后顺便触发视图的更新。



### 已被废弃的`Object.observe`

`Object.observe`曾在ES7的草案中，并在提议中进展到stage2，最终依然被废弃。
这里只举一个MDN上的例子：

```
// 一个数据模型
var user = {
  id: 0,
  name: 'Brendan Eich',
  title: 'Mr.'
};

// 创建用户的greeting
function updateGreeting() {
  user.greeting = 'Hello, ' + user.title + ' ' + user.name + '!';
}
updateGreeting();

Object.observe(user, function(changes) {
  changes.forEach(function(change) {
    // 当name或title属性改变时, 更新greeting
    if (change.name === 'name' || change.name === 'title') {
      updateGreeting();
    }
  });
});
```

由于是已经废弃了的特性，Chrome虽然曾经支持但也已经废弃了支持，这里不再讲更多，有兴趣可以搜一搜以前的文章，这曾经是一个被看好的特性（[Object.observe()带来的数据绑定变革](http://div.io/topic/600)）。
当然关于它也有一些替代品[Polymer/observe-js](https://github.com/polymer/observe-js)。



### ES6带来的`Proxy`

人如其名，类似HTTP中的代理：

```
var p = new Proxy(target, handler);
```

`target`为目标对象，可以是任意类型的对象，比如数组，函数，甚至是另外一个代理对象。
`handler`为处理器对象，包含了一组代理方法，分别控制所生成代理对象的各种行为。

举个例子：

```
let a = new Proxy({}, {
  set: function(obj, prop, value) {
    obj[prop] = value;

    if (prop === 'zhihu') {
      console.log("set " + prop + ": " + obj[prop]);
    }

    return true;
  }
});

a.zhihu = 100;
```

当然，`Proxy`的能力远不止此，还可以实现代理转发等等。

但是要注意的是目前浏览器中只有Firefox18支持这个特性，而babel官方也表明不支持这个特性：

> Unsupported feature
> Due to the limitations of ES5, Proxies cannot be transpiled or polyfilled.

目前已经有babel插件可以实现，但是据说实现的比较复杂。
如果是Node的话升级到目前的最新版本应该就可以使用了，上面的例子测试环境为Node v6.4.0。

### 参考资料

- [Angular沉思录（一）数据绑定](https://github.com/xufei/blog/issues/10)
- [Object.defineProperty() - JavaScript | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
- [vue/array.js at dev · vuejs/vue](https://github.com/vuejs/vue/blob/dev/src/observer/array.js)
- [Object.observe() - JavaScript | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/observe)
- [Proxy - JavaScript | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

 [JavaScript](https://blog.daraw.cn/categories/JavaScript/) [JavaScript](https://blog.daraw.cn/tags/JavaScript/)[Proxy](https://blog.daraw.cn/tags/Proxy/)[脏值检测](https://blog.daraw.cn/tags/脏值检测/)





## ES6函数剩余参数（Rest Parameters)



参考资料：









## Promise

下面文章

[Promises/A+ 规范和 ECMAscript 6 中 Promise 规范区别？ - 知乎 (zhihu.com)](https://www.zhihu.com/question/279850405/answer/779173718)

[谁规定了 Promise 是 microTask](https://juejin.cn/post/7095543708841426975)

[展开看看Promise](https://juejin.cn/post/7055202073511460895)





## Proxy

目的：监控对象属性的操作，操作包括修改等

**`Object.defineProperty()`** 静态方法会直接在一个对象上定义一个新属性，或修改其现有属性，并返回此对象。 

**Proxy** 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。





## module

Module：ESM  CommonJS

[20分钟学会ES6之代理与模块 Proxy&Module_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1Nj411X7QL/?vd_source=a9caa6410eb2baf51ab8ecfb66da5f53)
