import type { Vec3 } from "./types";
import {
  OKLAB_TO_NON_LINEAR_LMS,
  NON_LINEAR_LMS_TO_OKLAB,
  LINEAR_LMS_TO_XYZ,
  XYZ_TO_LINEAR_LMS,
  XYZ_TO_LINEAR_SRGB,
  LINEAR_SRGB_TO_XYZ,
  XYZ_TO_LINEAR_DISPLAY_P3,
  LINEAR_DISPLAY_P3_TO_XYZ,
} from "./constants";
import { multMat3Vec3 } from "./utils";

export const toLinearRgb = (rgb: Vec3): Vec3 => {
  return rgb.map((val) => {
    const sign = val < 0 ? -1 : 1;
    const abs = Math.abs(val);

    if (abs <= 0.04045) return val / 12.92;
    return sign * Math.pow((abs + 0.055) / 1.055, 2.4);
  }) as Vec3;
};
export const toNonLinearRgb = (rgb: Vec3): Vec3 => {
  return rgb.map((val) => {
    const sign = val < 0 ? -1 : 1;
    const abs = Math.abs(val);

    if (abs > 0.0031308) return sign * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
    return 12.92 * val;
  }) as Vec3;
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
// oklch -> oklab -> lms -> xyz -> srgb
export const oklchToLinearSrgb = (oklch: Vec3): Vec3 => {
  const oklab = lchToLab(oklch);
  const nonLinearLms = multMat3Vec3(OKLAB_TO_NON_LINEAR_LMS, oklab);
  const linearLms = toLinearLms(nonLinearLms);
  const xyz = multMat3Vec3(LINEAR_LMS_TO_XYZ, linearLms);
  return multMat3Vec3(XYZ_TO_LINEAR_SRGB, xyz);
};
export const oklchToSrgb = (oklch: Vec3): Vec3 => {
  return toNonLinearRgb(oklchToLinearSrgb(oklch));
};
// SRGB->OKLCH
// srgb -> xyz -> lms -> oklab -> oklch
export const srgbToOklab = (rgb: Vec3): Vec3 => {
  const linearRgb = toLinearRgb(rgb);
  const xyz = multMat3Vec3(LINEAR_SRGB_TO_XYZ, linearRgb);
  const linearLms = multMat3Vec3(XYZ_TO_LINEAR_LMS, xyz);
  const nonLinearLms = toNonLinearLms(linearLms);
  return multMat3Vec3(NON_LINEAR_LMS_TO_OKLAB, nonLinearLms);
};
export const srgbToOklch = (rgb: Vec3): Vec3 => {
  return labToLch(srgbToOklab(rgb));
};

// OKLCH->DISPLAY-P3
// oklch -> oklab -> lms -> xyz -> displayp3
export const oklchToLinearDisplayp3 = (oklch: Vec3): Vec3 => {
  const oklab = lchToLab(oklch);
  const nonLinearLms = multMat3Vec3(OKLAB_TO_NON_LINEAR_LMS, oklab);
  const linearLms = toLinearLms(nonLinearLms);
  const xyz = multMat3Vec3(LINEAR_LMS_TO_XYZ, linearLms);
  return multMat3Vec3(XYZ_TO_LINEAR_DISPLAY_P3, xyz);
};
export const oklchToDisplayp3 = (oklch: Vec3): Vec3 => {
  return toNonLinearRgb(oklchToLinearDisplayp3(oklch));
};
// DISPLAY-P3->OKLCH
// displayp3 -> xyz -> lms -> oklab -> oklch
export const displayp3ToOklab = (rgb: Vec3): Vec3 => {
  const linearRgb = toLinearRgb(rgb);
  const xyz = multMat3Vec3(LINEAR_DISPLAY_P3_TO_XYZ, linearRgb);
  const linearLms = multMat3Vec3(XYZ_TO_LINEAR_LMS, xyz);
  const nonLinearLms = toNonLinearLms(linearLms);
  return multMat3Vec3(NON_LINEAR_LMS_TO_OKLAB, nonLinearLms);
};
export const displayp3ToOklch = (rgb: Vec3): Vec3 => {
  return labToLch(displayp3ToOklab(rgb));
};
