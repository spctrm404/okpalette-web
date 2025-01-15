import { Hues } from "./types";

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

export const hueForLightness = (
  lightness: number,
  { from, to }: Hues,
): number => {
  const hueDiff = from <= to ? to - from : to + 360 - from;
  return (from + lightness * hueDiff) % 360;
};

export const quantize = (num: number, step: number): number => {
  const multiplier = 1 / step;
  return (Math.round(Math.abs(num) * multiplier) / multiplier) * Math.sign(num);
};

export const replaceWordInCamelCase = (
  camelString: string,
  targetWord: string,
  replacementWord: string,
): string => {
  const trimmedString = camelString.trim();

  return trimmedString.replace(new RegExp(targetWord, "gi"), () => {
    return replacementWord
      .toLowerCase()
      .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
  });
};

export const camelCaseToKebabCase = (camelString: string): string => {
  if (!camelString.trim()) return ""; // 빈 문자열 또는 공백만 있는 경우 처리

  return camelString
    .trim() // 앞뒤 공백 제거
    .replace(/[\s_]+/g, "-") // 공백 및 언더스코어를 하이픈으로 변환
    .replace(/[^a-zA-Z0-9-]/g, "") // 특수문자 제거
    .replace(/([a-z])([A-Z])/g, "$1-$2") // 소문자와 대문자 경계 처리
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2") // 연속된 대문자 처리
    .replace(/(\d)([a-zA-Z])/g, "$1-$2") // 숫자 뒤 문자 경계 처리
    .replace(/([a-zA-Z])(\d)/g, "$1-$2") // 문자 뒤 숫자 경계 처리
    .replace(/--+/g, "-") // 연속된 하이픈 제거
    .toLowerCase(); // 결과를 소문자로 변환
};
