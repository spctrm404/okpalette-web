import {
  OKLAB_TO_NON_LINEAR_LMS,
  LINEAR_LMS_TO_XYZ,
  XYZ_TO_LINEAR_SRGB,
  LINEAR_SRGB_TO_XYZ,
  XYZ_TO_LINEAR_LMS,
  NON_LINEAR_LMS_TO_OKLAB,
} from "./constants";
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

export const toLinearRgb = (rgb: Vec3): Vec3 => {
  return rgb.map((val) => {
    const sign = val < 0 ? -1 : 1;
    const abs = Math.abs(val);

    if (abs <= 0.04045) return val / 12.92;
    return sign * Math.pow((abs + 0.055) / 1.055, 2.4);
  });
};
export const toNonLinearRgb = (rgb: Vec3): Vec3 => {
  return rgb.map((val) => {
    const sign = val < 0 ? -1 : 1;
    const abs = Math.abs(val);

    if (abs > 0.0031308) return sign * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
    return 12.92 * val;
  });
};

export const toLinearLms = (lms: Vec3): Vec3 => {
  return lms.map((val) => val ** 3) as Vec3;
};
export const toNonLinearLms = (lms: Vec3): Vec3 => {
  return lms.map((val) => Math.cbrt(val)) as Vec3;
};

export const lchToLab = (lch: Vec3): Vec3 => {
  return [
    lch[0],
    lch[1] * Math.cos((lch[2] * Math.PI) / 180),
    lch[1] * Math.sin((lch[2] * Math.PI) / 180),
  ];
};
export const labToLch = (lab: Vec3): Vec3 => {
  const hue = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;
  return [
    lab[0],
    Math.sqrt(lab[1] ** 2 + lab[2] ** 2),
    hue >= 0 ? hue : hue + 360,
  ];
};

// OKLCH->SRGB
export const oklchToSrgb = (oklch: Vec3): Vec3 => {
  const oklab = lchToLab(oklch);
  const nonLinearLms = multMat3Vec3(OKLAB_TO_NON_LINEAR_LMS, oklab);
  const linearLms = toLinearLms(nonLinearLms);
  const xyz = multMat3Vec3(LINEAR_LMS_TO_XYZ, linearLms);
  const linearRgb = multMat3Vec3(XYZ_TO_LINEAR_SRGB, xyz);
  return toNonLinearRgb(linearRgb);
};
// SRGB->OKLAB
export const srgbToOklab = (rgb: Vec3): Vec3 => {
  const linearRgb = toLinearRgb(rgb);
  const xyz = multMat3Vec3(LINEAR_SRGB_TO_XYZ, linearRgb);
  const linearLms = multMat3Vec3(XYZ_TO_LINEAR_LMS, xyz);
  const nonLinearLms = toNonLinearLms(linearLms);
  return multMat3Vec3(NON_LINEAR_LMS_TO_OKLAB, nonLinearLms);
};

// OKLCH->DISPLAY-P3
export const oklchToDisplayP3 = () => {};
// DISPLAY-P3->OKLAB
export const displayP3ToOklab = () => {};

// OKLCH->REC2020
export const oklchToRec2020 = () => {};
// REC2020->OKLAB
export const rec2020ToOklab = () => {};
