import type { Vec3, ColorSpace } from "./index";
import {
  OKLAB_TO_NON_LINEAR_LMS,
  NON_LINEAR_LMS_TO_OKLAB,
  LINEAR_LMS_TO_XYZ,
  XYZ_TO_LINEAR_LMS,
  XYZ_TO_LINEAR_SRGB,
  LINEAR_SRGB_TO_XYZ,
  XYZ_TO_LINEAR_DISPLAY_P3,
  LINEAR_DISPLAY_P3_TO_XYZ,
  multMat3Vec3,
} from "./index";

const linearizeRgb = (rgb: Vec3): Vec3 => {
  return rgb.map((val) => {
    const sign = val < 0 ? -1 : 1;
    const abs = Math.abs(val);

    if (abs <= 0.04045) return val / 12.92;
    return sign * Math.pow((abs + 0.055) / 1.055, 2.4);
  }) as Vec3;
};
const nonLinearizeRgb = (rgb: Vec3): Vec3 => {
  return rgb.map((val) => {
    const sign = val < 0 ? -1 : 1;
    const abs = Math.abs(val);

    if (abs > 0.0031308) return sign * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
    return 12.92 * val;
  }) as Vec3;
};

const linearizeLms = (lms: Vec3): Vec3 => {
  return lms.map((val) => val ** 3) as Vec3;
};
const nonLinearizeLms = (lms: Vec3): Vec3 => {
  return lms.map((val) => Math.cbrt(val)) as Vec3;
};

const lchToLab = ([l, c, h]: Vec3): Vec3 => {
  return [
    l,
    c * Math.cos((h * Math.PI) / 180),
    c * Math.sin((h * Math.PI) / 180),
  ];
};
const labToLch = ([l, a, b]: Vec3): Vec3 => {
  const hue = (Math.atan2(b, a) * 180) / Math.PI;
  return [l, Math.sqrt(a ** 2 + b ** 2), hue >= 0 ? hue : hue + 360];
};

// OKLCH -> sRgb
// oklch -> oklab -> lms -> xyz -> sRgb
export const oklabToLinearSRgb = (oklab: Vec3): Vec3 => {
  const nonLinearLms = multMat3Vec3(OKLAB_TO_NON_LINEAR_LMS, oklab);
  const linearLms = linearizeLms(nonLinearLms);
  const xyz = multMat3Vec3(LINEAR_LMS_TO_XYZ, linearLms);
  return multMat3Vec3(XYZ_TO_LINEAR_SRGB, xyz);
};
export const oklchToLinearSRgb = (oklch: Vec3): Vec3 => {
  const oklab = lchToLab(oklch);
  return oklabToLinearSRgb(oklab);
};
export const oklchToSRgb = (oklch: Vec3): Vec3 => {
  return nonLinearizeRgb(oklchToLinearSRgb(oklch));
};
// sRgb -> OKLCH
// sRgb -> xyz -> lms -> oklab -> oklch
export const sRgbToOklab = (rgb: Vec3): Vec3 => {
  const linearRgb = linearizeRgb(rgb);
  const xyz = multMat3Vec3(LINEAR_SRGB_TO_XYZ, linearRgb);
  const linearLms = multMat3Vec3(XYZ_TO_LINEAR_LMS, xyz);
  const nonLinearLms = nonLinearizeLms(linearLms);
  return multMat3Vec3(NON_LINEAR_LMS_TO_OKLAB, nonLinearLms);
};
export const sRgbToOklch = (rgb: Vec3): Vec3 => {
  return labToLch(sRgbToOklab(rgb));
};

// OKLCH -> display-p3
// oklch -> oklab -> lms -> xyz -> displayP3
export const oklabToLinearDisplayP3 = (oklab: Vec3): Vec3 => {
  const nonLinearLms = multMat3Vec3(OKLAB_TO_NON_LINEAR_LMS, oklab);
  const linearLms = linearizeLms(nonLinearLms);
  const xyz = multMat3Vec3(LINEAR_LMS_TO_XYZ, linearLms);
  return multMat3Vec3(XYZ_TO_LINEAR_DISPLAY_P3, xyz);
};
export const oklchToLinearDisplayP3 = (oklch: Vec3): Vec3 => {
  const oklab = lchToLab(oklch);
  return oklabToLinearDisplayP3(oklab);
};
export const oklchToDisplayP3 = (oklch: Vec3): Vec3 => {
  return nonLinearizeRgb(oklchToLinearDisplayP3(oklch));
};
// display-p3 -> OKLCH
// displayP3 -> xyz -> lms -> oklab -> oklch
export const displayP3ToOklab = (rgb: Vec3): Vec3 => {
  const linearRgb = linearizeRgb(rgb);
  const xyz = multMat3Vec3(LINEAR_DISPLAY_P3_TO_XYZ, linearRgb);
  const linearLms = multMat3Vec3(XYZ_TO_LINEAR_LMS, xyz);
  const nonLinearLms = nonLinearizeLms(linearLms);
  return multMat3Vec3(NON_LINEAR_LMS_TO_OKLAB, nonLinearLms);
};
export const displayP3ToOklch = (rgb: Vec3): Vec3 => {
  return labToLch(displayP3ToOklab(rgb));
};

export const isInGamut = (
  [l, c, h]: Vec3,
  colorSpace: ColorSpace = "display-p3",
): boolean => {
  if (c === 0.0) return true;
  const [r, g, b] =
    colorSpace === "sRgb"
      ? oklchToSRgb([l, c, h])
      : oklchToDisplayP3([l, c, h]);
  return Math.min(r, g, b) >= 0 && Math.max(r, g, b) <= 1;
};
