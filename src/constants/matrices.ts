import type { mat3 } from "@/types";
import { inverseMatrix } from "@/utils";

// from https://bottosson.github.io/posts/oklab
const mat3XyzToLinearLms: mat3 = [
  [0.8189330101, 0.3618667424, -0.1288597137],
  [0.0329845436, 0.9293118715, 0.0361456387],
  [0.0482003018, 0.2643662691, 0.633851707],
];

// from https://bottosson.github.io/posts/oklab
const mat3NonLinearLmsToOklab: mat3 = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
];

// export const mat3OklabToNonLinearLms = inverseMatrix(mat3NonLinearLmsToOklab);
export const mat3OklabToNonLinearLms: mat3 = [
  [0.9999999984505197, 0.3963377921737678, 0.21580375806075877],
  [1.0000000088817607, -0.10556134232365633, -0.06385417477170588],
  [1.0000000546724106, -0.08948418209496574, -1.2914855378640917],
];
// export const mat3LinearLmsToXyz = inverseMatrix(mat3XyzToLinearLms);
export const mat3LinearLmsToXyz: mat3 = [
  [1.2270138511035211, -0.5577999806518221, 0.2812561489664678],
  [-0.04058017842328059, 1.11225686961683, -0.0716766786656012],
  [-0.0763812845057069, -0.4214819784180127, 1.5861632204407947],
];
