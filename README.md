对于该项目文件夹的介绍可以查看 [ps.txt](https://github.com/githubli1123/CesiumExampleCollection/blob/main/ps.txt) 。

才疏学浅，写的一般。

🎯正在梳理第二篇章和重温《WebGL编程指南》这本书......

# Cesium 源码解读

### 文章目录

00 文章目录与源码简单调试   [👉🔗](https://github.com/githubli1123/CesiumExampleCollection/blob/main/Temp/%E9%9C%80%E8%A6%81%E5%8F%91%E5%B8%83%E7%9A%84%E5%8D%9A%E5%AE%A2/00%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E4%B8%8E%E6%BA%90%E7%A0%81%E7%9A%84%E7%AE%80%E5%8D%95%E8%B0%83%E8%AF%95/00%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E4%B8%8E%E6%BA%90%E7%A0%81%E7%AE%80%E5%8D%95%E8%B0%83%E8%AF%95.md)

01 Cesium的渲染调度  [👉🔗](https://github.com/githubli1123/CesiumExampleCollection/blob/main/Temp/%E9%9C%80%E8%A6%81%E5%8F%91%E5%B8%83%E7%9A%84%E5%8D%9A%E5%AE%A2/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6.md)



## 00 文章目录与源码的简单调试

本篇文章持续更新，感觉调试源码和阅读源码的方法会随着工具的更新与 AI 的迭代不断改变优化，让我们更好的理解源码。而且本人比较喜欢通过图像表格来记忆和理解，图表出现较为频繁。文章风格介绍

拥有这些风格：

- 关注主体。只看主要的流程，只考虑这种情况：即第一次使用 Cesium 时创建的例子，实例代码链接在此 [👉🔗](https://sandcastle.cesium.com/)。
- 遗留问题。有些代码或者流程无法直接梳理清楚，会留下问题，等待后面阅读源码的其他部分后再来解答。
- 不断重复。有一些图或者表述会不断重复，一个是需要有这些来让我的表述更加有逻辑和直观，让知识点有部分关联，二是让读者记忆深刻。
- ......

没有这些风格：

- 注重关联。知识点或者类关系尽量不做过多关联，可能没法让你触类旁通或者知识点之间的链接较弱。
- 表述严谨。本身我目前也处于阅读源码的前期阶段吧，表述比较随意，望谅解。
- ......



### 1> 如何做到对源码进行简单调试

✅这里就不再赘述源码工程目录了（如果需要后面再补充）。直接给大家说明一下我是如何做到对 Cesium 源码进行简单的调试：

1. 克隆源码。在 GitHub 上克隆一份 Cesium 源码，我目前（2024年4月）使用的版本是 1.116 。
2. 执行 `npm i` 命令。可以这样粗浅理解为：我们克隆的这份源码其实并不是纯粹的只包含源码代码文件，其实它也算是一个项目，是一个工程，你可以执行 `npm i` 命令后 （这个命令会干些什么捏，目前不管）打开 index.html ，可以在浏览器看到 Cesium 示例、测试与文档。
3. 执行 `node server.js` 命令。使用 live server 类似插件启动服务打开 index.html 是不妥的。需要执行命令行 `node server.js` 启动服务，这个是一个基于 Express 的开发服务器，用于在本地开发和测试 CesiumJS，提供了文件监听、自动构建、静态文件服务和代理等功能，方便开发者进行 CesiumJS 相关项目的开发和调试。
4. 调试源码。这时就可以使用各类调试方法来调试 Cesium 源码了，在 `packages` 文件夹下修改源码文件或者在浏览器开发者工具断点调试。

暂时不分享调试源码的一些技巧，可以自行查找。



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



### 2> 文章目录

00 文章目录与源码简单调试   [👉🔗](https://github.com/githubli1123/CesiumExampleCollection/blob/main/Temp/%E9%9C%80%E8%A6%81%E5%8F%91%E5%B8%83%E7%9A%84%E5%8D%9A%E5%AE%A2/00%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E4%B8%8E%E6%BA%90%E7%A0%81%E7%9A%84%E7%AE%80%E5%8D%95%E8%B0%83%E8%AF%95/00%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E4%B8%8E%E6%BA%90%E7%A0%81%E7%AE%80%E5%8D%95%E8%B0%83%E8%AF%95.md)

01 Cesium的渲染调度  [👉🔗](https://github.com/githubli1123/CesiumExampleCollection/blob/main/Temp/%E9%9C%80%E8%A6%81%E5%8F%91%E5%B8%83%E7%9A%84%E5%8D%9A%E5%AE%A2/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6.md)



---

## 01 Cesium的渲染调度

### 1> CesiumWidget 类是渲染调度器

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



### 2>  Scene 类是场景对象容器

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





### 3>  Event 类实现事件机制

在编程领域，当谈论事件这个概念时，一般背靠着 事件驱动编程（Event-Driven Programming）思想 。事件驱动编程是一种常见的编程范式，它基于事件和事件处理器的概念，通过监听和响应事件来控制程序的执行流程。

事件：

- 用户的动作（如 点击鼠标、按下键盘等）
- 系统状态变化（如 网络请求完成、定时器到期等）
- 生命周期（如 单帧渲染过程中按数据更新与渲染这两个重要过程细化的四个事件：preUpdate、preRender、postUpdate、postRender🔢 ）
- 其他对象的状态改变（如 Entity 属性的改变、Entity 的增加等）
- ......

事件处理器：为该事件注册的回调函数，事件触发后由其处理。

在此，先解释一下 Cesium 对于事件机制的实现方式和使用：



站在事件机制的角度，对这个 Scene 原型上的 `render()` 方法进行分析：略......见下图（待完善）

<img src="https://github.com/githubli1123/CesiumExampleCollection/blob/main/Img/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6/event.png?raw=true" alt="event"  />

<img src="https://github.com/githubli1123/CesiumExampleCollection/blob/main/Img/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6/LifecycleEvent.png?raw=true" alt="Lifecycle" style="zoom: 80%;" />

左上角为事件注册者，提供事件回调。右边为事件处理者或者叫事件触发器，由一个事件来触发 事件处理者。由于该生命周期事件，我们可以在项目中使用类似的代码 `scene.addEventListener(cb)` 来为每一帧做一些自定义的任务。例如：每次渲染之前（即preRender事件）打印一下`时间差不多喽` 。

这个 Event 类会在后面反复使用，复用也是 Cesium 解耦出这个 helper class 的原因。同时，解耦 Event 类可以让事件机制更加清晰独立。
Cesium 实现事件机制的模式是发布订阅模式（Publisher-Subscriber），具有一个事件中心（EventEmitter）也就是实例化的 Event ：preUpdate、postUpdate 等。

事件机制也可以用观察者模式（Observer Pattern）来实现，这些模式决定了事件如何在组件之间进行传递和处理。



### 4>  小结

Cesium 的渲染循环，是在实例化 `Viewer` 时实例化了 `CesiumWidget` ，由属性 `_useDefaultRenderLoop` setter 触发 `startRenderLoop()` 方法，从而开启了渲染循环。在绘制一帧的逻辑中：

✅ `CesiumWidget 类` 支持了对 DOM 变化的响应，让 帧渲染出的内容 放置在合适正确的布局中。

✅ `CesiumWidget 类` 将渲染责任递给 WebGL context ，责任划分明确，只担任渲染调度者，渲染的具体逻辑（指绘制地球等）不包含其中。

✅ `Scene 类` 支持了帧渲染生命周期事件，为开发者预留了对 帧渲染过程 的操作空间。

🌟🤔 `CesiumWidget 类` 还有其他值得挖掘的点，值得挖掘的是它所管理的其他类，阅读后面的源码再做总结。

目前没有必要再继续深究 地球是如何绘制的 实体是如何绘制的，这涉及 Globe 、Primitive 等数据实体的更新和渲染，也涉及到 WebGL 在 Cesium 中如何调度 —— 这些都不是渲染循环这个概念中的内容。

### 5>  参考资料

[Cesium原理篇：1最长的一帧之渲染调度 - fu*k ](https://www.cnblogs.com/fuckgiser/p/5744509.html)

[CesiumJS 2022^ 源码解读 使用 requestAnimationFrame 循环触发帧动画](https://zhuanlan.zhihu.com/p/493708959)

[cesium 场景Scene - 简书 (jianshu.com)](https://www.jianshu.com/p/b48e4a9436b7)

[【cesium知识梳理】3.各类事件 ](https://juejin.cn/post/7264779043211821096)

[Cesium快速上手1-CesiumWidget-Scene结构](https://blog.csdn.net/sky___Show/article/details/132089197)





## 02 Cesium的地球渲染过程

需要一段时间梳理

### 1>  

<img src="https://github.com/githubli1123/CesiumExampleCollection/blob/main/Img/02Cesium%E7%9A%84%E5%9C%B0%E7%90%83%E6%B8%B2%E6%9F%93%E8%BF%87%E7%A8%8B/%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E4%BA%8B%E4%BB%B6%E4%B8%AD%E7%9A%84render%E8%8A%82%E7%82%B9.png?raw=true" alt="图片资源在该项目中可以找到：生命周期事件中的render节点"  />

得找到哪些类是用于绘制地球的。

从 scene 类出发，因为它是单帧渲染的起始，它原型上的 render 方法划分了生命周期事件，并在这些事件中间穿插了具体的用于渲染地球或者实体的函数，统一放在了函数 render 里，同时也穿插做了其他事情，下面探讨一下。

<img src="https://github.com/githubli1123/CesiumExampleCollection/blob/main/Img/02Cesium%E7%9A%84%E5%9C%B0%E7%90%83%E6%B8%B2%E6%9F%93%E8%BF%87%E7%A8%8B/%E6%B8%B2%E6%9F%93%E5%9C%B0%E7%90%83%E7%9A%84%E4%B8%89%E4%B8%AA%E9%87%8D%E8%A6%81%E9%98%B6%E6%AE%B5-%E8%AF%A5%E5%9B%BE%E7%89%87%E5%8F%AF%E5%9C%A8%E8%AF%A5%E9%A1%B9%E7%9B%AE%E4%B8%AD%E6%89%BE%E5%88%B0.png?raw=true" alt="渲染地球的三个重要阶段-该图片可在该项目中找到"  />

现在看看函数render，

站在渲染责任角度看待这个过程？

beginFrame是准备阶段，

站在UML时序图看待这个过程？

```
[Scene]
	- prototype.render()
[/Scene]
```



Globe.prototype.beginFrame 这个方法主要做了以下事情：

1. 检查是否需要加载更新海洋法线贴图资源。
2. 设置地球表面瓦片提供者的各种参数，例如最大屏幕空间误差、缓存大小、加载限制等。
3. 设置瓦片提供者的各种参数，包括光照距离、夜晚淡入淡出距离、海洋高光强度、水面遮罩等。
4. 开始渲染地球表面，包括瓦片的加载、渲染等操作。



【思考 单一职责】当执行到surface.beginFrame这个函数时，渲染任务是 地球表面的影像皮肤，地球的地形骨架不在这里出现。单一职责嘛。
影像皮肤在这一帧中是如何下载、如何解析、如何投影、如何渲染、如何回退的？初学者不要试图理解函数执行顺序，只有经验足够的人
才可以在纷繁复杂的函数执行中提炼出流程是如何设计的，我们目前是需要借助他人的理解，再加上自己对源码的阅读来提炼流程设计的奥秘。

surface.beginFrame(frameState);  *Initializes values for a new render frame and prepare the tile load queue.*

> 接下来才是起帧的重点：
>
> - 无效化全部瓦片（跟重置状态一个意思）
> - 重新初始化 `GlobeSurfaceTileProvider`
> - 清除瓦片四叉树内的加载队列
>
> 这 3 个分步骤，由 `QuadtreePrimitive.js` 模块内的两个函数 `invalidateAllTiles()`、`clearTileLoadQueue()` 以及 `GlobeSurfaceTileProvider` 原型链上的 `initialize` 方法按上述流程中的顺序依次执行。
>
> 下面是文字版解析。
>
> - 函数 `invalidateAllTiles` 调用条件及作用
>
> - - 条件：当 `GlobeSurfaceTileProvider` 改变了它的 `TerrainProvider` 时，会要求下一次起帧时 `QuadtreePrimitive` 重设全部的瓦片
>   - 作用：先调用 `clearTileLoadQueue` 函数（`QuadtreePrimitive.js` 模块内函数），清除瓦片加载队列；随后，若存在零级根瓦片（数组成员 `_levelZeroTiles`），那么就调用它们的 `freeResources` 方法（`QuadtreeTile` 类型），释放掉所有瓦片上的数据以及子瓦片递归释放
>
> - 方法 `GlobeSurfaceTileProvider.prototype.initialize` 的作用：
>
> - - 作用①是判断影像图层是否顺序有变化，有则对瓦片四叉树的每个 `QuadtreeTile` 的 data 成员上的数据瓦片重排列
>   - 作用②是释放掉 `GlobeSurfaceTileProvider` 上上一帧遗留下来待销毁的 `VertexArray`
>
> - 函数 `clearTileLoadQueue` 作用更简单，清空了 `QuadtreePrimitive` 对象上三个私有数组成员，即在第 5 部分要介绍的三个优先级瓦片加载队列，并把一部分调试状态重置。





解析、投影、下载、渲染、回退。但是这个流程的任务被细化并拆分到 beginFrame、updateAndExecuteCommands、endFrame 这三个阶段中。

既然散落在各处，但我相信 Cesium 会把这些东西给合理安排的。接下来看 下载、解析、投影、渲染、回退 流程在beginFrame中有怎么体现

===胡思乱想

？？？解析、投影（呈上） => 下载 => 解析、投影（启下）=> 渲染、回退

===

①beginFrame阶段一般是做准备工作的，那接下来看看做了哪些准备工作（肯定是从下载、解析、投影、渲染、回退五点出发喽）

beginFrame阶段的【？解析和投影】准备：

- QuadtreePrimitive.prototype.invalidateAllTiles：当 `GlobeSurfaceTileProvider` 改变了它的 `TerrainProvider` 时，会要求下一次起帧时 `QuadtreePrimitive` 重设全部的瓦片。清除瓦片加载队列；递归法释放掉所有瓦片上的数据【？并重新创建】

- GlobeSurfaceTileProvider.prototype.initialize ：**更新纹理重投影**，**图层顺序发生改变引发瓦片按图层索引进行重排序**，顶点数组的清理工作。

- QuadtreePrimitive.prototype.clearTileLoadQueue：清除瓦片加载队列。why？

```
  primitive._tileLoadQueueHigh.length = 0;
  primitive._tileLoadQueueMedium.length = 0;
  primitive._tileLoadQueueLow.length = 0;
```

- 

②updateAndExecuteCommands阶段

![](https://pic1.zhimg.com/80/v2-eda9cf823923345e1ce1fc57a979b4fc_720w.webp)

关于地球影像皮肤渲染的 “职责” 函数 在 Globe.render ，然后就把任务分为 this._material.update(); 和 this._surface.render(); 

❓我们会在 executeCommandsInViewport 函数中发现这两个函数 `updateAndRenderPrimitives` 和 `executeCommands` ，我很诧异！为什么会先更新和渲染primitives然后再执行webgl命令，从命名语义上看，`updateAndRenderPrimitives` 函数已经把primitives给画到屏幕上了，那还执行 commands 个什么劲。

✅仔细看看`updateAndRenderPrimitives` 就破案了，这里的 primitives 是指的 globe，渲染的是 globe。难道 `executeCommands`  就一点都不管 gobe 的渲染了吗？目前我们假设是的。

那么这里就要给大家看一张图，这张图表达了 数据，场景和渲染器 之间的关系，同时归纳总结了 primitives 这个 “数据集”

<img src="https://images.prismic.io/cesium/2015-05-26-0.png?auto=compress%2Cformat&rect=0%2C0%2C1191%2C717&w=945"  />

援引自文章：https://cesium.com/blog/2015/05/26/graphics-tech-in-cesium-stack/

那么好，现在找到了渲染地球的函数方法 `Globe.prototype.render` ，渲染职责给到了 Globe ，_material 和 _surface 这两个代表了什么？

```
1. _material 初始化是 undefined， 会涉及 makeShadersDirty 函数
getter 和 setter：获取或设置地球的材质外观。这可以是多个内置 Material 对象之一，也可以是使用 Fabric 编写脚本的自定义材质。
material: {
  get: function () {
    return this._material;
  },
  set: function (material) {
    if (this._material !== material) {
      this._material = material;
      makeShadersDirty(this);
    }
  },
},

2. _surface 初始化是 QuadtreePrimitive 实例
```

由此可见，重要的不可或缺的是 _surface 属性。

分为三个阶段：

1  tileProvider.beginUpdate

2  selectTilesForRendering(); createRenderCommandsForSelectedTiles();

3  tileProvider.endUpdate

```

一阶段  这段代码是 GlobeSurfaceTileProvider 对象的 beginUpdate 方法，它在开始更新地球表面瓦片的过程中执行以下操作：

1 清空 tilesToRenderByTextureCount 中的瓦片列表：
遍历 tilesToRenderByTextureCount 数组，对每个纹理贴图数量对应的瓦片列表进行清空操作。
这样做是为了准备接收新一轮更新后的瓦片数据。

2 更新裁剪平面：
如果存在裁剪平面，并且已启用，则调用 clippingPlanes.update(frameState) 方法更新裁剪平面。
裁剪平面用于在渲染过程中对瓦片进行裁剪，以提高渲染性能或实现特定效果。

3 重置已使用的绘制命令数目：
将 _usedDrawCommands 属性重置为 0。
这个属性用于记录当前帧已经使用的绘制命令数量，重置为 0 表示开始了新一轮的绘制过程。

4 重置已加载的瓦片和填充瓦片的标志位：
将 _hasLoadedTilesThisFrame 和 _hasFillTilesThisFrame 标志位都设置为 false。
这两个标志位用于记录当前帧是否已经加载了瓦片或填充了瓦片，重置为 false 表示开始了新的渲染过程，需要重新记录。
```

```
二阶段   createRenderCommandsForSelectedTiles();重要函数🌟showTileThisFrame(tile, frameState)：
这个重要函数的作用：在这一帧中 指定 需要显示的tile。provider（GlobeSurfaceTileProvider）可以通过 将渲染命令添加到命令列表的操作 来显示tile，或者使用任何其他适当的方法。只有该方法在下一帧也被调用，该tile在下一帧才会可见。

```

```
三阶段  这段代码是 `GlobeSurfaceTileProvider` 对象的 `endUpdate` 方法，它在地球表面瓦片更新周期结束后执行以下操作：

1. **初始化渲染状态**：
   - 如果当前没有定义渲染状态 (`this._renderState`)，则根据配置创建渲染状态。
   - 创建的渲染状态包括：启用剔除、启用深度测试、设置深度测试函数等。

2. **根据当前帧的加载和填充瓦片情况，更新填充瓦片的高度**：
   - 如果当前帧同时存在加载的瓦片和填充的瓦片，则需要将加载的瓦片的高度信息传递给填充的瓦片。
   - 调用 `TerrainFillMesh.updateFillTiles` 方法更新填充瓦片的高度信息。

3. **处理垂直夸张变化**：
   - 检测垂直夸张是否发生了变化，如果发生了变化，则需要更新加载的瓦片的地形夸张效果。
   - 遍历加载的瓦片，调用 `updateExaggeration` 方法更新瓦片的地形夸张效果。

4. **生成绘制命令**：🌟
   - 根据瓦片的纹理数量和加载状态，为每个瓦片生成绘制命令，并添加到渲染命令列表中。
   - 遍历 `tilesToRenderByTextureCount` 数组，对每个纹理贴图数量对应的瓦片列表进行处理，为每个瓦片生成绘制命令，并更新当前帧的最小地形高度。
```



<img src="https://github.com/githubli1123/CesiumExampleCollection/blob/main/Img/02Cesium%E7%9A%84%E5%9C%B0%E7%90%83%E6%B8%B2%E6%9F%93%E8%BF%87%E7%A8%8B/%E4%B8%80%E6%AD%A5%E4%B8%80%E6%AD%A5%E6%89%BE%E5%88%B0%E5%9C%B0%E7%90%83%E6%B8%B2%E6%9F%93%E7%9B%B8%E5%85%B3%E5%87%BD%E6%95%B0-%E8%AF%A5%E5%9B%BE%E5%8F%AF%E5%9C%A8%E8%AF%A5%E9%A1%B9%E7%9B%AE%E4%B8%AD%E6%89%BE%E5%88%B0.png?raw=true" style="zoom:67%;" />



```js
  this._surface = new QuadtreePrimitive({
    tileProvider: new GlobeSurfaceTileProvider({
      terrainProvider: terrainProvider,
      imageryLayers: imageryLayerCollection,
      surfaceShaderSet: this._surfaceShaderSet,
    }),
  });
```





## 03  Cesium的

