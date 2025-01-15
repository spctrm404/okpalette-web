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
uniform float u_gamut; // 0: sRGB, 1: Display P3

out vec4 outColor;

const float PI = 3.1415926536;
const float DEG2RAD = PI / 180.0;
const float GAMUT_SRGB = 0.0;
const float GAMUT_DISPP3 = 1.0;

float isInGamut(vec3 v) {
  float minValue = min(v.x, min(v.y, v.z));
  float maxValue = max(v.x, max(v.y, v.z));
  return step(0.0, minValue) * step(maxValue, 1.0);
}

vec3 transposeMatVec(mat3 m, vec3 v) {
  return vec3(dot(v, m[0]), dot(v, m[1]), dot(v, m[2]));
}

vec3 lchToLab(vec3 lch) {
  return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z));
}

vec3 oklabToLLms(vec3 oklab) {
  mat3 oklabToLms = mat3(
     1.0         ,  0.3963377922,  0.2158037581,
     1.0000000089, -0.1055613423, -0.0638541748,
     1.0000000055, -0.0894841821, -1.2914855379
  );
  vec3 lms = transposeMatVec(oklabToLms, oklab);
  vec3 lLms = pow(abs(lms), vec3(3.0)) * sign(lms);

  return lLms;
}

vec3 oklabToLSrgb(vec3 oklab) {
  vec3 lLms = oklabToLLms(oklab);
  mat3 lLmsToLrgb = mat3(
     4.0767416613, -3.3077115904,  0.2309699287,
    -1.268438    ,  2.6097574007, -0.3413193963,
    -0.0041960865, -0.7034186145,  1.7076147009
  );

  return transposeMatVec(lLmsToLrgb, lLms);
}

vec3 oklabToLDispP3(vec3 oklab) {
  vec3 lLms = oklabToLLms(oklab);
  mat3 lLmsToXyz = mat3(
     1.2270138511, -0.5577999807,  0.281256149 ,
    -0.0405801784,  1.1122568696, -0.0716766787,
    -0.0763812845, -0.4214819784,  1.5861632204
  );
  vec3 xyz = transposeMatVec(lLmsToXyz, lLms);
  mat3 xyzToLDispP3 = mat3(
     2.4934969119, -0.9313836179, -0.4027107845,
    -0.8294889696,  1.7626640603,  0.0236246858,
     0.0358458302, -0.0761723893,  0.956884524
  );

  return transposeMatVec(xyzToLDispP3, xyz);
}

vec3 linearToNonLinear(vec3 rgb) {
  vec3 absRgb = abs(rgb);
  vec3 signRgb = sign(rgb);
  vec3 threshold = vec3(0.0031308);

  vec3 belowThreshold = rgb * 12.92;
  vec3 aboveThreshold =
    signRgb * (1.055 * pow(absRgb, vec3(1.0 / 2.4)) - 0.055);

  return mix(belowThreshold, aboveThreshold, step(threshold, absRgb));
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
  float h = hDeg * DEG2RAD;

  vec3 oklch = vec3(l, c, h);
  vec3 oklab = lchToLab(oklch);

  vec3 lSrgb = oklabToLSrgb(oklab);
  vec3 srgb = linearToNonLinear(lSrgb);
  vec3 lDispP3 = oklabToLDispP3(oklab);
  vec3 dispP3 = linearToNonLinear(lDispP3);

  float inSrgb = isInGamut(lSrgb);
  float inDispP3 = isInGamut(lDispP3);

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
    neighborH = mod(neighborH, 360.0) * DEG2RAD;

    vec3 neighborOklch = vec3(neighborL, neighborC, neighborH);
    vec3 neighborOklab = lchToLab(neighborOklch);
    vec3 neighborLSrgb = oklabToLSrgb(neighborOklab);
    float neighborInSrgb = isInGamut(neighborLSrgb);

    // Boundary detection: current in P3 but not in sRGB, and neighbor in sRGB
    isBoundary += step(0.5, inDispP3) * (1.0 - inSrgb) * neighborInSrgb;
  }

  isBoundary = step(0.5, isBoundary); // If any neighbor is in sRGB, mark as boundary

  outColor = mix(
    mix(vec4(0.0, 0.0, 0.0, 0.0), vec4(srgb, 1.0), step(1.0, inSrgb)),
    mix(
      vec4(0.0, 0.0, 0.0, 0.0),
      vec4(dispP3, 1.0 - isBoundary),
      step(1.0, inDispP3)
    ),
    step(GAMUT_DISPP3, u_gamut)
  );
}
