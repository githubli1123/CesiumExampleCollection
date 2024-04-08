/*
 * @Author: ZJ Wu
 * @Date: 2024-01-25 14:55:07
 * @LastEditTime: 2024-01-25 15:57:54
 * @Description: 
 */
const VertexShader = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ViewMatrix;
    varying vec4 v_Color;

    void main(){
        gl_Position = u_ViewMatrix * a_Position;
        v_Color = a_Color;
    }
`;

const FragmentShader = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    varying vec4 v_Color;

    void main(){
        gl_FragColor = v_Color;
    }
`;

function main() {
    const webgl = document.querySelector('#webgl'); // 获取canvas元素
    const gl = webgl.getContext('webgl'); // 获取WebGL上下文

    initShaders(gl, VertexShader, FragmentShader); // C.F.
    const n = initVertexBuffers(gl); // C.F.

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');

    const viewMatrix = new Matrix4();
    viewMatrix.setLookAt(
        0.20, 0.25, 0.25,
        0.00, 0.00, 0.00,
        0.00, 1.00, 0.00,
    );
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);


}

function initVertexBuffers(gl) {
    const vertices = new Float32Array([
        // Vertex coordinates and color(RGBA)
        0.0, 0.5, -0.4, 0.4, 1.0, 0.4, // The back green one
        -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
        0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

        0.5, 0.4, -0.2, 1.0, 0.4, 0.4, // The middle yellow one
        -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
        0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

        0.0, 0.5, 0.0, 0.4, 0.4, 1.0,  // The front blue one 
        -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
        0.5, -0.5, 0.0, 1.0, 0.4, 0.4,
    ]);
    let n = 9; // 顶点数量

    const vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const FSIZE = vertices.BYTES_PER_ELEMENT; // 每个元素的字节数


    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);


    const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    
    return n;
}

