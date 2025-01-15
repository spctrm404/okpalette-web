export type Theme = "light" | "dark";

export type Hues = {
  from: number;
  to: number;
};

export type ThemeContextType = {
  theme: Theme;
  updateTheme: (newTheme: Theme) => void;
  toggleTheme: () => void;
  hues: Hues;
  updateHues: (newHues: Hues) => void;
  syncHues: () => void;
};

export type ThemeLightness = {
  [key: string]: { light: number; dark: number };
};

export type TonalPaletteConfig = {
  [key: string]: {
    reference: ThemeLightness;
    replacingName: boolean;
    isDynamic: boolean;
    peakChroma: number;
    peakChromaMult: number;
    peakLightness: number;
    staticHue: number;
    hueShift: number;
  };
};
