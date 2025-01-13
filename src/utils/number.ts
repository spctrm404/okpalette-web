export const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};

export const degToRad = (deg: number): number => {
  return (deg * Math.PI) / 180.0;
};

export const quantize = (num: number, step: number): number => {
  const multiplier = 1 / step;
  return (Math.round(Math.abs(num) * multiplier) / multiplier) * Math.sign(num);
};
