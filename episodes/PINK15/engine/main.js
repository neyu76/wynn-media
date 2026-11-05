import { THREE, scene, camera, renderer, WIDTH, HEIGHT, hemi, sun, sky, setCam, setKicks, step, ss, clamp, lerp, blinkLid, pop, renderPost, POST, TEXLOAD, placeSun } from './core.js';
import { C, S, B, cc, sc, bc, STR, COAT2, setStripe, setCellColor, roller, roller2, setRoller, setCard, C_SUN, S_SUN, B_SUN, CD, CW, BENCH, SCALE, GAL, PINT, gallon, pintG, setLiquid, setLCD, setStream, stream, stick, armL, armR, setArm, TABLE, PINKDOOR, BD, slideDoor, cLamp } from './prison.js';

// PINK15 — 15 s test in the style of the "Pink Prison Cell" sample (own script). Voice starts 0.10 s; times = align.json + 0.10.
// Camera grammar from the sample: hold still (~40 % of frames), then fast eased moves / whips; sets are real 3D rooms with sun shafts.
export const DURATION = 16.0;
const SETS = [C.g, S.g, B.g];
function show(g) { SETS.forEach(s => s.visible = s === g); }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const K = (ox, keys) => keys.map(k => [k[0], k[1] + ox, k[2], k[3], k[4] + ox, k[5], k[6], k[7], k[8] || 0]); // [t, pos, look, fov, roll°]
setKicks([]); // no shakes: the sample has none in these beats

// ---------------------------------------------------------------- light (cool grade like the sample: teal/blue sets, warm-white sun)
// v3 (user: sample has depth + better palette): low-key light = weak cool fill, strong warm sun, practical lamps, haze for depth
function fog(col, near, far) { scene.fog.color.set(col); scene.fog.near = near; scene.fog.far = far; }
function lightC(pink) { sky.visible = false; scene.background = new THREE.Color(0x101418); fog(pink ? 0x8a6c7a : 0x6a7a86, 4, 22);
  placeSun(C_SUN.target, C_SUN.dir, 3.2, 20); sun.color.set(0xffecd2); sun.intensity = 6.5;
  hemi.color.set(pink ? 0xf0b0d0 : 0xa8c8d4); hemi.groundColor.set(pink ? 0x7a5262 : 0x56626c); hemi.intensity = pink ? 1.9 : 2.0; C.lamp.intensity = 4.0;
  return { col: pink ? '#ffd0e2' : '#d8f0ff', side: 1, a: 0.5 }; }
function lightS() { sky.visible = false; scene.background = new THREE.Color(0x1a1a1a); fog(0x8e8c86, 5, 26); placeSun(S_SUN.target.map((v, i) => i ? v : v + 300), S_SUN.dir, 3.4, 20); sun.color.set(0xffecd0); sun.intensity = 6.0;
  hemi.color.set(0xd2dce2); hemi.groundColor.set(0x7a7670); hemi.intensity = 2.4; return { col: '#fff0d8', side: 1, a: 0.5 }; }
function lightB() { sky.visible = false; scene.background = new THREE.Color(0x1e2630); fog(0xc8d8e6, 3, 20); placeSun(B_SUN.target.map((v, i) => i ? v : v + 600), B_SUN.dir, 6, 30); sun.color.set(0xfff0dc); sun.intensity = 5.5;
  hemi.color.set(0xc8dcec); hemi.groundColor.set(0x7a8a9a); hemi.intensity = 2.0; return { col: '#e8f4ff', side: -1, a: 0.5 }; }

// ---------------------------------------------------------------- characters
function ch(C, t, o, rim, seed) { if (!o) { C.mesh.visible = false; return; } C.mesh.visible = true; C.mesh.material.emissiveIntensity = 0.38; C.at(...o.pos, (o.s || 1) * CS); C.face(camera);
  C.set({ expr: o.expr || 'neutral', look: o.look || [0, -0.2], blink: o.noBlink ? 0 : blinkLid(t, seed, o.swaps || []), arms: o.arms || { l: [-0.27, 0.84], r: [0.27, 0.84] }, open: o.open || {}, fx: o.fx || {}, items: o.items || {}, bob: o.bob || 0, lean: o.lean || 0, walk: o.walk || 0, rim }, t); }
const handW = (C, h, s = 1) => { C.mesh.updateMatrixWorld(true); return C.mesh.localToWorld(V(h[0], h[1], 0.02)); };
const CS = 0.72; // characters ~1.6 m tall in 3 m rooms (sample proportions)
const swapsOf = tab => tab.slice(1).map(x => x[0]);

// ---------------------------------------------------------------- S1 teal cell 0–4.85: "In 1979, guards in Seattle painted a jail cell pink. Not just any pink."
// three roller strokes on the back wall (x, t start, t top, t end): up the wall, then back down; the last ends on "pink" 3.14
const WALL_Z = -CD / 2;
const STROKES = [{ x: -0.98, t0: -1.2, t1: -0.2, y0: 0.38 }, { x: -0.66, t0: -0.45, t1: 1.05, y0: 0.38 }, { x: -0.34, t0: 1.85, t1: 3.12, y0: 0.38 }];
const TOP_Y = 2.62;
function rollerHead(t) { // roller position: going up on a stroke, sliding down to the next start between strokes
  for (let i = 0; i < STROKES.length; i++) { const s = STROKES[i]; if (t < s.t0) { const p = STROKES[i - 1]; if (!p) return [s.x, s.y0]; const k = ss(p.t1 + 0.05, s.t0, t); return [lerp(p.x, s.x, k), lerp(TOP_Y, s.y0, k)]; }
    if (t <= s.t1) { const k = (t - s.t0) / (s.t1 - s.t0), e = k * k * (3 - 2 * k) * 0.35 + k * 0.65; return [s.x, lerp(s.y0, TOP_Y, e)]; } }
  const l = STROKES[STROKES.length - 1]; const k = ss(l.t1 + 0.1, l.t1 + 0.9, t); return [l.x + 0.05 * k, lerp(TOP_Y, 1.9, k)]; }
// v2 camera (sample grammar): long near-still holds, then one short fast whip (0.3 s) per beat
// v3: wide lens from the low front corner — back wall + side wall + floor + ceiling lamp in frame, guard ~40 % of the height
const CAM_C1 = K(0, [[0.0, 1.2, 0.78, 1.45, -0.55, 1.62, -1.7, 72], [3.15, 1.17, 0.78, 1.4, -0.55, 1.62, -1.7, 71.4],
  [4.0, 0.28, 1.39, 0.25, 1.7, 1.4, -0.72, 43, -1.2], [4.9, 0.3, 1.39, 0.21, 1.7, 1.4, -0.72, 42.5, -1.2]]);
const G1A = [0.02, 0, -1.0];
const G1_EXPR = [[0, 'smug'], [2.12, 'grin'], [3.1, 'smug']];
function segCell1(t) { setCam(CAM_C1, t, 0.1); show(C.g); setCellColor(false); const rim = lightC(false);
  const [rx, ry] = rollerHead(t);
  STROKES.forEach((s, i) => { const top = t < s.t0 ? s.y0 : (t < s.t1 ? rollerHead(t)[1] : TOP_Y); setStripe(STR[i], s.x, 0.32, s.y0 - 0.02, i === 0 ? TOP_Y : top); });
  COAT2.forEach(m => m.visible = false);
  const hl = [-0.5, 1.36 + (ry - 1.5) * 0.12];
  ch(cc.g1, t, { pos: G1A, expr: step(G1_EXPR, t + 2 / 30), swaps: swapsOf(G1_EXPR), look: [-0.9, 0.5], arms: { l: hl, r: [0.27, 0.84] }, bob: Math.abs(Math.sin(t * 5.2)) * 0.01 }, rim, 3);
  ch(cc.g2, t, null);
  roller.visible = true; roller2.visible = false; setRoller(roller, handW(cc.g1, hl), V(rx, ry, WALL_Z));
  setCard(ss(4.18, 4.33, t), ss(4.33, 4.46, t), ss(4.46, 4.75, t));
  C.motes(t); }

// ---------------------------------------------------------------- S2 paint shop 4.85–8.65: "The recipe was exact: one pint of red paint into one gallon of white."
const PINT_REST = V(SCALE.x - 0.33, BENCH.y + PINT.h / 2, SCALE.z + 0.14);
const GTOP = () => gallon.localToWorld(V(0, GAL.h - 0.025, 0));
const TD = [SCALE.x + 300 - 0.02, BENCH.y + 1.12, SCALE.z + 0.34, SCALE.x + 300 - 0.06, BENCH.y + 0.1, SCALE.z - 0.02, 46];
const CAM_S = K(300, [[4.7, BENCH.x + 0.95, 1.85, 1.9, BENCH.x - 0.25, 1.0, -1.5, 66], [5.7, BENCH.x + 0.92, 1.84, 1.84, BENCH.x - 0.25, 1.0, -1.5, 65.5],
  [6.1, (BENCH.x + 0.92 + TD[0] - 300) / 2, BENCH.y + 1.4, (1.84 + TD[2]) / 2, TD[3] - 300, BENCH.y + 0.25, TD[5] - 0.1, 48],
  [6.55, TD[0] - 300, TD[1], TD[2], TD[3] - 300, TD[4], TD[5], TD[6]], [8.8, TD[0] - 300, TD[1] - 0.04, TD[2] - 0.02, TD[3] - 300, TD[4], TD[5], TD[6] - 0.6]]);
const SCI_EXPR = [[0, 'smug'], [5.6, 'stare'], [6.3, 'smug']];
function segShop(t) { setCam(CAM_S, t, 0.1); show(S.g); const rim = lightS(); S.g.updateMatrixWorld(true);
  const top = false; // v2: keep the researcher in frame (hiding him read as a pop) // top-down close-up from 6.3
  // pint: parked on the bench; lifted by the left 3D arm (6.42–6.62), tilted to pour (6.62–7.0), poured (→ 7.85), set upright and pulled away
  const lift = ss(6.42, 6.66, t), tilt = ss(6.62, 7.0, t) * (1 - ss(7.85, 8.12, t)), away = ss(8.05, 8.45, t);
  const hold = V(SCALE.x - 0.085, BENCH.y + 0.06 + GAL.h + 0.15, SCALE.z - 0.02);
  const pp = PINT_REST.clone().lerp(hold, lift).add(V(-0.35 * away, 0.15 * away, -0.2 * away)); pintG.position.copy(pp); pintG.rotation.set(0, 0, -1.95 * tilt);
  pintG.visible = !(away >= 1); S.g.updateMatrixWorld(true);
  const lipW = pintG.localToWorld(V(PINT.r, PINT.h / 2, 0)); const gt = GTOP();
  // stream (local to the set group): from the lip straight down to the paint surface
  const pouring = t > 6.95 && t < 7.92; if (pouring) setStream(lipW.clone().sub(S.g.position), V(lipW.x + 0.012, gt.y, lipW.z).sub(S.g.position), Math.sin(t * 40) * 0.002); else stream.visible = false;
  const red = ss(6.98, 7.85, t), mix = ss(7.8, 8.6, t), ang = Math.max(0, t - 7.72) * 7.5; setLiquid(red, mix, ang); setLCD((0.47 * red).toFixed(2));
  // left arm comes in from the upper left and holds the can's far side
  const armOn = t > 6.3 && t < 8.5;
  armL.visible = armOn; if (armOn) { const hd = pintG.localToWorld(V(-PINT.r - 0.035, 0.0, 0)); const sh = V(SCALE.x + 300 - 0.75, BENCH.y + 0.42, SCALE.z - 0.3).lerp(V(SCALE.x + 300 - 0.9, BENCH.y + 0.4, SCALE.z - 0.5), away);
    const el = sh.clone().lerp(hd, 0.55).add(V(0, 0.06, -0.06)); setArm(armL, sh.sub(S.g.position), el.sub(S.g.position), hd.sub(S.g.position)); }
  // right arm stirs with the stick from 7.68
  const stir = t > 7.62 && t < 8.75; stick.visible = stir; armR.visible = stir;
  if (stir) { const a = ang + 0.6, r = 0.055 * (0.4 + 0.6 * ss(7.62, 7.9, t)); const c = gt.clone().sub(S.g.position); const sp = V(c.x + Math.cos(a) * r, c.y + 0.1, c.z + Math.sin(a) * r * 0.8); stick.position.copy(sp); stick.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12 - 0.15);
    const hd = sp.clone().add(V(0.02, 0.12, 0)); const sh = V(SCALE.x + 0.8, BENCH.y + 0.5, SCALE.z - 0.25); setArm(armR, sh, sh.clone().lerp(hd, 0.5).add(V(0, 0.1, 0.05)), hd); }
  // the researcher behind the bench (wide shot only): reads the recipe off the clipboard, then reaches for the pint
  ch(sc.sci, t, top ? null : { pos: [BENCH.x - 0.02, 0, BENCH.z - 0.62], s: 1.14, expr: step(SCI_EXPR, t + 2 / 30), swaps: swapsOf(SCI_EXPR), look: t < 5.6 ? [0.3, -0.6] : [0.5, 0.1],
    arms: { l: [-0.36, 1.12], r: t > 5.7 ? [0.42, lerp(1.0, 1.2, ss(5.7, 6.0, t))] : [0.27, 0.84] }, open: { r: t > 5.7 }, items: { clip: { hand: 'l', ang: 8 } } }, rim, 11); }

// ---------------------------------------------------------------- S3 pink cell 8.65–11.55: "They checked the shade against a card and rolled on a second coat."
// opens on the freshly painted upper wall + window (matches the pink swirl), above the guards' heads, then tilts down onto g1
const CAM_P = K(0, [[8.45, 1.45, 0.95, 0.7, 0.45, 1.4, -1.7, 64], [9.95, 1.43, 0.95, 0.65, 0.45, 1.4, -1.7, 63.5],
  [10.8, 1.38, 0.75, 1.5, -0.15, 1.62, -1.7, 72], [11.7, 1.36, 0.75, 1.46, -0.15, 1.62, -1.7, 71.5]]);
const G1P = [0.95, 0, -1.3], G2P = [-0.3, 0, -1.0];
const G1P_EXPR = [[0, 'squint'], [9.6, 'stare'], [9.86, 'smug']], G2P_EXPR = [[0, 'neutral'], [10.38, 'grin']];
function segPink(t) { setCam(CAM_P, t, 0.1); show(C.g); setCellColor(true); const rim = lightC(true);
  STR.forEach(m => m.visible = false); setCard(1, 1, 1);
  const y2 = lerp(0.38, TOP_Y, ss(10.38, 11.25, t)); setStripe(COAT2[0], -0.98, 0.32, 0.36, TOP_Y); setStripe(COAT2[1], -0.66, 0.32, 0.36, y2);
  // g1 holds the chip up beside the wall and compares (looks chip → wall → nods)
  const chip = t > 8.78 ? { l: [-0.44, lerp(1.2, 1.6, ss(8.78, 9.05, t))], r: [0.27, 0.84] } : { l: [-0.3, 0.9], r: [0.27, 0.84] };
  ch(cc.g1, t, { pos: G1P, expr: step(G1P_EXPR, t + 2 / 30), swaps: swapsOf(G1P_EXPR), look: t < 9.35 ? [-0.9, 0.4] : (t < 9.6 ? [1, 0.3] : [-0.3, -0.1]), arms: chip, items: { swatch: { hand: 'l', ang: -6, col: '#f27aa6', oy: 0.09 } }, bob: t > 9.86 && t < 10.15 ? Math.abs(Math.sin((t - 9.86) * 22)) * 0.02 : 0 }, rim, 5);
  // g2 rolls the second coat up the wall on "rolled"
  const hd = [-0.66, y2 < 0.4 ? 1.3 : y2]; const hl = [-0.5, 1.36 + (hd[1] - 1.5) * 0.12];
  ch(cc.g2, t, { pos: G2P, expr: step(G2P_EXPR, t + 2 / 30), swaps: swapsOf(G2P_EXPR), look: [-0.9, 0.5], arms: { l: hl, r: [0.27, 0.84] } }, rim, 9);
  roller.visible = false; roller2.visible = true; setRoller(roller2, handW(cc.g2, hl), V(hd[0], hd[1], WALL_Z));
  C.motes(t); }

// ---------------------------------------------------------------- S4 cell block 11.55–16.0: "The other guards were laughing. Then the first prisoner walked in."
// v3: high wide shot of the two-tier block (guards' table front-left, pendant lamps, pink door mid), then down low to the door
const CAM_B = K(600, [[11.4, 0.35, 2.05, 1.9, -1.0, 1.6, -4.0, 70], [12.55, 0.33, 2.03, 1.84, -1.0, 1.6, -4.0, 69.5],
  [13.4, 1.7, 0.9, -0.35, 0.8, 1.35, -4.6, 54, 0.8], [16.2, 1.68, 0.9, -0.5, 0.8, 1.35, -4.6, 53.4, 0.6]]);
const GA = [TABLE.x - 0.35, 0, TABLE.z - 0.55], GB = [TABLE.x + 0.45, 0, TABLE.z - 0.5];
// prisoner path [t, x, z]: walks in from the right along the doors and turns into the open pink cell on "in" (14.52)
const CON = [[12.9, 3.4, -3.35], [14.15, PINKDOOR + 0.35, -3.4], [14.55, PINKDOOR, -3.95], [15.1, PINKDOOR - 0.05, -4.55], [16.0, PINKDOOR - 0.05, -4.6]];
function conAt(t) { let i = 0; while (i < CON.length - 2 && t > CON[i + 1][0]) i++; const a = CON[i], b = CON[i + 1]; const k = clamp((t - a[0]) / (b[0] - a[0])); return { x: lerp(a[1], b[1], k), z: lerp(a[2], b[2], k), moving: t > CON[0][0] && t < 15.1 }; }
const GA_EXPR = [[0, 'laugh'], [12.5, 'grin'], [12.75, 'laugh']], GB_EXPR = [[0, 'grin'], [11.9, 'laugh']];
function segHall(t) { setCam(CAM_B, t, 0.1); show(B.g); const rim = lightB();
  const shake = (a, f) => Math.abs(Math.sin(t * f)) * a;
  ch(bc.g1, t, { pos: GA, expr: step(GA_EXPR, t + 2 / 30), swaps: swapsOf(GA_EXPR), look: [0.8, 0.2], arms: { l: [-0.3, 0.95], r: [0.62, 1.32] }, open: { r: true }, bob: shake(0.03, 13), lean: Math.sin(t * 6.5) * 0.3, items: {} }, rim, 4);
  ch(bc.g2, t, { pos: GB, expr: step(GB_EXPR, t + 2 / 30), swaps: swapsOf(GB_EXPR), look: [-0.6, 0.1], arms: { l: [-0.12, 0.88], r: [0.12, 0.9] }, open: { l: true, r: true }, bob: shake(0.025, 11), lean: Math.sin(t * 5.3 + 1) * 0.25, items: { mug: { hand: 'r', ang: 0 } } }, rim, 7);
  const c = conAt(t); ch(bc.con, t, t < 12.9 ? null : { pos: [c.x, 0, c.z], s: 1.18, expr: t < 14.55 ? 'angry' : (t < 15.2 ? 'stare' : 'squint'), swaps: [14.55, 15.2], look: t < 14.4 ? [-0.8, -0.1] : [-0.2, 0.4], arms: { l: [-0.3, 0.8], r: [0.3, 0.8] }, walk: c.moving ? (t * 1.9) % 1 : 0, bob: c.moving ? Math.abs(Math.sin(t * 12)) * 0.015 : 0 }, rim, 13);
  B.motes(t); }

// ---------------------------------------------------------------- edit
const SEGS = [{ t0: 0, t1: 4.85, f: segCell1 }, { t0: 4.85, t1: 8.65, f: segShop }, { t0: 8.65, t1: 11.55, f: segPink }, { t0: 11.55, t1: DURATION, f: segHall }];
const TRANS = { 4.85: 'dissolve', 8.65: 'dissolve', 11.55: 'dissolve' };
export const EDIT = { SEGS, TRANS };
const segAt = t => { for (let i = 0; i < SEGS.length; i++) if (t < SEGS[i].t1) return i; return SEGS.length - 1; };
const HALF = 4.5 / 30;
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
const GRADE_CSS = 'saturate(1.0) contrast(1.1) brightness(1.08)';
const subc = document.createElement('canvas'); subc.width = WIDTH; subc.height = HEIGHT; const sctx = subc.getContext('2d'); sctx.imageSmoothingQuality = 'high';
const VIG = document.createElement('canvas'); VIG.width = WIDTH; VIG.height = HEIGHT; { const g = VIG.getContext('2d'); const gr = g.createRadialGradient(WIDTH / 2, HEIGHT / 2, HEIGHT * 0.4, WIDTH / 2, HEIGHT / 2, HEIGHT * 0.75); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#d4d4d4'); g.fillStyle = gr; g.fillRect(0, 0, WIDTH, HEIGHT); }
window.renderAt = (t, maxSub = 6) => {
  let i = segAt(t), sub = 1, done = false;
  for (const [bs, type] of Object.entries(TRANS)) { const b = +bs; const j = SEGS.findIndex(s => Math.abs(s.t0 - b) < 1e-6);
    if (type === 'dissolve' && t >= b - HALF && t < b + HALF) { const k = ss(b - HALF, b + HALF, t); drawSeg(actx, j - 1, t, maxSub); drawSeg(tctx, j, t, maxSub); actx.globalAlpha = k; actx.drawImage(tmp, 0, 0); actx.globalAlpha = 1; done = true; }
    if (done) break; }
  if (!done) sub = drawSeg(actx, i, t, maxSub);
  return { url: acc.toDataURL('image/jpeg', 0.97), sub, seg: i };
};
Promise.all(TEXLOAD).then(() => { window.READY = true; });
window.camAt = (t, sg) => { const i = segAt(t); if (sg !== undefined) window.__sg = sg; SEGS[i].f(t); const [p, d, f] = camState(); return [...p.toArray(), ...d.toArray(), f, i]; };
window.__blurPx = (t) => { const i = segAt(t); return blurPx(i, t); };
