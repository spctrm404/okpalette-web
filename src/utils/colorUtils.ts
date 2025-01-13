import { Matrix } from "@types/commonTypes";
import { RGB, LCH, CuloriOklch } from "@types/colourTypes";
import {
  Hues,
  PaletteParam,
  Palette,
  Swatch,
  ApcaMatrix,
} from "@types/paletteTypes";
import { FigmaDocumentColorSpace } from "@types/figmaTypes";

import {
  LIGHTNESS_STEP,
  CHROMA_STEP,
  HUE_STEP,
  DISP_P3_CHROMA_LIMIT,
} from "../constants";

import { quantize } from "./numberUtils";

import { inGamut, converter, clampChroma } from "culori";
import { APCAcontrast, displayP3toY, sRGBtoY } from "apca-w3";

export const nomalizedRgbToHex = ({ r, g, b }: RGB): string => {
  return [r, g, b]
    .map((value) => {
      return Math.round(value * 255)
        .toString(16)
        .padStart(2, "0")
        .toUpperCase();
    })
    .join("");
};

export const hueForLightness = (
  lightness: number,
  { from, to }: Hues,
): number => {
  const hueDiff = from <= to ? to - from : to + 360 - from;
  return (from + lightness * hueDiff) % 360;
};

export const chromaForLightness = (
  lightness: number,
  peakLightness: number,
  peakChroma: number,
): number => {
  const chroma =
    peakLightness === 1
      ? peakChroma * lightness
      : peakLightness === 0
        ? peakChroma * (1 - lightness)
        : lightness <= peakLightness
          ? (peakChroma / peakLightness) * lightness
          : (peakChroma / (1 - peakLightness)) * (1 - lightness);
  return chroma;
};

export const peakChromaForLightnessAndHue = (
  peakLightness: number,
  hues: Hues,
): number => {
  const hue = hueForLightness(peakLightness, hues);
  let low = 0;
  let high = DISP_P3_CHROMA_LIMIT;
  const inDispP3 = inGamut("p3");
  while (high - low > CHROMA_STEP) {
    const mid = (low + high) / 2;
    const oklch: CuloriOklch = {
      mode: "oklch",
      l: peakLightness,
      c: mid,
      h: hue,
    };
    const isDispP3 = inDispP3(oklch);
    if (isDispP3) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return low;
};

export const peakChromaAndLightnessForHue = () => {
  const inP3 = inGamut("p3");
  const peaks: LCH[] = [];
  for (let hue = 0; hue <= 360; hue += HUE_STEP) {
    let maxChromaForHue = 0;
    let correspondingLightness = 0;
    for (let lightness = 1; lightness > 0; lightness -= LIGHTNESS_STEP) {
      let maxChromaForLightness = 0;
      for (
        let chroma = 0;
        chroma <= DISP_P3_CHROMA_LIMIT;
        chroma += CHROMA_STEP
      ) {
        const oklch: CuloriOklch = {
          mode: "oklch",
          l: lightness,
          c: chroma,
          h: hue,
        };
        if (inP3(oklch)) {
          if (chroma > maxChromaForLightness) maxChromaForLightness = chroma;
        } else {
          break;
        }
      }
      if (maxChromaForLightness > maxChromaForHue) {
        maxChromaForHue = maxChromaForLightness;
        correspondingLightness = lightness;
      } else if (maxChromaForLightness < maxChromaForHue) {
        break;
      }
    }
    peaks.push({
      l: correspondingLightness,
      c: maxChromaForHue,
      h: hue,
    });
  }
  return peaks;
};

export const createPalette = ({
  swatchStep,
  peakLightness,
  peakChroma,
  hues,
}: PaletteParam): Palette => {
  const total = 100 / swatchStep + 1;
  const swatches: Swatch[] = [];
  const inDispP3 = inGamut("p3");
  const inSRgb = inGamut("rgb");
  const toDispP3 = converter("p3");
  const toSRgb = converter("rgb");
  for (let n = 0; n < total; n++) {
    const lightness = quantize(n / (total - 1), LIGHTNESS_STEP);
    const chroma = quantize(
      chromaForLightness(lightness, peakLightness, peakChroma),
      CHROMA_STEP,
    );
    const hue = hueForLightness(lightness, hues);
    if (lightness === 0) {
      swatches.push({
        oklch: { l: 0, c: 0, h: hue },
        dispP3Oklch: { l: 0, c: 0, h: hue },
        dispP3: { r: 0, g: 0, b: 0 },
        dispP3Hex: "000000",
        sRgbOklch: { l: 0, c: 0, h: hue },
        sRgb: { r: 0, g: 0, b: 0 },
        sRgbHex: "000000",
        gamut: "sRGB",
      });
    } else if (lightness === 1) {
      swatches.push({
        oklch: { l: 1, c: 0, h: hue },
        dispP3Oklch: { l: 1, c: 0, h: hue },
        dispP3: { r: 1, g: 1, b: 1 },
        dispP3Hex: "FFFFFF",
        sRgbOklch: { l: 1, c: 0, h: hue },
        sRgb: { r: 1, g: 1, b: 1 },
        sRgbHex: "FFFFFF",
        gamut: "sRGB",
      });
    } else {
      const oklch: CuloriOklch = {
        mode: "oklch",
        l: lightness,
        c: chroma,
        h: hue,
      };
      const isDispP3 = inDispP3(oklch);
      const isSRgb = inSRgb(oklch);
      const dispP3Oklch = clampChroma(oklch, "oklch", "p3");
      const dispP3 = toDispP3(dispP3Oklch);
      const dispP3Hex = nomalizedRgbToHex(dispP3);
      const sRgbOklch = clampChroma(oklch, "oklch", "rgb");
      const sRgb = toSRgb(sRgbOklch);
      const sRgbHex = nomalizedRgbToHex(sRgb);
      swatches.push({
        oklch,
        dispP3Oklch,
        dispP3,
        dispP3Hex,
        sRgbOklch,
        sRgb,
        sRgbHex,
        gamut: isSRgb ? "sRGB" : isDispP3 ? "Display P3" : "Out of Display P3",
      });
    }
  }

  return { swatchStep, peakLightness, peakChroma, hues, swatches };
};

export const calculateApcaScore = (
  { r: fgR, g: fgG, b: fgB }: RGB,
  { r: bgR, g: bgG, b: bgB }: RGB,
  colorspace: FigmaDocumentColorSpace,
): number => {
  const fgY =
    colorspace == "DISPLAY_P3"
      ? displayP3toY([fgR, fgG, fgB])
      : sRGBtoY([fgR, fgG, fgB]);
  const bgY =
    colorspace == "DISPLAY_P3"
      ? displayP3toY([bgR, bgG, bgB])
      : sRGBtoY([bgR, bgG, bgB]);
  const contrast = APCAcontrast(fgY, bgY);
  return Math.round(Number(contrast));
};

export const createApcaMatrix = (
  palette: Palette,
  colorspace: FigmaDocumentColorSpace,
): ApcaMatrix => {
  const swatches = palette.swatches;
  const matrix: Matrix = new Matrix(swatches.length, swatches.length);
  swatches.forEach((bg, xIdx) => {
    swatches.forEach((fg, yIdx) => {
      matrix.setValueByCoord(
        { x: xIdx, y: yIdx },
        calculateApcaScore(
          colorspace == "DISPLAY_P3" ? fg.dispP3 : fg.sRgb,
          colorspace == "DISPLAY_P3" ? bg.dispP3 : bg.sRgb,
          colorspace,
        ),
      );
    });
  });
  return {
    palette,
    matrix,
  };
};
