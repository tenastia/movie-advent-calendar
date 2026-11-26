// Mode 1 — Explosion, piece-by-piece decay.
// From its release time a letter trembles briefly, peels slowly off the
// surface, then eases from rest up and away through curl-noise turbulence,
// tumbling slowly and moving deeper until it joins the drifting field.
// No impulse anywhere: every phase starts and ends at rest.

uniform float uTrembleDuration;
uniform float uTrembleAmount;
uniform float uPeelDuration;
uniform float uPeelLift;
uniform float uPeelTilt;
uniform float uRiseAngle;
uniform float uRiseSpread;
uniform float uRiseHeight;
uniform float uDriftAway;
uniform float uTurbulence;
uniform float uTurbulenceScale;
uniform float uTumbleSpeed;

uniform float uFieldRadius;
uniform float uDepthSpread;
uniform float uFieldDepth;
uniform float uDrift;
uniform float uDriftPeriod;
uniform float uFlightScale;
uniform float uSizeJitter;
uniform float uBrightnessJitter;

// Divergence-free swirl: the curl of a few plane-wave potentials, ∇×(d·sin(k·p)) =
// cos(k·p)·(k×d). Cheap, smooth and shared by all letters, so neighbours swirl together.
vec3 curlNoise(vec3 p) {
  vec3 c = vec3(0.0);
  vec3 k;
  k = vec3(0.93, 0.41, -0.27);  c += cross(k, vec3(-0.30, 0.85, 0.43)) * cos(dot(k, p) + 1.3);
  k = vec3(-0.52, 1.21, 0.66);  c += cross(k, vec3(0.77, 0.12, -0.62)) * cos(dot(k, p) + 4.1);
  k = vec3(1.62, -0.88, 1.07);  c += 0.55 * cross(k, vec3(0.21, -0.58, 0.79)) * cos(dot(k, p) + 2.2);
  k = vec3(-1.95, -1.33, -0.71); c += 0.5 * cross(k, vec3(-0.66, 0.70, 0.27)) * cos(dot(k, p) + 5.7);
  k = vec3(2.71, 2.03, -2.36);  c += 0.3 * cross(k, vec3(0.48, 0.36, 0.80)) * cos(dot(k, p) + 0.6);
  return c * 0.5;
}

// The letter's place in the drifting field, around where it left the number.
vec3 fieldHome(vec3 numberPos) {
  vec3 dir = randUnit(aRandA.x, aRandA.y);
  vec3 p = numberPos + dir * (uFieldRadius * mix(0.4, 1.6, aRandA.z));
  p.z = p.z * uDepthSpread - uFieldDepth;
  return p;
}

// Slow bounded wander around that place.
vec3 wander(float t) {
  float w = TAU / max(uDriftPeriod, 1.0);
  vec3 ph = TAU * aRandC.xyz;
  vec3 s = vec3(
    sin(w * t + ph.x) + 0.5 * sin(1.71 * w * t + 2.0 * ph.y),
    sin(0.83 * w * t + ph.y) + 0.5 * sin(1.37 * w * t + 3.0 * ph.z),
    sin(0.91 * w * t + ph.z) + 0.5 * sin(1.53 * w * t + 1.7 * ph.x)
  );
  return s * (uDrift * damp(1.71 * w, 0.1) / 1.5);
}

Flight flight(float t, float release) {
  Flight f;
  vec3 numberPos = vec3(aNumPos * uNumberEm, 0.0);
  float em = uNumberEm;
  float tau = t - release;

  float trem = max(uTrembleDuration, 1e-3);
  float peel = max(uPeelDuration, 1e-3);
  float driftStart = trem + 0.5 * peel; // the drift eases in while the peel finishes

  // 1. Tremble: a short shiver that builds, then hands over to the peel.
  float shake = smoothstep(0.0, trem, tau) * (1.0 - smoothstep(trem, driftStart, tau));
  shake *= uTrembleAmount * damp(83.0, 2.0);
  float ph = TAU * aRandB.z;
  vec3 jitter = vec3(
    sin(47.0 * tau + ph) + 0.5 * sin(83.0 * tau + 2.0 * ph),
    sin(59.0 * tau + 1.7 * ph) + 0.5 * sin(71.0 * tau + 3.1 * ph),
    0.0
  ) * (shake * em / 1.5);
  f.roll = 1.5 * shake * sin(53.0 * tau + 2.3 * ph);

  // 2. Peel: a slow lift off the surface toward the camera, curling like a flake.
  float lift = smoothstep(trem, trem + peel, tau);
  float ra = radians(uRiseAngle + uRiseSpread * (2.0 * aRandC.w - 1.0));
  vec2 rise = vec2(sin(ra), cos(ra));
  vec3 p0 = numberPos + jitter + vec3(rise * 0.25, 1.0) * (lift * uPeelLift * em);
  f.tiltAxis = vec3(cos(ph), sin(ph), 0.0);
  f.tilt = radians(uPeelTilt) * lift * (0.6 + 0.8 * fract(aRandB.w * 7.13));

  // 3. Drift: from rest, up and away (and deeper), into the field.
  float u = clamp((tau - driftStart) / max(uDriftAway, 1e-3), 0.0, 1.0);
  float e = u * u * (3.0 - 2.0 * u);
  vec3 p1 = p0 + vec3(rise * uRiseHeight, -0.35 * uRiseHeight);
  vec3 p2 = fieldHome(numberPos) + wander(t);
  vec3 b = mix(mix(p0, p1, e), mix(p1, p2, e), e);
  f.pos = b + curlNoise(b * uTurbulenceScale) * (uTurbulence * smoothstep(0.0, 0.6, u));

  // Slow 3D tumble that spins up from rest once the drift begins.
  f.axis = randUnit(aRandB.x, aRandB.y);
  float w = uTumbleSpeed * (0.5 + aRandB.w);
  w *= damp(w, 0.1);
  float s = max(tau - driftStart, 0.0);
  float ramp = max(0.5 * uDriftAway, 1.0);
  f.angle = w * (s - ramp * (1.0 - exp(-s / ramp)));

  f.scale = max(0.05, 1.0 + e * (uFlightScale + uSizeJitter * (2.0 * aRandD.w - 1.0)));
  f.bright = 1.0 - e * uBrightnessJitter * aRandD.z;
  f.alpha = 1.0;
  return f;
}
