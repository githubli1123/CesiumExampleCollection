

## 1 CesiumWidget 类是渲染调度器

所谓的渲染是指在浏览器 canvas 上绘制图像，调度是指控制着这个渲染的使用。借助 `requestAnimationFrame, rAF` 这个浏览器 API 来不断在每一帧调用 单帧渲染函数 `render()` ，单帧渲染函数借助 WebGL 来实现 canvas 绘制。而这个多帧循环往复运行和渲染的过程有一个调度者，是 `CesiumWidget` 类。

![](D:\project\CesiumExampleCollection\Temp\需要发布的博客\01Cesium的渲染调度\Cesium的渲染调度大致图.png)

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



## 2 Scene 类是场景对象容器

需要进入到伪代码①中的 `widget.render(); // 单帧渲染` 

```js
CesiumWidget.prototype.render = function () {
  if (this._canRender) {
    ...
    this._scene.render(currentTime); // 看这句
  } else {...}
};
```

通过简单查看所有属性和方法：目前明白这个类保存着大量场景中的对象和状态，并且是可以借助其他类来绘制单帧中出现的地球、实体等数据。



## 3 小结

Cesium 的渲染循环中，在绘制一帧的逻辑中，目前没有必要再继续深究 地球是如何绘制的 实体是如何绘制的，这涉及 Globe 、Primitive 等数据实体的更新和渲染，也涉及到 WebGL 在 Cesium 中如何调度 —— 这些都不是渲染循环这个概念中的内容。