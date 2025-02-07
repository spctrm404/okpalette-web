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

float isInGamut(vec3 v) {
  float minVal = min(v.x, min(v.y, v.z));
  float maxVal = max(v.x, max(v.y, v.z));
  return step(0.0, minVal) * step(maxVal, 1.0);
}

vec3 lchToLab(vec3 lch) {
  return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z));
}

vec3 oklabToXyz(vec3 oklab) {
  vec3 nonLinearLms = u_OKLAB_TO_NON_LINEAR_LMS * oklab;
  vec3 linearLms = pow(abs(nonLinearLms), vec3(3.0)) * sign(nonLinearLms);

  return u_LINEAR_LMS_TO_XYZ * linearLms;
}

vec3 oklabToLinearSrgb(vec3 oklab) {
  vec3 xyz = oklabToXyz(oklab);

  return u_XYZ_TO_LINEAR_SRGB * xyz;
}

vec3 oklabToLinearDisplayP3(vec3 oklab) {
  vec3 xyz = oklabToXyz(oklab);

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
  float mappedCoord = mix(
    0.0,
    mix(coord.x, 1.0 - coord.x, step(1.0, flipped) + step(3.0, flipped)),
    step(1.0, mappedTo)
  ); // if(mappedTo < 1.0) 0
  mappedCoord = mix(
    mappedCoord,
    mix(coord.y, 1.0 - coord.y, step(2.0, flipped) + step(3.0, flipped)),
    step(2.0, mappedTo)
  ); // if(mappedTo < 2.0) x
  mappedCoord = mix(
    mappedCoord,
    mix(coord.x, 1.0 - coord.x, step(1.0, flipped) + step(3.0, flipped)) +
      mix(coord.y, 1.0 - coord.y, step(2.0, flipped) + step(3.0, flipped)) /
        2.0,
    step(3.0, mappedTo)
  ); // if(mappedTo < 3.0) y, if(mappedTo >= 3.0) x+y/2

  return mix(from, to, mappedCoord);
}

void main() {
  vec2 coord = gl_FragCoord.xy / u_resolution;

  float l = axisMap(u_lMappedTo, u_lFlipped, u_lFrom, u_lTo, coord);
  float c = axisMap(u_cMappedTo, u_cFlipped, u_cFrom, u_cTo, coord);

  float hTo = mix(u_hTo + 360.0, u_hTo, step(u_hFrom, u_hTo));
  float hDeg = axisMap(u_hMappedTo, u_hFlipped, u_hFrom, hTo, coord);
  hDeg = mod(hDeg, 360.0);
  float h = hDeg * DEGREES_TO_RADIANS;

  vec3 oklch = vec3(l, c, h);
  vec3 oklab = lchToLab(oklch);

  vec3 linearSrgb = oklabToLinearSrgb(oklab);
  vec3 nonLinearSrgb = toNonLinearRgb(linearSrgb);
  vec3 linearDisplayP3 = oklabToLinearDisplayP3(oklab);
  vec3 nonLinearDisplayP3 = toNonLinearRgb(linearDisplayP3);

  float inSrgb = isInGamut(linearSrgb);
  float inDisplayP3 = isInGamut(linearDisplayP3);

  // Expanded neighbor pixel offsets for 3-pixel radius
  vec2 offsets[24] = vec2[](
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

  // Check neighbors for sRGB inclusion
  float isBoundary = 0.0;
  for (int i = 0; i < 24; i++) {
    vec2 neighborCoord = coord + offsets[i] / u_resolution;
    float neighborL = axisMap(
      u_lMappedTo,
      u_lFlipped,
      u_lFrom,
      u_lTo,
      neighborCoord
    );
    float neighborC = axisMap(
      u_cMappedTo,
      u_cFlipped,
      u_cFrom,
      u_cTo,
      neighborCoord
    );
    float neighborH = axisMap(
      u_hMappedTo,
      u_hFlipped,
      u_hFrom,
      hTo,
      neighborCoord
    );
    neighborH = mod(neighborH, 360.0) * DEGREES_TO_RADIANS;

    vec3 neighborOklch = vec3(neighborL, neighborC, neighborH);
    vec3 neighborOklab = lchToLab(neighborOklch);
    vec3 neighborLinearSrgb = oklabToLinearSrgb(neighborOklab);
    float neighborInSrgb = isInGamut(neighborLinearSrgb);

    // Boundary detection: current in P3 but not in sRGB, and neighbor in sRGB
    isBoundary += step(0.5, inDisplayP3) * (1.0 - inSrgb) * neighborInSrgb;
  }

  isBoundary = step(0.5, isBoundary); // If any neighbor is in sRGB, mark as boundary

  outColor = mix(
    mix(vec4(0.0, 0.0, 0.0, 0.0), vec4(nonLinearSrgb, 1.0), step(1.0, inSrgb)),
    mix(
      vec4(0.0, 0.0, 0.0, 0.0),
      vec4(nonLinearDisplayP3, 1.0 - isBoundary),
      step(1.0, inDisplayP3)
    ),
    step(GAMUT_DISPLAY_P3, u_gamut)
  );
}
