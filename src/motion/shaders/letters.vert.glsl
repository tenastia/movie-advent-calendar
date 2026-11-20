// Letters vertex shader — shared part.
//
// uTime is the time of day in seconds. The day runs:
//   uDecay0 → uDecay1     the number comes apart one letter at a time
//   uDecay1 → uAssemble1  letters fly back one at a time and build the title
//   uAssemble1 → 24:00    the title rests and breathes, then fades into the
//                         next day's number over the last uCrossfade seconds
// Every position is a pure function of (uTime, per-instance seeds). The active
// mode supplies `Flight flight(float t, float release)`: where a letter is while
// it is free (on the number before its release, then leaving, then drifting).

uniform float uTime;
uniform float uStatic;      // 0 animated, 1 static number, 2 static title, 3 next day's number
uniform float uNumberEm;    // world units per em; the title uses the same size
uniform float uFocus;       // view depth that is in focus
uniform float uSpan;        // day-seconds per frame while fast-previewing (0 = exact)

uniform float uDecay0;
uniform float uDecay1;
uniform float uAssemble1;
uniform float uDayLength;
uniform float uCrossfade;

uniform float uApproach;    // minutes
uniform float uAssembleEase;
uniform float uAssembleArc;
uniform float uStack;       // 1: left-over letters stack onto their slot; 0: they stay in the field
uniform float uStayDim;
uniform float uBreathe;
uniform float uBreathePeriod;
uniform float uBreatheWave;

uniform float uFocusRange;
uniform float uBlurStrength;
uniform float uFarBlur;
uniform float uBokehGrow;

attribute vec2 aNumPos;    // em, relative to the number's center
attribute vec2 aTitlePos;  // em, relative to the number's center (same grid pitch)
attribute vec4 aData;      // glyph index, unused, slot order 0..1, slot index
attribute vec4 aSched;     // release 0..1 of the decay window, arrival 0..1 of the assembly window, hero 0/1, unused
attribute vec4 aRandA;     // per-letter randoms, used by the mode
attribute vec4 aRandB;
attribute vec4 aRandC;
attribute vec4 aRandD;     // xy: return arc direction (shared); zw: free for the mode

varying vec2 vUv;
varying float vGlyph;
varying float vDepth;
varying float vAlpha;
varying float vBright;

const float PI = 3.141592653589793;
const float TAU = 6.283185307179586;
const float STACK_MERGE = 4.0; // s for a stacked letter to melt into the identical one beneath it

vec3 randUnit(float u, float v) {
  float z = 2.0 * u - 1.0;
  float a = TAU * v;
  float r = sqrt(max(0.0, 1.0 - z * z));
  return vec3(r * cos(a), r * sin(a), z);
}

// Map an angle to [-PI, PI] so unwinding takes the short way round.
float wrapAngle(float a) {
  return a - TAU * floor(a / TAU + 0.5);
}

vec3 rotateAxis(vec3 p, vec3 axis, float angle) {
  float a = wrapAngle(angle);
  float c = cos(a);
  float s = sin(a);
  return p * c + cross(axis, p) * s + axis * dot(axis, p) * (1.0 - c);
}

float easeInOutPow(float x, float p) {
  return x < 0.5 ? 0.5 * pow(2.0 * x, p) : 1.0 - 0.5 * pow(2.0 * (1.0 - x), p);
}

// Fast-preview smoothing (same as damp() in day.ts): an oscillation at w rad/s
// keeps its amplitude while it moves less than c radians per frame, then fades.
float damp(float w, float c) {
  float x = w * uSpan / c;
  return x <= 1.0 ? 1.0 : 1.0 / (x * x);
}

// A letter's free state. Orientation = tumble(axis, angle) · tilt(tiltAxis, tilt) · roll(z).
struct Flight {
  vec3 pos;
  vec3 axis;
  float angle;
  vec3 tiltAxis;
  float tilt;
  float roll;
  float scale;
  float bright;
  float alpha;
};

/*__MODE__*/

float circleOfConfusion(float depth) {
  float off = depth - uFocus;
  float k = off > 0.0 ? uFarBlur : 1.0;
  return clamp(max(abs(off) - uFocusRange, 0.0) * uBlurStrength * k, 0.0, 1.0);
}

void main() {
  vUv = uv;
  vGlyph = aData.x;
  float t = uTime;
  float hero = aSched.z;
  vec3 numberPos = vec3(aNumPos * uNumberEm, 0.0);
  vec3 titlePos = vec3(aTitlePos * uNumberEm, 0.0);
  float endFade = smoothstep(uDayLength - uCrossfade, uDayLength, t);

  vec3 pos = numberPos;
  vec3 axis = vec3(0.0, 0.0, 1.0);
  float angle = 0.0;
  vec3 tiltAxis = vec3(1.0, 0.0, 0.0);
  float tilt = 0.0;
  float roll = 0.0;
  float size = uNumberEm;
  float bright = 1.0;
  float alpha = 1.0;

  if (uStatic > 0.5) {
    // Reduced motion: nothing moves. Number → title halfway through assembly,
    // title → next day's number at midnight.
    float mid = 0.5 * (uDecay1 + uAssemble1);
    float xf = smoothstep(mid - 0.5 * uCrossfade, mid + 0.5 * uCrossfade, t);
    if (uStatic < 1.5) {
      alpha = 1.0 - xf;
    } else if (uStatic < 2.5) {
      pos = titlePos;
      alpha = xf * hero * (1.0 - endFade);
    } else {
      alpha = endFade;
    }
  } else {
    float release = mix(uDecay0, uDecay1, aSched.x);
    float arrive = mix(uDecay1, uAssemble1, aSched.y);
    float start = arrive - 60.0 * uApproach;
    bool returns = hero > 0.5 || uStack > 0.5;

    Flight f = flight(t, release);
    pos = f.pos;
    axis = f.axis;
    angle = f.angle;
    tiltAxis = f.tiltAxis;
    tilt = f.tilt;
    roll = f.roll;
    size = uNumberEm * f.scale;
    bright = f.bright;
    alpha = f.alpha;

    if (returns && t > start) {
      // Fly back: ease in from wherever it drifts, unwind to face the camera,
      // land at the original letter size on the focus plane.
      float prog = clamp((t - start) / max(arrive - start, 1e-3), 0.0, 1.0);
      float e = easeInOutPow(prog, uAssembleEase);
      Flight f0 = flight(start, release);
      vec3 arcDir = randUnit(aRandD.x, aRandD.y);
      pos = mix(f.pos, titlePos, e) + arcDir * (uAssembleArc * length(f0.pos - titlePos) * sin(PI * e));
      float k = 1.0 - e;
      angle = (wrapAngle(f0.angle) + (f.angle - f0.angle)) * k;
      tilt *= k;
      roll *= k;
      size = uNumberEm * mix(f.scale, 1.0, e);
      bright = mix(f.bright, 1.0, e);
      alpha = mix(f.alpha, 1.0, e);

      if (t >= arrive) {
        // Stacked copies melt into the identical letter already in the slot.
        if (hero < 0.5) alpha *= 1.0 - smoothstep(arrive, arrive + STACK_MERGE, t);
        // Resting title: a slow breath once the title is complete.
        float w = TAU / max(uBreathePeriod, 0.1);
        float ramp = smoothstep(uAssemble1, uAssemble1 + uBreathePeriod, t);
        float b = uBreathe * damp(w, 0.1) * ramp * sin(w * (t - uAssemble1) - TAU * uBreatheWave * aData.z);
        pos.xy *= 1.0 + b;
        size *= 1.0 + b;
      }
    } else if (!returns) {
      // "stay": left-over letters keep drifting as a dim background.
      alpha *= mix(1.0, uStayDim, smoothstep(uDecay1, uAssemble1, t));
    }
    alpha *= 1.0 - endFade;
  }

  if (alpha < 0.001) {
    // Invisible: collapse outside the clip volume so it costs no fragments.
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    vDepth = 0.0;
    vAlpha = 0.0;
    vBright = 0.0;
    return;
  }

  // Defocused letters swell a little, like a real circle of confusion.
  vec4 center = modelViewMatrix * vec4(pos, 1.0);
  float coc = circleOfConfusion(-center.z);
  vec3 local = position * size * (1.0 + uBokehGrow * coc);
  local = rotateAxis(local, vec3(0.0, 0.0, 1.0), roll);
  local = rotateAxis(local, tiltAxis, tilt);
  local = rotateAxis(local, axis, angle);

  vec4 mv = modelViewMatrix * vec4(pos + local, 1.0);
  vDepth = -mv.z;
  vAlpha = alpha;
  vBright = bright;
  gl_Position = projectionMatrix * mv;
}
