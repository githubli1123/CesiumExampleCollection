# Cesium 源码解读

## 00文章目录与源码的简单调试

本篇文章持续更新，感觉调试源码和阅读源码的方法会随着工具的更新与 AI 的迭代不断改变优化，让我们更好的理解源码。而且本人比较喜欢通过图像表格来记忆和理解，现在 Cesium 中文资料中对于 Cesium 源码的图表类资料较少，正好让我来填补一下（大言不惭了😂）。而且这个系列的博客模拟你第一次看 Cesium 源码。

拥有这些风格：

- 关注主体。只看主要的流程，假设完全没有 bug 和一般情况（即第一次使用 Cesium 时创建的例子）。
- 遗留问题。有些代码或者流程无法直接梳理清楚，留下问题，等待后面阅读源码后茅塞顿开。
- 不断重复。有一些图或者表述会不断重复，一个是需要有这些来让我的表述更加有逻辑和直观，让知识点有部分关联，二是让读者记忆深刻。
- ......

没有这些风格：

- 注重关联。知识点或者类关系尽量不做过多关联，可能没法让你触类旁通或者知识点之间的链接较弱。
- 表述严谨。本身我目前也处于初次阅读源码的阶段，表述比较随意，望谅解。
- ......



### 1 如何做到对源码进行简单调试

✅这里就不再赘述源码工程目录了（如果需要后面再补充）。直接给大家说明一下我是如何做到对 Cesium 源码进行简单的调试：

1. 克隆源码。在 GitHub 上克隆一份 Cesium 源码，我目前（2024年4月）使用的版本是 1.116 。
2. 执行 `npm i` 命令。我们克隆的这份源码其实并不是纯粹的只包含源码代码文件，其实它也算是一个项目，是一个工程，你可以执行 `npm i` 命令后 （这个命令会干些什么捏，目前不管）打开 index.html ，可以在浏览器看到 Cesium 示例、测试与文档。
3. 执行 `node server.js` 命令。使用 live server 类似插件启动服务打开 index.html 是不妥的。需要执行命令行 `node server.js` 启动服务，这个是一个基于 Express 的开发服务器，用于在本地开发和测试 CesiumJS，提供了文件监听、自动构建、静态文件服务和代理等功能，方便开发者进行 CesiumJS 相关项目的开发和调试。
4. 调试源码。这时就可以使用各类调试方法来调试 Cesium 源码了，在 `packages` 文件夹下修改源码文件或者在浏览器开发者工具断点调试。

暂时不分享调试源码的一些技巧，可以自行查找。



📌值得注意的一些细碎点：

**1** 分发包与源码包最大的区别在于，分发包提供了打包后的Build文件夹，可供调试或者发布直接使用；提供了两个版本的打包API，提供了API文档，删除了部分生产用不着的打包配置文件。注意，分发包保留了源码目录，但是有关打包命令可能失效。见图

<img src="https://gitee.com/ahsfdx/cesium-example-collection-src/raw/master/Cesium%20Source%20code%20interpretation/%E5%88%86%E5%8F%91%E5%8C%85%E4%B8%8E%E6%BA%90%E7%A0%81%E5%8C%85.png" alt="分发包与源码包" style="zoom: 50%;" />



**2**  `Source` 源码资源文件夹中的变更为了 `package` 文件夹。这一点可以在 [Cesium1.100版本更新日志](https://github.com/CesiumGS/cesium/releases/tag/1.100) 中看到，源代码已分区为两个文件夹： `packages/engine` 和 `packages/widgets`。

<img src="https://gitee.com/ahsfdx/cesium-example-collection-src/raw/master/Cesium%20Source%20code%20interpretation/Cesium1.100%E7%89%88%E6%9C%AC%E5%90%8E%E5%B7%A5%E7%A8%8B%E7%9B%AE%E5%BD%95%E7%9A%84%E6%94%B9%E5%8F%98.png" alt="分发包与源码包" style="zoom: 50%;" />



🔗参考资料

[CesiumJS 2022^ 源码解读0 - 文章目录与源码工程结构 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/537147162)

[Cesium源码阅读环境搭建 - 当时明月在曾照彩云归 - 博客园 (cnblogs.com)](https://www.cnblogs.com/jiujiubashiyi/p/17111635.html)

[Cesium打包命令总结 - Cesium实验室 - 博客园 (cnblogs.com)](https://www.cnblogs.com/cesium1/p/10062900.html)

[Cesium开发工具篇 | 06Cesium源码编译打包 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/369519695)

[Cesium打包入门(gulp与esbuild)_scripts.prepare cesium@1.95-CSDN博客](https://blog.csdn.net/u011575168/article/details/128419078)



### 2 文章目录

00文章目录与源码简单调试   [👉🔗](https://github.com/githubli1123/CesiumExampleCollection/blob/main/Temp/%E9%9C%80%E8%A6%81%E5%8F%91%E5%B8%83%E7%9A%84%E5%8D%9A%E5%AE%A2/00%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E4%B8%8E%E6%BA%90%E7%A0%81%E7%9A%84%E7%AE%80%E5%8D%95%E8%B0%83%E8%AF%95/00%E6%96%87%E7%AB%A0%E7%9B%AE%E5%BD%95%E4%B8%8E%E6%BA%90%E7%A0%81%E7%AE%80%E5%8D%95%E8%B0%83%E8%AF%95.md)

01Cesium的渲染调度  [👉🔗](https://github.com/githubli1123/CesiumExampleCollection/blob/main/Temp/%E9%9C%80%E8%A6%81%E5%8F%91%E5%B8%83%E7%9A%84%E5%8D%9A%E5%AE%A2/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6/01Cesium%E7%9A%84%E6%B8%B2%E6%9F%93%E8%B0%83%E5%BA%A6.md)



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

- 触发渲染循环中的生命周期事件（preUpdate、preRender、postUpdate、postRender）。这个地方涉及 Cesium 事件机制知识点。见图。
- 更新帧状态和帧序号
- 更新 Scene 中的 Primitive
- 移交渲染权给模块内的 `render` 函数触发 WebGL 绘制



### 3 小结

Cesium 的渲染循环中，在绘制一帧的逻辑中，目前没有必要再继续深究 地球是如何绘制的 实体是如何绘制的，这涉及 Globe 、Primitive 等数据实体的更新和渲染，也涉及到 WebGL 在 Cesium 中如何调度 —— 这些都不是渲染循环这个概念中的内容。