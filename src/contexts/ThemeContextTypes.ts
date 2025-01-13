import type { Hues } from "@types/paletteTypes";

export type Theme = "light" | "dark";

export type ThemeLightness = {
  [key: string]: { light: number; dark: number };
};

export type TonalPaletteConfig = {
  [key: string]: {
    reference: React.MutableRefObject<ThemeLightness>;
    replacingName: boolean;
    isDynamic: boolean;
    peakChroma: number;
    peakChromaMult: number;
    peakLightness: number;
    staticHue: number;
    hueShift: number;
  };
};

export type ThemeContextValue = {
  theme: Theme;
  hues: Hues;
  setTheme?: React.Dispatch<React.SetStateAction<Theme>>;
  toggleTheme?: () => void;
  setHues?: React.Dispatch<React.SetStateAction<Hues>>;
  syncHues?: () => void;
};
