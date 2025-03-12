import type { ColorSpace } from "./index";
import {
  oklabToLinearSRgb,
  oklchToLinearDisplayP3,
  oklchToDisplayP3,
  oklchToSRgb,
} from "./index";

export const findMaxChroma = (
  l: number,
  h: number,
  colorSpace: ColorSpace = "display-p3",
  epsilon = 1e-6,
): number => {
  let low = 0.0;
  let high = 0.4; // c 값은 최대 0.4를 넘지 않음
  let mid: number;

  while (high - low > epsilon) {
    mid = (low + high) / 2.0;
    const [r, g, b] =
      colorSpace === "sRgb"
        ? oklchToSRgb([l, mid, h])
        : oklchToDisplayP3([l, mid, h]);

    if (Math.min(r, g, b) >= 0 && Math.max(r, g, b) <= 1) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return low;
};

// Finds the maximum saturation possible for a given hue that fits in sRGB
// Saturation here is defined as S = C/L
// a and b must be normalized so a^2 + b^2 == 1
const computeMaxSaturation = (a: number, b: number) => {
  // Max saturation will be when one of r, g or b goes below zero.

  // Select different coefficients depending on which component goes below zero first
  let k0, k1, k2, k3, k4, wl, wm, ws;

  if (-1.88170328 * a - 0.80936493 * b > 1) {
    // Red component
    k0 = +1.19086277;
    k1 = +1.76576728;
    k2 = +0.59662641;
    k3 = +0.75515197;
    k4 = +0.56771245;
    wl = +4.0767416621;
    wm = -3.3077115913;
    ws = +0.2309699292;
  } else if (1.81444104 * a - 1.19445276 * b > 1) {
    // Green component
    k0 = +0.73956515;
    k1 = -0.45954404;
    k2 = +0.08285427;
    k3 = +0.1254107;
    k4 = +0.14503204;
    wl = -1.2684380046;
    wm = +2.6097574011;
    ws = -0.3413193965;
  } else {
    // Blue component
    k0 = +1.35733652;
    k1 = -0.00915799;
    k2 = -1.1513021;
    k3 = -0.50559606;
    k4 = +0.00692167;
    wl = -0.0041960863;
    wm = -0.7034186147;
    ws = +1.707614701;
  }

  // Approximate max saturation using a polynomial:
  let S = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b;

  // Do one step Halley's method to get closer
  // this gives an error less than 10e6, except for some blue hues where the dS/dh is close to infinite
  // this should be sufficient for most applications, otherwise do two/three steps

  const k_l = +0.3963377774 * a + 0.2158037573 * b;
  const k_m = -0.1055613458 * a - 0.0638541728 * b;
  const k_s = -0.0894841775 * a - 1.291485548 * b;

  {
    const l_ = 1.0 + S * k_l;
    const m_ = 1.0 + S * k_m;
    const s_ = 1.0 + S * k_s;

    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    const l_dS = 3.0 * k_l * l_ * l_;
    const m_dS = 3.0 * k_m * m_ * m_;
    const s_dS = 3.0 * k_s * s_ * s_;

    const l_dS2 = 6.0 * k_l * k_l * l_;
    const m_dS2 = 6.0 * k_m * k_m * m_;
    const s_dS2 = 6.0 * k_s * k_s * s_;

    const f = wl * l + wm * m + ws * s;
    const f1 = wl * l_dS + wm * m_dS + ws * s_dS;
    const f2 = wl * l_dS2 + wm * m_dS2 + ws * s_dS2;

    S = S - (f * f1) / (f1 * f1 - 0.5 * f * f2);
  }

  return S;
};

// finds L_cusp and C_cusp for a given hue
// a and b must be normalized so a^2 + b^2 == 1
const findCusp = (
  a: number,
  b: number,
  colorSpace: ColorSpace = "display-p3",
) => {
  // First, find the maximum saturation (saturation S = C/L)
  const sCusp = computeMaxSaturation(a, b);

  // Convert to linear sRGB to find the first point where at least one of r,g or b >= 1:
  const [maxR, maxG, maxB] =
    colorSpace === "sRgb"
      ? oklabToLinearSRgb([1, sCusp * a, sCusp * b])
      : oklchToLinearDisplayP3([1, sCusp * a, sCusp * b]);

  const lCusp = Math.cbrt(1 / Math.max(maxR, maxG, maxB));
  const cCusp = lCusp * sCusp;

  return [lCusp, cCusp];
};

// Finds intersection of the line defined by
// L = L0 * (1 - t) + t * L1;
// C = t * C1;
// a and b must be normalized so a^2 + b^2 == 1
const findGamutIntersection = (
  a: number,
  b: number,
  L1: number,
  C1: number,
  L0: number,
  colorSpace: ColorSpace = "display-p3",
): number => {
  // Find the cusp of the gamut triangle
  const [lCusp, cCusp] = findCusp(a, b, colorSpace);

  // Find the intersection for upper and lower half seprately
  let t;
  if ((L1 - L0) * cCusp - (lCusp - L0) * C1 <= 0) {
    // Lower half
    t = (cCusp * L0) / (C1 * lCusp + cCusp * (L0 - L1));
  } else {
    // Upper half

    // First intersect with triangle
    t = (cCusp * (L0 - 1)) / (C1 * (lCusp - 1) + cCusp * (L0 - L1));

    // Then one step Halley's method
    {
      const dL = L1 - L0;
      const dC = C1;

      const k_l = +0.3963377774 * a + 0.2158037573 * b;
      const k_m = -0.1055613458 * a - 0.0638541728 * b;
      const k_s = -0.0894841775 * a - 1.291485548 * b;

      const l_dt = dL + dC * k_l;
      const m_dt = dL + dC * k_m;
      const s_dt = dL + dC * k_s;

      {
        const L = L0 * (1 - t) + t * L1;
        const C = t * C1;

        const l_ = L + C * k_l;
        const m_ = L + C * k_m;
        const s_ = L + C * k_s;

        const l = l_ ** 3;
        const m = m_ ** 3;
        const s = s_ ** 3;

        const ldt = 3 * l_dt * l_ ** 2;
        const mdt = 3 * m_dt * m_ ** 2;
        const sdt = 3 * s_dt * s_ ** 2;

        const ldt2 = 6 * l_dt ** 2 * l_;
        const mdt2 = 6 * m_dt ** 2 * m_;
        const sdt2 = 6 * s_dt ** 2 * s_;

        const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s - 1;
        const r1 = 4.0767416621 * ldt - 3.3077115913 * mdt + 0.2309699292 * sdt;
        const r2 =
          4.0767416621 * ldt2 - 3.3077115913 * mdt2 + 0.2309699292 * sdt2;

        const u_r = r1 / (r1 * r1 - 0.5 * r * r2);
        let t_r = -r * u_r;

        const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s - 1;
        const g1 =
          -1.2684380046 * ldt + 2.6097574011 * mdt - 0.3413193965 * sdt;
        const g2 =
          -1.2684380046 * ldt2 + 2.6097574011 * mdt2 - 0.3413193965 * sdt2;

        const u_g = g1 / (g1 * g1 - 0.5 * g * g2);
        let t_g = -g * u_g;

        const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s - 1;
        const b1 = -0.0041960863 * ldt - 0.7034186147 * mdt + 1.707614701 * sdt;
        const b2 =
          -0.0041960863 * ldt2 - 0.7034186147 * mdt2 + 1.707614701 * sdt2;

        const u_b = b1 / (b1 * b1 - 0.5 * b * b2);
        let t_b = -b * u_b;

        // const FLT_MAX = Number.MAX_VALUE;
        const FLT_MAX = 3.4028235e38;

        t_r = u_r >= 0 ? t_r : FLT_MAX;
        t_g = u_g >= 0 ? t_g : FLT_MAX;
        t_b = u_b >= 0 ? t_b : FLT_MAX;

        t += Math.min(t_r, Math.min(t_g, t_b));
      }
    }
  }
  return t;
};
