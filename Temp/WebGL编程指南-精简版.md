这篇笔记记录这我学习《WebGL编程指南》这本书的心得。



## 02

绘制一个点的最简流程：

1. 定义顶点着色器和片元着色器。在这两个着色器中都有各自的定义好的内部变量。
2. 定义和获取容器 canvas 和 WebGL 上下文实例 gl。
3. 初始化顶点着色器和片元着色器。
4. 得到某个 attribute 变量（地址），例如 a_position ，并为它赋值。
5. 设置 gl 的背景色并 clear 。
6. 最后，gl 绘制这个点。





WebGL 依赖一种着色器的绘制机制。

着色器：

顶点着色器、片元着色器



将位置信息从 JavaScript 传递到 顶点着色器： attribute 变量

将颜色信息从 JavaScript 传递到 片元着色器： uniform 变量





## 04

缓冲区对象

WebGL提供了一种很方便的机制，即缓冲区对象(buffer object)，它可以一次性地向着色器传入多个顶点的数据。缓冲区对象是 WebGL系统中的一块内存区域，我们可以一次性地向缓冲区对象中填充大量的顶点数据，然后将这些数据保存在其中，供顶点着色器使用。

<img src="E:\AProject\CesiumExampleCollection\Img\WebGL编程指南-精简版\使用缓冲区.png" alt="使用缓冲区"  />

注意，开启attribute 变量后,你就不能再用 `gl.vertexAttrib[1234]f()`向它传数据了。除非你显式地关闭该 attribute 变量。实际上，你无法 (也不应该) 同时使用 `gl.vertexAttribPointer()` 和 `gl.vertexAttrib[1234]f()` 这两个函数。

<img src="E:\AProject\CesiumExampleCollection\Img\WebGL编程指南-精简版\顶点着色器执行过程中缓冲区数据的传输过程.png" alt="顶点着色器执行过程中缓冲区数据的传输过程"  />



WebGL 可以绘制的基本图像如下，借助API `gl.drawArrays()` 绘制。

<img src="E:\AProject\CesiumExampleCollection\Img\WebGL编程指南-精简版\WebGL可以绘制的基本图像.png" alt="WebGL可以绘制的基本图像"  />

但是，这个最简单的例子中数据在第四步中的赋值可是大有文章。数据如何动态的赋给 a_position 是需要一些步骤的。需要借助缓冲区对象，流程如下：

1. 准备一个 JavaScript 特殊数组。
2. 创建缓冲区对象，`gl.createBuffer()`。
3. 绑定缓冲区对象   `gl.bindBuffer(target, buffer)`。
4. 向缓冲区对象写入 准备好的 JavaScript 数据   `gl.bufferData(raeget, data, usage)`。
5. 将缓冲区对象分配给 attribute 变量   `gl.vertexAttribPointer(location, size, type, normalized, stride, offset)`。
6. 开启 attribute 变量   `gl.enbaleVertexAttribArray(location)`。

目前可以想到，我们可以控制第一步和第四步来达到数据的动态赋值。

仔细观察 将绑定到gl.ARRAY_BUFFER的缓冲区对象分配给指定attribute变量 这个函数

<img src="E:\AProject\CesiumExampleCollection\Img\WebGL编程指南-精简版\将绑定到gl.ARRAY_BUFFER的缓冲区对象分配给指定attribute变量.png" alt="将绑定到gl.ARRAY_BUFFER的缓冲区对象分配给指定attribute变量"  />



移动旋转缩放

**一个模型可能经过了多次变换，将这些变换全部复合成一个等效的变换，就得到了模型变换，模型变换的矩阵称为模型矩阵。上式中（旋转矩阵\*平移矩阵）就称为模型矩阵**

<img src="E:\AProject\CesiumExampleCollection\Img\WebGL编程指南-精简版\平移旋转.png" alt="平移旋转"  />

上图的情况不太理解。破案了，是 cuon-matrix.js 工具函数的锅，似乎不能叠加变换，以求得模型矩阵 Model Matrix。





## 05颜色和纹理

1 非坐标数据传入顶点着色器

<img src="E:\AProject\CesiumExampleCollection\Img\WebGL编程指南-精简版\使用两个缓冲区对象向顶点着色器传输数据.png" alt="使用两个缓冲区对象向顶点着色器传输数据"  />

2 几何形状的显示之varying 变量的作用 （由绘制彩色三角形例子引出）

<img src="E:\AProject\CesiumExampleCollection\Img\WebGL编程指南-精简版\几何形状的装配与光栅化.png" alt="几何形状的装配与光栅化"  />



<img src="E:\AProject\CesiumExampleCollection\Img\WebGL编程指南-精简版\几何形状的装配与光栅化2.png" alt="几何形状的装配与光栅化2"  />



🏷️顶点着色器和片元着色器之间图形装配与光栅化的过程如下：

`gl.drawArrays()`的参数n为3，顶点着色器将被执行3次。

第1步:执行顶点着色器。缓冲区对象中的第1个坐标 `(0.0,0.5)` 被传递给attribute，一旦一个顶点的坐标被赋值给了 `gl_Position`，它就进变量 `a_Position`。人了图形装配区域，并暂时储存在那里。你应该还记得，我们仅仅显式地向 `a_Position` 赋了x分量和y分量，所以Z分量和w分量赋的是默认值进入图形装配区域的坐标其实是 `(0.0,0.5,0.0,1.0)`。

第2步:再次执行顶点着色器。类似地，将第2个坐标 `(-0.5,-0.5,0.0,1.0)` 传入并储存在装配区。

第3步:第3 次执行顶点着色器。将第3个坐标`(0.5,0.5.0,1.0)`传入并储存在装配区。现在，顶点着色器执行完毕，三个顶点坐标都已经处在装配区了。

第4步:开始装配图形。使用传入的点坐标，根据gldrawArrays(的第一个参数信息(g1.TRIANGLES)来决定如何装配。本例使用三个顶点来装配出一个三角形。

第 5步:显示在屏幕上的三角形是由片元(像素) 组成的，所以还需要将图形转化为片元，这个过程被称为光栅化(rasterization)。光栅化之后，我们就得到了组成这个三角形的所有片元。在图 5.11 中的最后一步，你可以看到光栅化后得到的组成三角形的片元。

<img src="E:\AProject\CesiumExampleCollection\Img\WebGL编程指南-精简版\几何形状的装配与光栅化过程.png" alt="几何形状的装配与光栅化过程"  />



🏷️执行片元着色器

一旦光栅化过程结束后，程序就开始逐片元调用片元着色器。在图 5.12 中，片元着色器被调用了 10次每调用一次,就处理一个片元(为了整洁,图5.12 省略了中间步骤)对于每个片元，片元着色器计算出该片元的颜色，并写入颜色缓冲区。直到第15 步最后一个片元被处理完成，浏览器就会显示出最终的结果。

<img src="E:\AProject\CesiumExampleCollection\Img\WebGL编程指南-精简版\调用片元着色器.png" alt="调用片元着色器"  />

小知识：

| 类型和变量名      | 描述                                                         |
| ----------------- | ------------------------------------------------------------ |
| vec4 gl_FragCoord | 该内置变量的第1个和第2个分量表示片元在 < canvas >坐标系统(窗口坐标系统)中的坐标值 |



varying 变量

从上面了解到顶点着色器和片元着色器之间的数据传输细节，这也是 varying 变量起作用的地方。内插过程就是顶点着色器输出的值和片段着色器接收到的值之间的插值过程，在这个具体的例子中就是线段上的所有片元的颜色会被恰当的计算出来。



纹理映射（贴图）：一门重要的技术，①不想使用varying内插，为每个片元涂上合适的颜色 ②模拟坑坑洼洼的表面

四大步骤

1. 准备好映射到几何图形上的纹理图像
2. 为几何图形配置纹理映射方式。
3. 加载纹理图像，对其进行一些配置，以在WebGL 中使用它。
4. 在片元着色器中将相应的纹素从纹理中抽取出来，并将纹素的颜色赋给片元。



纹理图像（纹理，texture image）：纹理映射是所需的图片资源

纹素（texels，texture elements）：组成纹理图像的像素

纹理映射方式：`确定“几何图形的某个片元”的颜色怎样 `取决于 `“几何图形的某个图像中哪个(或哪几个)像素”`的问题(即片元与纹素的映射公式或关系)。

纹理坐标（texture coordinate）：一套新的坐标系统，用来确定图像的哪部分将覆盖到几何图形上。

<img src="../Img/WebGL编程指南-精简版/纹理坐标.png" alt="纹理坐标" style="zoom:75%;" />

<img src="../Img/WebGL编程指南-精简版/纹理映射.png" alt="纹理坐标" style="zoom:75%;" />
