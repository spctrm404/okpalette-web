export type XY = {
  x: number;
  y: number;
};

export type MatrixFileds = {
  values: number[];
  width: number;
  height: number;
};

export class Matrix implements MatrixFileds {
  values: number[];
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.values = new Array(this.width * this.height).fill(0);
  }

  coordToIdx({ x, y }: XY) {
    return y * this.height + x;
  }

  setValueByIdx(idx: number, value: number) {
    this.values[idx] = value;
  }

  setValueByCoord(coord: XY, value: number) {
    this.values[this.coordToIdx(coord)] = value;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getSize() {
    return { width: this.width, height: this.height };
  }

  getLength() {
    return this.width * this.height;
  }

  getValueByIdx(idx: number) {
    return this.values[idx];
  }

  getValueByCoord(coord: XY) {
    return this.values[this.coordToIdx(coord)];
  }

  static fromSerialized(serializedMatrix: MatrixFileds): Matrix {
    const matrix = new Matrix(serializedMatrix.width, serializedMatrix.height);
    matrix.values = serializedMatrix.values;
    return matrix;
  }
}
