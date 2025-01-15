export type Theme = "light" | "dark";

export type Hues = {
  from: number;
  to: number;
};

export type ThemeContextType = {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  toggleTheme: () => void;
  hues: Hues;
  setHues: React.Dispatch<React.SetStateAction<Hues>>;
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
