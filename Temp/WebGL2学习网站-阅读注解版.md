

## WebGL2的基本原理

### 基础概念

WebGL通常被认为是一种3D API。实际上WebGL仅仅是栅格化(rasterization)引擎。它会基于你的代码来画点，线条和三角形。 而你需要使用点、线、三角形组合来完成复杂的3D任务。

> 📌*读者注：这本书会教授我们如何绘制点线面，而如何组合这些点线面是另外一门学问了*

WebGL是在GPU上运行的。在GPU上运行的WebGL代码是以一对函数的形式，分别叫做点着色器(Vertex Shader)和片段着色器(Fragment Shader). 他们是用一种类似C++的强类型语言[GLSL](https://webgl2fundamentals.org/webgl/lessons/zh_cn/webgl-shaders-and-glsl.html)编写的。这一对函数组合被叫做程序(Program)。

点着色器的任务是计算点的的位置。基于函数输出的位置，WebGL能够栅格化(rasterize)不同种类的基本元素，如[点、线和三角形](https://webgl2fundamentals.org/webgl/lessons/zh_cn/webgl-points-lines-triangles.html)。当栅格化这些基本元素的同时，也会调用第二种函数：片段着色器。它的任务就是计算当前正在绘制图形的每个像素的颜色。

几乎所有的WebGL API是为这些函数对的运行来[设置状态](https://webgl2fundamentals.org/webgl/lessons/resources/webgl-state-diagram.html)。你需要做的是：设置一堆状态，然后调用`gl.drawArrays`和`gl.drawElements`在GPU上运行你的着色器。

> 📌*读者注：*

这些函数需要用到的任意数据都必须提供给GPU。 着色器有如下四种方法能够接收数据。

1. 属性(Attributes)，缓冲区(Buffers)和顶点数组(Vertex Arrays)

   缓存区以二进制数据形式的数组传给GPU。缓存区可以放任意数据，通常有位置，归一化参数，纹理坐标，顶点颜色等等

   属性用来指定数据如何从缓冲区获取并提供给顶点着色器。比如你可能将位置信息以3个32位的浮点数据存在缓存区中， 一个特定的属性包含的信息有：它来自哪个缓存区，它的数据类型(3个32位浮点数据)，在缓存区的起始偏移量，从一个位置到下一个位置有多少个字节等等。

   > 📌*读者注：属性在语言层面可以类比C语言的 int float 等变量类型，但是属性包含的信息更丰富*

   缓冲区并非随机访问的，而是将顶点着色器执行指定次数。每次执行时，都会从每个指定的缓冲区中提取下一个值并分配给一个属性。

   属性的状态收集到一个顶点数组对象（VAO）中，该状态作用在每个缓冲区，以及如何从这些缓冲区中提取数据。

   > 📌*读者注：比 WebGL 1 多出了 顶点数组 这个概念*

2. 全局变量 Uniforms 

   Uniforms 是在执行着色器程序前设置的全局变量

3. 纹理  Textures

   纹理是能够在着色器程序中随机访问的数组数据。大多数情况下纹理存储图片数据，但它也用于包含颜色以为的数据。

4. 可变量  Varyings 

   Varyings是一种从点着色器到片段着色器传递数据的方法。根据显示的内容如点，线或三角形， 顶点着色器在Varyings中设置的值，在运行片段着色器的时候会被解析。



### 简单使用 WebGL 

WebGL只关注两件事：剪辑空间坐标(Clip space coordinates)和颜色。 所以作为程序员，你的任务是向WebGL提供这两件事--编写两种着色器的代码：**点着色器提供剪辑空间坐标；片段着色器提供颜色**。

**不管你的画布大小，剪辑空间坐标的取值范围是 -1到 1**。下面是一个很简单的WebGL程序例子。

① 首先从顶点着色器开始。

```glsl
#version 300 es 

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position; 

// all shaders have a main function
void main() {
	// gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = a_position;
}
```

运行的时候，如果所有的代码是用 Javascript (而非GLSL)写的，你可以想象它是如下形式：

```JavaScript
// *** PSEUDO CODE!! ***
 
var positionBuffer = [
  0, 0, 0, 0,
  0, 0.5, 0, 0,
  0.7, 0, 0, 0,
];
var attributes = {};
var gl_Position;
 
drawArrays(..., offset, count) {
  var stride = 4;
  var size = 4;
  for (var i = 0; i < count; ++i) {
     // copy the next 4 values from positionBuffer to the a_position attribute
     const start = offset + i * stride;
     attributes.a_position = positionBuffer.slice(start, start + size);
     runVertexShader();
     ...
     doSomethingWith_gl_Position();
}
```

这个例子只是给你演示顶点着色器是怎么运行的。实际没有这么简单，因为`positionBuffer`需要被**转换成二进制数据**，从而取出数据会有些不同。

② 接下来我们需要片段着色器

```glsl
#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
 
// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
  // Just set the output to a constant reddish-purple
  outColor = vec4(1, 0, 0.5, 1);
}
```

上面，我们声明了`outColor`作为片段着色器的输出，并设置值为`1, 0, 0.5, 1`。颜色值范围是 0~1，上面颜色值的红色为1，绿色为0，蓝色为0.5，透明性为1。



③ 准备容器，提供一个渲染上下文（着色器实例）

首先我们需要一个HTML canvas元素

```
 <canvas id="c"></canvas>
```

然后再Javascript中查找到该元素

```
 var canvas = document.querySelector("#c");
```

现在我们创建一个WebGL2RenderingContext

```glsl
 var gl = canvas.getContext("webgl2");
 if (!gl) {
    // no webgl2 for you!
    ...
```



④  准备着色器 GLSL 代码

为了让着色器代码能够在GPU上运行，你需要编译这些着色器代码。编译前，通过字符串连接的方式把这些GLSL的代码片段作为Javascript的string，当然也可以使用AJAX下载方式，或把他们放到non-javascript标签中，或者像下例一样以多行字符串模板的形式。

```glsl
var vertexShaderSource = `#version 300 es
 
// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
 
// all shaders have a main function
void main() {
 
  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = a_position;
}
`;
 
var fragmentShaderSource = `#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
 
// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
  // Just set the output to a constant reddish-purple
  outColor = vec4(1, 0, 0.5, 1);
}
`;
```

实际上，大多数3D引擎在运行过程中用不同形式的字符串模板、连接等等产生GLSL着色器（GLSL字符串源码）。然而，本章实例中没有那么复杂，不需要再运行中实时生成GLSL。

> 注意： `#version 300 es` **必须位于着色器代码的第一行**。 它前面不允许有任何的注释或空行！ `#version 300 es` 的意思是你想要使用WebGL2的着色器语法:GLSL ES 3.00。 如果你没有把它放到第一行，将默认设置为GLSL ES 1.00,即WebGL1.0的语法。相比WebGL2的语法，会少很多特性。



⑤  构造一个函数来创建 不同的 着色器实例 ，并链接为一个程序 *(program)* 

该函数接收的参数列表为 WebGL2RenderingContext实例，GLSL源码字符串 和 编译着色器。

```JavaScript
// 创建着色器的函数
function createShader(gl, type, source) {
  var shader = gl.createShader(type);// 创建指定类型的着色器对象
  gl.shaderSource(shader, source);// 将着色器源码附加到着色器对象上
  gl.compileShader(shader);// 编译着色器
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);// 检查着色器编译是否成功
  if (success) {
    return shader;
  }
 
  console.log(gl.getShaderInfoLog(shader));// 如果编译失败，打印错误信息到控制台并删除编译失败的着色器对象
  gl.deleteShader(shader);
}

//  两配对着色器的链接函数
function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();// 创建着色器程序对象
  gl.attachShader(program, vertexShader);// 将顶点着色器附加到着色器程序对象上
  gl.attachShader(program, fragmentShader);// 将片段着色器附加到着色器程序对象上
  gl.linkProgram(program);// 链接着色器程序
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {// 成功链接，返回着色器程序对象
    return program;
  }
 
  console.log(gl.getProgramInfoLog(program));// 链接失败
  gl.deleteProgram(program);
}

// 创建顶点着色器和片段着色器，并创建着色器程序
var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
var program = createProgram(gl, vertexShader, fragmentShader);
```



⑥  为 GLSL程序 提供数据

6.1  查找属性

在GPU上已经创建了一个GLSL程序后，我们还需要提供数据给它。大多数WebGL API是有关设置状态来供给GLSL程序数据的。 在我们的例子中，GLSL程序唯一的输入属性是`a_position`。我们做的第一件事就是查找到这个属性。记住在查找属性是在**程序初始化的时候**，而**不是render循环**的时候。

```javascript
var positionAttributeLocation = gl.getAttribLocation(program, "a_position");// 查找属性
```

6.2  创建缓冲区

属性从缓存区中取数据，所以我们需要创建缓冲区。

```JavaScript
var positionBuffer = gl.createBuffer();
```

6.3  绑定缓冲区

WebGL通过 `绑定点` 来处理许多WebGL资源。你可以认为 `绑定点`是WebGL内部的全局变量。首先你绑定一个资源到某个 `绑定点`，然后所有方法通过这个 `绑定点` 来对这个资源的访问。下面我们来绑定缓冲区。

```
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
```

6.4  数据存放到 GPU 缓冲区

现在我们通过绑定点把数据存放到缓冲区。

解释一下下面的代码：Javascript 弱类型语言，而 WebGL 需要强类型数据，需要用`new Float32Array(positions)`创建32位的浮点数数组，然后用`gl.bufferData`函数将数组数据**拷贝到GPU上的`positionBuffer`里面**。因为前面已经把`positionBuffer`绑定到了`ARRAY_BUFFER`，所以我们可以直接使用 `绑定点` （*读者注：相当于快捷键？*）。最后一个参数`gl.STATIC_DRAW`提示 WebGL 如何使用数据，WebGL 据此做相应的优化。`gl.STATIC_DRAW` 告诉 WebGL 我们不太可能去改变数据的值。

```JavaScript
// three 2d points
var positions = [
  0, 0,
  0, 0.5,
  0.7, 0,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
```

6.5  属性从 GPU 缓冲区中拿到数据

数据存放到缓存区后，接下来需要告诉属性如何从缓冲区拿到数据。首先，我需要创建属性状态集合：顶点数组对象(Vertex Array Object)。

```
var vao = gl.createVertexArray();
```

为了使所有属性的设置能够应用到WebGL属性状态集，我们需要绑定这个 `vao`（顶点数组对象实例） 到 `gl`（上下文实例）。

```
gl.bindVertexArray(vao);
```

然后，我们还需要启用属性。如果没有开启这个属性，这个属性值会是一个常量。

```
gl.enableVertexAttribArray(positionAttributeLocation);
```

接下来，我们需要设置属性值如何从缓存区取出数据。

```JavaScript
var size = 2;          // 2 components per iteration
var type = gl.FLOAT;   // the data is 32bit floats
var normalize = false; // don't normalize the data
var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
var offset = 0;        // start at the beginning of the buffer
gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset)
```

`gl.vertexAttribPointer` 的隐含部分是它绑定当前的`ARRAY_BUFFER`到这个属性。换句话说，这个属性被绑定到`positionBuffer`。 从GLSL顶点着色器的角度看，属性`a_position`是`vec4`

```
in vec4 a_position;
```

`vec4`是一个浮点型的数。以 javascript 来看，你可以认为它是这样的`a_position = {x: 0, y: 0, z: 0, w: 0}`。我们设置`size = 2`, 属性值被设置为`0, 0, 0, 1`。 属性获取前两个坐标值(x和y) ,z和w分别被默认设置为0和1。







。。。一大片有待书写







完整代码在 `WebGLCodeResource/01第一次使用WebGL绘制三角形.html` 中





### 工作原理

探讨一个基本问题：WebGL 和 GPU 到底在做什么。GPU 基本做了两部分事情： 第一部分是处理顶点(数据流)，变成裁剪空间节点；第二部分是基于第一部分的结果绘制像素。

> 📌*读者注：对于各种类型的空间变换可以先简单看看这个博文 ：[Unity shader 入门之渲染管线三、空间转换_unity 裁剪空间](https://blog.csdn.net/st75033562/article/details/123426835)   。裁剪空间坐标系，裁剪空间的目标是能都方便地对渲染图元进行裁剪：视锥体内的图元被保留，视锥体外的图元被剔除，视锥体相交的图元会被裁剪。*
>



当你调用

```
gl.drawArrays(gl.TRIANGLES, 0, 9);
```

> 📌读者注：
>
> 使用给定的顶点数据数组，以每三个顶点组成一个三角形的方式，从顶点数据的开头 **绘制** 9个顶点的图元。这通常需要在之前进行了顶点数据的设置和着色器程序的使用。结合完整代码 `WebGLCodeResource/01第一次使用WebGL绘制三角形.html` 来理解。

数字9意味着处理“9个顶点”，相应地就有9个点被处理。

![img](https://webgl2fundamentals.org/webgl/lessons/resources/vertex-shader-anim.gif)

左边是你提供的数据。点着色器是用[GLSL](https://webgl2fundamentals.org/webgl/lessons/zh_cn/webgl-shaders-and-glsl.html)写的函数。 每个顶点都用调用一次它。在这个函数里面， 做了一些数学运算和设置裁剪空间的顶点坐标 到一个特殊变量`gl_position`。GPU 获得了这些坐标值并在内部存起来。

假设你在画一些三角形，每次 GPU 都会取出 3 个顶点来生成三角形。它指出三角形的 3 个点对应哪些像素， 然后这些像素值画出这个三角形，这个过程就叫“像素栅格化”。对于每个像素，都会调用片段着色器。 它有一个 vec4 类型的输出变量，它指示绘制像素的颜色是什么。

整个过程会非常有意思。但是你观察我们之前的例子中，片段着色器只有很少关于像素的信息。 实际上，我们能够传给它更多信息。“varyings”就能够从点着色器传值到片段着色器。

我们先简单示例如何将裁剪空间坐标系的值从点着色器到片段着色器。









































