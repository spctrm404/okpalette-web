import { ReactNode, useCallback, useLayoutEffect, useState } from "react";
import { Hues, Theme } from "./types";
import {
  TONAL_PALTETTE_CONFIGS,
  CHROMA_STEP,
  HUE_STEP,
  LIGHTNESS_STEP,
} from "./constants";
import {
  chromaForLightness,
  quantize,
  hueForLightness,
  replaceWordInCamelCase,
  camelCaseToKebabCase,
} from "./utils";
import { ThemeContext } from "./ThemeContext";

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [hues, setHues] = useState<Hues>({ from: 0, to: 0 });

  const updateTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);
  const updateHues = useCallback((newHues: Hues) => {
    setHues(newHues);
  }, []);
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme: Theme) => {
      return prevTheme === "light" ? "dark" : "light";
    });
  }, []);
  const syncHues = useCallback(() => {
    setHues((prevHues: Hues) => {
      return { ...prevHues, ["to"]: prevHues.from };
    });
  }, []);

  const applyCssCustomProperties = useCallback(() => {
    const targetDom = document.documentElement;
    for (const [paletteGroupName, paletteConfig] of Object.entries(
      TONAL_PALTETTE_CONFIGS,
    )) {
      const {
        reference,
        replacingName,
        isDynamic,
        peakChroma,
        peakChromaMult,
        peakLightness,
        staticHue,
        hueShift,
      } = paletteConfig;
      Object.entries(reference).forEach(([name, themeLightness]) => {
        let lightness = themeLightness[theme];

        let chroma =
          chromaForLightness(lightness, peakLightness, peakChroma) *
          peakChromaMult;
        chroma = quantize(chroma, CHROMA_STEP);

        let hue =
          (isDynamic ? hueForLightness(lightness, hues) : staticHue) + hueShift;
        hue = quantize(hue, HUE_STEP);

        let propertyName = replacingName
          ? replaceWordInCamelCase(name, "name", paletteGroupName)
          : name;
        propertyName = camelCaseToKebabCase(propertyName);
        propertyName = `--${propertyName}`;

        lightness = quantize(lightness, LIGHTNESS_STEP);

        targetDom.style.setProperty(
          propertyName,
          `oklch(${lightness} ${chroma} ${hue}deg)`,
        );
      });
    }
    targetDom.style.setProperty(
      "--shadow-0",
      "0 0 0 0 rgba(0, 0, 0, 0), 0 0 0 0 rgba(0, 0, 0, 0)",
    );
    if (theme === "light") {
      targetDom.style.setProperty(
        "--shadow-1",
        "0rem .0625rem .125rem 0rem rgba(0, 0, 0, 0.30), 0rem .0625rem .1875rem .0625rem rgba(0, 0, 0, 0.15)",
      );
      targetDom.style.setProperty(
        "--shadow-2",
        "0rem .0625rem .125rem 0rem rgba(0, 0, 0, 0.30), 0rem .125rem .375rem .125rem rgba(0, 0, 0, 0.15)",
      );
      targetDom.style.setProperty(
        "--shadow-3",
        "0rem .0625rem .125rem 0rem rgba(0, 0, 0, 0.30), 0rem .0625rem .1875rem .0625rem rgba(0, 0, 0, 0.15)",
      );
      targetDom.style.setProperty(
        "--shadow-4",
        "0rem .125rem .1875rem 0rem rgba(0, 0, 0, 0.30), 0rem .375rem .625rem .25rem rgba(0, 0, 0, 0.15)",
      );
      targetDom.style.setProperty(
        "--shadow-5",
        "0rem .25rem .25rem 0rem rgba(0, 0, 0, 0.30), 0rem .5rem .75rem .375rem rgba(0, 0, 0, 0.15)",
      );
    } else {
      targetDom.style.setProperty(
        "--shadow-1",
        "0rem .0625rem .1875rem .0625rem rgba(0, 0, 0, 0.15), 0rem .0625rem .125rem 0rem rgba(0, 0, 0, 0.30)",
      );
      targetDom.style.setProperty(
        "--shadow-2",
        "0rem .125rem .375rem .125rem rgba(0, 0, 0, 0.15), 0rem .0625rem .125rem 0rem rgba(0, 0, 0, 0.30)",
      );
      targetDom.style.setProperty(
        "--shadow-3",
        "0rem .25rem .5rem .1875rem rgba(0, 0, 0, 0.15), 0rem .0625rem .1875rem 0rem rgba(0, 0, 0, 0.30)",
      );
      targetDom.style.setProperty(
        "--shadow-4",
        "0rem .375rem .625rem .25rem rgba(0, 0, 0, 0.15), 0rem .125rem .1875rem 0rem rgba(0, 0, 0, 0.30)",
      );
      targetDom.style.setProperty(
        "--shadow-5",
        "0rem .5rem .75rem .375rem rgba(0, 0, 0, 0.15), 0rem .25rem .25rem 0rem rgba(0, 0, 0, 0.30)",
      );
    }
  }, [theme, hues]);

  useLayoutEffect(() => {
    applyCssCustomProperties();
  }, [applyCssCustomProperties]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateTheme,
        toggleTheme,
        hues,
        updateHues,
        syncHues,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
