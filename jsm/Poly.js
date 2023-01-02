const defAttr = () => ({
  gl: null, // webgl上下文对象
  vertices: [], // 顶点集合
  geoData: [], // 顶点的对象型数组
  size: 2, // 顶点分量数
  attrName: "a_Position", // attribute变量名称
  count: 0, // 顶点数量
  types: ["POINTS"], // 绘图方式
  circleDot: false, // 是否是圆点
  u_IsPOINTS: null, // uniform变量
});

export default class Poly {
  constructor(attr) {
    Object.assign(this, defAttr(), attr);
    this.init();
  }

  // 初始化
  init() {
    const { attrName, size, gl, circleDot } = this;
    if (!gl) return;
    const vertexBuffer = gl.createBuffer(); // 建立缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); // 绑定缓冲区对象
    this.updateBuffer(); // 更新缓存区对象中的数据
    const a_Name = gl.getAttribLocation(gl.program, attrName); // 获取attribute变量
    gl.vertexAttribPointer(a_Name, size, gl.FLOAT, false, 0, 0); // 将缓冲区对象分配给attribute变量
    gl.enableVertexAttribArray(a_Name); // 开启顶点数据的批处理功能
    // 如果是圆点，获取一下uniform变量
    if (circleDot) {
      this.u_IsPOINTS = gl.getUniformLocation(gl.program, "u_IsPOINTS");
    }
  }

  // 添加顶点
  addVertice(...params) {
    this.vertices.push(...params);
    this.updateBuffer();
  }

  // 删除最后一个顶点
  popVertice() {
    const { vertices, size } = this;
    const len = vertices.length;
    vertices.splice(len - size, len);
    this.updateBuffer();
  }

  // 根据索引位置设置顶点
  setVertice(ind, ...params) {
    const { vertices, size } = this;
    const i = ind * size;
    params.forEach((param, paramInd) => {
      vertices[i + paramInd] = param;
    });
  }

  // 更新缓冲区数据，同时更新顶点数量
  updateBuffer() {
    const { gl, vertices } = this;
    this.updateCount();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); // 往缓冲区对象中写入数据
  }

  // 更新顶点数量
  updateCount() {
    this.count = this.vertices.length / this.size;
  }

  // 基于geoData解析出vertices数据
  updateVertices(params) {
    const { geoData } = this;
    const vertices = [];
    geoData.forEach((data) => {
      params.forEach((key) => {
        vertices.push(data[key]);
      });
    });
    this.vertices = vertices;
  }

  // 绘图方法
  draw(types = this.types) {
    const { gl, count, u_IsPOINTS, circleDot } = this;
    for (let type of types) {
      circleDot && gl.uniform1f(u_IsPOINTS, type === "POINTS");
      gl.drawArrays(gl[type], 0, count);
    }
  }
}
