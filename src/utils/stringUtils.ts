export const camelCaseToKebabCase = (camelString: string): string => {
  const trimmedString = camelString.trim();
  const kebabString = trimmedString
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .replace(/(\d)([a-zA-Z])/g, "$1-$2")
    .toLowerCase();
  return kebabString;
};

export const formatDigits = (
  num: number,
  intLen: number,
  floatLen: number,
): string => {
  const [intPart, floatPart] = num.toFixed(floatLen).split(".");
  const paddedInt = intPart ? intPart.padStart(intLen, "0") : "0";
  return `${intLen > 0 ? paddedInt : intLen === 0 ? intPart : ""}${
    floatLen > 0 ? `.${floatPart}` : ""
  }`;
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
