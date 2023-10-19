# CesiumExampleCollection
Cesium框架的示例集合

## 搭建环境

在这里我默认已经安装 nodejs 并配置好环境。我目前使用的版本是 v16.20.0

- 使用 vite 脚手架构建 vue3 项目。Vite 需要 [Node.js](https://nodejs.org/en/) 版本 >= 12.0.0。
  - 使用 $ pnpm create vite 指令安装
- 在 public 文件夹中创建 lib 文件夹，在其中拷贝一份 cesium 库文件。
- 替换 src 文件夹。



## 重要类

着重关心：地球，时间轴控件，各类实体以及他们的样式变化。对应到代码中就是

### Viewer

但凡创建任何一个三维窗口可能都逃脱不了Viewer类的使用。Viewer基本上也就代表这一个Cesium的**三维窗口的所有**（有待理解）。因此我们首先介绍一些Viewer的组成。当我们使用 `var viewer = new Cesium.Viewer('cesiumContainer');` 创建一个三维窗口以后，它的内部是怎样组成的呢？请看下图：

![img](https://pic1.zhimg.com/v2-e3a906d676403f11afe782763f17a414_b.jpg)

可以看到viewer其实就是一堆UI的组合。

最顶上的**cesiumWidget**是核心的三维窗口所在。这里面不仅仅包含创建三维窗口所需要的canvas、还有scene用来管理三维场景中的所有三维对象。其中的一个异类可能就是用来表示时间的clock了，因为这玩意儿和窗口真没啥关系。

最下方的**其他UI组件**包含了各种按钮、时间轴等UI组件。这些UI组件都是Cesium为我们预先创建好的，可以直接进行交互调用的工具。它们纯粹就是div的堆叠，当然内部会调用一些改变三维场景的命令，从而影响着三维窗口的显示内容。

可以看到Viewer类几乎都是这些UI的组合，当然唯一例外的是中间的**dataSourceDisplay**，这是viewer向三维场景中添加三维对象的接口。刚才已经说了，scene是管理三维场景中的对象的。那么它和这个datasourceDisplay是否会有冲突？答案是否定的。datasourceDisplay所做的事情就是把外部数据资源，比如kml、geojson、各种内部的几何体转化成scene能识别的三维场景对象，再通过内部一些命令，加入到scene当中去的。所以可以说，dataSourceDisplay中管理的对象，实际上和scene中的一些对象是对应的关系。但是它再将三维场景对象加入scene中去以后，还是会继续管理这些对象。比如您在dataSourceDisplay中删除某些对象以后，scene当中的某些对象也会被删除掉。

说到**dataSourceDisplay**，或许初学者会有点儿陌生。但是说到viewer.entities，可能大家都很熟悉了。实际上我们平常通过viewer.entities加入到场景中的各种对象，等同于加入到dataSourceDisplay当中。这话怎么说呢？请看下图：

![img](https://pic4.zhimg.com/v2-1a122e8549f376a7834f28dd8b46cd3b_b.jpg)

dataSourceDisplay实际上内部管理着一堆dataSource对象，其中有一个比较特殊的dataSource，名字叫defaultDataSource。它的内部和其他类型的dataSource也很相似，都是由一堆entity组成的entities。entity代表一个实体。我们平时使用的**viewer.entities**，其实只是一个快捷方式。它真正调用的是`dataSourceDisplay.defaultDataSource.entities`。

所以说嘛，我们通过viewer.entities增加到场景中的实体，实际上是由dataSourceDisplay来管理的。

**defaultDataSource**相当于Cesium为我们内置的一个dataSource，不需要我们手动创建，只需要调用viewer.entities直接加载三维实体就好。

而其他dataSource就没有这么好运了，在Cesium的API文档中搜索可以发现：

![img](https://pic3.zhimg.com/v2-ec5c22b9b876d936c239de1d144fbf56_b.jpg)

这里的GeoJsonDataSource、KmlDataSource、CzmlDataSource相当于可以引用外部资源，然后自己内部自动转换成一个一个的entity，不需要我们做特殊的操作。当然我们也可以做一些适当的修改，Cesium的Sandcastle中有相应的示例。

Entity表示一个实体对象，准确的讲，应该是一个可以随时间动态变化的实体对象。为什么这样说呢？Cesium为了让Entity能够赋予时间的动态特性，把其属性都仔细设计了一番，特别引入了Property这个类。比如position本来用经纬度表示一下就ok了，结果现在它被设计成Property 类型。好处是这个Property可以记录某某时间段在某个位置，然后另外一个时间段，则在另外一个位置。也就是说position这个Property已不单纯指表示某个位置了，被赋予了时间的动态特性，内部的结构可以很复杂，不同的时间在不同的位置。

Entity还有一个其他的基本属性：

id表示唯一标识符。

name表示名字，可以不设置。

orientation表示实体的姿态变化（旋转方向）。 这个属性的内部是用四元数(Quaternion)表示的，Property中内部的基本属性类型是Quaternion，即某个时间段是这个Quaternion，另外一个时间段，又是另外一个Quaternion。Quaternion表示四元数，可能很多前端工程师并不熟悉，如果Cesium把它换成欧拉角，会让大家好理解一点。

另外一个需要吐槽的地方在于，orientation的类型是一个Property，并不能由此推断出这和个Property内部需要使用Quaternion作为基本类型来用。所以Cesium的API文档在这里是描述得不太清楚的。我也是在看Cesium的示例才知道orientation需要赋值为一个Quaternion对象。而且不止于此，很多其他Property属性也有着同样的问题，所以有时候只能看Cesium的源码才能了解该如何操作。



![img](https://pic2.zhimg.com/v2-73c9ef4a97ec4fd963a8a71c28339fb9_b.jpg)



Entity除了这些基本属性之外，还有很多几何图形类，比如billboard、box、corridor等等。这些属性的类型都是XXXGraphics。XXXGraphics内部仍然是由一堆Property类型的属性组成。

由此可见Entity从里到外，都是特别崇尚Property的设计。Property无处不在。之前我写过一篇文章叫 [Cesium的Property机制总结](https://link.zhihu.com/?target=https%3A//www.jianshu.com/p/f0b47997224c)，如果您希望对Property有更多的了解，可以参考一下。

还有一个地方需要开发者特别注意：但凡遇到 XXXProperty、XXXGraphics 的类，就要明白，它一定是和Entity相关的。Cesium有很多名称类似的类，但是他们的使用场景差别很大，千万不要搞混了。



![img](https://pic1.zhimg.com/v2-facc5ca046ec2fc79baeb85aed01e498_b.jpg)



比如，API文档中搜索Billboard就会发现有：Billboard、BillboardCollection、BillboardGrahpics等类。其中BillboardGrahpics就属于Entity API中使用的类，而Billboard、BillboardCollection这些不带有Propery后缀、Graphics后缀的，一般都是Primitive API的一员。二者是绝对不能混用的。

### Scene

Scene也是我们使用Cesium时无法跳过的一个重要的类。



![img](https://pic3.zhimg.com/v2-1957629c3336a7bed6cc65eef193c002_b.jpg)



它是用来管理三维场景的各种对象实体的核心类。其中：

globe用来表示整个地球的表皮，地球表皮的绘制需要两样东西，地形高程和影像数据。Cesium的地形高程数据只能有一套，而影像数据可以由多层，多层可以相互叠加。

primitives、groundprimitives则是表示加入三维场景中的各种三维对象了。groundPrimitives用来表示贴地的三维对象。我们之前通过viewer.entities加入场景中的三维实体，大多会转化成primitives和groundPrimitives。

这里面有一个值得注意的问题：经常有开发者会调用scene.primitives.removeAll()来清空所有三维场景对象。这个操作是破坏性的。因为viewer.entities可以自己管理和自身相关的primitive的，也就是它会自动调用scene.primitives的add和remove方法，来进行primitive的增删操作。然而此时因为removeAll的操作，却也被强制删掉了，从而导致viewer.entities失效。removeAll并非不能用，我们在接下来的Primitive类中论述。

最后剩下的就是一堆地球周边的环境对象了，比如天空盒（用来表示星空）、skyAtmosphere（用来表示大气）、sun（表示太阳）、moon（表示月亮）等等。



### Primitive & PrimitiveCollection

Primitive是Primitive API的核心类，它代表Cesium的三维场景中的一个基本绘制图元。

然而Cesium在这个地方搞得让人有点儿混淆：就是Cesium的**Primitive类**和**Primitive类型**并非一个东西。。哎。。实在是有一些拗口。。

暂且我们把**Primitive类型**，称为图元类型。那么Cesium中属于图元类型的类有很多：比如Globe、Model、Primitive、Billboards、Labels、Points、ViewportQuad。注意：这里面的Primitive只是图元类型的一种而已！我是觉得Cesium的Primitive类这个名字取得很不好，很容易让人误解。如果改成CustomPrimitive（类似CustomDataSource）或许能更好地让人理解。不过Cesium就这样，又能咋地。。┑(￣Д ￣)┍

![img](https://pic3.zhimg.com/v2-c4625ba84863200dd70fa9068abc6442_b.jpg)

务必注意：Cesium用PrimitiveCollection类来作为图元类型的集合容器，**不仅仅是承载Cesium的Primitive类**，同时也可以承载Model、ViewportQuad类图元。

甚至我们可以自定义图元类型，存放到PrimitiveColloection当中去。我在github上开源了一些自定义Primitive类的方法和示例，如果有兴趣，也可以了解一下： [https://github.com/cesiumlab/cesium-custom-primitive](https://link.zhihu.com/?target=https%3A//github.com/cesiumlab/cesium-custom-primitive)。

我们再来聊一下PrimitiveCollection这个类。这个类也很有意思，不仅表示一个图元类型的集合，本身也是一个**图元类型**！

![img](https://pic3.zhimg.com/v2-cb42b29d40b0be5082c72e305de9259e_b.jpg)

Cesium的API文档里面早有说明，而且还给出了示例(注意示例中的scene.primitives也是一个PrimitiveCollection类型的对象)。于是，就产生了各种奇妙的可能了。我们可以利用PrimitiveCollection来构建一棵具有层级结构的场景树。

![img](https://pic1.zhimg.com/v2-2ad36dd47bb5aee2082da5faa0afe078_b.jpg)

上图中，scene.primitives相当于场景树的根节点，我们在根节点上可以挂接各种Primitive对象，同时也可以挂接PrimitiveCollection对象，然后PrimitiveCollection对象下面又可以挂接N个不同的Primitive对象。

很自然，为了方便清空某个PrimitiveCollection对象下的所有对象，自然需要removeAll()这个方法了。

但是需要注意的是，这个方法可以用在任何一个自定义的PrimitiveCollection对象上，但是我们不能直接在scene.primities上使用。如前所述，因为viewer.entities会在scene.primitives上偷偷挂接一些它管理的primitive对象。如果我们直接调用scene.primitives.removeAll()，相当于把viewer.entities也给删除了。

所以removeAll()方法的使用是需要注意场合的。

### 总结

至此，Cesium几个重要的类我们都一一做了介绍，这几个类也是Cesium最核心的类，相信由此出发，读者可以更好地掌握Cesium的API使用方法。以后有机会，我们会再介绍一下Cesium API中一些约定俗称的，但是前端开发者又比较难理解的APi调用方法。



## Property  动态改变

![Cesium的Property机制总结](https://pic1.zhimg.com/v2-191d0dcc18de95eb11e79b7884c7445d_720w.png?source=d16d100b)

前言Cesium官方教程中有一篇叫《空间数据可视化》([Visualizing Spatial Data](http://link.zhihu.com/?target=https%3A//cesiumjs.org/tutorials/Visualizing-Spatial-Data/))。该文文末简单提到了Cesium的Property机制，然后话锋一转，宣告此教程的第二部分将重点讲解Property机制。但是呢，第二部分还没有写好，说在等待的过程中，可以先看下Cesium对影像和地形的支持。。可以看官方教程中的说法，如下图所示：

![img](https://picx.zhimg.com/80/v2-662a2dce7f49b5f3302a5dfd8aa84d12_720w.webp?source=d16d100b)

于是，我苦等了一年啦。。官方教程的第二部分还是没能看到。。毕竟这是Cesium官方推荐使用的Entity API中最重要的部分之一。。居然这么久了也不给更新下。。我想还是自己总结一下得好。。为什么要用Property？还是举个例子来说吧。

### 📦不变的长方体 ConstantProperty

比如我想在地球上的某个位置加一个盒子，可以这样写代码：

```JS
// 创建盒子 
var blueBox = viewer.entities.add({
    name : 'Blue box',
    position: Cesium.Cartesian3.fromDegrees(-114.0, 40.0, 300000.0),
    box : {
        dimensions : new Cesium.Cartesian3(400000.0, 300000.0, 500000.0),
        material : Cesium.Color.BLUE,
        outline: true,
    }
}); 
```

下面的两句代码实现的效果一致且意义也一致

```JS
blueBox.box.dimensions = new Cesium.Cartesian3(400000.0, 300000.0, 200000.0);
```

```js
blueBox.box.dimensions = new ConstantProperty(new Cesium.Cartesian3(400000.0, 300000.0, 200000.0));
```

Entity的 `box.dimensions` 类型并不是 `Cartesian3`，而是一个 `Property` 。虽然我们赋值了一个 `Cartesian3` ，但是 Cesium 内部会隐晦地转化成了一个`ConstantProperty` 。注意只会隐晦地转化成` ConstantProperty` ，而不是` SampleProperty` ，更不是` TimeIntervalCollectionProperty` 。虽然叫` ConstantProperty`，但是，这里Constant的意思并不是说这个Property不可改变，而是说它**不会随时间发生变化**。

最终的效果如图所示：

![动图封面](https://pica.zhimg.com/v2-f27bbcb37047dae8ef5775f223503abb_720w.jpg?source=d16d100b)

### 匀速式变长的长方体 SampledProperty

但是呢，如果我想让这个盒子逐渐变长，该怎么操作呢？方法是有的，就是可以不停地去修改blueBox.position，类似这样： 

```JS
setInterval(function(){ blueBox.box.dimensions = xxx; }, 3000);
```

如果场景中有很多物体，在不同的时间段要发生各种走走停停地运动时，这样操作可能会很累人。那么**Cesium就提供一种机制，让dimensions可以随时间自动发生变化，自动赋予不同的数值（位置）。这也就是property的作用**了。

以下代码的加入，就可以让盒子如上图所示做线性运动了。

```JS
// 装配一个 SampledProperty 对象
var property = new Cesium.SampledProperty(Cesium.Cartesian3);
property.addSample(
    Cesium.JulianDate.fromIso8601('2019-01-01T00:00:00.00Z'),
    new Cesium.Cartesian3(400000.0, 300000.0, 200000.0));
property.addSample(
    Cesium.JulianDate.fromIso8601('2019-01-03T00:00:00.00Z'),
    new Cesium.Cartesian3(400000.0, 300000.0, 700000.0));
// 使用这个 SampledProperty 对象
blueBox.box.dimensions = property; 
```

以上代码的意思就是在两个不同的时间点分别赋予不同的位置，用SampledProperty包装成一个property，最后赋给blueBox.box.dimensions。由此可见，**Property最大的特点是和时间相互关联，在不同的时间可以动态地返回不同的属性值**。而Entity则可以感知这些Property的变化，在不同的时间驱动物体进行动态展示。Cesium宣称自己是数据驱动和time-dynamic visualization，这些可都是仰仗Property系统来实现的。当然，Property可不只是这么简单，以下再详细论述。

Property的分类Cesium的Property不止有刚才示例代码中的SampleProperty，还有很多其他的类型。如果搜索一下Cesium的API文档，会有很多。。如下图所示：

![img](https://pic1.zhimg.com/80/v2-b70b0d43f35231f5eb36febafff1c6d0_720w.webp?source=d16d100b)

我们简单分类一下

![img](https://pic1.zhimg.com/80/v2-c83680caaff317ec55ebd5e79056fa60_720w.webp?source=d16d100b)

Property虚基类Property是所有Property类型的虚基类。它定义了以下接口。

![img](https://picx.zhimg.com/80/v2-ed2ace748efa89a624bbbf5689290899_720w.webp?source=d16d100b)

- **getValue** 是一个方法，用来获取某个时间点的特定属性值。它有两个参数：第一个是time，用来传递一个时间点；第二个是result，用来存储属性值，当然也可以是undefined。这个result是Cesium的scratch机制，主要是用来**避免频繁创建和销毁对象而导致内存碎片**。**Cesium就是通过调用getValue类似的一些函数来感知Property的变化的**，当然这个方法我们在外部也是可以使用的。

- **isConstant** 用来判断该属性是否会随时间变化，是一个布尔值。Cesium会通过这个变量来决定是否需要在场景更新的每一帧中都获取该属性的数值，从而来更新三维场景中的物体。如果isConstant为true，则只会获取一次数值，除非definitionChanged事件被触发。

- **definitionChanged** 是一个事件，可以通过该事件，来监听该Property自身所发生的变化，比如数值发生修改。

- **equals** 是一个方法，用来检测属性值是否相等。

### 📦跳跃式变长的长方体 TimeIntervalCollectionProperty

基本Property类型 `SampleProperty` 我们最早在上述示例中使用的就是它，用来通过给定多个不同时间点的Sample，然后在每两个时间点之间进行线性插值的一种Property。代码写法如下：

```js
var property = new Cesium.SampledProperty(Cesium.Cartesian3);
property.addSample(
    Cesium.JulianDate.fromIso8601('2019-01-01T00:00:00.00Z'),
    new Cesium.Cartesian3(400000.0, 300000.0, 200000.0)
);
property.addSample(
    Cesium.JulianDate.fromIso8601('2019-01-03T00:00:00.00Z'),
    new Cesium.Cartesian3(400000.0, 300000.0, 700000.0)
);
blueBox.box.dimensions = property; 
```



TimeIntervalCollectionProperty该Property用来指定各个具体的时间段的属性值，每个时间段内的属性值是恒定的，并不会发生变化，除非已经进入到下一个时间段。拿创建的盒子示例来说，表现出来的特点就是盒子尺寸的变化时跳跃式的。
代码如下：

```js
// 装配一个 TimeIntervalCollectionProperty
var property = new Cesium.TimeIntervalCollectionProperty(Cesium.Cartesian3);
property.intervals.addInterval(
    Cesium.TimeInterval.fromIso8601({
        iso8601 : '2019-01-01T00:00:00.00Z/2019-01-01T12:00:00.00Z',
        isStartIncluded : true,
        isStopIncluded : false,
        data : new Cesium.Cartesian3(400000.0, 300000.0, 200000.0)
    })
);
property.intervals.addInterval(
    Cesium.TimeInterval.fromIso8601({
        iso8601 : '2019-01-01T12:00:01.00Z/2019-01-02T00:00:00.00Z',
        isStartIncluded : true,
        isStopIncluded : false,
        data : new Cesium.Cartesian3(400000.0, 300000.0, 400000.0)
    })
);
property.intervals.addInterval(
    Cesium.TimeInterval.fromIso8601({
    	iso8601 : '2019-01-02T00:00:01.00Z/2019-01-02T12:00:00.00Z',
    	isStartIncluded : true,
    	isStopIncluded : false,
    	data : new Cesium.Cartesian3(400000.0, 300000.0, 500000.0)
	})
);
property.intervals.addInterval(
    Cesium.TimeInterval.fromIso8601({
        iso8601 : '2019-01-02T12:00:01.00Z/2019-01-03T00:00:00.00Z',
        isStartIncluded : true,
        isStopIncluded : true,
        data : new Cesium.Cartesian3(400000.0, 300000.0, 700000.0)
    })
);
// 使用 TimeIntervalCollectionProperty
blueBox.box.dimensions = property; 
```



ConstantProperty

通过对TimeIntervalCollectionProperty和SampleProperty的描述，读者应该基本了解Property的特点。我们回过头来说下ConstantProperty，其实这才是最常用的Property。示例代码如下：`blueBox.box.dimensions = new Cesium.Cartesian3(400000.0, 300000.0, 200000.0); `以上代码貌似没有使用ConstantProperty，实际上他是等同于：`blueBox.box.dimensions = new ConstantProperty(new Cesium.Cartesian3(400000.0, 300000.0, 200000.0)); `也就是举个例子，

可以通过 property.getValue(viewer.clock.currentTime) 方法来获取某个时间点property的属性值。如果property是SampleProperty或者TimeIntervalCollectionProperty的话，不同的时间点，可能getValue出不同的数值。但是如果这个property是ConstantProperty，那么无论什么时间（getValue的第一个参数不起作用），最后返回的数值都是一样的。但是不会随时间变化，并不代表不可改变。ConstantProperty还有一个setValue的方法，开发者可以通过调用它，来在适当的时候改变property的值。比如，我可以通过点击按钮来修改ConstantProperty，代码如下：`blueBox.box.dimensions.setValue(new Cesium.Cartesian3(400000.0, 300000.0, 700000.0)); `需要注意的是，虽然最终效果一样，但是以下两种写法的意义是不一样的。`blueBox.box.dimensions = new Cesium.Cartesian3(400000.0, 300000.0, 200000.0);``blueBox.box.dimensions.setValue(new Cesium.Cartesian3(400000.0, 300000.0, 700000.0));`前者会创建一个新的ConstantProperty，后者则会修改原有的ConstantProperty的值。

### 📦组合前几种变化 CompositePropertyCompositeProperty

组合的Property，可以把多种不同类型的ConstantProperty、SampleProperty、TimeIntervalCollectionProperty等Property组合在一起来操作。比如前一个时间段需要线性运动，后一段时间再跳跃式运动。则可以使用类似下面这段代码来实现。

```JS
// 1 sampledProperty
var sampledProperty = new Cesium.SampledProperty(Cesium.Cartesian3);
sampledProperty.addSample(
    Cesium.JulianDate.fromIso8601('2019-01-01T00:00:00.00Z'),
    new Cesium.Cartesian3(400000.0, 300000.0, 200000.0)
);
sampledProperty.addSample(
    Cesium.JulianDate.fromIso8601('2019-01-02T00:00:00.00Z'),
    new Cesium.Cartesian3(400000.0, 300000.0, 400000.0)
);
// 2 ticProperty
var ticProperty = new Cesium.TimeIntervalCollectionProperty();
ticProperty.intervals.addInterval(Cesium.TimeInterval.fromIso8601({        iso8601 : '2019-01-02T00:00:00.00Z/2019-01-02T06:00:00.00Z',        isStartIncluded : true,        isStopIncluded : false,        data : new Cesium.Cartesian3(400000.0, 300000.0, 400000.0)    }));   ticProperty.intervals.addInterval(Cesium.TimeInterval.fromIso8601({        iso8601 : '2019-01-02T06:00:00.00Z/2019-01-02T12:00:00.00Z',        isStartIncluded : true,        isStopIncluded : false,        data : new Cesium.Cartesian3(400000.0, 300000.0, 500000.0)    }));   ticProperty.intervals.addInterval(Cesium.TimeInterval.fromIso8601({        iso8601 : '2019-01-02T12:00:00.00Z/2019-01-02T18:00:00.00Z',        isStartIncluded : true,        isStopIncluded : false,        data : new Cesium.Cartesian3(400000.0, 300000.0, 600000.0)    }));   ticProperty.intervals.addInterval(Cesium.TimeInterval.fromIso8601({        iso8601 : '2019-01-02T18:00:00.00Z/2019-01-03T23:00:00.00Z',        isStartIncluded : true,        isStopIncluded : true,        data : new Cesium.Cartesian3(400000.0, 300000.0, 700000.0)    }));
// 3 compositeProperty
var compositeProperty = new Cesium.CompositeProperty();
compositeProperty.intervals.addInterval(
    Cesium.TimeInterval.fromIso8601({
        iso8601 : '2019-01-01T00:00:00.00Z/2019-01-02T00:00:00.00Z',
        data : sampledProperty
    })
);
compositeProperty.intervals.addInterval(
    Cesium.TimeInterval.fromIso8601({
        iso8601 : '2019-01-02T00:00:00.00Z/2019-01-03T00:00:00.00Z',
        isStartIncluded : false,
        isStopIncluded : false,
        data : ticProperty
    })
);
// 4 设置position
blueBox.box.dimensions = compositeProperty; 
```

我们一直在用SampledProperty、ConstantProperty等来修改Entity的box.dimensions属性。基本上可以得出结论：大部分Property都是可以赋值给Entity的box.dimensions的。

### 🌏线性改变位置 PositionProperty

以上示例可以看到，我们一直在用SampledProperty、ConstantProperty等来修改Entity的box.dimensions属性。基本上可以得出结论：大部分Property都是可以赋值给Entity的box.dimensions的。PositionProperty和Property一样，是一个虚类，并不能直接实例化，他扩展了Property的接口，增加了referenceFrame，同时只能用来表示position。

![img](https://picx.zhimg.com/80/v2-c1217233d5e37d6471c733ae6b87b33b_720w.webp?source=d16d100b)

referenceFrame是用来表示position的参考架。目前Cesium有以下两种参考架。

![img](https://pica.zhimg.com/80/v2-745a51e13cf50b947c6a9414674d6c07_720w.webp?source=d16d100b)

我们常用的是FIXED这种默认类型，它相当于以地球的中心作为坐标系的原点，x轴正向指向赤道和本初子午线的交点。（可能描述不准确。。）这样我们给定一个笛卡尔坐标(x, y, z)，它在地球上的位置是固定的。而INERTIAL这种类型，则相当于以太阳系的质心为原点的坐标架偏移到地球的中心来，如果给定一个笛卡尔坐标(x, y, z)，那么它在不同的时间表示的是地球上的不同位置。。（我的理解，可能有误。。）一般情况下，我们用不上INERTIAL。但是如果真的给定了INERTIAL下的坐标点，Cesium内部会通过PositionProperty，把它转成同一个FIXED下的坐标点来使用，这些不需要我们操作。但是，因为普通的Property是没有办法进行这种参考架的自动转换的，所以Cesium派生了一批PositionProperty类型。基于PositionProperty的类型有以下几种：

- CompositePositionProperty
- ConstantPositionProperty
- PositionProperty
- PositionPropertyArray
- SampledPositionProperty
- TimeIntervalCollectionPositionProperty

稍加留意，就会发现，和普通的Property相比，只是多了一个Position，所以用法上也大同小异，只不过他们是用来专门表示位置的。SampledPositionPropertySampledPositionProperty的用法，不多解释，直接看代码吧：

```JS
var property = new Cesium.SampledPositionProperty();
property.addSample(
    Cesium.JulianDate.fromIso8601('2019-01-01T00:00:00.00Z'),
    Cesium.Cartesian3.fromDegrees(-114.0, 40.0, 300000.0)
);
property.addSample(
    Cesium.JulianDate.fromIso8601('2019-01-03T00:00:00.00Z'),
    Cesium.Cartesian3.fromDegrees(-114.0, 45.0, 300000.0)
);
blueBox.position = property; 
```

### 🌏插值改变位置 setInterpolationOptions

`SampleProperty`和`SampledPositionProperty`有一个特有的方法：`setInterpolationOptions`，用来修改不同的插值方式。以下是以Cesium的Interpolation示例中的截图来说明他们的不同之处。

线性插值

![img](https://pica.zhimg.com/80/v2-66b22bdf4bdaf61bb644aef429ad6491_720w.webp?source=d16d100b)

代码写法如下：`entity.position.setInterpolationOptions({ interpolationDegree : 1, interpolationAlgorithm : Cesium.LinearApproximation }); `

Lagrange插值

![img](https://pica.zhimg.com/80/v2-060e5140a134c618ec79ed98e77ce56d_720w.webp?source=d16d100b)

`entity.position.setInterpolationOptions({ interpolationDegree : 5, interpolationAlgorithm : Cesium.LagrangePolynomialApproximation }); `

Hermite插值

![img](https://pica.zhimg.com/80/v2-653d0d3e480c7ecaa6cae8f8896e57c6_720w.webp?source=d16d100b)

`entity.position.setInterpolationOptions({ interpolationDegree : 2, interpolationAlgorithm : Cesium.HermitePolynomialApproximation }); `

### 👓改变长方体的外观 MaterialProperty

MaterialPropertyMaterialProperty是用来专门表示材质的Property，它对Property进行了扩展，增加了getType方法，用来获取材质类型。

![img](https://picx.zhimg.com/80/v2-bbcd5c27c1d7bcfbe78837f2cffc9bb8_720w.webp?source=d16d100b)

MaterialProperty也是一个虚基类，派生类有：

- CheckerboardMaterialProperty
- ColorMaterialProperty
- CompositeMaterialProperty
- GridMaterialProperty
- ImageMaterialProperty
- MaterialProperty
- PolylineArrowMaterialProperty
- PolylineDashMaterialProperty
- PolylineGlowMaterialProperty
- PolylineOutlineMaterialProperty
- StripeMaterialProperty

使用上大同小异，我们以ColorMaterialProperty来说明一下。

### 👓改变长方体颜色 ColorMaterialProperty

```JS
blueBox.box.material = new Cesium.ColorMaterialProperty(new Cesium.Color(0, 1, 0));
// 以上代码等同于
// blueBox.box.material = new Cesium.Color(0, 1, 0); 
```

ColorMaterialProperty的动态变化如果希望Color动起来的话，也是可以的。ColorMaterialProperty的内部有一个color属性，可以赋予一个SampledProperty来实现动态效果。

```JS
var colorProperty = new Cesium.SampledProperty(Cesium.Color);
colorProperty.addSample(
    Cesium.JulianDate.fromIso8601('2019-01-01T00:00:00.00Z'),
    new Cesium.Color(0, 1, 0)
);
colorProperty.addSample(
    Cesium.JulianDate.fromIso8601('2019-01-03T00:00:00.00Z'),
    new Cesium.Color(0, 0, 1)
);
blueBox.box.material = new Cesium.ColorMaterialProperty(colorProperty); 
```

### 🌟自定义改变各种属性CallbackPropertyCallbackProperty

自由度最高的一种Property，让用户通过自定义，回调函数，来返回需要的值。回调函数中，用户可以使用time来给定value，也可以以自己的方式给给定。以下代码就是不通过time，自己手动调整dimension的示例。

```JS
var l = 200000.0;
var property = new Cesium.CallbackProperty(function (time, result) {
    result = result || new Cesium.Cartesian3(0, 0, 0);
    l += 10000.0;
    if (l > 700000.0) {
        l = 200000.0;
    }
    result.x = 400000.0; 
    result.y = 300000.0;
    result.z = l;
    return result;
}, false);
blueBox.box.dimensions = property; 
```



### 🔗链接属性ReferenceProperty

该Property可以直接链接到别的对象的Property上，相当于引用，省得自己构建了。比如这里我创建了一个红色的盒子redBox，希望它和之前的蓝色盒子一起变大。那么可以使用以下代码：

`var collection = viewer.entities;  redBox.box.dimensions = new Cesium.ReferenceProperty(collection, blueBox.id, ['box', 'dimensions']); `

![img](https://picx.zhimg.com/80/v2-a5026e1c8bcfe4c5415ebf0ed021a2cc_720w.webp?source=d16d100b)

ReferenceProperty构造函数的参数有三个。

第一个参数用来指定需要引用的对象所属的collection，如果没有自己专门创建EntityCollection的话，可以直接使用viewer.entities。

第二个参数传递所指对象的id。

第三个参数指定属性的位置的数组，如果是有层级的属性，可以依次写入。比如 `['billboard', 'scale']` 指定的是entity.billboard.scale 属性。当然还有其他设置方式，可以参见Cesium的api文档。

### 📌独配 PropertyBag

PropertyBag 虽然不是以Property结尾，但实际上也是一个Property。它的特点是可以包装一个对象(JS中的对象概念)，该对象的每一个属性(JS中的属性概念)，都可以作为一个动态的Property。比如之前修改dimensions的话，dimensions是作为一个Cartesian3类型变量整体封装到Property中去的，如果我们只想修改dimensions的x。则可以使用PropertyBag来实现，代码如下：

```JS
var zp = new Cesium.SampledProperty(Number);
zp.addSample(Cesium.JulianDate.fromIso8601('2019-01-01T00:00:00.00Z'), 200000.0);
zp.addSample(Cesium.JulianDate.fromIso8601('2019-01-03T00:00:00.00Z'), 700000.0);
// 为 dimension 属性配置一个 PropertyBag 实例，为 z 值单独配置一个SampledProperty来控制 z 值的随时间改变
blueBox.box.dimensions = new Cesium.PropertyBag({
    x: 400000.0,
    y: 300000.0,
    z: zp 
}); 
```

效果和 sampleProperty 类似，但是修改的只是 dimensions 的 z 。PropertyArrayPropertyArray和上述的PropertyBag类似，只是其内部封装了一个数组而已。这里不再赘述。

### ✅物体朝向与速度方向

VelocityOrientationProperty该Property用来Entity的position的位置变化，来计算出移动的方向，最后把速度方向输出成Orientation。Cesium自带的示例中有一个Interpolation中有其用法，不再赘述。

VelocityVectorProperty与上面的Property类似，把速度方向转成Vector。使用示例如下：

```JS
blueBox.box.show = false;
blueBox.billboard = {
    scale: 0.05,
    image : 'https://upload-images.jianshu.io/upload_images/80648-5dfe8a3ea2c250be.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/540/format/webp',
    alignedAxis : new Cesium.VelocityVectorProperty(blueBox.position, true) // alignedAxis must be a unit vector    
}; 
```

可见图像的摆放方向和位置移动的方向保持一致。效果如下：

![动图](https://pic1.zhimg.com/v2-1d415e24a5c34c2f70b49ea953b8b9a2_720w.webp?source=d16d100b)

附录

[本文在github上的源码](http://link.zhihu.com/?target=https%3A//github.com/vtxf/cesium-notes/blob/master/Cesium%E7%9A%84Property%E6%9C%BA%E5%88%B6%E6%80%BB%E7%BB%93/%E6%BA%90%E7%A0%81/sample1.js)



## ImageryLayer  载入影像

[为什么cesium只有imageryLayer？ - 知乎 (zhihu.com)](https://www.zhihu.com/question/551961049/answer/2662465672)

与 Widgets 组件类中的 BaseLayerPicker

### Viewer创建中指定

```js
this.map = new Viewer(withKeyId, {
            imageryProvider: new ArcGisMapServerImageryProvider({
                url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
            }),
});
```



### 后续添加



记录：

| 情况 | 如何添加 imageryProvider                                     | 是否设置 Ion | BaseLayerPicker                                       | 显示结果             |
| ---- | ------------------------------------------------------------ | ------------ | ----------------------------------------------------- | -------------------- |
|      | 直接添加 {  }                                                | 否           | 没有这个图层的图标，显示为黑色                        | 正常                 |
|      | 不加 [Viewer.ConstructorOptions](https://cesium.com/learn/cesiumjs/ref-doc/Viewer.html#.ConstructorOptions) {  } | 否           | 不可使用 BaseLayerPicker 中的 Cesium Ion 组中的数据源 | 不显示地球但显示星空 |
|      |                                                              | 是           | 可以正常使用所有数据源                                | 正常                 |
|      | 间接加 {  }                                                  | 否           | 按钮消失                                              | 不显示地球但显示星空 |
|      |                                                              | 是           | 按钮消失                                              | 不显示地球但显示星空 |
|      |                                                              |              |                                                       |                      |



1. 在 viewer 中直接添加一个 imageryProvider 不需要设置 Ion ，加载正常，但是在 BaseLayerPicker 组件中是异常的，没有这个图层的图标，显示为黑色。
2. 在不传入 [Viewer.ConstructorOptions](https://cesium.com/learn/cesiumjs/ref-doc/Viewer.html#.ConstructorOptions) 这个配置时
   1. 有 Ion 配置，可以正常使用 BaseLayerPicker 所有数据源。
   2. 没有 Ion 配置，不可使用 BaseLayerPicker 中的 Cesium Ion 组中的数据源，且在首屏时不显示地球但显示星空。
   3. 总结：需要注意 BaseLayerPicker 组件如何修改，后面需要对其改写配置。
3. 
