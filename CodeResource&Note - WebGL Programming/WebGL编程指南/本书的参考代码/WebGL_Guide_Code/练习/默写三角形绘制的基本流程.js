/*
 * @Author: Wu Zhoujie
 * @Date: 2023-12-07 14:45:57
 * @LastEditTime: 2023-12-07 17:20:27
 * @Description: 学会 JS 中传递数据给 WebGL 中的缓冲区对象，
 *               再将缓冲区对象分配给一个 attribute 变量来实现
 *               动态顶点位置。
 */
const VSHADER_SOURCE = `
    attribute vec4 a_Position; // 在全局声明一个 attribute + vec4 类型的变量
    void main() {
        gl_Position = a_Position; // 定义顶点位置
    }
`;

const FSHADER_SOURCE = `
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // 定义片元颜色
    }
`;

function main(){
    const canvas = document.getElementById("webgl");
    const gl = canvas.getContext("webgl");
    // gl = getWebGLContext(canvas);

    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

    const n = initVertexBuffers(gl);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);

}

function initVertexBuffers(gl) {
    // JS中定义的顶点数据和顶点数
    const vertices = new Float32Array([
        0.0, 0.5,   -0.5, -0.5,    0.5, -0.5
    ]);
    const n = 3;

    // 1. 创建缓冲区对象
    const vertexBuffer = gl.createBuffer();

    // 2. 绑定缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // 3. 向缓冲区对象中写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // 4. 将缓冲区对象分配给一个 attribute 变量（类比直接给该变量赋值）
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // 5. 启用该 attribute 变量
    gl.enableVertexAttribArray(a_Position);

    return n;

}

main();