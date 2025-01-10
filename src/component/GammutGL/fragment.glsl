// glsl-stage: fragment
#version 300 es
precision mediump float;

uniform vec2 u_Resolution;
uniform float u_LFrom;
uniform float u_LTo;
uniform float u_CFrom;
uniform float u_CTo;
uniform float u_HDegFrom;
uniform float u_HDegTo;
uniform int u_Gamut; // 0: sRGB, 1: Display P3

out vec4 outColor;

const float PI = 3.1415927;
const float DEG2RAD = PI / 180.0;
const int GAMUT_SRGB = 0;
const int GAMUT_DISPP3 = 1;
const float BOUNDARY_CHK_C_DELTA = 0.002; // Chroma 증가 값

bool isInGamut(vec3 v) {
  return all(greaterThanEqual(v, vec3(0.0))) &&
  all(lessThanEqual(v, vec3(1.0)));
}

vec3 mulTransposedMat3Vec3(mat3 m, vec3 v) {
  return vec3(dot(v, m[0]), dot(v, m[1]), dot(v, m[2]));
}

vec3 lchToLab(vec3 lch) {
  return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z));
}

vec3 oklabToLSrgb(vec3 oklab) {
  mat3 oklabToLms = mat3(
     0.9999999984505198 ,  0.39633779217376786,  0.2158037580607588 ,
     1.0000000088817609 , -0.10556134232365635, -0.06385417477170591,
     1.0000000546724108 , -0.08948418209496575, -1.2914855378640917
  );
  vec3 lmsNonLinear = mulTransposedMat3Vec3(oklabToLms, oklab);
  vec3 lms = pow(abs(lmsNonLinear), vec3(3.0)) * sign(lmsNonLinear);
  mat3 lmsToLrgb = mat3(
     4.076741661347994   , -3.307711590408193   ,  0.230969928729428   ,
    -1.2684380040921763  ,  2.6097574006633715  , -0.3413193963102197  ,
    -0.004196086541837188, -0.7034186144594493  ,  1.7076147009309444
  );

  return mulTransposedMat3Vec3(lmsToLrgb, lms);
}

// OKLab을 Display P3 Linear로 직접 변환
vec3 oklabToLrgbDisplayP3(vec3 lab) {
  mat3 labToLms = mat3(
     0.9999999984505198 ,  0.39633779217376786,  0.2158037580607588 ,
     1.0000000088817609 , -0.10556134232365635, -0.06385417477170591,
     1.0000000546724108 , -0.08948418209496575, -1.2914855378640917
  );

  vec3 lmsNonLinear = mulTransposedMat3Vec3(labToLms, lab);
  vec3 lms = pow(abs(lmsNonLinear), vec3(3.0)) * sign(lmsNonLinear);

  // LMS에서 XYZ로 변환
  mat3 lmsToXyz = mat3(
     1.2270138511035211, -0.5577999806518222,  0.2812561489664683,
    -0.0405801784232806,  1.1122568696168301, -0.0716766786656012,
    -0.0763812845057069, -0.4214819784180127,  1.5861632204407947
  );

  vec3 xyz = mulTransposedMat3Vec3(lmsToXyz, lms);

  // XYZ에서 Display P3 Linear로 변환
  mat3 xyzToDisplayP3 = mat3(
     2.493496911941425 , -0.931383617919124 , -0.4027107844507168,
    -0.8294889695615747,  1.7626640603183463,  0.0236246858419436,
     0.0358458302437845, -0.0761723892680418,  0.9568845240076872
  );

  return mulTransposedMat3Vec3(xyzToDisplayP3, xyz);
}

// Linear RGB를 Gamma 보정 RGB로 변환
vec3 lrgbToRgb(vec3 rgb) {
  vec3 absRgb = abs(rgb);
  vec3 signRgb = sign(rgb);
  vec3 threshold = vec3(0.0031308);

  vec3 belowThreshold = rgb * 12.92;
  vec3 aboveThreshold =
    signRgb * (1.055 * pow(absRgb, vec3(1.0 / 2.4)) - 0.055);

  return mix(belowThreshold, aboveThreshold, step(threshold, absRgb));
}

// OKLab 색상이 sRGB 색 공간의 경계에 있는지 확인하는 함수
bool isAtSrgbBoundary(vec3 oklch, vec3 lab) {
  // 현재 색상이 sRGB 색 공간 내에 있는지 확인
  vec3 lrgbSrgb = oklabToLSrgb(lab);
  bool inSrgbGamut = isInGamut(lrgbSrgb);

  // chroma를 약간 증가시켜서 sRGB 색 공간 밖으로 나가는지 확인
  vec3 oklchIncreasedC = vec3(oklch.x, oklch.y + BOUNDARY_CHK_C_DELTA, oklch.z);
  vec3 labIncreasedC = lchToLab(oklchIncreasedC);
  vec3 lrgbIncreasedC = oklabToLSrgb(labIncreasedC);
  bool inSrgbGamutIncreasedC = isInGamut(lrgbIncreasedC);

  // 현재는 sRGB 안에 있고, 증가된 chroma는 sRGB 밖에 있으면 경계로 판단
  return inSrgbGamut && !inSrgbGamutIncreasedC;
}

float mapAxis(int mapping, vec2 coord, float minValue, float maxValue) {
  float value = mapping == 0 ? coord.x : coord.y;
  return mix(minValue, maxValue, value);
}

void main() {
  vec2 coord = gl_FragCoord.xy / u_Resolution;
  float x = coord.x;
  float y = coord.y;

  // Y축 매핑: 아래쪽이 0, 위쪽이 0.4
  float y_mapped = y * 0.4;

  // l과 c 값 설정
  float l = mapAxis(u_LMapping, coord, 0.0, 1.0);
  float c = mapAxis(u_LMapping, coord, 0.0, 1.0);

  // h 값 보간
  float h_from = u_FromHue;
  float h_to = u_ToHue;

  if (h_to < h_from) {
    h_to += 360.0;
  }
  float h = mapAxis(u_LMapping, coord, 0.0, 1.0);

  float h = h_from + (h_to - h_from) * x;
  h = mod(h, 360.0);
  float h_rad = h * DEG2RAD;

  // OKLCH 색상 생성
  vec3 oklch = vec3(l, c, h_rad);

  // OKLab으로 변환
  vec3 lab = lchToLab(oklch);

  if (u_Gamut == GAMUT_SRGB) {
    // sRGB 색 공간 처리
    vec3 lrgb = oklabToLSrgb(lab);
    vec3 rgb = lrgbToRgb(lrgb);
    bool inGamut = isInGamut(lrgb);

    if (inGamut) {
      outColor = vec4(rgb, 1.0);
    } else {
      outColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
  } else if (u_Gamut == GAMUT_DISPP3) {
    // Display P3 색 공간 처리
    vec3 lrgbP3 = oklabToLrgbDisplayP3(lab);
    vec3 rgb = lrgbToRgb(lrgbP3);
    bool inGamut = isInGamut(lrgbP3);

    if (inGamut) {
      // sRGB 색 공간의 경계인지 확인
      bool atSrgbBoundary = isAtSrgbBoundary(oklch, lab);

      // 경계일 경우 투명하게, 그 외에는 불투명하게
      float alpha = atSrgbBoundary ? 0.0 : 1.0;
      outColor = vec4(rgb, alpha);
    } else {
      outColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
  }
}
