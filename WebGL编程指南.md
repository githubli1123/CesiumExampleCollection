这篇笔记记录这我学习《WebGL编程指南》这本书的心得。

## 动态数据

绘制一个点的最简流程：

1. 定义顶点着色器和片元着色器。在这两个着色器中都有各自的定义好的内部变量。
2. 定义和获取容器 canvas 和 WebGL 上下文实例 gl。
3. 初始化顶点着色器和片元着色器。
4. 得到某个 attribute 变量（地址），例如 a_position ，并为它赋值。
5. 设置 gl 的背景色并 clear 。
6. 最后，gl 绘制这个点。



但是，这个最简单的例子中数据在第四步中的赋值可是大有文章。数据如何动态的赋给 a_position 是需要一些步骤的。需要借助缓冲区对象，流程如下：

1. 准备一个 JavaScript 特殊数组。
2. 创建缓冲区对象，`gl.createBuffer()`。
3. 绑定缓冲区对象   `gl.bindBuffer(target, buffer)`。
4. 向缓冲区对象写入 准备好的 JavaScript 数据   `gl.bufferData(raeget, data, usage)`。
5. 将缓冲区对象分配给 attribute 变量   `gl.vertexAttribPointer(location, size, type, normalized, stride, offset)`。
6. 开启 attribute 变量   `gl.enbaleVertexAttribArray(location)`。

目前可以想到，我们可以控制第一步和第四步来达到数据的动态赋值。









## API

