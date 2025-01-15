import { ThemeLightness, TonalPaletteConfig } from "./types";

const THEME_PEAK_LIGHTNESS = 0.6;
const THEME_PEAK_CHROMA = 0.13;
const THEME_SECONDARY_CHROMA_MULT = 0.25;
const THEME_TERTIARY_HUE_SHIFT = 120;
const THEME_NEUTRAL_VARIANT_PEAK_CHROMA = 0.01;
const THEME_NEUTRAL_PEAK_CHROMA = 0.005;
const THEME_WARNING_HUE = 90;
const THEME_WARNING_PEAK_LIGHTNESS = 0.87;
const THEME_WARNING_PEAK_CHROMA = 0.205;
const THEME_ERROR_HUE = 29;
const THEME_ERROR_PEAK_LIGHTNESS = 0.65;
const THEME_ERROR_PEAK_CHROMA = 0.297;
const VIVIDS_LIGHTNESS: ThemeLightness = {
  name: {
    light: 0.51,
    dark: 0.89,
  },
  onName: {
    light: 1,
    dark: 0.18,
  },
  onNameVariant: {
    light: 0.91,
    dark: 0.45,
  },
  nameContainer: {
    light: 0.91,
    dark: 0.48,
  },
  onNameContainer: {
    light: 0.26,
    dark: 0.98,
  },
  onNameContainerVariant: {
    light: 0.48,
    dark: 0.89,
  },
  inverseName: {
    light: 0.47,
    dark: 0.89,
  },
  onInverseName: {
    light: 0.98,
    dark: 0.18,
  },
};
const NEUTRALS_LIGHTNESS: ThemeLightness = {
  surfaceContainerLowest: {
    light: 1,
    dark: 0.29,
  },
  surface: {
    light: 0.99,
    dark: 0.31,
  },
  surfaceContainerLow: {
    light: 0.97,
    dark: 0.34,
  },
  surfaceContainer: {
    light: 0.95,
    dark: 0.38,
  },
  surfaceContainerHigh: {
    light: 0.93,
    dark: 0.43,
  },
  surfaceContainerHighest: {
    light: 0.91,
    dark: 0.48,
  },
  onSurface: {
    light: 0.26,
    dark: 0.99,
  },
  inverseSurface: {
    light: 0.3,
    dark: 0.98,
  },
  onInverseSurface: {
    light: 0.94,
    dark: 0.37,
  },
};
const NEUTRAL_VARIANTS_LIGHTNESS: ThemeLightness = {
  surfaceVariant: {
    light: 0.91,
    dark: 0.48,
  },
  onSurfaceVariant: {
    light: 0.44,
    dark: 0.92,
  },
  outline: {
    light: 0.6,
    dark: 0.82,
  },
  outlineVariant: {
    light: 0.82,
    dark: 0.6,
  },
};

export const LIGHTNESS_STEP = 0.01;
export const CHROMA_STEP = 0.001;
export const HUE_STEP = 1;
export const TONAL_PALTETTE_CONFIGS: TonalPaletteConfig = {
  primary: {
    reference: VIVIDS_LIGHTNESS,
    replacingName: true,
    isDynamic: true,
    peakChroma: THEME_PEAK_CHROMA,
    peakChromaMult: 1,
    peakLightness: THEME_PEAK_LIGHTNESS,
    staticHue: 0,
    hueShift: 0,
  },
  secondary: {
    reference: VIVIDS_LIGHTNESS,
    replacingName: true,
    isDynamic: true,
    peakChroma: THEME_PEAK_CHROMA,
    peakChromaMult: THEME_SECONDARY_CHROMA_MULT,
    peakLightness: THEME_PEAK_LIGHTNESS,
    staticHue: 0,
    hueShift: 0,
  },
  tertiary: {
    reference: VIVIDS_LIGHTNESS,
    replacingName: true,
    isDynamic: true,
    peakChroma: THEME_PEAK_CHROMA,
    peakChromaMult: 1,
    peakLightness: THEME_PEAK_LIGHTNESS,
    staticHue: 0,
    hueShift: THEME_TERTIARY_HUE_SHIFT,
  },
  neutral: {
    reference: NEUTRALS_LIGHTNESS,
    replacingName: false,
    isDynamic: true,
    peakChroma: THEME_NEUTRAL_PEAK_CHROMA,
    peakChromaMult: 1,
    peakLightness: THEME_PEAK_LIGHTNESS,
    staticHue: 0,
    hueShift: 0,
  },
  neutralVariant: {
    reference: NEUTRAL_VARIANTS_LIGHTNESS,
    replacingName: false,
    isDynamic: true,
    peakChroma: THEME_NEUTRAL_VARIANT_PEAK_CHROMA,
    peakChromaMult: 1,
    peakLightness: THEME_PEAK_LIGHTNESS,
    staticHue: 0,
    hueShift: 0,
  },
  error: {
    reference: VIVIDS_LIGHTNESS,
    replacingName: true,
    isDynamic: false,
    peakChroma: THEME_ERROR_PEAK_CHROMA,
    peakChromaMult: 1,
    peakLightness: THEME_ERROR_PEAK_LIGHTNESS,
    staticHue: THEME_ERROR_HUE,
    hueShift: 0,
  },
  warning: {
    reference: VIVIDS_LIGHTNESS,
    replacingName: true,
    isDynamic: false,
    peakChroma: THEME_WARNING_PEAK_CHROMA,
    peakChromaMult: 1,
    peakLightness: THEME_WARNING_PEAK_LIGHTNESS,
    staticHue: THEME_WARNING_HUE,
    hueShift: 0,
  },
};
