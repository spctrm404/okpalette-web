import { quantize } from "@/utils";

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

export const formatDigits = (
  num: number,
  intLen: number = 0,
  floatLen: number = 0,
): string => {
  const multiplier = Math.pow(10, -floatLen);
  const quantized = quantize(num, multiplier);
  const [intPart, floatPart = ""] = Math.abs(quantized).toString().split(".");
  const paddedInt = intPart.padStart(intLen, "0");
  const paddedFloat = floatPart.padEnd(floatLen, "0");

  return `${quantized < 0 ? "-" : ""}${paddedInt}${floatLen > 0 ? `.${paddedFloat}` : ""}`;
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
