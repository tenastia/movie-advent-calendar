// Letters fragment shader: SDF glyph with fake depth of field and depth fog.

uniform sampler2D uAtlas;
uniform vec2 uAtlasGrid;     // columns, rows of glyph cells
uniform float uSdfEdge;      // SDF value at the glyph edge (1 - cutoff)
uniform float uSdfRadius;    // atlas px per unit of SDF value
uniform float uMaxSoftPx;    // softest edge the SDF padding can hold without showing the quad
uniform float uBlurMaxPx;    // blur at full circle of confusion, atlas px

uniform float uFocus;
uniform float uFocusRange;
uniform float uBlurStrength;
uniform float uFarBlur;
uniform float uBokehDim;
uniform float uFogStart;
uniform float uFogLength;
uniform float uNearFade;

uniform float uWeight;
uniform vec3 uColor;
uniform float uOpacity;

varying vec2 vUv;
varying float vGlyph;
varying float vDepth;
varying float vAlpha;
varying float vBright;

void main() {
  float g = floor(vGlyph + 0.5);
  float row = floor((g + 0.5) / uAtlasGrid.x);
  float col = g - row * uAtlasGrid.x;
  vec2 uv = (vec2(col, row) + vec2(vUv.x, 1.0 - vUv.y)) / uAtlasGrid;

  float sd = texture2D(uAtlas, uv).r;
  float dist = (uSdfEdge - sd) * uSdfRadius - uWeight; // atlas px, > 0 outside the stroke

  // Edge softness grows with |view depth - focus distance|.
  float off = vDepth - uFocus;
  float coc = clamp(max(abs(off) - uFocusRange, 0.0) * uBlurStrength * (off > 0.0 ? uFarBlur : 1.0), 0.0, 1.0);
  float aa = 0.75 * fwidth(dist);
  float w = clamp(aa + coc * uBlurMaxPx, 1e-3, uMaxSoftPx);
  float a = 1.0 - smoothstep(-w, w, dist);

  // Far letters fade into black, letters brushing the lens fade out.
  float fog = smoothstep(uFocus + uFogStart, uFocus + uFogStart + uFogLength, vDepth);
  float nearA = smoothstep(0.4 * uNearFade, uNearFade, vDepth);

  a *= vAlpha * (1.0 - fog) * nearA * (1.0 - uBokehDim * coc) * uOpacity;
  if (a < 0.002) discard;

  gl_FragColor = vec4(uColor * vBright, a);
  #include <colorspace_fragment>
}
