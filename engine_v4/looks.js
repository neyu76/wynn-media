// looks.js — v8 lighting/colour presets (docs/STYLE_V8.md §5), tuned on PINK15 v4 against the two v8 samples.
// Rule: strong warm sun + practical lamps make the contrast; the fill (hemi) stays HIGH (samples are bright, median luma ≈ 165,
// dark only in ceilings/corners); haze (fog) gives depth in big spaces; ONE saturated accent colour per episode.
//   import { applyLook, LOOKS } from './looks.js';
//   function lightC() { applyLook('cellTeal', { target: [0.4, 0.2, -0.3], dir: [0.9, 3.0, -1.25], span: 3.2 }); }
import { THREE, scene, hemi, sun, sky, placeSun } from './core.js';

export const LOOKS = {
  // small interior with one barred window (PINK15 teal cell): deep teal, warm sun shaft, dark-ish ceiling
  cellTeal:  { bg: 0x101418, fog: [0x6a7a86, 4, 22], sun: [0xffecd2, 6.5], hemi: [0xa8c8d4, 0x56626c, 2.0] },
  // the same room painted in the accent colour (pink bounce light)
  cellAccent: { bg: 0x101418, fog: [0x8a6c7a, 4, 22], sun: [0xffecd2, 6.5], hemi: [0xf0b0d0, 0x7a5262, 1.9] },
  // workshop/office interior, neutral cream walls
  workshop:  { bg: 0x1a1a1a, fog: [0x8e8c86, 5, 26], sun: [0xffecd0, 6.0], hemi: [0xd2dce2, 0x7a7670, 2.4] },
  // big hall / atrium (two tiers, pendants): light hazy blue, fog for depth
  hallHaze:  { bg: 0x1e2630, fog: [0xc8d8e6, 3, 20], sun: [0xfff0dc, 5.5], hemi: [0xc8dcec, 0x7a8a9a, 2.0] },
  // outdoor desert/canyon day (railroad sample): saturated warm ground, blue sky, long haze to the horizon
  desertDay: { bg: null, fog: [0xd9c2b0, 30, 260], sun: [0xfff2dc, 4.2], hemi: [0xbcd6f0, 0xb0704a, 1.6], sky: true },
  // golden hour finale (railroad sample ending): low orange sun, pink-violet haze
  goldenHour: { bg: null, fog: [0xe8b090, 20, 200], sun: [0xffc890, 4.6], hemi: [0xf0c0d0, 0x6a4060, 1.3], sky: true },
};

// apply a preset; sunAt = { target, dir, span, far } in world coords (dir = offset from target to the sun, so light travels −dir)
export function applyLook(name, sunAt, over = {}) { const L = { ...LOOKS[name], ...over };
  sky.visible = !!L.sky; scene.background = L.bg == null ? null : new THREE.Color(L.bg);
  scene.fog.color.set(L.fog[0]); scene.fog.near = L.fog[1]; scene.fog.far = L.fog[2];
  if (sunAt) placeSun(sunAt.target, sunAt.dir, sunAt.span || 6, sunAt.far || 30);
  sun.color.set(L.sun[0]); sun.intensity = L.sun[1];
  hemi.color.set(L.hemi[0]); hemi.groundColor.set(L.hemi[1]); hemi.intensity = L.hemi[2];
  return L; }

// v8 grade (set in the episode core.js gradeE): HueSaturation ≥ 0.0 — PINK15 v4 used 0.0 and measured saturation 69 while the
// samples are 96–128, so start new episodes at +0.15…+0.25 and check with vidclone qa; Brightness 0.14 /
// Contrast 0.1, Vignette offset 0.35 darkness 0.48, Bloom 0.32 on lamps. Characters: material.emissiveIntensity = 0.38 so they
// take the scene light but stay readable.
export const V8_CHAR_GLOW = 0.38;
