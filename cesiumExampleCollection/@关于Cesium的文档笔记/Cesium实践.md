## 水面模型倒影

查看示例 http://support.supermap.com.cn:8090/webgl/examples/webgl/editor.html#S3MTiles_srsb_water 时查看到使用了 Cesium.when API ，该 API 在 1.92 版本后被废弃，可使用原生 Promise 来替代。

在查阅 1.102 版本的 CesiumJS API 文档后，查询不到 cesium.viewer.scene.open 这个 API ，可能在 1.92 版本之前。如何找到该特定版本的文档呢？



## SuperMap iClient3D-WebGL

经过二次开发出的iclient3D-WebGL在使用上和cesium并没有太大不同，但是有些需求经过封装后再实现会更加的简单方便，再配合上supermap iServer以及相应的数据，就可以展现出一个三维场景。



##  CND引入Cesium

```html
<link href="https://cdn.bootcdn.net/ajax/libs/cesium/1.98.1/Widgets/widgets.css" rel="stylesheet">
<script src="https://cdn.bootcdn.net/ajax/libs/cesium/1.98.1/Cesium.js"></script>
```



## 流场绘制

需求：后端传来的数据是以天为尺度的河流流向与流速信息，在时间轴上自然也是以天为尺度来进行推进的。目前存在观感上的不足，不足之处在于：①表示流向与流速的箭头样式单一，无法直观呈现流速信息；②流向变化过于生硬，需要缓慢变化。

对于一个不足：

通过devtool工具查看网络请求的图片可以看出存在不同样式的箭头，长度不一，但是因为缩放后，图片被挤在一个狭小的空间内，观感上箭头的长度的长短对比不明显。

1. 当我不使用图片材质后且我把改变箭头长度的逻辑封装在一个函数里，出现了箭头线段会随比例尺变化而变化，但是箭头不会改变大小，而且修改canvas画笔经过的关键点也没有用，箭头样式不变。

2. 当我使用图片材质且使用逻辑封装函数，和上面一样。

3. 当我不使用那个封装函数，使用材质时，用原来的代码直接写在赋值材质前面（不封逻辑），其实箭头的大小也不会变，只是屏幕竖着的方向上压缩。
4. 当我不使用那个封装逻辑和不封逻辑，也不使用材质时，观感和情况1类似，不同之处在于连箭头线段长度也不变了。

奇怪的是为什么箭头还可以显示。

现在冒出这样的问题‘🤔：项目源码中是如何定位每个箭头的坐标的？如何按时间轴流逝来改变箭头？

经过仔细阅读一部分后得知：

1. 添加流场图层和数据
2. 每个箭头都是一个实体并且 material 属性设置为 Cesium.PolylineArrowMaterialProperty ，在 Cesium sandcastle 中测试发现箭头不会改变大小，一直占据固定的屏幕区域面积。

好的，目前清楚了什么导致了箭头大小不变，解决方案首先想到使用多段线来自定义绘制。

查阅资料，得到这些有价值的网址：

[Cesium实现文字、点、多段线、多边形的实时绘制-技术文章-jiaocheng.bubufx.com](http://jiaocheng.bubufx.com/info-show-1032277.html)

[cesium绘制动态线，多段线_cesium 动态线_qq_52595269的博客-CSDN博客](https://blog.csdn.net/qq_52595269/article/details/128721337)

但是我发现绘制多边形是目前最佳的，可 mars3d 的多边形绘制 API 不会，需要学习。而且会出现绘制难题：如何确定绘制起始点，如何确定箭头的不同指向，传入的点坐标是何种类型坐标系下的？

### ✅使用原生 Cesium 配合 mars3d 初步实现

使用 面要素 entity，创建多个面要素来表示箭头；

方向角为度分秒制。 entity可以旋转，发现有设置实体逆时针旋转角度的属性`rotation`，但好像只是椭球体。多边形旋转的 API 暂未找到；

但是找到这个：

[cesium 滑动slider转动旋转entity模型_cesium entity旋转_没有天赋的搬砖者的博客-CSDN博客](https://blog.csdn.net/sdad2154/article/details/124431801)

[CesiumJS 旋转entity对象的方式_entity 旋转_老朱自强不息的博客-CSDN博客](https://blog.csdn.net/moyebaobei1/article/details/103697831)

评论区中讨论可以通过矩阵变换matrix实现polygon旋转。

[Cesium（八）动态拖动entity（解决拖动闪烁问题）_hpugisers的博客-CSDN博客](https://blog.csdn.net/weixin_40184249/article/details/93633337)

[Cesium PolygonGeometry的移动、拉伸、旋转——旋转_cesium polygon怎么旋转_imyang_123的博客-CSDN博客](https://blog.csdn.net/weixin_44339199/article/details/123340364)





......待补充





通过一个改写一个现有的绘制直线箭头的类并通过传入栅格中心点来获取箭头起点与终点，目前是已经完成显示某一天的流场图，流场线的方向与长度的逻辑也已经解决。

结果描述：箭头可以以栅格中心点为圆心来不断改变方向



### 如何为变化插值

现在可以使用 计时器 来完成 第一天流场与第二天流场的切换。不过不够柔和，过于生硬。

是否可以使用 Cesium.Viewer.clock.onTick.addEventListener 这个监听函数来实现

现在的情况：

我可以渲染该地区的某一天的流场线，我需要不断渲染中间状态的流场线，可是渲染与销毁的时机总是把握不清楚，出现全部渲染后再依次销毁的情况

我希望创建箭头后过一小段时间销毁，在创建箭头过一小段时间后销毁。

我通过回调地狱的形式实现了上面的期望，不过会出现画面短暂缺失箭头，这是因为没有做到视觉暂留。通过简单的调整逻辑的顺序即可较好解决。方法是在下一次中间箭头渲染完成后再把上一个箭头销毁。

在进一步使用异步与循环方法来不断渲染中间帧箭头的方法时，总是会出现一个渲染错误，而且排查后发现是因为 u v 不能为 0，但是我已经通过分段函数 speedToArrowLengthMappingFunction 避免给 mars3d.PointUtil.getPositionByDirectionAndLen 传入为 0 的 radius，但是我把 u v 给直接写死为 0 ，正常渲染。说明是 u + delta_u * this.frame_node,v + delta_u * this.frame_node 这两个参数的问题？



### 🎉找到一种新的方法来实现流场线

需求分析：。。。

预期效果：每一个栅格中都有一个流线箭头，长度配合宽度来表达水流的速度大小，箭头方向表达速度方向。数据尺度为天，时间轴流逝单位也为天，方向的改变过于生硬，优化方向为 为方向的改变插入一个动画。

思路1：使用 Cesium 的时钟系统，在原始代码的基础上修改，使用 CallbackProperty 回调函数时添加一个旋转动画过度，等待旋转动画执行完毕后再返回属性值，或许可行，这样不会过多的破坏原始代码，而是注入一段代码来得到过度动画。

思路2：直接改写数据，给数据插值为小时尺度的





## Cesium 的绘制能力



### 5.1 点



### 5.2 线

#### 5.2.1 线段

将线段放在标准三维笛卡尔坐标系下观察，我将线段按呈现的形态分为三种类型的线段：

直线段，弧线段，贴地线

Cesium.arctype.NONE

#### 5.3 面

通过统一的API来创建 Cesium.Entity ，不过可以通过配置不同的配置项来得到不同类型的面要素

#### 5.4 体



#### 5.5 角度

角度表示的两种方法：弧度制与度分秒制。



## Cesium的坐标系统 --- positions

```
// 笛卡尔坐标（世界坐标） Cartesian3
x: -2730600.4169988516
y: 5121420.770754761
z: 2636033.325302303

// 地理坐标 Cartographic
lng:118.044587
lat: 24.623838
alt: 0

// 屏幕坐标 Cartesian2
？
```

杂乱记录

- 在 entity 创建时传入配置项 position 或 positions 时需要 世界坐标格式。一般在传入地理坐标数据后经过换算才可以赋给 position 配置项。

### 坐标转换









##  Cesium初始化失败

### 7.1 cesium 的infoBox不能执行js脚本

在给cesium使用html2canvas插件加截图保存控件时，提示错误

`Blocked script execution in 'about:blank' because the document's frame is sandboxed and the 'allow-scripts' permission is not set.`
一、分析：因为infoBox是Ifram框架，H5的新安全机制不允许在其中执行脚本，如果在里面写了类似于点击事件的脚本，则会提示如下错误：Blocked script execution in 'about:blank' because the document's frame is sandboxed and the 'allow-scripts' permission is not set.

二、解决方法有两个：

1.禁用infobox，自己设计信息面板。

 2.设置沙箱的权限

```
var iframe = document.getElementsByClassName('cesium-infoBox-iframe')[0];

iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms'); 
```



### 7.2 TOKEN

```
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmZmE1YmE1Ny1jNWZhLTRjN2QtOTkzZC0wODllNDQ3ZDMzYjMiLCJpZCI6MTYwNDM2LCJpYXQiOjE2OTIwNjQ2ODh9.Q5-0ASoSHIEQ13UYJKkNH8qzcStSywCV7RZru0E_YZc'
```





## 图层相关的概念

Cesium应用程序另一个关键元素是Imagery(图层)。瓦片图集合根据不同的投影方式映射到虚拟的三维数字地球表面。依赖于相机指向地表的方向和距离，Cesium会去请求和渲染不同层级的图层详细信息。

多种图层能够被添加、移除、排序和适应到Cesium中。

Cesium提供了各种接口支持各样的图层数据源。

支持的图层格式：

- wms
- TMS
- WMTS (with time dynamic imagery)
- ArcGIS
- Bing Maps
- Google Earth
- Mapbox
- OpenStreetMap

不同的数据源需要不同的认证 - 需要确保自己能够有权限访问到这些数据源，自然地需要注册特定的认证才可以。

Cesium使用Bing Maps作为默认的图层；这个图层被打包进Viewer中用于演示；Cesium需要您自己创建ion account然后生成一个access key用于访问图层数据。

**使用Cesium ion中的Sentinel-2图层：**

1. 去Cesium ion页面，将Sentinel-2图层加入到自己的assets中。点击在导航栏中点击“Asset Depot”
2. 点击“Add to my assets”。Sentinel-2将在你个人用户中的asset列表（My Assets）中出现，此时将在个人的app中图层数据源变得可用。
3. 代码级别：我们创建一个IonImageryProvider，将assetId传给对应的Sentinel-2图层。然后我们将ImageryProvider添加到viewer.imageryLayers。

代码块：

```js
// Remove default base layer
viewer.imageryLayers.remove(viewer.imageryLayers.get(0));

// Add Sentinel-2 imagery
viewer.imageryLayers.addImageryProvider(new Cesium.IonImageryProvider({ assetId : 3954 }));
```



查询 API 文档得到：

- [ImageryLayer](https://cesium.com/learn/cesiumjs/ref-doc/ImageryLayer.html)
- [ImageryLayerCollection](https://cesium.com/learn/cesiumjs/ref-doc/ImageryLayerCollection.html)





[Cesium第四课——添加图层 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/450757068?utm_id=0)

[cesium加载图层覆盖其他图层，设置图层加载顺序问题_cesium怎么设置图层的层级_god‘s hand的博客-CSDN博客](https://blog.csdn.net/dai556688/article/details/129819838)





## 矩阵变换相关







## 浅试帧监听

一、案例1

不断在帧中创建和销毁实体，达到物体运动的效果。

```html
<!DOCTYPE html>
<html lang="zh">

<head>
    <!-- Use correct character set. -->
    <meta charset="utf-8" />
    <!-- Tell IE to use the latest, best version. -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!-- Make the application on mobile take up the full browser screen and disable user scaling. -->
    <meta name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />
    <title>12</title>
    <script src="../Build/CesiumUnminified/Cesium.js"></script>

    <style>
        @import url(../Build/CesiumUnminified/Widgets/widgets.css);

        html,
        body,
        #cesiumContainer {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
    </style>
</head>

<body>
    <div id="cesiumDemo"></div>
    <script type="text/javascript">
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmZmE1YmE1Ny1jNWZhLTRjN2QtOTkzZC0wODllNDQ3ZDMzYjMiLCJpZCI6MTYwNDM2LCJpYXQiOjE2OTIwNjQ2ODh9.Q5-0ASoSHIEQ13UYJKkNH8qzcStSywCV7RZru0E_YZc';

        let viewer = new Cesium.Viewer('cesiumDemo', { infoBox: false });
        let tag = 1;
        let thisFrame = [];
        let lastFrame = [];
        viewer.clock.multiplier = 3600
        // 对 帧 添加 监听事件 ✨
        let postRender = viewer.clock.onTick.addEventListener((clock) => {
            console.log('from',thisFrame)
            // 函数主体
            // 耗时任务
            // let from = [];
            let a = 40.0,
                b = 30.0,
                c = 50.0;
            for (let index = 0; index < 1; index++) {
                let greenBoxEntity = new Cesium.Entity({
                    name: 'Green box with black outline',
                    position: Cesium.Cartesian3.fromDegrees(-107.0 + index - 100, 40.0 - tag/5, 300000.0),
                    // 盒子
                    box: {
                        dimensions: new Cesium.Cartesian3(a, b, c),
                        material: Cesium.Color.GREEN.withAlpha(0.5),
                        outline: true,
                        outlineColor: Cesium.Color.BLACK
                    },
                    // 点
                    point: {
                        pixelSize: 50
                    }
                });
                thisFrame.push(greenBoxEntity);
            }
            thisFrame.forEach((e) => {
                console.log('add')
                // 将 Entity 添加到 viewer 中
                const greenBox = viewer.entities.add(e);
                // 保存这一帧的画面
                lastFrame.push(e)
            })        
            if(tag%6===0){
                lastFrame?.forEach((e) => {
                    console.log('remove')
                    viewer.entities.remove(e)
                });
                lastFrame = [];
            }
            if(tag%(6*100)===0){
                tag = 1;
            }
            thisFrame = [];
            console.log('from2',thisFrame)
            console.log('这一帧',lastFrame)
            tag += 1;

        });

        setTimeout(() => {
            postRender()
        }, 10000);

    </script>
</body>
</html>
```



二、不断修改某一实体的属性，例如：姿态 orientation

① 需要为 orientation 属性配置，否则默认为 undefined ，下面介绍了这个静态方法的使用

![image-20230823154341263](C:\Users\123\AppData\Roaming\Typora\typora-user-images\image-20230823154341263.png)

但是这似乎是为了模型而提供的属性配置，不清楚多边形面是否可以使用这个属性。目前失败了









## 诸多疑惑

1. Cesium如何渲染一个地球，如何将一个立方体渲染到地球上，如何实现鼠标转动地球的时候渲染转动后的地球

2. Cesium动画机制

3. 如何为Cesium每一帧安排一个任务，如果任务耗时过长的话会如何

4. 在帧监听中，添加一系列 entity 后再把上一帧的一系列 entity 移除，试图做到动画效果，可是页面不显示 entity 。

5. 在 orientation 中设置一个 Cesium.CallbackProperty 对象，试图动态改变姿态，但是报错。

   1. 关键代码如下，代码资源在 Cesium帧监听 文件夹 02** 文件：

      ```js
      const center = Cesium.Cartesian3.fromDegrees(2.5, 0.0);
              const heading = -Cesium.Math.PI_OVER_TWO;
              const pitch = Cesium.Math.PI_OVER_FOUR;
              const roll = 0.0;
              const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
              const quaternion = Cesium.Transforms.headingPitchRollQuaternion(center, hpr);
              // 创建 添加
              const cyanPolygon = viewer.entities.add({
                  name: "Cyan polygon",
                  orientation: new Cesium.CallbackProperty(function () {
                      return quaternion;
                  }),// 姿态
                  polygon: {
                      hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights([
                          0.0, 0.0, 0.0,
                          1.0, 5.0, 0.0,
                          -1.0, 5.0, 0.0,
                      ]),
                      perPositionHeight: true,
                      material: Cesium.Color.CYAN.withAlpha(0.5),
                      outline: true,
                      outlineColor: Cesium.Color.BLACK,
                  },
              });
              viewer.zoomTo(cyanPolygon)
      ```

   2. 错误如下：

      ![image-20230824110605171](C:\Users\123\AppData\Roaming\Typora\typora-user-images\image-20230824110605171.png)

   3. 解决：加一个参数 iscontant ，为布尔类型。含义为：获取一个值，该值指示此属性是否为常量。

   4. 但似乎加这个 callbackproperty 没有啥用处
   
6. 在 cesium 中有图层的概念吗，entity实体是存放在哪的，卫星影像是存放在哪的，viewer是啥，都是放在viewer这个地方的吗，不会很乱吗？

6. 时钟系统 与  CallbackProperty 




添加：Cesium.viewer.entities.add(entity)

移除：Cesium.viewer.entities.remove(entity)



## ConstantProperty 

在读取 polgon 多边形属性 entity.polygon.outlineColor 时，返回的是这样一个属性 ConstantProperty 

查询 chagpt 后给出回答：

> Cesium ConstantProperty 是 CesiumJS 中的一个类，用于创建具有固定值的属性对象。它提供了一种方便的方式来定义不受变化影响的属性。
>
> ConstantProperty 类继承自 Property 类，Property 是 CesiumJS 中表示对象属性的基类。ConstantProperty 能够将常量值与其他属性相结合，使其在属性链中保持不变。
>
> 使用 ConstantProperty，您可以将值或 JavaScript 对象作为属性关联到 Cesium 实体、图元、几何体等上。这意味着当属性改变时，相应的实体或图元也会更新。
>
> 例如，如果想要给某个 Cesium 实体指定一个固定位置，则可以使用 ConstantProperty 将位置坐标值与实体关联起来。这样，在屏幕渲染过程中，即使视图发生变化，实体的位置仍然保持不变。
>
> 总之，Cesium ConstantProperty 是一种用于创建具有固定值的属性对象的类，可在 CesiumJS 中使用以确保属性的不变性。

不过似乎可以访问到 entity.polygon.outlineColor._value 属性拿到或者改变 outline color ，不，可以改变属性，但是样式不变，但是过很久时间样式又会变🤣。

多阅读这篇文章：[Cesium的Property机制总结 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/50534090)

![Cesium的Property机制总结](https://pica.zhimg.com/70/v2-191d0dcc18de95eb11e79b7884c7445d_1440w.image?source=172ae18b&biz_tag=Post)

**引出了 Cesium 的 property 设计目的和各类接口**



## 学习指南

数据格式

[从零开始GIS（Ⅱ）— 五花八门的数据格式 (qq.com)](https://mp.weixin.qq.com/s?__biz=MzUzOTY1Mjg3Mg==&mid=2247483706&idx=1&sn=8d306f73c58b3a8ff85eba75bf344bd9&chksm=fac4675dcdb3ee4befeb0b9248db3d9ae67527a9590c9b2542b9220fed4d3c08a7a330a6ef71&scene=21#wechat_redirect)





## 项目初始化

