## 01Cesium的渲染调度

### 1 CesiumWidget 类是渲染调度器

所谓的渲染是指在浏览器 canvas 上绘制图像，调度是指控制着这个渲染的使用。借助 `requestAnimationFrame, rAF` 这个浏览器 API 来不断在每一帧调用 单帧渲染函数 `render()` ，单帧渲染函数借助 WebGL 来实现 canvas 绘制。而这个多帧循环往复运行和渲染的过程有一个调度者，是 `CesiumWidget` 类。

![](https://gitee.com/ahsfdx/cesium-example-collection-src/raw/master/Cesium%20Source%20code%20interpretation/Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6%E5%A4%A7%E8%87%B4%E5%9B%BE.png)

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



### 2 Scene 类是场景对象容器

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

- 触发单帧中的生命周期事件（preUpdate、preRender、postUpdate、postRender）🔢。这个地方涉及 Cesium 事件机制知识点。见图
- 更新帧状态和帧序号
- 更新 Scene 中的 Primitive
- 调用类中的 `render` 函数，将渲染责任递给 WebGL context （其实是 Context 对象，对 WebGL 的封装），触发绘制。

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





### 3 小结

Cesium 的渲染循环中，在绘制一帧的逻辑中，目前没有必要再继续深究 地球是如何绘制的 实体是如何绘制的，这涉及 Globe 、Primitive 等数据实体的更新和渲染，也涉及到 WebGL 在 Cesium 中如何调度 —— 这些都不是渲染循环这个概念中的内容。