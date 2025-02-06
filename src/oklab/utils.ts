import type { Mat3, Vec3 } from "./types";

export const inverseMat3 = (mat3: Mat3): Mat3 | null => {
  const [[a, d, g], [b, e, h], [c, f, i]] = mat3;
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);

  if (det === 0) return null;
  return [
    [(e * i - f * h) / det, (c * h - b * i) / det, (b * f - c * e) / det],
    [(f * g - d * i) / det, (a * i - c * g) / det, (c * d - a * f) / det],
    [(d * h - e * g) / det, (b * g - a * h) / det, (a * e - b * d) / det],
  ];
};

export const multMat3Vec3 = (mat3: Mat3, vec3: Vec3): Vec3 => {
  return [
    mat3[0][0] * vec3[0] + mat3[1][0] * vec3[1] + mat3[2][0] * vec3[2],
    mat3[0][1] * vec3[0] + mat3[1][1] * vec3[1] + mat3[2][1] * vec3[2],
    mat3[0][2] * vec3[0] + mat3[1][2] * vec3[1] + mat3[2][2] * vec3[2],
  ];
};
