export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];
export type Mat3 = [Vec3, Vec3, Vec3];
export type Coefficients = {
  r: {
    limits: [number, number];
    coefficients: [number, number, number, number, number];
  };
  g: {
    limits: [number, number];
    coefficients: [number, number, number, number, number];
  };
  b: {
    limits: [number, number];
    coefficients: [number, number, number, number, number];
  };
};
export type ColorSpace = "sRgb" | "display-p3";
