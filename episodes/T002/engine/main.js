import { THREE, scene, camera, renderer, WIDTH, HEIGHT, hemi, sun, sky, setCam, setKicks, step, ss, clamp, lerp, lerpA, blinkLid, REACT_LEAD, pop, renderPost, POST, TEXLOAD } from './core.js';
import { S as SET, VAL, TILE_A, TILE_B, tileCenter, BOARD, tag, setOverlays, setCover, swatch, setSwatch, SW, canDark, canLight, pipette, ch, key } from './studio.js';

// RC01-T002 "Same Pixels" (48.5 s, illustrative demonstration). Voice starts 0.10 s; all times are video time.
export const DURATION = 48.5;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const _p = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
// no impact kicks on board shots (they would move A/B across the frame); only on character beats
setKicks([[5.14, 0.5], [6.52, 0.5], [16.54, 0.6], [42.36, 0.5]]);

function light() { sky.visible = false; scene.background = new THREE.Color(0xcfd8d0); scene.fog.color.set(0xcfd8d0); scene.fog.near = 30; scene.fog.far = 90; sun.intensity = 0;
  hemi.intensity = 0.8; hemi.color.set(0xfff4e4); hemi.groundColor.set(0x8a8070); key.intensity = 1.9;
  POST.vigOff = true; POST.ao = false; // equal image values must stay equal anywhere on screen
  return { col: '#ffe2a8', side: -1, a: 0.5 }; }
const EX = (list, t) => ({ expr: step(list, t + REACT_LEAD), swaps: list.slice(1).map(e => e[0] - REACT_LEAD) });
function C(c, t, s, rim, seed) { if (!s) { c.mesh.visible = false; return; } c.mesh.visible = true; c.at(s.at[0], 0, s.at[1], 1); c.face(camera); c.mesh.updateMatrixWorld();
  const e = Array.isArray(s.ex) ? EX(s.ex, t) : { expr: s.ex || 'neutral', swaps: [] };
  c.set({ expr: e.expr, look: s.look || [0, 0], blink: blinkLid(t, seed, e.swaps), arms: s.arms || {}, open: s.open || {}, fx: s.fx || {}, rim }, t); }
function handW(c, h, toward = 0.06) { c.mesh.localToWorld(_p.set(h[0], h[1], 0)); _c.subVectors(camera.position, _p).normalize(); return _p.clone().addScaledVector(_c, toward); }
const P1 = [-1.0, 0.15], P2 = [1.0, 0.15];
const CRATE_TOP = 0.75, CAN_D = V(0.58, CRATE_TOP, 0.62), CAN_L = V(0.98, CRATE_TOP, 0.62), FLOOR_D = V(-0.72, 0, 0.45), FLOOR_L = V(0.72, 0, 0.45);
const A = tileCenter(TILE_A), B = tileCenter(TILE_B);

// world state: cans ('floor' | 'hand' | 'crate'), pipette tip (null = in pocket), overlays, cover, swatch
function world(t, W) {
  const rim = light();
  setOverlays(W.ovS || 0, W.ovG || 0, W.ovAB || 0); setCover(W.cover || 0); setSwatch(W.sw ?? 0, W.eq ?? 0);
  C(ch.p1, t, W.p1, rim, 1); C(ch.p2, t, W.p2, rim, 2);
  const place = (cn, mode, floor, crate, who, hand) => { if (mode === 'hand') { const w = handW(ch[who], hand); cn.position.set(w.x, w.y - 0.27, w.z); } else cn.position.copy(mode === 'crate' ? crate : floor); };
  place(canDark, W.cans || 'floor', FLOOR_D, CAN_D, 'p1', W.p1 && W.p1.arms && W.p1.arms.l || [-0.3, 0.6]);
  place(canLight, W.cans || 'floor', FLOOR_L, CAN_L, 'p2', W.p2 && W.p2.arms && W.p2.arms.l || [-0.3, 0.6]);
  pipette.visible = !!W.tip; if (W.tip) { const hw = handW(ch.p2, W.p2.arms.r, 0.05); pipette.position.copy(W.tip); _d.subVectors(hw, W.tip).normalize(); pipette.quaternion.setFromUnitVectors(UP, _d); }
}
const crate = (() => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.66, CRATE_TOP, 0.3), new THREE.MeshToonMaterial({ color: 0x8a5a32 })); m.position.set(0.78, CRATE_TOP / 2, 0.62); m.castShadow = m.receiveShadow = true; SET.g.add(m); return m; })();

// ================================================================ S1 0–3.05 hook: the designed board; ILLUSTRATIVE DEMONSTRATION; slow push (no kicks, no fast moves)
const CAM1 = [[0.0, 0.14, 1.48, 3.1, 0.0, 1.42, -0.3, 46], [3.2, 0.05, 1.5, 2.55, 0.0, 1.45, -0.3, 44]];
function seg1(t) { setCam(CAM1, t);
  world(t, { p1: { at: P1, ex: 'squint', look: [1, 0] }, p2: { at: P2, ex: 'squint', look: [-1, 0] } }); }

// ================================================================ S2 3.05–10.4 two painters argue · one points to A · the other to B · the shadow
const CAM2 = [[2.9, 0.0, 1.45, 4.6, 0.0, 1.25, -0.2, 50], [4.6, -0.25, 1.45, 4.3, -0.2, 1.3, -0.2, 49], [6.0, 0.25, 1.45, 4.3, 0.2, 1.3, -0.2, 49], [7.3, 0.1, 1.5, 3.6, 0.08, 1.4, -0.25, 47],
  [8.7, 0.1, 1.58, 2.5, 0.1, 1.55, -0.3, 44], [10.6, 0.13, 1.6, 2.3, 0.12, 1.55, -0.3, 43]];
function seg2(t) { setCam(CAM2, t);
  const pA = t > 5.05 && t < 8.6, pB = t > 6.45 && t < 8.6;
  world(t, { p1: { at: P1, ex: [[0, 'angry'], [5.1, 'smug']], look: pA ? [1, 0.2] : [1, 0], arms: pA ? { r: [0.62, 1.25] } : {}, open: { r: pA }, fx: { puff: t < 5.0 ? 1 : 0 } },
    p2: { at: P2, ex: [[0, 'angry'], [6.5, 'smug']], look: pB ? [-1, 0.4] : [-1, 0], arms: pB ? { l: [-0.62, 1.4] } : {}, open: { l: pB }, fx: { puff: t < 5.0 ? 1 : 0 } } }); }

// ================================================================ S3 10.4–18.7 two different cans · sample A and B · the values match · the painters disagree
const CAM3 = [[10.3, 0.0, 1.25, 3.9, 0.0, 0.75, 0.2, 49], [11.9, 0.0, 1.35, 3.6, 0.0, 0.95, 0.0, 48], [12.6, 0.05, 1.52, 2.6, -0.05, 1.38, -0.3, 45], [13.9, 0.05, 1.52, 2.55, -0.05, 1.38, -0.3, 45],
  [15.0, 0.6, 1.3, 1.95, 0.74, 1.18, 0.35, 42], [16.0, 0.62, 1.28, 1.85, 0.76, 1.18, 0.35, 41], [17.2, 0.0, 1.45, 4.3, 0.0, 1.2, -0.1, 49], [18.9, 0.0, 1.47, 4.0, 0.0, 1.3, -0.15, 48]];
function seg3(t) { setCam(CAM3, t);
  const got = t > 10.95, held = got;
  const tA = ss(12.55, 12.9, t), tB = ss(13.05, 13.4, t), back = ss(13.6, 13.95, t);
  const rest = V(0.75, 1.3, 0.2), tip = t < 12.5 || t > 14.0 ? null : (back > 0 ? rest.clone().lerp(rest, back) : (tB > 0 ? A.clone().lerp(B, tB) : rest.clone().lerp(A, tA)));
  world(t, { cans: held ? 'hand' : 'floor', tip, sw: Math.min(pop(14.85, t, 0.18), 1), eq: pop(15.5, t, 0.16),
    p1: { at: P1, ex: [[0, 'smug'], [10.9, 'grin'], [16.1, 'shock'], [17.4, 'squint']], look: t > 14.8 && t < 17.2 ? [1, -0.1] : [1, -0.4], arms: { l: held ? [-0.3, 0.62] : lerpA([-0.27, 0.84], [-0.4, 0.35], ss(10.6, 10.9, t)) }, fx: { sweat: t > 16.1 && t < 17.4 ? 2 : 0 } },
    p2: { at: P2, ex: [[0, 'smug'], [11.2, 'grin'], [12.5, 'squint'], [16.1, 'shock'], [17.4, 'stare']], look: t > 12.5 && t < 14.0 ? [-1, 0.3] : [-1, -0.2],
      arms: { l: t > 11.2 ? [-0.3, 0.62] : lerpA([-0.27, 0.84], [-0.4, 0.35], ss(10.9, 11.2, t)), r: t > 12.5 && t < 14.0 ? [-0.5, 1.2] : [0.3, 0.95] }, fx: { qmarks: ss(16.6, 16.8, t) * (1 - ss(18.2, 18.4, t)) } } }); }

// ================================================================ S4 18.7–26.9 context: apparent lighting (shadow outline) · surrounding pattern (grid) · identical values (A/B rings)
const CAM4 = [[18.5, 0.0, 1.5, 3.2, 0.0, 1.5, -0.3, 46], [20.6, 0.04, 1.54, 2.45, 0.04, 1.54, -0.3, 44], [22.4, 0.1, 1.55, 2.35, 0.1, 1.55, -0.3, 44], [24.0, 0.04, 1.55, 2.42, 0.02, 1.55, -0.3, 44],
  [25.4, -0.06, 1.5, 2.3, -0.08, 1.4, -0.3, 43], [27.1, -0.06, 1.5, 2.45, -0.06, 1.45, -0.3, 44]];
function seg4(t) { setCam(CAM4, t);
  world(t, { ovS: ss(21.9, 22.3, t) * (1 - ss(24.0, 24.4, t)) + ss(23.1, 23.3, t) * 0.3 * (1 - ss(24.0, 24.4, t)), ovG: ss(24.0, 24.3, t) * (1 - ss(25.2, 25.5, t)), ovAB: ss(25.25, 25.5, t),
    p1: { at: P1, ex: 'squint', look: [1, 0.2] }, p2: { at: P2, ex: 'squint', look: [-1, 0.2] }, cans: 'hand' }); }

// ================================================================ S5 26.9–36.7 cover the picture · matching windows over A and B · clues gone · pixels unchanged
const MID = A.clone().lerp(B, 0.5);
const CAM5 = [[26.7, 0.0, 1.52, 2.6, 0.0, 1.5, -0.3, 45], [28.8, -0.05, 1.45, 2.35, -0.08, 1.38, -0.3, 44], [31.0, MID.x, 1.42, 2.05, MID.x, MID.y, -0.3, 42], [33.6, MID.x, 1.41, 1.95, MID.x, MID.y, -0.3, 41], [36.9, MID.x, 1.4, 1.8, MID.x, MID.y, -0.3, 40]];
function seg5(t) { setCam(CAM5, t);
  world(t, { cover: ss(27.35, 28.6, t), ovAB: 0, cans: 'hand', p1: { at: P1, ex: [[0, 'stare'], [33.3, 'shock']], look: [1, 0.2] }, p2: { at: P2, ex: [[0, 'stare'], [33.3, 'worried']], look: [-1, 0.2] } }); }

// ================================================================ S6 36.7–45.2 remove the cover (same path) · painters stare at the board · at the samples · nothing repainted · cans set down
const CAM6 = [[36.5, MID.x, 1.42, 2.2, MID.x, MID.y + 0.05, -0.3, 43], [38.4, 0.0, 1.5, 2.6, 0.0, 1.5, -0.3, 45], [39.6, 0.0, 1.45, 4.4, 0.0, 1.25, -0.2, 50], [41.2, 0.42, 1.35, 3.2, 0.48, 1.15, 0.15, 47],
  [42.6, 0.4, 1.3, 3.0, 0.5, 0.95, 0.3, 46], [44.0, 0.05, 1.45, 4.5, 0.0, 1.25, -0.1, 50], [45.4, 0.1, 1.45, 4.3, 0.05, 1.25, -0.1, 49]];
function seg6(t) { setCam(CAM6, t);
  const down = t > 42.4;
  world(t, { cover: 1 - ss(36.8, 38.0, t), sw: 1, eq: 1, cans: down ? 'crate' : 'hand',
    p1: { at: P1, ex: [[0, 'stare'], [39.3, 'stare'], [40.7, 'worried'], [42.0, 'sigh']], look: t < 40.6 ? [1, 0.3] : [1, -0.1], arms: down ? {} : { l: [-0.3, 0.62] } },
    p2: { at: P2, ex: [[0, 'stare'], [39.3, 'squint'], [40.7, 'shock'], [42.0, 'sigh']], look: t < 40.6 ? [-1, 0.3] : [-0.4, -0.2], arms: down ? {} : { l: [-0.3, 0.62] } } }); }

// ================================================================ S7 45.2–48.5 "Same pixels. Different verdict." — equal swatches, the two cans, the board behind; hold
const CAM7 = [[45.0, 0.66, 1.62, 2.25, 0.73, 1.1, 0.25, 45], [48.7, 0.71, 1.58, 1.95, 0.77, 1.1, 0.25, 43]];
function seg7(t) { setCam(CAM7, t);
  world(t, { sw: 1, eq: 1, cans: 'crate', p1: { at: P1, ex: 'stare', look: [1, -0.2] }, p2: { at: P2, ex: [[0, 'stare'], [46.4, 'smug']], look: [-1, -0.3] } }); }

// pixel check helper: screen positions (px, 1080×1920) of the A and B tile centres at time t
window.__ab = (t) => { const i = segAt(t); SEGS[i].f(t); camera.updateMatrixWorld(); const pr = v => { const p = v.clone().project(camera); return [Math.round((p.x + 1) / 2 * WIDTH), Math.round((1 - p.y) / 2 * HEIGHT)]; }; return { A: pr(A), B: pr(B), value: VAL.dark }; };

// ---------------------------------------------------------------- edit
const SEGS = [{ t0: 0, t1: 3.05, f: seg1 }, { t0: 3.05, t1: 10.4, f: seg2 }, { t0: 10.4, t1: 18.7, f: seg3 }, { t0: 18.7, t1: 26.9, f: seg4 }, { t0: 26.9, t1: 36.7, f: seg5 }, { t0: 36.7, t1: 45.2, f: seg6 }, { t0: 45.2, t1: DURATION, f: seg7 }];
const TRANS = { 3.05: 'dissolve', 10.4: 'dissolve', 18.7: 'dissolve', 26.9: 'dissolve', 36.7: 'dissolve', 45.2: 'dissolve' };
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
    if (!POST.vigOff) { sctx.globalCompositeOperation = 'multiply'; sctx.drawImage(VIG, 0, 0); sctx.globalCompositeOperation = 'source-over'; } // T002: no vignette on blur sub-frames either
    renderer.setSize(WIDTH, HEIGHT, false); ctx.globalAlpha = 1 / (j + 1); ctx.drawImage(subc, 0, 0); });
  POST.lib = true; POST.on = true; ctx.globalAlpha = 1; return n; }
const GRADE_CSS = 'saturate(1.08) contrast(1.08) brightness(1.0)';
const subc = document.createElement('canvas'); subc.width = WIDTH; subc.height = HEIGHT; const sctx = subc.getContext('2d'); sctx.imageSmoothingQuality = 'high';
const VIG = document.createElement('canvas'); VIG.width = WIDTH; VIG.height = HEIGHT; { const gg = VIG.getContext('2d'); const gr = gg.createRadialGradient(WIDTH / 2, HEIGHT / 2, HEIGHT * 0.4, WIDTH / 2, HEIGHT / 2, HEIGHT * 0.75); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#d4d4d4'); gg.fillStyle = gr; gg.fillRect(0, 0, WIDTH, HEIGHT); }
window.renderAt = (t, maxSub = 5) => {
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
