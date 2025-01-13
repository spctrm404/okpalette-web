export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type LCH = {
  l: number;
  c: number;
  h: number;
};

export type CuloriOklch = {
  mode: "oklch";
} & LCH;

export type CuloriSrgb = {
  mode: "rgb";
} & RGB;

export type CuloriDispP3 = {
  mode: "p3";
} & RGB;
