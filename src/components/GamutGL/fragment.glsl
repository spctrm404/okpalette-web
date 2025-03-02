#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_lMappedTo; // 0: none, 1: x, 2: y, 3: xy
uniform float u_lFlipped; // 0: none, 1: x, 2: y, 3: xy
uniform float u_lFrom;
uniform float u_lTo;
uniform float u_cMappedTo; // 0: none, 1: x, 2: y, 3: xy
uniform float u_cFlipped; // 0: none, 1: x, 2: y, 3: xy
uniform float u_cFrom;
uniform float u_cTo;
uniform float u_hMappedTo; // 0: none, 1: x, 2: y, 3: xy
uniform float u_hFlipped; // 0: none, 1: x, 2: y, 3: xy
uniform float u_hFrom;
uniform float u_hTo;
uniform float u_gamut; // 0: srgb, 1: displayP3

uniform mat3 u_OKLAB_TO_NON_LINEAR_LMS;
uniform mat3 u_LINEAR_LMS_TO_XYZ;
uniform mat3 u_XYZ_TO_LINEAR_SRGB;
uniform mat3 u_XYZ_TO_LINEAR_DISPLAY_P3;

out vec4 outColor;

const float PI = 3.1415927;
const float DEGREES_TO_RADIANS = PI / 180.0;
const float GAMUT_DISPLAY_P3 = 1.0;
const int NEIGHBORS_NUM = 24;
const vec2 NEIGHBORS_OFFSET[NEIGHBORS_NUM] = vec2[](
  // Radius 1
  vec2(0.0, 1.0),
  vec2(1.0, 0.0),
  vec2(0.0, -1.0),
  vec2(-1.0, 0.0),
  // Radius 2
  vec2(0.0, 2.0),
  vec2(2.0, 0.0),
  vec2(0.0, -2.0),
  vec2(-2.0, 0.0),
  vec2(1.0, 1.0),
  vec2(-1.0, 1.0),
  vec2(1.0, -1.0),
  vec2(-1.0, -1.0),
  // Radius 3
  vec2(0.0, 3.0),
  vec2(3.0, 0.0),
  vec2(0.0, -3.0),
  vec2(-3.0, 0.0),
  vec2(2.0, 1.0),
  vec2(1.0, 2.0),
  vec2(-2.0, 1.0),
  vec2(-1.0, 2.0),
  vec2(2.0, -1.0),
  vec2(1.0, -2.0),
  vec2(-2.0, -1.0),
  vec2(-1.0, -2.0)
);

float isInGamut(vec3 v) {
  // if both are 1.0, v is in [0, 1]
  vec3 check =
    // step(0.0, v) returns 1.0 if v >= 0.0, 0.0 if v < 0.0
    step(vec3(0.0), v) *
    // step(v, 1.0) returns 1.0 if v <= 1.0, 0.0 if v > 1.0
    step(v, vec3(1.0));
  return check.x * check.y * check.z;
}

//cylindrical to cartesian coordinates
vec3 lchToLab(vec3 lch) {
  return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z));
}

// lab -> non-linear lms -> linaer lms -> xyz
vec3 oklabToXyz(vec3 oklab) {
  vec3 nonLinearLms = u_OKLAB_TO_NON_LINEAR_LMS * oklab;
  vec3 linearLms = pow(abs(nonLinearLms), vec3(3.0)) * sign(nonLinearLms);

  return u_LINEAR_LMS_TO_XYZ * linearLms;
}

vec3 xyzToLinearSrgb(vec3 xyz) {
  return u_XYZ_TO_LINEAR_SRGB * xyz;
}
vec3 xyzToLinearDisplayP3(vec3 xyz) {
  return u_XYZ_TO_LINEAR_DISPLAY_P3 * xyz;
}

vec3 toNonLinearRgb(vec3 rgb) {
  vec3 sign = sign(rgb);
  vec3 abs = abs(rgb);
  vec3 nonlinear = sign * (1.055 * pow(abs, vec3(1.0 / 2.4)) - 0.055);
  vec3 linear = 12.92 * rgb;

  return mix(linear, nonlinear, step(0.0031308, abs));
}

float axisMap(float mappedTo, float flipped, float from, float to, vec2 coord) {
  // 0 -> (0, 0)
  // 1 -> (1, 0)
  // 2 -> (0, 1)
  // 3 -> (1, 1)
  vec2 flipMask =
    step(vec2(1.0, 2.0), vec2(flipped)) + step(vec2(3.0), vec2(flipped));
  flipMask = min(flipMask, vec2(1.0));

  vec2 flippedCoord = mix(coord, 1.0 - coord, flipMask);

  // if (mappedTo < 1.0) mappedCoord = 0.0
  // if (mappedTo >= 1.0) mappedCoord = flippedCoord.x
  float mappedCoord = mix(0.0, flippedCoord.x, step(1.0, mappedTo));
  // if (mappedTo >= 2.0) mappedCoord = flippedCoord.y
  mappedCoord = mix(mappedCoord, flippedCoord.y, step(2.0, mappedTo));
  // if (mappedTo >= 3.0) mappedCoord = (flippedCoord.x + flippedCoord.y) / 2.0
  mappedCoord = mix(
    mappedCoord,
    (flippedCoord.x + flippedCoord.y) * 0.5,
    step(3.0, mappedTo)
  );

  return mix(from, to, mappedCoord);
}

float axisMapForHue(
  float mappedTo,
  float flipped,
  float from,
  float to,
  vec2 coord
) {
  // 0 -> (0, 0)
  // 1 -> (1, 0)
  // 2 -> (0, 1)
  // 3 -> (1, 1)
  vec2 flipMask =
    step(vec2(1.0, 2.0), vec2(flipped)) + step(vec2(3.0), vec2(flipped));
  flipMask = min(flipMask, vec2(1.0));

  vec2 flippedCoord = mix(coord, 1.0 - coord, flipMask);

  // if (mappedTo < 1.0) mappedCoord = 0.0
  // if (mappedTo >= 1.0) mappedCoord = flippedCoord.x
  float mappedCoord = mix(0.0, flippedCoord.x, step(1.0, mappedTo));
  // if (mappedTo >= 2.0) mappedCoord = flippedCoord.y
  mappedCoord = mix(mappedCoord, flippedCoord.y, step(2.0, mappedTo));
  // if (mappedTo >= 3.0) mappedCoord = (flippedCoord.x + flippedCoord.y) / 2.0
  mappedCoord = mix(
    mappedCoord,
    (flippedCoord.x + flippedCoord.y) * 0.5,
    step(3.0, mappedTo)
  );

  // hFrom이 hTo보다 큰 경우, to를 360도 늘려서 보정
  float adjustedTo = to + step(to, from) * 360.0;

  // hFrom에서 adjustedTo까지 부드럽게 보간
  float hue = mix(from, adjustedTo, mappedCoord);

  // 0~360 범위 유지
  hue = mod(hue, 360.0);

  return hue * DEGREES_TO_RADIANS;
}

void main() {
  vec2 coord = gl_FragCoord.xy / u_resolution;

  vec3 oklch = vec3(
    axisMap(u_lMappedTo, u_lFlipped, u_lFrom, u_lTo, coord),
    axisMap(u_cMappedTo, u_cFlipped, u_cFrom, u_cTo, coord),
    axisMapForHue(u_hMappedTo, u_hFlipped, u_hFrom, u_hTo, coord)
  );
  // oklch.z =
  //   mod(mix(oklch.z, oklch.z + 360.0, step(u_hTo, u_hFrom)), 360.0) *
  //   DEGREES_TO_RADIANS;

  vec3 oklab = lchToLab(oklch);
  vec3 xyz = oklabToXyz(oklab);

  vec3 linearSrgb = xyzToLinearSrgb(xyz);
  vec3 linearDisplayP3 = xyzToLinearDisplayP3(xyz);

  vec3 nonLinearSrgb = toNonLinearRgb(linearSrgb);
  vec3 nonLinearDisplayP3 = toNonLinearRgb(linearDisplayP3);

  float inSrgb = isInGamut(linearSrgb);
  float inDisplayP3 = isInGamut(linearDisplayP3);

  // check if the pixel is a boundary
  // if the pixel is in display-p3 but not in srgb, and any of the neighbors is in srgb, it is a boundary
  float isBoundary = 0.0;
  for (int i = 0; i < NEIGHBORS_NUM; i++) {
    vec2 neighborCoord = coord + NEIGHBORS_OFFSET[i] / u_resolution;
    vec3 neighborLch = vec3(
      axisMap(u_lMappedTo, u_lFlipped, u_lFrom, u_lTo, neighborCoord),
      axisMap(u_cMappedTo, u_cFlipped, u_cFrom, u_cTo, neighborCoord),
      axisMap(u_hMappedTo, u_hFlipped, u_hFrom, u_hTo, neighborCoord)
    );
    neighborLch.z = mod(neighborLch.z, 360.0) * DEGREES_TO_RADIANS;
    vec3 neighborOklab = lchToLab(neighborLch);
    vec3 neighborXyz = oklabToXyz(neighborOklab);
    vec3 neighborLinearSrgb = xyzToLinearSrgb(neighborXyz);

    // Check if the neighbor is in the sRGB gamut
    float neighborInSrgb = isInGamut(neighborLinearSrgb);
    // if current pixel is in display-p3 but not in srgb, and the neighbor is in srgb, it is a boundary
    isBoundary += step(0.5, inDisplayP3) * (1.0 - inSrgb) * neighborInSrgb;
  }
  isBoundary = step(1.0, isBoundary);

  vec4 srgbColor = vec4(nonLinearSrgb, inSrgb);
  vec4 displayP3Color = vec4(
    nonLinearDisplayP3,
    (1.0 - isBoundary) * inDisplayP3
  );
  outColor = mix(srgbColor, displayP3Color, step(GAMUT_DISPLAY_P3, u_gamut));
}
