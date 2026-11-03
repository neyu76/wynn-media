import { THREE, scene, camera, renderer, WIDTH, HEIGHT, hemi, sun, sky, setCam, setKicks, step, ss, clamp, lerp, lerpA, blinkLid, REACT_LEAD, pop, renderPost, POST, TEXLOAD } from './core.js';
import { A, B, TOP, tabA, tabB, setMarks, TAB_REST, stand, stylus, trayP, trayO, recon, according, npN, npE, ill, compPlaque, uiStars, uiBox, setBubble, bubble, chA, chB, keyA, PLINTH_TOP, spot } from './court.js';

// RC01-T012 "Nanni's Clay Complaint" (48.2 s, history / illustration). Voice starts 0.10 s; all times are video time.
export const DURATION = 48.2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const _p = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
function P(keys, t) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [t0, a] = keys[i], [t1, b] = keys[i + 1]; if (t < t1) { const k = ss(t0, t1, t); return Array.isArray(a) ? lerpA(a, b, k) : lerp(a, b, k); } } return keys[keys.length - 1][1]; }
// impact kicks on the punch words (camera offset flips each frame, 7 f)
setKicks([[1.17, 0.8], [8.05, 0.6], [14.25, 1.0], [20.9, 0.7], [21.8, 0.7], [22.76, 0.6], [46.0, 0.5]]);

function lightA(dim = 0) { sky.visible = false; scene.background = new THREE.Color(0xd8c4a0); scene.fog.color.set(0xd8c4a0); scene.fog.near = 30; scene.fog.far = 90; sun.intensity = 0;
  hemi.intensity = lerp(0.85, 0.12, dim); hemi.color.set(0xfff0d8); hemi.groundColor.set(0x8a6a44); keyA.intensity = lerp(2.0, 0.25, dim); A.g.visible = true; B.g.visible = false; return { col: '#ffd59a', side: -1, a: lerp(0.6, 0.2, dim) }; }
function lightB() { sky.visible = false; scene.background = new THREE.Color(0x10141e); scene.fog.color.set(0x10141e); scene.fog.near = 30; scene.fog.far = 90; sun.intensity = 0;
  hemi.intensity = 0.38; hemi.color.set(0xb8c8ff); hemi.groundColor.set(0x20242e); A.g.visible = false; B.g.visible = true; return { col: '#fff2dc', side: 1, a: 0.5 }; }
// expression table → expression at t + REACT_LEAD, and the swap times (a blink rides on each swap)
const EX = (list, t) => ({ expr: step(list, t + REACT_LEAD), swaps: list.slice(1).map(e => e[0] - REACT_LEAD) });
function C(c, t, s, rim, seed) { if (!s) { c.mesh.visible = false; return; } c.mesh.visible = true; c.at(s.at[0], s.at[2] || 0, s.at[1], s.s || 1); c.face(camera); c.mesh.updateMatrixWorld();
  const e = Array.isArray(s.ex) ? EX(s.ex, t) : { expr: s.ex || 'neutral', swaps: [] };
  c.set({ expr: e.expr, look: s.look || [0, 0], blink: blinkLid(t, seed, e.swaps), arms: s.arms || {}, open: s.open || {}, fx: s.fx || {}, walk: s.walk || 0, bob: s.bob || 0, rim }, t); }
function handW(c, h, toward = 0.05) { c.mesh.localToWorld(_p.set(h[0], h[1], 0)); _c.subVectors(camera.position, _p).normalize(); return _p.clone().addScaledVector(_c, toward); }
function stick(m, a, b) { _d.subVectors(b, a); const L = _d.length(); m.position.copy(a); m.quaternion.setFromUnitVectors(UP, _d.normalize()); m.scale.set(1, L / 0.22, 1); }
const grow = (o, k) => { o.visible = k > 0.01; o.scale.setScalar(Math.max(0.01, k)); };
const TAB_UP = V(-0.28, TOP + 0.13, 0.1); // upright on the stand (acts 5–6)
const NAN = [-0.8, 0.05], DEAL = [0.86, -0.1], SCR = [-0.32, -0.5];

// world for set A; every field has a neutral default
function court(t, W) {
  const rim = lightA(W.dim || 0);
  setMarks(W.marks ?? 0.35);
  const tm = W.tab || 'rest'; stand.visible = tm === 'up';
  if (tm === 'rest') { tabA.position.copy(TAB_REST); tabA.rotation.set(-Math.PI / 2, 0, 0.1); }
  else if (tm === 'up') { tabA.position.copy(TAB_UP); tabA.rotation.set(-0.12, 0, 0); }
  grow(recon, W.recon ?? 0); grow(according, W.acc ?? 0); grow(npN, W.npN ?? 1); grow(npE, W.npE ?? 1); grow(ill, W.ill ?? 0);
  trayO.g.visible = (W.trayO ?? 1) > 0.01; trayO.g.position.x = lerp(1.05, 0.56, clamp(W.trayO ?? 1)) + (W.push || 0) * -0.04; trayP.g.visible = (W.trayP ?? 1) > 0.01; trayP.g.scale.setScalar(Math.max(0.01, W.trayP ?? 1));
  grow(compPlaque, W.comp || 0); compPlaque.position.set(TAB_REST.x, TOP + 0.2, TAB_REST.z - 0.06); compPlaque.lookAt(camera.position);
  for (const [ui, s] of [[uiStars, W.stars], [uiBox, W.cbox]]) { ui.g.visible = !!s && s[0] > 0.01; if (ui.g.visible) { ui.g.position.set(-0.1, 1.22, 0.2); ui.g.scale.setScalar(s[0]); ui.g.lookAt(camera.position); ui.x.visible = s[1] > 0.01; ui.x.scale.setScalar(Math.max(0.01, s[1])); } }
  setBubble(W.bubble || 0, !!W.check); if (bubble.visible) { bubble.position.set(NAN[0] + 0.38, 2.28, NAN[1] + 0.05); bubble.lookAt(camera.position); }
  C(chA.nanni, t, W.nanni, rim, 1); C(chA.dealer, t, W.dealer, rim, 2); C(chA.scribe, t, W.scribe, rim, 3);
  // stylus in the scribe's right hand, tip on the tablet (taps lift it)
  stylus.visible = !!W.scribe && W.stylus !== false; if (stylus.visible) { const hw = handW(chA.scribe, W.scribe.arms.r, 0.03); const tip = V(TAB_REST.x + 0.02, TOP + 0.04 + (W.tap || 0) * 0.03, TAB_REST.z); stick(stylus, A.g.worldToLocal(hw.clone()), tip); }
  if (tm === 'hand') { const hw = handW(chA.nanni, W.nanni.arms.r, 0.1); tabA.position.copy(A.g.worldToLocal(hw)); tabA.position.y += 0.08; tabA.rotation.set(-0.1, chA.nanni.mesh.rotation.y, 0.08); }
}
const scribeAt = (t, tapping, ex = 'squint') => ({ at: [SCR[0], SCR[1], -0.32], ex, look: [0.4, -1], arms: { r: [0.32, lerp(0.9, 0.98, tapping ? Math.abs(Math.sin(t * 14)) : 0)], l: [-0.2, 0.9] } });
const tapK = (t, on) => on ? Math.abs(Math.sin(t * 14)) : 0;

// ================================================================ S1 0–3.1 hook: stylus pressing clay · ANIMATED RECONSTRUCTION · "still here"
const CAM1 = [[0.0, -0.09, 1.55, 1.2, -0.14, 0.86, 0.14, 44], [1.3, -0.11, 1.45, 1.03, -0.15, 0.86, 0.14, 42], [3.3, -0.13, 1.36, 0.88, -0.16, 0.86, 0.14, 40]];
function seg1(t) { setCam(CAM1, t);
  court(t, { marks: lerp(0.08, 0.42, ss(0.2, 2.8, t)), recon: pop(0.25, t, 0.18), tap: tapK(t, t < 2.6), npN: 0, npE: 0, trayO: 0, trayP: 0,
    scribe: scribeAt(t, t < 2.6), nanni: { at: NAN, ex: 'neutral', look: [1, -0.6] }, dealer: { at: DEAL, ex: 'neutral', look: [-1, -0.4] } }); }

// ================================================================ S2 3.1–11.0 Nanni → Ea-nasir · ACCORDING TO NANNI · offered vs promised · he wanted the seller to hear it
const CAM2 = [[2.9, 0.0, 1.55, 4.6, 0.0, 1.05, 0.0, 50], [4.4, -0.3, 1.5, 4.0, -0.35, 1.05, 0.0, 49], [5.6, 0.35, 1.5, 4.0, 0.4, 1.05, 0.0, 49], [6.7, 0.35, 1.45, 2.9, 0.38, 1.0, 0.0, 46],
  [8.2, 0.35, 1.42, 2.6, 0.38, 0.98, 0.05, 45], [9.6, 0.05, 1.5, 4.0, 0.05, 1.05, 0.0, 49], [11.2, -0.1, 1.5, 3.8, -0.1, 1.08, 0.0, 49]];
function seg2(t) { setCam(CAM2, t);
  const angry = t > 9.62;
  court(t, { npN: pop(3.85, t, 0.18), npE: pop(5.35, t, 0.18), acc: pop(6.05, t, 0.2), trayO: ss(7.25, 7.7, t), trayP: pop(9.08, t, 0.18), recon: 0, scribe: scribeAt(t, false, 'neutral'), stylus: false,
    nanni: { at: NAN, ex: [[0, 'neutral'], [6.42, 'squint'], [8.05, 'angry']], look: t > 7.3 ? [1, -0.5] : [0.6, 0], arms: angry ? { r: [0.62, lerp(1.15, 1.3, (Math.sin(t * 9) + 1) / 2)], l: [-0.27, 0.84] } : {}, open: { r: angry }, fx: { puff: angry ? 1 : 0 } },
    dealer: { at: DEAL, ex: [[0, 'neutral'], [5.4, 'smug'], [9.7, 'stare']], look: [-1, -0.3], arms: t > 7.2 && t < 7.9 ? { l: [-0.6, 0.8] } : {} } }); }

// ================================================================ S3 11.0–20.2 expecting good copper · presented with the unacceptable · goods → promise · reaches for clay
const CAM3 = [[10.8, -0.5, 1.55, 2.5, -0.7, 1.3, 0.05, 45], [12.4, -0.48, 1.55, 2.35, -0.7, 1.3, 0.05, 44], [13.4, 0.42, 1.4, 1.8, 0.45, 0.98, 0.1, 44],
  [14.3, -0.55, 1.5, 2.0, -0.7, 1.35, 0.05, 42], [15.4, 0.4, 1.38, 1.5, 0.45, 0.94, 0.08, 43], [16.4, 0.22, 1.36, 1.45, 0.22, 0.98, 0.0, 43],
  [17.3, -0.35, 1.5, 2.6, -0.5, 1.15, 0.05, 46], [18.6, -0.33, 1.42, 1.85, -0.38, 1.25, 0.12, 42], [20.4, -0.34, 1.4, 1.7, -0.38, 1.25, 0.12, 41]];
function seg3(t) { setCam(CAM3, t);
  const reach = ss(16.95, 17.5, t), lift = ss(17.5, 18.4, t), hold = t > 17.55;
  const nx = lerp(NAN[0], -0.62, ss(16.6, 17.2, t));
  court(t, { acc: 1, trayO: 1, trayP: 1, push: ss(12.6, 13.0, t), tab: hold ? 'hand' : 'rest', scribe: scribeAt(t, false, 'neutral'), stylus: false,
    nanni: { at: [nx, NAN[1]], ex: [[0, 'greedy'], [12.7, 'stare'], [14.15, 'shock'], [15.1, 'angry'], [16.9, 'squint'], [18.4, 'smug']], look: t < 15.1 ? [1, -0.3] : (t < 16.25 ? [1, -0.9] : (t < 16.9 ? [0.6, -0.9] : [0.4, -0.4])),
      fx: { sparkle: t < 12.6 ? 1 : 0, sweat: t > 14.2 && t < 15.6 ? 2 : 0 },
      arms: { r: hold ? [0.32, lerp(1.0, 1.24, lift)] : lerpA([0.27, 0.84], [0.62, 0.8], reach), l: [-0.27, 0.84] } },
    dealer: { at: DEAL, ex: [[0, 'smug'], [12.6, 'grin']], look: [-1, -0.4], arms: t > 12.6 && t < 13.6 ? { l: [-0.55, 0.85], r: [0.3, 0.9] } : {}, open: { l: t > 12.6 && t < 13.6 } } }); }

// ================================================================ S4 20.2–26.9 no star rating · no comment box · pressed into clay · far beyond the exchange
const CAM4 = [[20.0, -0.1, 1.35, 2.0, -0.1, 1.22, 0.2, 45], [21.9, -0.12, 1.33, 1.9, -0.1, 1.2, 0.2, 44], [22.6, -0.24, 1.38, 1.15, -0.3, 0.92, 0.08, 43], [23.6, -0.24, 1.36, 1.1, -0.3, 0.92, 0.08, 42],
  [25.6, 0.1, 3.2, 3.0, 0.0, 0.5, 0.0, 49], [27.1, 0.2, 4.0, 3.5, 0.0, 0.5, 0.0, 50]];
function seg4(t) { setCam(CAM4, t);
  const s1 = pop(20.3, t, 0.16) * (1 - ss(21.0, 21.2, t)), x1 = pop(20.88, t, 0.12), s2 = pop(21.28, t, 0.16) * (1 - ss(21.9, 22.1, t)), x2 = pop(21.78, t, 0.12);
  const pressing = t > 22.2 && t < 23.6;
  court(t, { acc: 0, trayO: 1, trayP: 1, marks: lerp(0.42, 0.88, ss(22.2, 23.6, t)), tap: tapK(t, pressing), comp: pop(22.9, t, 0.2), stars: [s1, x1], cbox: [s2, x2],
    scribe: scribeAt(t, pressing, pressing ? 'squint' : 'neutral'),
    nanni: { at: [NAN[0] + 0.05, NAN[1]], ex: [[0, 'stare'], [22.2, 'angry'], [24.0, 'smug']], look: [0.4, -0.8], arms: t > 22.2 ? { r: [0.55, lerp(1.0, 1.15, (Math.sin(t * 7) + 1) / 2)] } : {}, open: { r: t > 22.2 } },
    dealer: { at: DEAL, ex: [[0, 'grin'], [22.8, 'stare']], look: [-1, -0.5] } }); }

// ================================================================ S5 26.9–35.0 FUTURE DELIVERIES (a wish in the letter) · ILLUSTRATION · the pointing hand: complaint → goods
const CAM5 = [[26.7, -0.38, 2.0, 2.9, -0.42, 2.0, 0.05, 47], [29.8, -0.38, 2.05, 2.6, -0.42, 2.08, 0.07, 45], [31.4, 0.0, 1.6, 4.0, 0.0, 1.1, 0.0, 49], [33.4, -0.25, 1.5, 3.6, -0.1, 1.05, 0.0, 48], [35.2, -0.1, 1.45, 3.2, 0.0, 1.0, 0.0, 46]];
function seg5(t) { setCam(CAM5, t);
  const ptC = t > 32.35 && t < 33.75, ptG = t > 33.75;
  court(t, { acc: 0, trayO: 1, trayP: 1, tab: 'up', marks: 0.88, bubble: pop(27.3, t, 0.2) * (1 - ss(31.3, 31.6, t)), check: t > 30.5, ill: pop(31.6, t, 0.18),
    scribe: scribeAt(t, false, 'neutral'), stylus: false,
    nanni: { at: [NAN[0] - 0.05, NAN[1]], ex: [[0, 'squint'], [28.7, 'smug'], [30.5, 'grin'], [32.35, 'stare'], [33.8, 'smug']], look: ptC ? [1, -0.8] : (ptG ? [1, -0.6] : [0.5, 0.6]),
      arms: ptC ? { r: [0.62, 0.92] } : (ptG ? { r: [0.66, 1.02] } : {}), open: { r: ptC || ptG }, fx: { sparkle: t > 30.5 && t < 31.4 ? 1 : 0 } },
    dealer: { at: DEAL, ex: [[0, 'stare'], [30.6, 'worried']], look: [-1, -0.3], fx: { sweat: t > 30.6 && t < 32.0 ? 1 : 0 } } }); }

// ================================================================ S6 35.0–36.7 the delivery scene fades, the tablet stays (camera framed on the tablet; A dims)
const OFF = [0.03, 0.06, 0.62]; // camera offset from the tablet, shared with the first key of S7 (match across the dissolve)
const CAM6 = [[34.8, TAB_UP.x + 0.12, TAB_UP.y + 0.18, TAB_UP.z + 1.2, TAB_UP.x, TAB_UP.y, TAB_UP.z, 42], [36.0, TAB_UP.x + 0.06, TAB_UP.y + 0.1, TAB_UP.z + 0.85, TAB_UP.x, TAB_UP.y, TAB_UP.z, 41],
  [36.9, TAB_UP.x + OFF[0], TAB_UP.y + OFF[1], TAB_UP.z + OFF[2], TAB_UP.x, TAB_UP.y, TAB_UP.z, 40]];
function seg6(t) { setCam(CAM6, t);
  court(t, { dim: ss(35.4, 36.6, t), acc: 0, trayO: 1, trayP: 1, tab: 'up', marks: 0.88, ill: 1, scribe: scribeAt(t, false, 'neutral'), stylus: false,
    nanni: { at: [NAN[0] - 0.05, NAN[1]], ex: 'smug', look: [1, -0.6] }, dealer: { at: DEAL, ex: 'worried', look: [-1, -0.3] } }); }

// ================================================================ S7 36.7–48.2 museum: the tablet stays · British Museum collection · durable record · closer hold
const TB = V(300 + 0, PLINTH_TOP + 0.13, 0.02);
const CAM7 = [[36.5, TB.x + OFF[0], TB.y + OFF[1], TB.z + OFF[2], TB.x, TB.y, TB.z, 40], [37.9, 300.04, 1.12, 1.25, 300, 1.06, 0.0, 42], [39.7, 300.0, 0.98, 1.45, 300, 0.86, 0.0, 44],
  [41.6, 300.75, 1.3, 2.7, 300.38, 1.0, 0.0, 49], [44.0, 300.7, 1.28, 2.5, 300.36, 1.02, 0.0, 48], [45.6, 300.2, 1.18, 1.45, 300.0, 1.06, 0.0, 43], [48.4, 300.08, 1.12, 1.0, 300.0, 1.07, 0.0, 41]];
function seg7(t) { setCam(CAM7, t);
  const rim = lightB(); setMarks(0.88); spot.intensity = 9;
  const vk = [[40.4, [1.6, 0.9]], [41.6, [0.72, 0.62]]]; const vp = P(vk, t), walking = t > 40.4 && t < 41.6;
  C(chB.visitor, t, t < 40.3 ? null : { at: vp, ex: [[0, 'neutral'], [42.2, 'squint'], [44.25, 'laugh']], look: [-1, -0.2], walk: walking ? (t * 2.2) % 1 : 0, bob: t > 44.25 ? Math.abs(Math.sin(t * 16)) * 0.015 : 0,
    arms: t > 44.25 ? { l: [-0.13, 0.86], r: [0.13, 0.86] } : {} }, rim, 4); }

// ---------------------------------------------------------------- edit
const SEGS = [{ t0: 0, t1: 3.1, f: seg1 }, { t0: 3.1, t1: 11.0, f: seg2 }, { t0: 11.0, t1: 20.2, f: seg3 }, { t0: 20.2, t1: 26.9, f: seg4 }, { t0: 26.9, t1: 35.0, f: seg5 }, { t0: 35.0, t1: 36.7, f: seg6 }, { t0: 36.7, t1: DURATION, f: seg7 }];
const TRANS = { 3.1: 'dissolve', 11.0: 'dissolve', 20.2: 'dissolve', 26.9: 'dissolve', 35.0: 'dissolve', 36.7: 'dissolve' };
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
