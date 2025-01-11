#version 300 es
precision highp float;

uniform vec2 u_Resolution;
uniform float u_LMappedTo; // 0: x, 1: y
uniform float u_LFlipped;
uniform float u_CMappedTo; // 0: x, 1: y
uniform float u_CFlipped;
uniform float u_HMappedTo; // 0: x, 1: y
uniform float u_HFlipped;
uniform float u_HDegFrom;
uniform float u_HDegTo;
uniform float u_Gamut; // 0: sRGB, 1: Display P3
uniform float u_BoundaryChkCDelta;

out vec4 outColor;

const float PI = 3.1415927;
const float DEG2RAD = PI / 180.0;
const float GAMUT_SRGB = 0.0;
const float GAMUT_DISPP3 = 1.0;

bool isInGamut(vec3 v) {
  return all(greaterThanEqual(v, vec3(0.0))) &&
  all(lessThanEqual(v, vec3(1.0)));
}

vec3 transposeMatVec(mat3 m, vec3 v) {
  return vec3(dot(v, m[0]), dot(v, m[1]), dot(v, m[2]));
}

vec3 lchToLab(vec3 lch) {
  return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z));
}

vec3 oklabToLLms(vec3 oklab) {
  mat3 oklabToLms = mat3(
     1           ,  0.3963377774,  0.2158037573,
     1           , -0.1055613458, -0.0638541728,
     1           , -0.0894841775, -1.291485548
  );
  vec3 lms = transposeMatVec(oklabToLms, oklab);
  vec3 lLms = pow(abs(lms), vec3(3.0)) * sign(lms);

  return lLms;
}

vec3 oklabToLSrgb(vec3 oklab) {
  vec3 lLms = oklabToLLms(oklab);
  mat3 lLmsToLrgb = mat3(
     4.0767416621, -3.3077115913,  0.2309699292,
    -1.2684380046,  2.6097574011, -0.3413193965,
    -0.0041960863, -0.7034186147,  1.707614701
  );

  return transposeMatVec(lLmsToLrgb, lLms);
}

vec3 oklabToLDispP3(vec3 oklab) {
  vec3 lLms = oklabToLLms(oklab);
  mat3 lLmsToXyz = mat3(
     1.2270138 , -0.5578    ,  0.28125614,
    -0.04058018,  1.1122569 , -0.07167668,
    -0.07638128, -0.42148197,  1.5861632
  );
  vec3 xyz = transposeMatVec(lLmsToXyz, lLms);
  mat3 xyzToLDispP3 = mat3(
     2.403984 , -0.9899069, -0.3976415,
    -0.8422229,  1.7988437,  0.0160354,
     0.0482059, -0.0974068,  1.2740049
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

bool isAtSrgbBoundary(vec3 oklch) {
  vec3 oklab = lchToLab(oklch);
  vec3 lSrgb = oklabToLSrgb(oklab);
  bool inSrgbGamut = isInGamut(lSrgb);

  vec3 oklchIncC = vec3(oklch.x, oklch.y + u_BoundaryChkCDelta, oklch.z);
  vec3 oklabIncC = lchToLab(oklchIncC);
  vec3 lSrgbIncC = oklabToLSrgb(oklabIncC);
  bool inSrgbGamutIncC = isInGamut(lSrgbIncC);

  return inSrgbGamut && !inSrgbGamutIncC;
}

float axisMap(
  float mapping,
  float flipped,
  float minValue,
  float maxValue,
  vec2 coord
) {
  float value = mix(coord.x, coord.y, step(0.0, mapping));
  value = mix(value, 1.0 - value, step(0.0, flipped));

  return mix(minValue, maxValue, value);
}

void main() {
  vec2 coord = gl_FragCoord.xy / u_Resolution;

  float l = axisMap(u_LMappedTo, u_LFlipped, 0.0, 1.0, coord);
  float c = axisMap(u_CMappedTo, u_CFlipped, 0.0, 1.0, coord);

  float hDegTo = mix(u_HDegTo + 360.0, u_HDegTo, step(u_HDegFrom, u_HDegTo));
  float hDeg = axisMap(u_HMappedTo, u_HFlipped, u_HDegFrom, hDegTo, coord);
  hDeg = mod(hDeg, 360.0);
  float hRad = hDeg * DEG2RAD;

  vec3 oklch = vec3(l, c, hRad);
  vec3 oklab = lchToLab(oklch);

  if (u_Gamut == GAMUT_SRGB) {
    vec3 lSrgb = oklabToLSrgb(oklab);
    vec3 srgb = linearToNonLinear(lSrgb);
    bool inGamut = isInGamut(lSrgb);

    outColor = inGamut ? vec4(srgb, 1.0) : vec4(0.0, 0.0, 0.0, 0.0);
  } else if (u_Gamut == GAMUT_DISPP3) {
    vec3 lDispP3 = oklabToLDispP3(oklab);
    vec3 dispP3 = linearToNonLinear(lDispP3);
    bool inGamut = isInGamut(lDispP3);

    if (inGamut) {
      // float alpha = isAtSrgbBoundary(oklch) ? 0.0 : 1.0;
      // outColor = vec4(dispP3, alpha);
      outColor = vec4(dispP3, 1.0);
    } else {
      outColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
  }
}
