import type { Mat3, Vec3 } from "./types";

export const multMat3Vec3 = (mat3: Mat3, vec3: Vec3): Vec3 => {
  return [
    mat3[0][0] * vec3[0] + mat3[0][1] * vec3[1] + mat3[0][2] * vec3[2],
    mat3[1][0] * vec3[0] + mat3[1][1] * vec3[1] + mat3[1][2] * vec3[2],
    mat3[2][0] * vec3[0] + mat3[2][1] * vec3[1] + mat3[2][2] * vec3[2],
  ];
};

export const mat3ToGlslMat3 = (mat3: Mat3): Float32Array => {
  return new Float32Array([
    mat3[0][0],
    mat3[1][0],
    mat3[2][0],
    mat3[0][1],
    mat3[1][1],
    mat3[2][1],
    mat3[0][2],
    mat3[1][2],
    mat3[2][2],
  ]);
};
