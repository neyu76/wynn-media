import { THREE, scene, camera, renderer, WIDTH, HEIGHT, hemi, sun, sky, setCam, setKicks, step, ss, clamp, lerp, blinkLid, pop, renderPost, POST, TEXLOAD, R, setSeed } from './core.js';
import { A, O, ac, oc, mach, setMachine, eyeAim, slotW, POOL, poseTicket, scrap, setRule, RULE_C, aKey, oKey, oLight, setPile, pileTop, MC, DESK } from './town.js';

// RC01-T005 "The Town That Fined Its Own Ticket Printer" (48.0 s, fiction): voice starts 0.10 s; all times are video time (align.json + 0.10)
export const DURATION = 48.0;
const SETS = [A.g, O.g];
function show(g) { SETS.forEach(s => s.visible = s === g); }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const K = (ox, keys) => keys.map(k => [k[0], k[1] + ox, k[2], k[3], k[4] + ox, k[5], k[6], k[7], k[8] || 0]); // every key = [t, pos, look, fov, roll°]
const _c1 = new THREE.Color(), _c2 = new THREE.Color();
const mixC = (a, b, k) => _c1.set(a).lerp(_c2.set(b), k).getHex();
// impact kicks (flip every frame, 7 f): machine lands, FINE stamp on the rule, pile dumped on the desk, plate laid on top
setKicks([[11.42, 1.0], [7.25, 0.35], [39.7, 0.7], [41.36, 0.3]]);

// ---------------------------------------------------------------- light
function lightA(warm = 0, k = 1) { sky.visible = false; sun.intensity = 0; scene.background = new THREE.Color(0xbcd6ee); scene.fog.color.set(0xd8e2ea); scene.fog.near = 30; scene.fog.far = 120;
  hemi.color.set(mixC(0xe6f0ff, 0xffe2c4, warm)); hemi.groundColor.set(0x9c8a72); hemi.intensity = 0.85 * k; aKey.color.set(mixC(0xfff1d6, 0xffc890, warm)); aKey.intensity = 2.0 * k;
  return { col: warm > 0.5 ? '#ffc070' : '#ffffff', side: -1, a: 0.55 }; }
function lightO(tense = 0) { sky.visible = false; sun.intensity = 0; scene.background = new THREE.Color(0x2a1d14); scene.fog.color.set(0x2a1d14); scene.fog.near = 30; scene.fog.far = 80;
  hemi.color.set(mixC(0xfff0dc, 0xf0d8ff, tense)); hemi.groundColor.set(0x5a4030); hemi.intensity = 0.7; oKey.color.set(mixC(0xffe2b8, 0xffd0a0, tense)); oKey.intensity = 1.5; oLight.intensity = 3.5;
  return { col: '#ffd59a', side: -1, a: 0.6 }; }

// ---------------------------------------------------------------- characters (blinks every 0.5–2.3 s, 4-frame half/shut/shut/half)
function chars(C, t, m, c, rim) {
  if (m) { C.mayor.mesh.visible = true; C.mayor.at(...m.pos, m.s || 1); C.mayor.face(camera);
    C.mayor.set({ expr: m.expr || 'neutral', look: m.look || [0.5, -0.2], blink: m.noBlink ? 0 : blinkLid(t, 3), arms: m.arms || { l: [-0.3, 0.9], r: [0.3, 0.9] }, open: m.open || {}, fx: m.fx || {}, items: m.items || {}, bob: m.bob || 0, lean: m.lean || 0, walk: m.walk || 0, rim }, t); }
  else C.mayor.mesh.visible = false;
  if (c) { C.cleaner.mesh.visible = true; C.cleaner.at(...c.pos, c.s || 1); C.cleaner.face(camera);
    C.cleaner.set({ expr: c.expr || 'neutral', look: c.look || [-0.5, -0.2], blink: c.noBlink ? 0 : blinkLid(t, 8), arms: c.arms || { l: [-0.27, 0.9], r: [0.27, 0.9] }, open: c.open || {}, fx: c.fx || {}, items: c.items || {}, bob: c.bob || 0, lean: c.lean || 0, walk: c.walk || 0, rim }, t); }
  else C.cleaner.mesh.visible = false;
}

// ---------------------------------------------------------------- ticket schedules
// street (10–39 s): first fine, the second, then the loop speeds up (time compression) and paper spreads into the street
setSeed(777);
const TICKS = [];
TICKS.push({ te: 15.13, fl: 1.95, land: [0.55, 0.3], yaw: 0.4 });            // "printed a fine … fluttered straight onto the pavement" (lands 17.38)
TICKS.push({ te: 20.69, fl: 0.85, land: [0.1, 0.42], yaw: -0.7 });           // "Another fine. Another piece of paper." (lands 21.84)
{ let x = 0.3, z = 0.45, t = 23.35, i = 0;
  while (t < 35.9) { const fast = t < 28.1; const ang = R(-1.2, 2.2), d = R(0.12, 0.26); x = clamp(x + Math.cos(ang) * d, -0.9, 2.4); z = clamp(z + Math.abs(Math.sin(ang)) * d * 0.7, 0.15, 1.9);
    const street = z > 0.62; TICKS.push({ te: t, fl: fast ? 0.62 : 0.8, land: [x, z, street ? -0.084 : 0], yaw: R(-3, 3) }); t += fast ? 0.21 : 0.42; i++; } }
// the cleaner picks two tickets; each pick is followed by a fresh one landing beside his hand ("already earned a companion")
const PICKS = [[25.9, 1.05, 0.95], [26.55, 0.8, 0.9]];
PICKS.forEach(([tp, x, z], j) => { TICKS.push({ te: tp - 1.4, fl: 0.9, land: [x, z, -0.084], yaw: 0.5 + j, pick: tp }); TICKS.push({ te: tp - 0.05, fl: 0.62, land: [x + 0.12, z + 0.05, -0.084], yaw: -0.6 - j }); });
const GATHER = 36.9;
TICKS.forEach((tk, i) => { if (tk.pick === undefined) tk.gather = GATHER + (i % 23) * 0.012; });
const HOOK = [{ te: -0.05, fl: 2.1, land: [0.58, 0.32], yaw: 0.5 }, { te: 2.75, fl: 1.2, land: [0.2, 0.4], yaw: -0.4 }];
const landT = tk => tk.te + 0.3 + tk.fl;
// countdown digit and eye target for the loop
const COUNTS = [[13.95, 3], [14.22, 2], [14.5, 1], [15.13, 0], [18.02, 3], [18.29, 2], [18.59, 1], [18.95, 0], [22.77, 3], [22.98, 2], [23.18, 1], [23.35, 0]];
function digitAt(t, on) { if (!on) return 0; if (t >= 23.35 && t < 35.96) return 3 - (Math.floor((t - 23.35) / (t < 28.1 ? 0.07 : 0.14)) % 3); return step([[0, 0], ...COUNTS], t); }

// ---------------------------------------------------------------- S1 hook 0–3.25: "In this made-up town, the ticket machine fined its own tickets."
const CAM_HOOK = K(0, [[0.0, 0.52, 1.1, 0.95, 0.36, 1.0, -0.1, 38], [1.1, 0.7, 1.0, 1.4, 0.42, 0.75, 0.0, 42], [2.25, 1.0, 1.05, 1.95, 0.45, 0.62, 0.05, 46], [3.35, 1.02, 1.1, 2.1, 0.42, 0.65, 0.0, 46]]); // ends wide enough for eye + ticket
function segHook(t) { setCam(CAM_HOOK, t); show(A.g); const rim = lightA(0);
  const [ep, ey] = t < 1.9 ? eyeAim(V(0.5, 0.8, 0.4)) : eyeAim(V(0.58, 0.09, 0.32));
  setMachine({ on: 1, digit: t > 1.95 && t < 2.6 ? (t < 2.17 ? 3 : t < 2.37 ? 2 : 1) : 0, eyeP: ep, eyeY: ey, red: t > 2.37 && t < 2.75 ? 1 : 0 });
  POOL.forEach(m => m.visible = false); HOOK.forEach((tk, i) => poseTicket(POOL[i], t, tk)); scrap.visible = false; setRule([0, 0, 0, 0, 0]);
  chars(ac, t, null, null, rim); }

// ---------------------------------------------------------------- S2–S6 street 3.25–39.0 (one continuous camera path)
const CAM_ST = K(0, [
  [3.1, -0.2, 1.5, 3.2, -0.7, 1.4, -0.4, 46], [4.4, -0.55, 1.55, 2.4, -0.85, 1.48, -0.45, 44], [5.35, -0.92, 1.62, 1.66, -1.05, 1.62, -0.55, 44, 1.5],
  [7.0, -0.94, 1.62, 1.56, -1.05, 1.6, -0.55, 43, 1.5], [8.1, -0.88, 1.56, 1.76, -1.02, 1.5, -0.55, 44, 0], [9.4, -0.3, 1.5, 2.4, -0.6, 1.35, -0.3, 44],
  [10.4, 0.2, 1.6, 3.2, -0.1, 1.15, -0.3, 46], [11.3, 0.45, 1.65, 3.5, 0.2, 1.05, -0.3, 47], [12.4, 0.55, 1.35, 2.4, 0.3, 1.0, -0.25, 44],
  // 13.3: eye + scrap in one frame; 13–23 s: the fov narrows while following the paper (reads as push-in, not a plain tilt)
  [13.3, 0.95, 0.95, 1.75, 0.5, 0.58, 0.05, 46], [14.35, 0.58, 0.98, 1.25, 0.36, 0.86, -0.08, 37], [15.3, 0.48, 1.06, 1.05, 0.36, 1.0, -0.1, 33],
  [16.4, 0.62, 0.82, 1.4, 0.46, 0.46, 0.1, 40], [17.5, 0.75, 0.56, 1.5, 0.52, 0.16, 0.25, 36], [18.5, 0.62, 0.78, 1.35, 0.42, 0.66, -0.04, 34],
  [19.55, 1.15, 1.45, 1.9, 0.45, 0.62, 0.05, 48, -2], [20.8, 0.5, 1.06, 1.1, 0.36, 1.0, -0.1, 33], [22.0, 0.75, 0.72, 1.6, 0.35, 0.25, 0.3, 40],
  [23.0, 0.95, 1.2, 2.4, 0.5, 0.7, 0.2, 44], [24.5, 1.7, 1.9, 4.0, 0.8, 0.55, 0.45, 50], [26.0, 1.9, 1.45, 3.4, 1.0, 0.8, 0.55, 48, 2],
  [27.4, 1.65, 1.35, 3.0, 0.9, 0.7, 0.55, 46], [28.6, 0.35, 2.0, 4.3, 0.15, 0.75, 0.2, 50], [29.7, 0.65, 1.6, 3.3, 0.6, 1.05, 0.3, 46],
  // 30.65 → 31.5: follow the cleaner's finger to line 2 of the rule
  [30.65, 1.45, 1.55, 2.4, 0.9, 1.25, 0.6, 46], [31.5, -0.92, 1.62, 1.66, -1.05, 1.62, -0.55, 44, 2], [32.7, 1.25, 1.0, 2.0, 0.6, 0.55, -0.05, 46], [33.9, 0.55, 0.32, 0.9, 0.37, 0.16, -0.02, 40],
  [35.0, 0.41, 0.2, 0.62, 0.35, 0.15, -0.01, 36], [35.95, 0.58, 1.0, 1.2, 0.45, 0.86, -0.1, 40], [36.95, 1.25, 1.6, 3.2, 0.75, 0.72, 0.4, 48, -1.5],
  [38.0, 0.5, 1.62, 3.6, 0.0, 1.0, -0.5, 48], [39.1, -0.2, 1.72, 3.4, -0.6, 1.2, -1.2, 48]]);
const MAYOR_A = [-0.42, 0, 0.02];
// cleaner path on the street: [t, x, z, crouch]
const CL_PATH = [[23.9, 3.3, 0.95, 0], [24.95, 1.25, 0.85, 0], [25.6, 1.15, 0.85, 0], [26.3, 0.95, 0.82, 0], [28.2, 1.0, 0.8, 0], [31.7, 1.0, 0.8, 0], [32.55, 0.8, 0.12, 1], [35.45, 0.8, 0.12, 1], [35.8, 0.82, 0.14, 0], [37.8, 0.82, 0.3, 0], [39.1, -0.6, -1.0, 0]];
function clAt(t) { let i = 0; while (i < CL_PATH.length - 2 && t > CL_PATH[i + 1][0]) i++; const a = CL_PATH[i], b = CL_PATH[i + 1]; const k = ss(a[0], b[0], t);
  return { x: lerp(a[1], b[1], k), z: lerp(a[2], b[2], k), c: lerp(a[3], b[3], k), moving: t > a[0] && t < b[0] && Math.hypot(b[1] - a[1], b[2] - a[2]) > 0.1 }; }
const carryPt = t => { const c = clAt(t); return V(c.x, 1.05, c.z + 0.1); };
TICKS.forEach(tk => { if (tk.gather !== undefined) tk.carry = carryPt; });
function segStreet(t) { setCam(CAM_ST, t); show(A.g); const rim = lightA(0);
  // machine: drops from the sky on "installed" (bounce), watches the paper, counts down, prints
  const drop = t < 11.3 ? 3 : (t < 11.42 ? 3 * (1 - ((t - 11.3) / 0.12) ** 2) : Math.max(0, Math.sin((t - 11.42) * 18) * 0.05 * Math.exp(-(t - 11.42) * 8)));
  const on = t < 36.3 ? 1 : 0;
  let target = V(0.6, 0.6, 1.5);
  if (t > 13.05 && t < 15.13) target = scrap.position.clone();
  else if (t >= 15.13 && t < 19.3) target = V(0.55, 0.09, 0.3);
  else if (t >= 19.3 && t < 23.35) target = t < 21.9 ? V(0.55, 0.09, 0.3) : V(0.1, 0.09, 0.42);
  else if (t >= 23.35 && t < 36.0) { const lt = TICKS.filter(k => landT(k) <= t && (k.pick === undefined || t < k.pick)).pop(); if (lt) target = V(lt.land[0], 0.05, lt.land[1]); }
  let [ep, ey] = eyeAim(target); if (!on) { ep = 0.55 * ss(36.3, 36.9, t) + ep * (1 - ss(36.3, 36.9, t)); }
  const printing = TICKS.some(k => t >= k.te && t < k.te + 0.35);
  setMachine({ on, digit: digitAt(t, on), eyeP: ep, eyeY: ey, red: on && (printing || (t > 20.55 && t < 20.72)) ? 1 : 0, plate: t < 36.55, drop });
  // paper
  POOL.forEach(m => m.visible = false); TICKS.forEach((tk, i) => poseTicket(POOL[i], t, tk));
  scrap.visible = t > 12.75 && t < GATHER + 0.4; if (scrap.visible) { const k = ss(12.75, 13.1, t), g = ss(GATHER, GATHER + 0.4, t); scrap.position.set(lerp(-0.3, 0.68, k), 0.12 + Math.abs(Math.sin(k * 9)) * 0.06 * (1 - k), lerp(0.4, 0.22, k)); scrap.rotation.set(k * 8, k * 5, 0); if (g > 0) scrap.position.lerp(carryPt(t), g); }
  // rule sign: title on "rule", line 1 on "leave paper", ticks on "three seconds", FINE stamp on "fine", line 2 on "if a machine"; highlighted when the cleaner points at it
  setRule([ss(4.4, 4.6, t), ss(4.92, 5.15, t), t < 6.0 ? 0 : (t < 6.2 ? 1 : t < 6.42 ? 2 : 3), ss(7.78, 8.0, t), clamp((t - 7.2) / 0.22)], ss(30.9, 31.15, t) * (1 - ss(33.3, 33.6, t)));
  // mayor
  const mExpr = step([[0, 'neutral'], [4.4, 'smug'], [7.2, 'stare'], [9.25, 'grin'], [10.2, 'greedy'], [11.42, 'grin'], [13.05, 'stare'], [17.33, 'shock'], [18.0, 'worried'], [21.8, 'shock'], [23.9, 'worried'],
    [28.45, 'angry'], [31.3, 'worried'], [34.9, 'shock'], [35.95, 'ashamed']], t);
  const mPoint = t > 4.35 && t < 4.95 ? { l: [-0.55, 1.45], r: [0.3, 0.9] } : t > 7.15 && t < 7.6 ? { l: [-0.58, 1.55], r: [0.3, 0.9] } : t > 12.2 && t < 13.0 ? { l: [-0.3, 0.9], r: [0.55, 1.1] }
    : t > 10.2 && t < 11.3 ? { l: [-0.06, 1.0], r: [0.06, 1.02] } : t > 28.45 && t < 29.4 ? { l: [-0.3, 0.9], r: [0.6, 0.95] } : t > 29.4 && t < 30.5 ? { l: [-0.3, 0.9], r: [0.62, 1.25] } : null;
  const mOpen = t > 12.2 && t < 13.0;
  const back = ss(30.25, 30.75, t), mPos = [lerp(MAYOR_A[0], -0.2, back), 0, lerp(MAYOR_A[2], -1.25, back)]; // backs away when the cleaner points at the rule (and out of the pan to the sign)
  chars(ac, t, { pos: mPos, walk: t > 30.25 && t < 30.75 ? (t * 2.6) % 1 : 0, expr: mExpr, look: t > 28.45 && t < 30.5 ? [1, -0.1] : (t > 13.05 ? [0.8, -0.6] : [-0.7, 0.4]), arms: mPoint || { l: [-0.3, 0.9], r: [0.3, 0.9] }, open: { r: mOpen }, bob: t > 9.25 && t < 9.9 ? Math.abs(Math.sin(t * 14)) * 0.012 : 0,
      fx: { sweat: t > 21.8 && t < 28.4 ? 1 : (t > 34.9 ? 2 : 0), sparkle: t > 11.42 && t < 12.6 ? 1 : 0 } },
    t < 23.9 ? null : clChar(t), rim);
}
function clChar(t) { const c = clAt(t), y = -0.36 * c.c;
  const reach = PICKS.find(([tp]) => t > tp - 0.35 && t < tp + 0.15); const holding = PICKS.some(([tp]) => t >= tp && t < tp + 0.5);
  const expr = step([[0, 'worried'], [25.85, 'grin'], [26.0, 'shock'], [26.5, 'grin'], [26.6, 'shock'], [27.3, 'worried'], [29.4, 'shock'], [30.5, 'stare'], [32.0, 'squint'], [34.9, 'smug'], [35.9, 'stare'], [36.9, 'grin'], [37.8, 'smug']], t);
  let arms = { l: [-0.27, 0.9], r: [0.27, 0.9] }, open = {}, items = {};
  if (t < 32.3 && !(t > 30.9 && t < 31.75)) items.broom = { hand: 'r', ang: c.moving ? 18 : 6 };
  if (reach || holding) arms = { l: [-0.42, holding ? 1.05 : 0.45], r: [0.27, 0.9] }, open = { l: !holding };
  if (holding) items.ticket = { hand: 'l', ang: 12 };
  if (t > 30.9 && t < 31.75) arms = { l: [-0.62, 1.72], r: [0.27, 0.9] }, open = { l: true };
  if (t > 33.4 && t < 35.5) arms = { l: [-0.42, 0.62], r: [0.27, 0.9] }, open = { l: true };
  if (t > 35.8 && t < 36.4) arms = { l: [-0.5, 0.88], r: [0.27, 0.9] };
  if (t > 36.4 && t < 36.8) arms = { l: [-0.45, 0.62], r: [0.27, 0.9] }, items.plate = { hand: 'l', ang: -8 };
  if (t >= 36.8) { const n = ss(GATHER, GATHER + 0.5, t); arms = { l: [-0.34, 1.02], r: [0.34, 1.02] }; open = { l: true, r: true }; items.pile = { hand: 'r', ox: -0.17, oy: -0.18, n: 0.3 + 0.7 * n }; }
  return { pos: [c.x, y, c.z], expr, look: t > 30.9 && t < 31.75 ? [-1, 0.5] : (t > 32.3 && t < 35.5 ? [-0.6, -1] : [-0.6, -0.4]), arms, open, items, walk: c.moving ? (t * 2.6) % 1 : 0, bob: c.moving ? Math.abs(Math.sin(t * 16)) * 0.012 : 0,
    fx: { sweat: t > 24.9 && t < 28.2 ? 2 : (t > 29.4 && t < 30.6 ? 1 : 0), bulb: ss(34.85, 35.0, t) * (1 - ss(35.6, 35.75, t)), sparkle: t > 37.1 && t < 38.2 ? 1 : 0 } };
}

// ---------------------------------------------------------------- O1 office 39.0–42.1: pile dumped on the desk, plate laid on top
const MAYOR_O = [-0.05, 0, DESK.z - 0.45];
const CAM_O1 = K(300, [[38.8, 1.0, 1.42, 3.1, 0.35, 1.1, -0.6, 46], [39.85, 0.55, 1.5, 2.45, 0.12, 1.12, -0.5, 44], [40.85, 0.5, 1.55, 1.95, 0.25, 1.15, -0.4, 44], [41.7, 0.45, 1.52, 1.75, 0.2, 1.13, -0.4, 42], [42.3, 0.43, 1.5, 1.68, 0.2, 1.12, -0.4, 41]]);
function segO1(t) { setCam(CAM_O1, t); show(O.g); const rim = lightO(0);
  // the plate stays in the cleaner's hand until it touches the top of the pile (41.34), then the 3D plate takes over
  setPile(ss(39.62, 39.9, t), 0, t < 41.34 ? 0 : 1);
  const cx = lerp(1.6, 0.85, ss(38.9, 39.55, t)) - 0.25 * ss(40.1, 40.5, t), walking = t < 39.55 || (t > 40.1 && t < 40.5);
  const arms = t < 39.62 ? { l: [-0.34, 1.02], r: [0.34, 1.02] } : (t > 40.14 && t < 41.36 ? { l: [-0.27, 0.9], r: [-0.48, lerp(1.3, 1.08, ss(40.64, 41.34, t))] } : { l: [-0.27, 0.9], r: [0.27, 0.9] });
  const items = t < 39.62 ? { pile: { hand: 'r', ox: -0.17, oy: -0.18, n: 1 } } : (t > 40.14 && t < 41.34 ? { plate: { hand: 'r', ang: 10 } } : {});
  chars(oc, t, { pos: MAYOR_O, expr: step([[0, 'smug'], [39.6, 'shock'], [40.6, 'worried'], [41.3, 'shock']], t), look: [0.6, -0.3], fx: { sweat: t > 39.65 ? 2 : 0 }, arms: t > 39.65 && t < 40.4 ? { l: [-0.45, 1.5], r: [0.45, 1.5] } : undefined, open: { l: t > 39.65 && t < 40.4, r: t > 39.65 && t < 40.4 } },
    { pos: [cx, 0, -0.05], expr: step([[0, 'smug'], [39.62, 'grin'], [40.2, 'stare'], [41.34, 'smug']], t), look: [-0.9, -0.3], arms, open: { l: t < 39.62, r: t < 39.62 }, items, walk: walking ? (t * 2.6) % 1 : 0, bob: walking ? Math.abs(Math.sin(t * 16)) * 0.012 : 0 }, rim); }
// ---------------------------------------------------------------- A2 clean street 42.1–43.85: "The street was finally clean."
const CAM_CLEAN = K(0, [[41.9, 0.05, 1.3, 4.8, 0.0, 1.5, -3.0, 50], [43.0, 0.06, 1.38, 4.0, 0.0, 1.55, -3.0, 47], [44.0, 0.07, 1.44, 3.5, 0.0, 1.6, -3.0, 45]]); // slow push toward the town hall
function segClean(t) { setCam(CAM_CLEAN, t); show(A.g); const rim = lightA(0.6);
  setMachine({ on: 0, digit: 0, eyeP: 0.55, eyeY: 0, red: 0, plate: false }); POOL.forEach(m => m.visible = false); scrap.visible = false; setRule([1, 1, 3, 1, 1]);
  chars(ac, t, null, null, rim); }
// ---------------------------------------------------------------- O2 payoff 43.85–48.0: "The mayor's desk had disappeared. Please fine the owner."
const CAM_O2 = K(300, [[43.7, 0.3, 1.42, 2.85, 0.0, 1.2, -0.5, 46], [44.9, 0.45, 1.47, 2.6, 0.25, 1.3, -0.5, 46], [46.5, 0.5, 1.5, 2.25, 0.3, 1.33, -0.5, 45], [48.2, 0.52, 1.5, 2.1, 0.3, 1.33, -0.5, 44]]);
function segO2(t) { setCam(CAM_O2, t); show(O.g); const rim = lightO(0.3);
  setPile(1, ss(43.9, 44.8, t), 1);
  const hand = t > 45.5;
  chars(oc, t, { pos: [MAYOR_O[0], lerp(0, -0.22, ss(44.2, 44.8, t)), MAYOR_O[2]], expr: step([[0, 'worried'], [44.7, 'shock'], [45.9, 'ashamed']], t), look: t > 45.9 ? [0.4, -1] : [0.5, -0.2], fx: { sweat: 2, shame: ss(45.95, 46.2, t) } },
    { pos: [0.82, 0, 0.05], expr: step([[0, 'smug'], [46.35, 'wink']], t), look: [-0.9, -0.2], arms: hand ? { l: [-0.42, lerp(0.85, 1.02, ss(45.5, 45.85, t))], r: [0.27, 0.9] } : undefined, open: {}, items: hand ? { ticket: { hand: 'l', ang: 8 } } : {}, fx: { sparkle: t > 46.4 ? 1 : 0 } }, rim); }

// ---------------------------------------------------------------- edit
const SEGS = [{ t0: 0, t1: 3.25, f: segHook }, { t0: 3.25, t1: 38.95, f: segStreet }, { t0: 38.95, t1: 42.1, f: segO1 }, { t0: 42.1, t1: 43.85, f: segClean }, { t0: 43.85, t1: DURATION, f: segO2 }];
const TRANS = { 3.25: 'dissolve', 38.95: 'dissolve', 42.1: 'dissolve', 43.85: 'dissolve' };
export const EDIT = { SEGS, TRANS };
const segAt = t => { for (let i = 0; i < SEGS.length; i++) if (t < SEGS[i].t1) return i; return SEGS.length - 1; };
const HALF = 3.5 / 30;
const acc = document.createElement('canvas'); acc.width = WIDTH; acc.height = HEIGHT; const actx = acc.getContext('2d'); actx.imageSmoothingQuality = 'high';
const tmp = document.createElement('canvas'); tmp.width = WIDTH; tmp.height = HEIGHT; const tctx = tmp.getContext('2d'); tctx.imageSmoothingQuality = 'high';
function renderSeg(i, t) { POST.focus = null; SEGS[i].f(t); renderPost(); }
function camState() { return [camera.position.clone(), new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion), camera.fov]; }
function blurPx(i, t) { const dt = 0.5 / 30; SEGS[i].f(t); const [p0, d0] = camState(); SEGS[i].f(t + dt); const [p1, d1] = camState(); const ang = d0.angleTo(d1); const lin = p0.distanceTo(p1) / 1.5; return (ang + lin) / (camera.fov * Math.PI / 180) * HEIGHT; }
function drawSeg(ctx, i, t, maxSub) { const bp = blurPx(i, t); const n = bp < 4 ? 1 : Math.max(2, Math.min(maxSub, Math.ceil(bp / 3))); ctx.clearRect(0, 0, WIDTH, HEIGHT); const mid = Math.floor((n - 1) / 2);
  const order = [mid, ...[...Array(n).keys()].filter(k => k !== mid)];
  order.forEach((k, j) => { const ts = t + (n > 1 ? (k / (n - 1) - 0.5) * 0.5 / 30 : 0);
    if (k === mid) { POST.lib = true; POST.on = true; POST.ao = true; renderSeg(i, ts); ctx.globalAlpha = 1 / (j + 1); ctx.drawImage(renderer.domElement, 0, 0, WIDTH, HEIGHT); return; }
    renderer.setSize(WIDTH / 2, HEIGHT / 2, false); POST.lib = false; POST.on = false; renderSeg(i, ts);
    sctx.globalCompositeOperation = 'source-over'; sctx.filter = GRADE_CSS; sctx.drawImage(renderer.domElement, 0, 0, WIDTH, HEIGHT); sctx.filter = 'none';
    sctx.globalCompositeOperation = 'multiply'; sctx.drawImage(VIG, 0, 0); sctx.globalCompositeOperation = 'source-over';
    renderer.setSize(WIDTH, HEIGHT, false); ctx.globalAlpha = 1 / (j + 1); ctx.drawImage(subc, 0, 0); });
  POST.lib = true; POST.on = true; ctx.globalAlpha = 1; return n; }
const GRADE_CSS = 'saturate(1.08) contrast(1.08) brightness(1.0)';
const subc = document.createElement('canvas'); subc.width = WIDTH; subc.height = HEIGHT; const sctx = subc.getContext('2d'); sctx.imageSmoothingQuality = 'high';
const VIG = document.createElement('canvas'); VIG.width = WIDTH; VIG.height = HEIGHT; { const g = VIG.getContext('2d'); const gr = g.createRadialGradient(WIDTH / 2, HEIGHT / 2, HEIGHT * 0.4, WIDTH / 2, HEIGHT / 2, HEIGHT * 0.75); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#d4d4d4'); g.fillStyle = gr; g.fillRect(0, 0, WIDTH, HEIGHT); }
// claim gate C03: a small FICTION label from frame 0 (top-left, clear of the caption band), fades out by 3.2 s
function fictionTag(ctx, t) { const a = 1 - ss(2.7, 3.2, t); if (a <= 0) return; const s = WIDTH / 1080; ctx.save(); ctx.globalAlpha = a; ctx.font = `bold ${30 * s}px "DejaVu Sans", sans-serif`; const txt = 'FICTION · ORIGINAL STORY', w = ctx.measureText(txt).width + 36 * s;
  ctx.fillStyle = 'rgba(20,22,34,0.72)'; ctx.beginPath(); ctx.roundRect(40 * s, 120 * s, w, 54 * s, 12 * s); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 58 * s, 148 * s); ctx.restore(); }
window.renderAt = (t, maxSub = 5) => {
  let i = segAt(t), sub = 1, done = false;
  for (const [bs, type] of Object.entries(TRANS)) { const b = +bs; const j = SEGS.findIndex(s => Math.abs(s.t0 - b) < 1e-6);
    if (type === 'dissolve' && t >= b - HALF && t < b + HALF) { const k = ss(b - HALF, b + HALF, t); drawSeg(actx, j - 1, t, maxSub); drawSeg(tctx, j, t, maxSub); actx.globalAlpha = k; actx.drawImage(tmp, 0, 0); actx.globalAlpha = 1; done = true; }
    if (done) break; }
  if (!done) sub = drawSeg(actx, i, t, maxSub);
  fictionTag(actx, t);
  return { url: acc.toDataURL('image/jpeg', 0.97), sub, seg: i };
};
Promise.all(TEXLOAD).then(() => { window.READY = true; });
window.camAt = (t, sg) => { const i = segAt(t); if (sg !== undefined) window.__sg = sg; SEGS[i].f(t); const [p, d, f] = camState(); return [...p.toArray(), ...d.toArray(), f, i]; };
window.__blurPx = (t) => { const i = segAt(t); return blurPx(i, t); };
