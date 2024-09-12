对于该项目文件夹的介绍可以查看 [ps.txt](https://github.com/githubli1123/CesiumExampleCollection/blob/main/ps.txt) 。

才疏学浅，写的一般。随着自己的不断阅读和学习，文章内容也会不断变更。请批判的看待内容。

🏷️ 9月份全力学习 node.js 和 ts 。

🎯正在拜读《3D Engine Design for Virtual Globes》、《实时计算机图形学第2版》，重温《WebGL高级编程》这本书，佛系梳理第三、四章内容（10月中旬完成）......

# Cesium 源码解读

### 文章目录

00 文章目录与源码简单调试   [👉🔗](https://github.com/githubli1123/CesiumExampleCollection/blob/main/Temp/%E9%9C%80%E8%A6%81%E5%8F%91%E5%B8%83%E7%9A%84%E5%8D%9A%E5%AE%A2/00%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E4%B8%8E%E6%BA%90%E7%A0%81%E7%9A%84%E7%AE%80%E5%8D%95%E8%B0%83%E8%AF%95/00%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E4%B8%8E%E6%BA%90%E7%A0%81%E7%AE%80%E5%8D%95%E8%B0%83%E8%AF%95.md)

01 Cesium的渲染调度  [👉🔗](https://github.com/githubli1123/CesiumExampleCollection/blob/main/Temp/%E9%9C%80%E8%A6%81%E5%8F%91%E5%B8%83%E7%9A%84%E5%8D%9A%E5%AE%A2/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6.md)

02 Cesium中地球渲染的过程 [👉🔗](https://github.com/githubli1123/CesiumExampleCollection/blob/main/Temp/%E9%9C%80%E8%A6%81%E5%8F%91%E5%B8%83%E7%9A%84%E5%8D%9A%E5%AE%A2/02Cesium%E7%9A%84%E5%9C%B0%E7%90%83%E6%B8%B2%E6%9F%93%E8%BF%87%E7%A8%8B/02Cesium%E7%9A%84%E5%9C%B0%E7%90%83%E6%B8%B2%E6%9F%93%E8%BF%87%E7%A8%8B.md)

## 00 文章目录与源码的简单调试

本篇文章持续更新，感觉调试源码和阅读源码的方法会随着工具的更新与 AI 的迭代不断改变优化，让我们更好的理解源码。而且本人比较喜欢通过图像表格来记忆和理解，图表出现较为频繁。文章风格介绍

拥有这些风格：

- 关注主体。只看主要的流程，只考虑这种情况：即第一次使用 Cesium 时创建的例子，实例代码链接在此 [👉🔗](https://sandcastle.cesium.com/)。
- 遗留问题。有些代码或者流程无法直接梳理清楚，会留下问题，等待后面阅读源码的其他部分后再来解答。
- 不断重复。有一些图或者表述会不断重复，一个是需要有这些来让我的表述更加有逻辑和直观，让知识点有部分关联，二是让读者记忆深刻。
- ......

没有这些风格：

- 注重关联。知识点或者类关系尽量不做过多关联，可能没法让你触类旁通或者知识点之间的链接较弱。
- 表述严谨。本身我目前也处于阅读源码进行学习的阶段，表述比较随意，望谅解。
- ......



### 1 如何做到对源码进行简单调试

✅这里就不再赘述源码工程目录了（如果需要后面再补充）。直接给大家说明一下我是如何做到对 Cesium 源码进行简单的调试：

1. 克隆源码。在 GitHub 上克隆一份 Cesium 源码，我目前（2024年4月）使用的版本是 1.116 。
2. 执行 `npm i` 命令。安装所需要的包。可以这样粗浅理解为：我们克隆的这份源码其实并不是纯粹的只包含源码代码文件，其实它也算是一个项目，是一个工程，你可以执行 `npm i` 命令后 （这个命令具体会干些什么捏，目前不管）打开 index.html ，可以在浏览器看到 Cesium 示例、测试与文档。
3. 执行 `npm run build` 命令。构建 Build 目录。运行 `build`/`release`/`make-zip` 等指令，此文件夹会出现。它主要是发布出来 CesiumJS 的 IIFE 和 CommonJS 版本，以及附带必须要用的五大静态资源文件夹 - `Assets`、`Core`、`ThirdParty`、`Widgets`、`Workers`。根据指令的不同，发布的库文件不一样，也影响是不是有 TypeScript 类型定义文件、SourceMap 映射文件。`build` 指令发布的是 `Build/CesiumUnminified` 未压缩版本，含 IIFE 库和 CommonJS 库，也就是主库文件约有 25 万行的版本；`release` 指令发布的是 `Build/Cesium` 文件夹下的压缩版本，代码经过简化。
4. 执行 `node server.js` 命令。使用 live server 类似插件启动服务打开 index.html 是不妥的。需要执行命令行 `node server.js` 启动服务，这个是一个基于 Express 的开发服务器，用于在本地开发和测试 CesiumJS，提供了文件监听、自动构建、静态文件服务和代理等功能，方便开发者进行 CesiumJS 相关项目的开发和调试。
5. 调试源码。这时就可以使用各类调试方法来调试 Cesium 源码了，在 `packages` 文件夹下修改源码文件或者在浏览器开发者工具断点调试。

暂时不分享调试源码的一些技巧，可以自行查找。



下面说明一下如何看构建命令。



📌值得注意的一些细碎点：

**1** 分发包与源码包最大的区别在于，分发包提供了打包后的Build文件夹，可供调试或者发布直接使用；提供了两个版本的打包API，提供了API文档，删除了部分生产用不着的打包配置文件。注意，分发包保留了源码目录，但是有关打包命令可能失效。见图

<img src="https://github.com/githubli1123/CesiumExampleCollection/blob/main/Img/00%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E4%B8%8E%E6%BA%90%E7%A0%81%E7%9A%84%E7%AE%80%E5%8D%95%E8%B0%83%E8%AF%95/%E5%88%86%E5%8F%91%E5%8C%85%E4%B8%8E%E6%BA%90%E7%A0%81%E5%8C%85.png?raw=true" alt="分发包与源码包" style="zoom: 33%;" />



**2**  `Source` 源码资源文件夹中的变更为了 `package` 文件夹。这一点可以在 [Cesium1.100版本更新日志](https://github.com/CesiumGS/cesium/releases/tag/1.100) 中看到，源代码已分区为两个文件夹： `packages/engine` 和 `packages/widgets`。

<img src="https://github.com/githubli1123/CesiumExampleCollection/blob/main/Img/00%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E4%B8%8E%E6%BA%90%E7%A0%81%E7%9A%84%E7%AE%80%E5%8D%95%E8%B0%83%E8%AF%95/Cesium1.100%E7%89%88%E6%9C%AC%E5%90%8E%E5%B7%A5%E7%A8%8B%E7%9B%AE%E5%BD%95%E7%9A%84%E6%94%B9%E5%8F%98.png?raw=true" alt="分发包与源码包" style="zoom: 33%;" />



🔗参考资料

[CesiumJS 2022^ 源码解读0 - 文章目录与源码工程结构 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/537147162)

[Cesium源码阅读环境搭建 - 当时明月在曾照彩云归 - 博客园 (cnblogs.com)](https://www.cnblogs.com/jiujiubashiyi/p/17111635.html)

[Cesium打包命令总结 - Cesium实验室 - 博客园 (cnblogs.com)](https://www.cnblogs.com/cesium1/p/10062900.html)

[Cesium开发工具篇 06Cesium源码编译打包 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/369519695)

[Cesium打包入门(gulp与esbuild)_scripts.prepare cesium@1.95-CSDN博客](https://blog.csdn.net/u011575168/article/details/128419078)



### 2 文章目录

00 文章目录与源码简单调试   [👉🔗](https://github.com/githubli1123/CesiumExampleCollection/blob/main/Temp/%E9%9C%80%E8%A6%81%E5%8F%91%E5%B8%83%E7%9A%84%E5%8D%9A%E5%AE%A2/00%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E4%B8%8E%E6%BA%90%E7%A0%81%E7%9A%84%E7%AE%80%E5%8D%95%E8%B0%83%E8%AF%95/00%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E4%B8%8E%E6%BA%90%E7%A0%81%E7%AE%80%E5%8D%95%E8%B0%83%E8%AF%95.md)

01 Cesium的渲染调度  [👉🔗](https://github.com/githubli1123/CesiumExampleCollection/blob/main/Temp/%E9%9C%80%E8%A6%81%E5%8F%91%E5%B8%83%E7%9A%84%E5%8D%9A%E5%AE%A2/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6.md)



---

## 01 Cesium的渲染调度

### 1 CesiumWidget 类是渲染调度器

所谓的渲染是指在浏览器 canvas 上绘制图像，调度是指控制着这个渲染的使用。借助 `requestAnimationFrame, rAF` 这个浏览器 API 来不断在每一帧调用 单帧渲染函数 `render()` ，单帧渲染函数借助 WebGL 来实现 canvas 绘制。而这个多帧循环往复运行和渲染的过程有一个调度者，是 `CesiumWidget` 类。

![](https://github.com/githubli1123/CesiumExampleCollection/blob/main/Img/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6/Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6%E5%A4%A7%E8%87%B4%E5%9B%BE.png?raw=true)

下面是简化后的伪代码①，渲染循环的开始

```js
function startRenderLoop(widget: CesiumWidget) {
  widget._renderLoopRunning = true;

  let lastFrameTime = 0;
  function render(frameTime) { // 单帧渲染函数
    if (widget._useDefaultRenderLoop) {
      try {
          widget.resize(); // 响应 DOM 变化
          widget.render(); // 单帧渲染
          requestAnimationFrame(render); // 下一帧渲染
        }
      }
    } else {
      widget._renderLoopRunning = false;
    }
  }

  requestAnimationFrame(render); // 开始触发渲染循环
}
```

同时可以看出，CesiumWidget 类也负责响应 DOM 的变化，例如：窗口尺寸变化导致 DIV 的变化。



### 2  Scene 类是场景对象容器

需要进入到伪代码①中的 `widget.render(); // 单帧渲染` 

```js
CesiumWidget.prototype.render = function () {
  if (this._canRender) {
    ...
    this._scene.render(currentTime); // 看这句
  } else {...}
};
```

通过简单查看 Scene  类中所有属性和方法：目前明白这个类保存着大量场景对象和状态，并且是可以借助其他类来绘制单帧中出现的地球、实体等数据。

🤔有待回答：哪些场景和状态，这些状态具体的作用是什么？



Scene  类原型上的 `render` 方法负责：

- 触发单帧中的生命周期事件（`preUpdate、preRender、postUpdate、postRender`）🔢。这个地方涉及 Cesium 事件机制知识点。
- 更新帧状态和帧序号
- 更新渲染过程，包括更新射线拾取、预加载等。
- 调用类中的 `render` 函数，将渲染责任递给 WebGL context （其实是 Context 对象，对 WebGL 的封装），触发绘制。 解读render函数 [👉🔗]()

下面是Scene  类原型上的 `render` 方法的伪代码

```js
/**
 * Update and render the scene. It is usually not necessary to call this function
 * directly because {@link CesiumWidget} or {@link Viewer} do it automatically.
 * @param {JulianDate} [time] The simulation time at which to render.
 */
Scene.prototype.render = function (time) {
  // 1. Pre passes update. Execute any pass invariant code that should run before the passes here.
  this._preUpdate.raiseEvent(this, time); // 1️⃣

  const frameState = this._frameState;
  frameState.newFrame = false;

  if (!defined(time)) {time = JulianDate.now();}

  // Determine if shouldRender
  const cameraChanged = this._view.checkForCameraUpdates(this);
  let shouldRender = ...
  if (...) {
    const difference = ...
    shouldRender = shouldRender || difference > this.maximumRenderTimeChange;
  }

  if (shouldRender) {
    ... 更新部分状态

    const frameNumber = CesiumMath.incrementWrap(...);
    updateFrameNumber(this, frameNumber, time);
    frameState.newFrame = true;
  }

  tryAndCatchError(this, prePassesUpdate);

  // 2. Passes update. Add any passes here
  if (this.primitives.show) {
    tryAndCatchError(this, updateMostDetailedRayPicks);
    tryAndCatchError(this, updatePreloadPass);
    tryAndCatchError(this, updatePreloadFlightPass);
    if (!shouldRender) {
      tryAndCatchError(this, updateRequestRenderModeDeferCheckPass);
    }
  }

  this._postUpdate.raiseEvent(this, time); // 2️⃣

  if (shouldRender) {
    this._preRender.raiseEvent(this, time); // 3️⃣
    frameState.creditDisplay.beginFrame();
    tryAndCatchError(this, render); // ✨将渲染责任递给 WebGL context 
  }

  // 4. Post passes update. Execute any pass invariant code that should run after the passes here.
  updateDebugShowFramesPerSecond(this, shouldRender);
  tryAndCatchError(this, postPassesUpdate);

  callAfterRenderFunctions(this);

  if (shouldRender) {
    this._postRender.raiseEvent(this, time); // 4️⃣
    frameState.creditDisplay.endFrame();
  }
};
```

图示了生命周期，✒该图会不断 更新&改变 内容，暂时这样。

<img src="https://github.com/githubli1123/CesiumExampleCollection/blob/main/Img/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6/LifecycleEvent.png?raw=true" alt="Lifecycle" style="zoom: 80%;" />

由于生命周期事件，我们可以在项目中使用类似的代码 `scene.addEventListener(cb)` 来为每一帧做一些自定义的任务。
例如：每次渲染之前（即preRender事件）打印一下`时间差不多喽` 。代码大致：

```js
viewer.scene.preRender.addEventListener(()=>{
	console.log('时间差不多喽');
})
```





### 3  Event 类实现事件机制

在编程领域，当谈论事件这个概念时，一般背靠着 事件驱动编程（Event-Driven Programming）思想 。事件驱动编程是一种常见的编程范式，它基于事件和事件处理器的概念，通过监听和响应事件来控制程序的执行流程。

事件：

- 用户的动作（如 点击鼠标、按下键盘等）
- 系统状态变化（如 网络请求完成、定时器到期等）
- 生命周期（如 单帧渲染过程中按数据更新与渲染这两个重要过程细化的四个事件：preUpdate、preRender、postUpdate、postRender🔢 ）
- 其他对象的状态改变（如 Entity 属性的改变、Entity 的增加等）
- ......

事件处理器：

为该事件注册的回调函数，事件触发后由其处理。MDN对该概念的阐述：https://developer.mozilla.org/zh-CN/docs/Web/Events/Event_handlers 。也会有人愿意把她叫做侦听器。

在此，先解释一下 Cesium 对于事件机制的实现方式和使用：

下面放出 Event.js 事件类的全部代码，附带注释

```
import Check from "./Check.js";
import defined from "./defined.js";

function Event() {
  this._listeners = []; // 事件处理器（侦听器）：为该事件注册的回调函数。
  this._scopes = []; // 回调函数的作用域
  this._toRemove = []; // 移除的事件处理器
  this._insideRaiseEvent = false; // 当前是否正在触发事件
}

Object.defineProperties(Event.prototype, {
  // 事件处理器的数量。当前订阅事件的侦听器数量。
  numberOfListeners: {
    get: function () {
      return this._listeners.length - this._toRemove.length;
    },
  },
});

// 添加事件处理器
Event.prototype.addEventListener = function (listener, scope) {
  //>>includeStart('debug', pragmas.debug);
  Check.typeOf.func("listener", listener);
  //>>includeEnd('debug');

  this._listeners.push(listener); // 添加事件处理器
  this._scopes.push(scope); // 添加事件处理器作用域

  const event = this;
  return function () {
    event.removeEventListener(listener, scope);
  };
};

Event.prototype.removeEventListener = function (listener, scope) {
  //>>includeStart('debug', pragmas.debug);
  Check.typeOf.func("listener", listener);
  //>>includeEnd('debug');

  const listeners = this._listeners;
  const scopes = this._scopes;

  let index = -1;
  for (let i = 0; i < listeners.length; i++) {
    if (listeners[i] === listener && scopes[i] === scope) {
      index = i;
      break;
    }
  }

  if (index !== -1) {
    if (this._insideRaiseEvent) {
      //In order to allow removing an event subscription from within
      //a callback, we don't actually remove the items here.  Instead
      //remember the index they are at and undefined their value.
      this._toRemove.push(index);
      listeners[index] = undefined;
      scopes[index] = undefined;
    } else {
      listeners.splice(index, 1);
      scopes.splice(index, 1);
    }
    return true;
  }

  return false;
};

function compareNumber(a, b) {
  return b - a;
}

// 触发事件，执行所有事件处理器
Event.prototype.raiseEvent = function () {
  this._insideRaiseEvent = true; // 表示当前正在触发事件

  let i;
  const listeners = this._listeners;
  const scopes = this._scopes;
  let length = listeners.length;

  // 执行所有事件处理器。若某些事件处理器被移除，则无法通过defined(listener)校验
  for (i = 0; i < length; i++) {
    const listener = listeners[i];
    if (defined(listener)) {
      listeners[i].apply(scopes[i], arguments);
    }
  }

  // Actually remove items removed in removeEventListener.
  // 正式地从 _listeners 中移除 _toRemove 中保存的事件处理器下标。
  const toRemove = this._toRemove;
  length = toRemove.length;
  if (length > 0) {
    toRemove.sort(compareNumber);
    for (i = 0; i < length; i++) {
      const index = toRemove[i];
      listeners.splice(index, 1);
      scopes.splice(index, 1);
    }
    toRemove.length = 0;
  }

  this._insideRaiseEvent = false;// 表示当前不在触发事件
};

export default Event;

```



站在事件机制的角度，对这个 Scene 原型上的 `render()` 方法进行分析：

下图主要表示单帧中的生命周期事件是如何实现和使用的

<img src="https://github.com/githubli1123/CesiumExampleCollection/blob/main/Img/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6/event.png?raw=true" alt="event"  />

Scene 实例中创建了四个 Event 实例，分别为 preUpdate、postUpdate、preRender、postRender ，并把她们挂载为自己的实例成员。图中的 an event 表示在某块代码中的行为触发了这个事件从而执行了所有事件处理器，一般都是直接调用 raiseEvent 方法。调用这个方法也往往是由 Scene 实例自身在每一帧时自动调用一次（可以在 Scene.prototype.render 方法中看到），一般不由开发者手动调用。这些事件处理器的添加则是由 addEventListener 方法实现，这部分往往由开发者调用。由此，我们可以在自己的项目代码中为某个事件添加事件处理器或者在Cesium中某个类实例为某个事件添加事件处理器，Scene 实例会在每一帧时调用这些事件处理器。实际案例：[Cesium中3D模型的驱动方法 | Jack Huang's Blog (huangwang.github.io)](https://huangwang.github.io/2018/12/26/Cesium中3D模型的驱动方法/) 。

现在来点绕的，发布订阅模式在这里如何体现的。我们来梳理一下各类名词。

| Cesium                                     | 事件机制           | 发布订阅模式                       |
| ------------------------------------------ | ------------------ | ---------------------------------- |
| Scene 实例（调用了 raiseEvent 的类或函数） | 创建事件的人       | 发布者（消息发布者）               |
| Scene 中挂载 preUpdate 等                  | 创建事件           | 发布事件（创建消息频道）           |
| preUpdate 等                               | 事件               | 事件总线中的一个事件（频道）       |
| Scene 实例                                 | 事件集合           | 事件总线（消息总线）               |
| 调用了 addEventListener 的类或函数         | 添加事件处理器的人 | 订阅者（消息接受者、侦听器）       |
| 调用了 addEventListener                    | 添加事件处理器     | 订阅事件（订阅频道）               |
| 调用了 raiseEvent                          | 触发事件           | 触发事件（看一眼频道后接受的消息） |

<img src="https://github.com/githubli1123/CesiumExampleCollection/blob/main/Img/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6/Cesium%E4%BA%8B%E4%BB%B6.png?raw=true" alt="Lifecycle" style="zoom: 80%;" />

在我看来哈，Cesium 的 Event 类和 Scene 类组合起来可以看作为发布订阅模式，像是 “ 散装 ” 的。而且好像有两个订阅者，一个是订阅事件的，一个专门来触发事件。而且事件总线也没有，散布在 scene 实例中。Event 类更像是一个辅助类一样，用于提供事件相关的各类方法。

> 😵碎碎念＆瞎扯淡：
>
> 其实我感觉 Cesium 库中对于事件相关的处理，都是把事件放在某个类中，而不是放在单独的事件总线中，比如说 Scene 中。这可以表明这些事件的归属者就是 Scene，为编写库带来方便，减少心智负担。如果真的按照发布订阅模式来做，事件的归属就会无法看出来了。但是，归属问题似乎也是可以解决的，只需要创建多个事件总线就可以了。但这样就伴随着事件机制相关的逻辑变得复杂。
>
> **对于 Scene 中的事件，重要的意义在于切分出了四个重要的时刻。Cesium 每一帧都会有这四个时刻，到了时间点就会触发相对应的事件。我们开发者可以做的就只是为这四个时刻添加一些我们需要的逻辑即可。可以联想一下 Vue 中的生命周期钩子，我感觉很像**。



<img src="https://github.com/githubli1123/CesiumExampleCollection/blob/main/Img/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6/LifecycleEvent.png?raw=true" alt="Lifecycle" style="zoom: 80%;" />

这个 Event 类会在后面反复使用，复用也是 Cesium 解耦出这个 helper class 的原因。同时，解耦 Event 类可以让事件机制更加清晰独立。
Cesium 实现事件机制的模式是发布订阅模式（Publisher-Subscriber），具有一个事件中心（EventEmitter）也就是实例化的 Event ：preUpdate、postUpdate 等。

当然，事件机制也可以用观察者模式（Observer Pattern）来实现。这些模式决定了事件如何在组件之间进行传递和处理。既然说到观察者模式就顺道也写一下。

（...待填坑）



### 4  小结

Cesium 的渲染循环，是在实例化 `Viewer` 时实例化了 `CesiumWidget` ，由属性 `_useDefaultRenderLoop` setter 触发 `startRenderLoop()` 方法，从而开启了渲染循环。在绘制一帧的逻辑中：

✅ `CesiumWidget 类` 支持了对 DOM 变化的响应，让 帧渲染出的内容 放置在合适正确的布局中。

✅ `CesiumWidget 类` 将渲染责任递给 WebGL context ，责任划分明确，只担任渲染调度者，渲染的具体逻辑（指绘制地球等）不包含其中。

✅ `Scene 类` 支持了帧渲染生命周期事件，为开发者预留了对 帧渲染过程 的操作空间。

🌟🤔 `CesiumWidget 类` 还有其他值得挖掘的点，值得挖掘的是它所管理的其他类，阅读后面的源码再做总结。

目前没有必要再继续深究 地球是如何绘制的 实体是如何绘制的，这涉及 Globe 、Primitive 等数据实体的更新和渲染，也涉及到 WebGL 在 Cesium 中如何调度 —— 这些都不是渲染循环这个概念中的内容。

### 5  参考资料

[Cesium原理篇：1最长的一帧之渲染调度 - fu*k ](https://www.cnblogs.com/fuckgiser/p/5744509.html)

[CesiumJS 2022^ 源码解读 使用 requestAnimationFrame 循环触发帧动画](https://zhuanlan.zhihu.com/p/493708959)

[cesium 场景Scene - 简书 (jianshu.com)](https://www.jianshu.com/p/b48e4a9436b7)

[【cesium知识梳理】3.各类事件 ](https://juejin.cn/post/7264779043211821096)

[Cesium快速上手1-CesiumWidget-Scene结构](https://blog.csdn.net/sky___Show/article/details/132089197)





## 02 Cesium中的地球渲染

<img src="https://github.com/githubli1123/CesiumExampleCollection/blob/main/Img/02Cesium%E7%9A%84%E5%9C%B0%E7%90%83%E6%B8%B2%E6%9F%93%E8%BF%87%E7%A8%8B/%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E4%BA%8B%E4%BB%B6%E4%B8%AD%E7%9A%84render%E8%8A%82%E7%82%B9.png?raw=true" alt="图片资源在该项目中可以找到：生命周期事件中的render节点"  />

得找到哪些类是用于绘制地球的。

从 scene 类出发，因为它是单帧渲染的起始，它原型上的 render 方法划分了生命周期事件，并在这些事件中间穿插了具体的用于渲染地球或者实体的函数，统一放在了函数 render 里，同时也穿插做了其他事情，下面探讨一下。

<img src="https://github.com/githubli1123/CesiumExampleCollection/blob/main/Img/02Cesium%E7%9A%84%E5%9C%B0%E7%90%83%E6%B8%B2%E6%9F%93%E8%BF%87%E7%A8%8B/%E6%B8%B2%E6%9F%93%E5%9C%B0%E7%90%83%E7%9A%84%E4%B8%89%E4%B8%AA%E9%87%8D%E8%A6%81%E9%98%B6%E6%AE%B5-%E8%AF%A5%E5%9B%BE%E7%89%87%E5%8F%AF%E5%9C%A8%E8%AF%A5%E9%A1%B9%E7%9B%AE%E4%B8%AD%E6%89%BE%E5%88%B0.png?raw=true" alt="渲染地球的三个重要阶段-该图片可在该项目中找到"  />

现在看看函数 `fn render()`，这个函数中目前着重看待上方三个蓝色标识的函数。但是我们还需要带上一个函数： `Globe.prototype.update() `。我们需要站在渲染责任角度看待这些过程，这些过程是为了渲染地球影像瓦片四叉树。先清楚这四个过程的名字：update ~~ beginFrame ~~ render（updateAndExecuteCommands） ~~ endFrame。

> updateAndExecuteCommands 是 Scene 中的一个重要的原型上私有静态函数。根据不同的视图模式来选择不同的具体的执行函数，起到这样一个作用。
>
> Globe 类可看做一个物体，Scene 类可看做一个容器。Globe 中的方法提供给 Scene 调用，Scene 是 Globe的渲染过程的控制者。
>
> 创建 cesiumWidget 时会即刻创建如下对象：canvas（一定创建）、scene（需要webgl支持才可创建）、globe、skyBox、skyAtmosphere、baseLayer。当然，这些 globe、skyBox、skyAtmosphere、baseLayer 对象是否被创建需要看传递给 cesiumWidget 的参数 options 中是否存在，她们创建后会被挂载到 scene 实例上，被 Scene 统一管理。可是查看代码可以发现：globe 对象是特殊的。她是可以缺失的，但她的创建也是需要依赖 ellipsoid（这很容易理解），那么按理来说 ellipsoid 应该只出现在 globe 对象内部，可是创建 globe 对象又需要 ellipsoid ，导致 ellipsoid 似乎“不合时宜” 地出现在 cesiumWidget 。

> 碎碎念：一个 Scene 类被实例化后，会在内部创建 globe 属性并赋值为 undefined，但是我在这个类中无法知道这个属性何时会发生改变，何处的代码会让 globe 改变，这样是不是会让编程人员产生额外的心智负担？ 我目前认为这种现象是必然的，一个类的属性改变就是需要 “外部” 代码（cesiumWidget类）。但是我们可以限制这个 “外部” 代码的范围（只允许cesiumWidget类改变 globe 属性），让这个属性的改变不要随心所欲以免造成预期之外的情况。
>
> 不太正确的感悟：Cesium 在设计各种类时，是有着层级的划分的，最顶层的是 Viewer，越往下就是职责划分的越细，往往是相邻两层的类有着密切联系。



```js
  this._surface = new QuadtreePrimitive({
    tileProvider: new GlobeSurfaceTileProvider({
      terrainProvider: terrainProvider,
      imageryLayers: imageryLayerCollection,
      surfaceShaderSet: this._surfaceShaderSet,
    }),
  });

地表
  |---影像
  |---地形
  |---地表着色器
```







**① update过程**

概述：update 过程主要做的事情是更新容器内所有 `ImageryLayer` 的可见状态，触发 layerShownOrHidden 事件。

```
 Globe.prototype.update()
 
	[Module QuadtreePrimitive.js]
	QuadtreePrimitive.prototype.update()
	
         [Module GlobeSurfaceTileProvider.js]
         GlobeSurfaceTileProvider.prototype.update()
         
               [Module ImageryLayerCollection.js]
               ImageryLayerCollection.prototype._update()
```

下面介绍一下出现的类的主要作用：

Globe：拥有 影像瓦片四叉树、地形瓦片四叉树 等。控制影像和地形的渲染和销毁。与地球相关的射线检测（找地球与射线的交点位置）。

QuadtreePrimitive：拥有所有瓦片。提供四叉树的数据结构和对应渲染流程的具体的处理方法。

GlobeSurfaceTileProvider：拥有 椭球体，瓦片分割模式tilingScheme 。提供四叉树瓦片和对应渲染流程的具体的处理方法。

ImageryLayerCollection：四叉树瓦片存放的容器，提供该容器对瓦片的增删改查等方法。

QuadtreeTile：QuadtreePrimitive 的一个瓦片，保存着这个瓦片的空间信息并管理该层级下的资源数据（图片，地形数据等），提供空间信息的查询方法和对资源的清除方法。其中有一个重要的属性成员 data ，

TileImagery：*The assocation between a terrain tile and an imagery tile.*



**② beginFrame过程**

概述：重置各种状态，释放所有瓦片资源，清除瓦片四叉树内的加载队列。



（1）Globe.prototype.beginFrame 这个方法主要做了以下事情：

1. 检查是否需要加载更新海洋法线贴图资源。
2. 设置地球表面瓦片提供者的各种参数，例如最大屏幕空间误差、缓存大小、加载限制等。
3. 设置瓦片提供者的各种参数，包括光照距离、夜晚淡入淡出距离、海洋高光强度、水面遮罩等。
4. 通道判断，若为渲染通道，才设置 `GlobeSurfaceTileProvider` 的一系列状态并把渲染职责递给 QuadtreePrimitive （即 Globe 实例中的 surface 对象调用 `beginFrame` 方法）。



（2）QuadtreePrimitive.prototype.beginFrame 方法：✨重点

1. 无效化全部瓦片（即重置状态），`invalidateAllTiles()` 。
   - 条件：当 `GlobeSurfaceTileProvider` 改变了它的 `TerrainProvider` 时，会要求下一次起帧时 `QuadtreePrimitive` 重设全部的瓦片。
   - 作用：`QuadtreePrimitive` 类来做到清除瓦片加载队列；随后，若 `QuadtreePrimitive` 类中存在零级根瓦片 数组成员，那么就调用零级根瓦片数组中每个元素（`QuadtreeTile` 类型）的 `freeResources` 方法，释放掉该层级上所有瓦片（`TileImagery` 类型）拥有的数据资源以及递归释放子层级上的所有瓦片资源。
2. 重新初始化 `GlobeSurfaceTileProvider`，`GlobeSurfaceTileProvider` 原型链上的 `initialize` 方法。
   - 作用①是判断影像图层是否顺序有变化，有则对瓦片四叉树的每个 `QuadtreeTile` 的 data 成员上的数据瓦片重排列
   - 作用②是释放掉 `GlobeSurfaceTileProvider` 上上一帧遗留下来待销毁的 `VertexArray`
3. 清除瓦片四叉树内的加载队列，`clearTileLoadQueue()`。
   - 清空了 `QuadtreePrimitive` 对象上三个私有数组成员，即在第 5 部分要介绍的三个优先级瓦片加载队列，并把一部分调试状态重置。



> 碎碎念：解析、投影、下载、渲染、回退。但是这个流程的任务被细化并拆分到update、 beginFrame、updateAndExecuteCommands、endFrame 这三个阶段中。
>
> 既然散落在各处，但我相信 Cesium 会把这些东西给合理安排的。接下来看 下载、解析、投影、渲染、回退 流程在beginFrame中有怎么体现，需要借助《3D Engine Design for Virtual Globes》这本书来梳理和归纳。



**③ render过程**

概述：根据帧状态选择要加载的新贴图，并创建渲染命令。



先后执行的函数：

1️⃣ updateAndExecuteCommands()方法：

`updateAndExecuteCommands()` 函数是 Scene 中的一个条件判断和选择分支的函数，最终会依据条件选择先后执行`updateAndRenderPrimitives()` 和 `executeCommands()` 这两个及其重要的函数。

```
function updateAndRenderPrimitives(scene) {
  const frameState = scene._frameState;
  // 贴地 primitive
  scene._groundPrimitives.update(frameState);
  // 一般 primitive
  scene._primitives.update(frameState);
  // ？
  updateDebugFrustumPlanes(scene);
  // 阴影帖图
  updateShadowMaps(scene);
  // 地球 🎉
  if (scene._globe) {
    scene._globe.render(frameState);
  }
}
```

2️⃣ updateAndRenderPrimitives() 方法：更新 Primitives ，渲染地球，把渲染职责递给了 Globe 。

3️⃣ Globe.prototype.render 方法：条件 地球可见时，若有 _material 则根据渲染帧上下文来更新 _material ，然后渲染职责递给 QuadtreePrimitive 。（ _material 初始化是 undefined， 会涉及 makeShadersDirty 函数
getter 和 setter：获取或设置地球的材质外观。这可以是多个内置 Material 对象之一，也可以是使用 Fabric 编写脚本的自定义材质。）

4️⃣ QuadtreePrimitive.prototype.render 方法：根据 *frame state* 选择新的 *tiles* 。为选择的 tiles 创建渲染指令 *creates render commands*。

1. GlobeSurfaceTileProvider.prototype.beginUpdate(frameState); 清空 tilesToRenderByTextureCount 中的瓦片列表。更新裁剪平面。重置一些状态。
2. fn selectTilesForRendering(this, frameState); 🌟 根据 *frame state* 选择新的 *tiles* 
3. fn createRenderCommandsForSelectedTiles(this, frameState); 🌟 为选择的 tiles 创建渲染指令 
4. GlobeSurfaceTileProvider.prototype.endUpdate(frameState); 将创建好的 **绘图指令** 添加到帧状态对象（`FrameState`）中。

QuadtreePrimitive.prototype.render 方法 分为三个阶段：

一阶段 tileProvider.beginUpdate

二阶段  selectTilesForRendering() 和 createRenderCommandsForSelectedTiles()

三阶段 tileProvider.endUpdate

```
一阶段
这段代码是 GlobeSurfaceTileProvider 对象的 beginUpdate 方法，它在开始更新地球表面瓦片的过程中执行以下操作：

1. 清空 tilesToRenderByTextureCount 中的瓦片列表：
遍历 tilesToRenderByTextureCount 数组，对每个纹理贴图数量对应的瓦片列表进行清空操作。
这样做是为了准备接收新一轮更新后的瓦片数据。

2. 更新裁剪平面：
如果存在裁剪平面，并且已启用，则调用 clippingPlanes.update(frameState) 方法更新裁剪平面。
裁剪平面用于在渲染过程中对瓦片进行裁剪，以提高渲染性能或实现特定效果。

3. 重置已使用的绘制命令数目：
将 _usedDrawCommands 属性重置为 0。
这个属性用于记录当前帧已经使用的绘制命令数量，重置为 0 表示开始了新一轮的绘制过程。

4. 重置已加载的瓦片和填充瓦片的标志位：
将 _hasLoadedTilesThisFrame 和 _hasFillTilesThisFrame 标志位都设置为 false。
这两个标志位用于记录当前帧是否已经加载了瓦片或填充了瓦片，重置为 false 表示开始了新的渲染过程，需要重新记录。
```

```
二阶段

两个重要函数🌟

selectTilesForRendering：瓦片可见性、是否被选择贯穿始终
1. 清空待渲染瓦片的数组容器 _tilesToRender：
瓦片四叉树类（QuadtreePrimitive）会立即清空其自身成员 _tileToRender 待渲染瓦片数组（元素的类型是QuadtreeTile）中的所有元素。这说明 Scene 渲染一帧时会完全清空上一帧要渲染的四叉树瓦片。 
❓为什么不在 beginFrame 过程中执行这个操作？？？需要看看这个待渲染瓦片数组的内容。

2. 判断零级瓦片的存在和创建零级瓦片 _levelZeroTiles：
在零级贴图存在之前，我们无法渲染任何内容。不存在则要创建出来。若瓦片四叉树类中的成员 tileProvider（GlobeSurfaceTileProvider） 不存在，是无法创建零级瓦片的。
创建零级瓦片依赖 QuadtreeTile 的静态方法 createLevelZeroTiles() ，传入瓦片四叉树上的瓦片分割模式参数 tilingScheme 来创建零级瓦片。
createLevelZeroTiles() 核心是 根据传入的 tilingScheme 参数来得到 WebMercator 是正方形区域还是经纬度长方形区域，接着用一个简单的两层循环不断创建单个 QuadtreeTile 并添加到返回结果中，最终给到零级瓦片 _levelZeroTiles。

⭕我需要明白四叉树的实现方式，那么我就需要去了解四叉树类的成员和方法。这个渲染流程的分析暂时搁置，先去分析一下四叉树的实现。详情见...

3. 递归遍历零级瓦片🔄
当执行这一步时，表明零级瓦片数组必定存在零级瓦片。然后做一些简单的相机运算，状态、数据运算，紧接着以深度优先，从近到远的顺序遍历零级瓦片数组。
具体的代码逻辑是：遍历零级瓦片数组，对每个瓦片元素判断是否可以渲染，不能则代表此四叉树瓦片还没下载完数据，将它放入 高优先加载队列 📋🔜 ，在 endFrame 终帧过程中执行下载操作，可渲染则执行 fn visitIfVisible() 函数。

优先级：是否渲染 tile.renderable，瓦片被细化且瓦片的子瓦片是否upsampled，

fn visitIfVisible()
3.1 计算是否可见，剔除瓦片：
	可见：立即进入递归访问瓦片的函数 visitTile() 。
		3.1.1 检查瓦片是否可以细化（refine）：
		如果瓦片可以细分，代码会检查其四个子瓦片（西南、东南、西北、东北）
		是否都是通过上采样（upsampled）得到的。
		如果所有子瓦片都是通过上采样得到的，那么就没有必要渲染这些子瓦片，直接渲染当前瓦片，
		将这个无需等待子元素的已经被渲染的 tile 放入 中优先加载队列 📋🔜 。
		同时，确保这些子瓦片不会被卸载，不忘记她们是被 upsampled 来的。
		
		3.1.2 细分瓦片：
		如果子瓦片不是全部通过上采样得到的，不需要将这些子瓦片添加到队列中。
		visitVisibleChildrenNearToFar() 会根据照相机位置（cameraPosition）的方位，
		从近到远地访问瓦片的子瓦片。具体来说，它根据相机位置所在的象限（东南、西北、西南、东北）
		来访问子瓦片，并调用 visitIfVisible 函数来检查每个子瓦片是否可见，以及是否需要进一步细分。
		总的来说就是细化当前瓦片，递归调用 visitIfVisible() 来实现瓦片全部细分。
		在访问子瓦片的过程中，会检查哪些子瓦片是可见的，哪些需要加载，哪些已经渲染过等。
		如果某个子瓦片是可见的，并且之前没有渲染过，那么它会添加到渲染列表中。
		如果某个子瓦片是可见的，但是之前已经渲染过，那么它会更新其高度信息。
		
		# 检查子图块渲染情况，是否有子图块被添加到了渲染列表中。
		firstRenderedDescendantIndex 表示第一个被渲染的子图块在 _tilesToRender 数组中的索引。
		如果索引值不等于 _tilesToRender 的长度，说明至少有一个子图块被添加到了渲染列表中。
		如果有子图块被添加到了渲染列表中，接下来会处理这些子图块的渲染状态和加载情况。
		先获取子图块的渲染详情： traversalDetails 对象中获取，用于了解访问子图块期间发生的情况。
		然后需要处理未准备好的子tile。
		
		# 处理子图块的渲染状态和加载
		## 如果发现一些子tile还没有准备好渲染，并且上一帧也全都没被渲染过，
		那么将所有这些子tile从渲染列表中剔除
		（❓将该层级所有待渲染的tile及其祖先标记为被剔除 TileSelectionResult.KICKED 状态）。
		## 接着更新渲染列表：将渲染列表中从 firstRenderedDescendantIndex 开始的所有子图块移除，
		添加当前 tile 到渲染列表中。同时，更新 _tileToUpdateHeights 数组。
		## 处理加载逻辑：如果在上一帧没有渲染过当前 tile，并且有很多子图块还没有准备好渲染，
		那么将当前 tile 添加到 中优先加载队列 📋🔜 。
		
		## 更新遍历详情traversalDetails:
		更新 traversalDetails 中的 allAreRenderable 和 anyWereRenderedLastFrame 字段。
		## 更新高度信息:
		如果当前 tile 是新渲染的，将其添加到 _tileToUpdateHeights 数组中，用于后续更新高度信息。
		## 调试计数器增加，增加调试计数器，用于跟踪等待子图块加载的情况。
		# 预加载祖先图块:如果需要预加载祖先图块，并且当前 tile 没有被添加到加载队列中，
		将当前 tile 添加到 低优先级加载队列 📋🔜 。
		
		剩下的活儿就是把合适的瓦片添加至瓦片四叉树上的 _tilesToRender 数组，
		并再次发起 高优先的瓦片加载队列 📋🔜 的加载行为。收尾，更新遍历详情traversalDetails。


	不可见：又涉及三个分支，这里暂时不分析。



💫这个阶段的事情是比较复杂的，需要绘制一个流程图来辅助理解。



createRenderCommandsForSelectedTiles：

这个 showTileThisFrame 方法会统计传进来的 QuadtreeTile 的 data 成员（ TileImagery 类型） 
上的 imagery 成员（Imagery[] 类型）有多少个是准备好的，条件有二：
Imagery 数据对象是准备好的；
Imagery 对象对应的 ImageryLayer 不是全透明的。


```

```
三阶段
这段代码是 GlobeSurfaceTileProvider 对象的 endUpdate 方法

1. 初始化渲染状态：
   - 如果当前没有定义渲染状态 (this._renderState)，则根据配置创建渲染状态。
   - 创建的渲染状态包括：启用剔除、启用深度测试、设置深度测试函数等。

2. 根据当前帧的加载和填充瓦片情况，更新填充瓦片的高度：
   - 如果当前帧同时存在加载的瓦片和填充的瓦片，则需要将加载的瓦片的高度信息传递给填充的瓦片。
   - 调用 TerrainFillMesh.updateFillTiles 方法更新填充瓦片的高度信息。

3. 处理垂直夸张变化：
   - 检测垂直夸张是否发生了变化，如果发生了变化，则需要更新加载的瓦片的地形夸张效果。
   - 遍历加载的瓦片，调用 updateExaggeration 方法更新瓦片的地形夸张效果。

4. 生成绘制命令：🌟
   - 根据瓦片的纹理数量和加载状态，为每个瓦片生成绘制命令，并添加到渲染命令列表中。
   - 遍历 tilesToRenderByTextureCount 数组，对每个纹理贴图数量对应的瓦片列表进行处理，
   	 为每个瓦片生成绘制命令，并更新当前帧的最小地形高度。
```



**④ endFrame 过程**









关于地球影像皮肤渲染的 “职责” 函数 在 Globe.render ，然后就把任务分为 this._material.update(); 和 this._surface.render(); 

❓我们会在 executeCommandsInViewport 函数中发现这两个函数 `updateAndRenderPrimitives` 和 `executeCommands` ，我很诧异！为什么会先更新和渲染primitives然后再执行webgl命令，从命名语义上看，`updateAndRenderPrimitives` 函数已经把primitives给画到屏幕上了，那还执行 commands 个什么劲。

✅仔细看看`updateAndRenderPrimitives` 就破案了，这里的 primitives 是指的 globe，渲染的是 globe。难道 `executeCommands`  就一点都不管 gobe 的渲染了吗？目前我们假设是的。

那么这里就要给大家看一张图，这张图表达了 数据，场景和渲染器 之间的关系，同时归纳总结了 primitives 这个 “数据集”：

<img src="https://images.prismic.io/cesium/2015-05-26-0.png?auto=compress%2Cformat&rect=0%2C0%2C1191%2C717&w=945"  />

援引自文章：https://cesium.com/blog/2015/05/26/graphics-tech-in-cesium-stack/







<img src="https://github.com/githubli1123/CesiumExampleCollection/blob/main/Img/02Cesium%E7%9A%84%E5%9C%B0%E7%90%83%E6%B8%B2%E6%9F%93%E8%BF%87%E7%A8%8B/%E4%B8%80%E6%AD%A5%E4%B8%80%E6%AD%A5%E6%89%BE%E5%88%B0%E5%9C%B0%E7%90%83%E6%B8%B2%E6%9F%93%E7%9B%B8%E5%85%B3%E5%87%BD%E6%95%B0-%E8%AF%A5%E5%9B%BE%E5%8F%AF%E5%9C%A8%E8%AF%A5%E9%A1%B9%E7%9B%AE%E4%B8%AD%E6%89%BE%E5%88%B0.png?raw=true" style="zoom:67%;" />



CesiumWidget

Scene

Globe

Ellipsoid

QuadtreePrimitive



Globe 的作用：





## 03  从 Cesium 中的 Primitive 出发，到理解 Cesium 渲染架构

（本章需要整理）

指令：

CesiumJS 将 WebGL 的绘制过程（也就是行为）封装成了“指令”，不同的指令对象有不同的用途。指令对象保存的行为，具体就是指 由 Primitive 对象（不一定全是 Primitive）生成的 WebGL 所需的数据资源（缓冲、纹理、唯一值等），以及着色器对象。数据资源和着色器对象仍然是 CesiumJS 封装的对象，而不是 WebGL 原生的对象，这是为了更好地与 CesiumJS 各种对象结合去绘图。由此可见， Cesium 封装的程度非常高。

> 此段文字来源自：[CesiumJS 2022^ 源码解读2 渲染架构之 Primitive - 创建并执行指令 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/496497442)

怎么知道 CesiumJS 有哪些指令？具体内容又是什么？



通道：

Cesium 中，一帧的画面是由多个通道按照固定的顺序依次绘制后构成的，通道英文单词是 `Pass`。

其顺序保存在 `Renderer/Pass.js` 模块导出的冻结对象中，目前（1.116版本）有 10 个优先顺序等级（最后 `NUMBER_OF_PASSES` 是通道的数量）：

```js
const Pass = {
  // If you add/modify/remove Pass constants, also change the automatic GLSL constants
  // that start with 'czm_pass'
  //
  // Commands are executed in order by pass up to the translucent pass.
  // Translucent geometry needs special handling (sorting/OIT). The compute pass
  // is executed first and the overlay pass is executed last. Both are not sorted
  // by frustum.
  ENVIRONMENT: 0,
  COMPUTE: 1,
  GLOBE: 2,
  TERRAIN_CLASSIFICATION: 3,
  CESIUM_3D_TILE: 4,
  CESIUM_3D_TILE_CLASSIFICATION: 5,
  CESIUM_3D_TILE_CLASSIFICATION_IGNORE_SHOW: 6,
  OPAQUE: 7,
  TRANSLUCENT: 8,
  VOXELS: 9,
  OVERLAY: 10,
  NUMBER_OF_PASSES: 11,
};
```

❓The compute pass is executed first and the overlay pass is executed last. Both are not sorted by frustum. 对于这注释我不理解。



### 1 生成指令 - Primitives 生成指令

看 `updateAndRenderPrimitives()`函数。

`Scene.js` 模块内的函数 `updateAndRenderPrimitives()` 负责更新 Scene 上的 Primitives。

期间，渲染职责会通过 `PrimitiveCollection` 转移到 `Primitive` 类（或者有类似结构的类，譬如 `Cesium3DTileset` 等）上，即调用 Primitive.prototype.update 方法。该方法会令其更新本身的数据资源，根据情况创建新的着色器，并随之创建或更新 **绘图指令**，最终在 `Primitive.js` 模块内的 `updateAndQueueCommands()` 函数排序、并推入帧状态对象的指令列表 frameState.commandList 上。

> 是怎么知道 `Primitive` 类会有类似结构的类的捏？ 这就需要看官方文档中放出的对于 Pirmitives 的分类。

<img src="https://images.prismic.io/cesium/2015-05-26-0.png?auto=compress%2Cformat&rect=0%2C0%2C1191%2C717&w=945"  />

这里贴出 Primitive.prototype.update 方法的具体功能

1. **检查是否需要更新**：
   - 如果`Primitive`对象没有几何实例（`geometryInstances`）或外观（`appearance`），或者不在3D场景中，或者不在渲染或拾取的帧中，那么就不需要更新。
2. **处理错误**：
   - 如果`Primitive`对象的状态是`FAILED`，那么抛出错误。
3. **创建批处理表**：
   - 如果`Primitive`对象没有批处理表（`_batchTable`），那么创建一个批处理表。
4. **更新批处理表**：
   - 如果批处理表有属性，并且支持顶点纹理提取，那么更新批处理表。
5. **加载几何实例**：
   - 如果`Primitive`对象的状态不是`COMPLETE`或`COMBINED`，那么根据`asynchronous`属性决定是异步加载还是同步加载几何实例。
6. **更新批处理表边界球体和偏移量**：
   - 如果`Primitive`对象的状态是`COMBINED`，那么更新批处理表的边界球体和偏移量。
7. **创建顶点数组**：
   - 如果`Primitive`对象的状态是`COMBINED`，那么创建顶点数组。
8. **检查是否需要重新计算边界球体**：
   - 如果`Primitive`对象需要重新计算边界球体，那么重新计算。
9. **创建或重新创建渲染状态和着色器程序**：
   - 如果外观或材质发生了变化，那么创建或重新创建渲染状态和着色器程序。
10. **更新命令**：
    - 根据外观、材质、透明度等属性，更新命令。
11. **更新并排队命令**：
    - 更新并排队的命令，推入帧状态对象的指令列表 frameState.commandList 上，以便在渲染过程中使用。



### 2 待执行指令集的优化

 看 `executeCommands()` 函数。

多段视椎体技术，筛选可见集。



如果不加优化，最简单的策略就是直接把指令集合中所有指令执行一遍，随后在屏幕上展现出来。这显然是不妥的。 最好的优化就是不渲染。

Cesium 使用的多段视椎体技术来将视锥体由远及近切成多个区域，相机近段的指令足够多以保证效果，相机远段的指令尽量少来提高性能。





## 04 从 Cesium 中的 Entity 出发看 







## 05 Cesium 的时间和时钟

（本章需要整理）

时间、时钟、时钟跳动、时间表示法、不同时间表示法的转换、实体与时钟的关系。

时钟系统包含：

widget：TimeLine、Animation

engine：Clock、JulianDate

跟 Clock 相关的主要有 Animation控件 和 Timeline控件 ，通常两者会搭配在一起使用。

Viewer 在初始化时，内部会创建一个 Clock ，所以建议开发者使用 viewer.cesiumWidget.clock 而不是自己创建Clock，毕竟在一个应用内，时间通常都是标准的，创建多个 Clock 反而混淆了。

Q1：那可以创建多个 TimeLine与Animation的组合 吗？



Q2：时间在 Cesium 中到底有发挥了什么功能？

- 首先，我们可以自定义帧率，为属性 targetFrameRate 设置值后可以让浏览器以设定的帧率渲染。由此体现时间的一个作用，帮助实现 设置目标帧率 功能。内部实现中需要当前帧时间与上一帧时间的差值大于帧时间间隔就渲染和改变尺寸，否则不渲染不改变尺寸。但浏览器依然勤勤恳恳地一个不落下地执行*requestAnimationFrame*(render) 。

  帧时间：在 浏览器 中会为渲染帧设置的一种时间，便于得到前后两帧之间的差值。调试源码发现是浮点数（类似 478.3 这种），会不断变大。第一帧的帧时间不可能为0，可能因为浏览器是把 requestAnimationFrame 的回调函数执行完成后的那个时间点作为第一帧的帧时间，仔细想想应该确实如此嘿嘿😁。

- 其次，每一帧的逝去都必然伴随着一次 clock tick 。Cesium 中的时间和现实中的时间都是永不停歇一直向前的，逝者如斯夫，不舍昼夜。直到浏览器标签页关闭，大道磨灭。
- 时间的首次创建是在 Scene 的实例化过程中。在不少应用 CesiumJS 着色器的文章中就用 `FrameState` 上的 `frameNumber` 来变相获取当前时间。可以看出，在 60FPS 的屏幕上，通过 `frameNumber / 60` 就可粗略获得当前时间值（秒），但是一旦浏览器的帧速率变化，比如 144 FPS，可是着色器中只考虑了 60FPS 情况，这个计算获得的时间就很不准确。而真正的时间值在帧状态对象 `scene._frameState` 的 `time` 字段上，推荐使用该成员值作为当前时间值。对于`JulianDate.now` 方法，无论什么时候初始化 CesiumJS，获取的时间值永远都是该方法运行的那个时刻。

```js
function Scene (/**/) {
  // ...
  updateFrameNumber(this, 0.0, JulianDate.now());
  // ...
}

function updateFrameNumber(scene, frameNumber, time) {
  const frameState = scene._frameState;
  frameState.frameNumber = frameNumber;
  frameState.time = JulianDate.clone(time, frameState.time);
}

JulianDate.now = function (result) {
  return JulianDate.fromDate(new Date(), result);
}
```

- 时间表示法。CesiumJS 使用 `JulianDate` 类来表示整个程序中的时间，它是一种天文时间系统，叫作“儒略”日期，它有两个成员字段，一个是自儒略第一天（公元前 4713 年 1 月 1 日）到现在的天数 `dayNumber`，另一个是今天已经走过的秒数（零点起算）`secondsOfDay`。

  > 注：我们所说的公历时间，即 GregorianDate（格里日历记法），在 CesiumJS 中也是有的，是作为 JS 原生类 Date 的高精度替代品。

- 时钟跳动。**每当调用 `tick` 时，会获取当前的时刻 `clock.currentTime`，然后调用 `JulianDate.addSeconds()` 方法把时间往前推。** 随后返回这个 currentTime 时间值，她将作为该帧中渲染实体的 “ 基准时间 ” ，帧渲染的生命周期函数就会使用这个 currentTime 。





Iso8601："2024-01-25T00:07:34.7999999523162842Z"

GregorianDate（格里高利历）

## 06 Cesium 中的 Property机制







## 0 跑通 Hello World 示例

代码非常之简短，就可以搭建一个地球及其时间轴、图层控制等各类部件：

```
const viewer = new Cesium.Viewer("cesiumContainer");
```

从这句代码中可以看出给 Viewer 提供了一个字符串，但实际上这个字符串是 HTML 中一个存在的 div 的 id 名称。即为 Viewer 提供一个容器就可以创建 Cesium 基础示例。



接下来，一点一点 dubugger ，看看整体流程。

### 1 

在 new Viewer 时，主要是创建一个基于 Cesium 的应用程序的基础小控件。这个小部件将所有标准的 Cesium 小控件组合在一起，形成一个可重用的包。通过使用混合（mixins），可以扩展这个小部件以添加对各种应用程序有用的功能。

主要功能包括：

- **初始化容器和选项**：检查并获取容器元素，处理初始化选项。
- **创建基础小控件**：根据选项创建各种小部件，如动画、时间轴、全屏按钮、场景模式选择器等。
- **处理数据源**：初始化数据源集合，并处理数据源的添加和删除事件。
- **事件处理**：处理各种事件，如时钟更新、场景模式变化、数据源变化等。
- **UI交互**：处理用户界面交互，如点击、双击、拖放等。

在  new Viewer 时会 new CesiumWidget ，可以看作这个是 Cesium 的渲染场景的窗口部件，也是渲染调度器，CesiumWidget 当中包含 地球、天空盒等实体和一些设置（例如useDefaultRenderLoop）。

Q1：如何初始化这些容器，又是如何赋予容器样式的捏？

A1：我们来看 TimeLine 是如何创建的。其他均可举一反三。

下面说明了 TimeLine 的 HTML 容器部分如何由 JavaScript 完成，并且注册了 settime 事件。

```
// Timeline
// 声明 实例化对象 变量
let timeline;
// 判断是否需要创建容器和实例化
if (!defined(options.timeline) || options.timeline !== false) {
  // 创建，挂载容器和赋予类名
  const timelineContainer = document.createElement("div");
  timelineContainer.className = "cesium-viewer-timelineContainer";
  viewerContainer.appendChild(timelineContainer);
  // 实例化 Timeline，细分并创建挂载 timeLine 部件中的小部件（组成成分）。
  timeline = new Timeline(timelineContainer, clock);
  timeline.addEventListener("settime", onTimelineScrubfunction, false);// 看下面
  timeline.zoomTo(clock.startTime, clock.stopTime);
}

// settime 事件触发后 onTimelineScrubfunction 执行
function onTimelineScrubfunction(e) {
  const clock = e.clock;
  clock.currentTime = e.timeJulian;
  clock.shouldAnimate = false;
}
```

```js
// 在 new TimeLine 末时，会注册这个事件名称。
const evt = document.createEvent("Event");
evt.initEvent("settime", true, true);
evt.clientX = xPos;
evt.timeSeconds = seconds;
evt.timeJulian = this._scrubJulian;
evt.clock = this._clock;
this._topDiv.dispatchEvent(evt);
```

```js
Timeline.prototype.addEventListener = function (type, listener, useCapture) {
  // 为该指定 div 添加某个类型的事件。
  this._topDiv.addEventListener(type, listener, useCapture);
};
```

下面说明 TimeLine 的 CSS 样式部分如何由 JavaScript 完成，屁也不是哦，就是直接引入。

```
import "../Widgets/widgets.css";
```

我还以为可以在 Cesium 中内部又有一些代码可以自动引入文件😕。或者为这些 div 动态赋予 CSS 样式。但仔细想想，这样可能是最佳实践，因为我们开发者可能会需要修改默认的 CSS 样式，如果使用 JavaScript 来为 div 赋予样式，就需要为开发者提供修改 CSS 的接口（还不一定好用），那这样倒不如直接引入修改后的 CSS 样式。况且 CSS 本来就作为前端基石之一，有着她的重要性和作用，不是非要使用 JavaScript 来统一管理。

到此，Cesium 已经创建了很多部件的容器了。接下来分析最重要的场景容器。

### 2 

此时，看看 new CesiumWidget 做了哪些事情。

用于创建一个包含 Cesium 场景的小部件。这个小部件可以用于显示 3D 地球、地形、天空盒、太阳、月亮等。

主要功能包括：

1. **初始化容器和选项**：检查并获取容器元素，处理初始化选项。
2. **创建场景**：根据选项创建 Cesium 场景，包括设置天空盒、地形、影像图层等。
3. **处理错误**：如果创建场景时发生错误，会显示错误面板。
4. **处理渲染循环**：**如果 `useDefaultRenderLoop` 为 `true`，则启动默认的渲染循环。**
5. **处理分辨率和像素比例**：根据浏览器支持的分辨率和设备像素比例，调整画布的大小和像素比例。
6. **处理相机**：根据选项设置相机的初始状态，包括场景模式、地图投影等。
7. **处理事件**：处理画布的右键菜单和选择开始事件，以防止默认行为。

此外，代码还处理了一些错误情况，例如容器元素不存在、选项不合法等。通过这些功能，`CesiumWidget` 小部件能够提供一个功能丰富、易于使用的 Cesium 场景显示框架。

可以看到创建 CesiumWidget 和创建 Viewer 做的一些事情十分相像。我们可以理解为 Viewer 在搭建整体，而 CesiumWidget 对其这个渲染场景的窗口部件中所呈现的实体和事件处理做了更加细致的工作。并开启了渲染循环。



### 3 

此时，在 new CesiumWidget 时开启了渲染循环。画面随时间的跳动一帧一帧的绘制和展示，动画效果也是随时间一帧帧地更新（此处还需要单开一个章节）。不管如何，时间必然会跳动 tick ，场景内的地球这些实体会在每一次时间 tick 后 render （这也就是一帧），让动画也是在随后的每一帧中随时间跳动，tick 后 animation。
