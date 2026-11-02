import { THREE, scene, camera, renderer, WIDTH, HEIGHT, hemi, sun, sky, setCam, step, ss, clamp, lerp, lerpA, blink, pop, renderPost, POST, TEXLOAD } from './core.js';
import { S as SET, DESK, page, PAGE0, stamp, flag, setPop, crits, ill, insts, setInst, claim, seal, BOARD, fName, fEvid, notStamp, claimCard, setThread, invTab, PRESS, setPress, files, letters, ch, light, lampLight } from './printshop.js';

// RC01-T003 "Bat People on the Moon" (49.2 s, history). Voice starts 0.10 s; all times are video time (voice/align.json + 0.10).
export const DURATION = 49.2;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const _p = new THREE.Vector3(), _c = new THREE.Vector3();
function P(keys, t) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [t0, a] = keys[i], [t1, b] = keys[i + 1]; if (t < t1) { const k = ss(t0, t1, t); return Array.isArray(a) ? lerpA(a, b, k) : lerp(a, b, k); } } return keys[keys.length - 1][1]; }

function interior(cool = 0) { sky.visible = false; scene.background = new THREE.Color(0x1e1712); scene.fog.color.set(0x1e1712); scene.fog.near = 30; scene.fog.far = 80;
  light(cool); hemi.intensity = lerp(0.7, 0.62, cool); hemi.color.set(new THREE.Color(0xffe8cc).lerp(new THREE.Color(0xd8e0ff), cool)); hemi.groundColor.set(0x4a3020); lampLight.intensity = 1.8;
  return { col: cool > 0.5 ? '#c8d4ff' : '#ffd59a', side: -1, a: 0.6 }; }
function C(c, t, s, rim) { if (!s) { c.mesh.visible = false; return; } c.mesh.visible = true; c.at(s.at[0], s.at[2] || 0, s.at[1], s.s || 1); c.face(camera); c.mesh.updateMatrixWorld();
  c.set({ expr: s.expr || 'neutral', look: s.look || [0, 0], blink: blink(t, s.bo || 0.7), arms: s.arms || {}, open: s.open || {}, fx: s.fx || {}, items: s.items || {}, bob: s.bob || 0, rim }, t); }
const faceCam = (m) => { const wp = new THREE.Vector3(); m.getWorldPosition(wp); m.rotation.y = Math.atan2(camera.position.x - wp.x, camera.position.z - wp.z); };

// one state object per frame; every field has a neutral default
function world(t, W) {
  const rim = interior(W.cool || 0);
  const pp = W.page || [PAGE0.x, PAGE0.y, PAGE0.z]; page.position.set(pp[0], pp[1], pp[2]);
  setPop(W.up || 0, W.crit || [], W.flap || 0, W.fold || 0, t); flag.visible = !!W.flag; ill.visible = (W.ill || 0) > 0.01; ill.scale.setScalar(Math.max(0.01, W.ill || 0));
  stamp.scale.setScalar(1 + 0.25 * Math.sin(clamp(W.stampPulse || 0) * Math.PI));
  setInst(W.inst || 0, W.year || 0);
  claim.visible = !!W.claim; if (W.claim) { claim.position.set(...W.claim[0]); claim.scale.setScalar(Math.max(0.01, W.claim[1])); faceCam(claim); }
  seal.visible = !!W.seal; if (W.seal) { seal.position.set(...W.seal[0]); seal.scale.setScalar(Math.max(0.01, W.seal[1])); faceCam(seal); seal.rotation.z = Math.sin(t * 3) * 0.08; }
  setThread(W.thread || 0, W.cut || 0); notStamp.visible = (W.not || 0) > 0.01; notStamp.scale.setScalar(lerp(2.2, 1, clamp(W.not || 0))); notStamp.material.opacity = clamp((W.not || 0) * 2); notStamp.material.transparent = true;
  claimCard.scale.setScalar(1 + 0.12 * Math.sin(clamp(W.claimPulse || 0) * Math.PI)); fEvid.scale.setScalar(1 + 0.1 * Math.sin(clamp(W.evPulse || 0) * Math.PI));
  invTab.visible = (W.inv || 0) > 0.01; invTab.scale.setScalar(Math.max(0.01, W.inv || 0));
  setPress(W.press || 0);
  files.forEach((f, i) => { const s = (W.files || [])[i]; f.visible = !!s; if (s) { f.position.set(s[0], DESK.y + 0.003 + i * 0.001, s[1]); f.scale.setScalar(Math.max(0.01, s[2] ?? 1)); f.rotation.y = s[3] || 0; } });
  letters.forEach((m, i) => { const s = (W.letters || [])[i]; m.visible = !!s; if (s) { m.position.set(s[0], DESK.y + 0.006 + i * 0.004, s[1]); m.rotation.z = s[2] || 0; } });
  C(ch.reader, t, W.reader, rim); C(ch.locke, t, W.locke, rim);
}
const FILE_A0 = [0.45, 0.12], FILE_B0 = [-0.45, 0.12];

// ================================================================ S1 0–3.5 hook: "A newspaper put bat people on the Moon. The discovery was invented."
const CAM1 = [[0.0, 0.18, 1.6, 1.35, 0.0, 0.86, 0.0, 46], [1.2, 0.12, 1.42, 1.08, -0.02, 0.9, -0.02, 45], [2.4, 0.06, 1.25, 0.86, -0.03, 0.96, -0.04, 44], [3.6, 0.02, 1.16, 0.74, -0.03, 0.98, -0.05, 43]];
function seg1(t) { setCam(CAM1, t);
  const up = ss(0.72, 1.05, t);
  world(t, { up, crit: [pop(1.0, t, 0.2), pop(1.2, t, 0.2), pop(1.4, t, 0.2)], flap: ss(1.5, 1.8, t), flag: true, stampPulse: clamp((t - 2.75) / 0.3) }); }

// ================================================================ S2 3.5–12.95 1835 · six instalments · lunar discoveries · the paper claimed: JOHN HERSCHEL · "science"
const CAM2 = [[3.3, 0.0, 1.35, 1.5, 0.0, 1.62, -0.9, 44], [4.5, 0.0, 1.45, 1.75, 0.0, 1.66, -0.9, 45], [5.6, 0.0, 1.5, 2.25, 0.0, 1.58, -0.9, 46], [6.5, 0.0, 1.5, 2.35, 0.0, 1.56, -0.9, 46],
  [7.4, 0.0, 2.15, 1.3, 0.0, 0.8, -0.12, 46], [8.3, 0.0, 2.1, 1.22, 0.0, 0.8, -0.12, 45], [9.2, 0.05, 1.35, 1.2, 0.0, 1.18, -0.25, 44], [10.9, 0.05, 1.33, 1.05, 0.02, 1.17, -0.25, 43],
  [11.9, 0.25, 1.4, 1.35, 0.12, 1.15, -0.25, 46], [13.1, 0.3, 1.42, 1.5, 0.12, 1.12, -0.25, 47]];
function seg2(t) { setCam(CAM2, t);
  const cl = pop(8.65, t, 0.2), sl = pop(11.5, t, 0.2);
  world(t, { up: 0, year: ss(3.65, 4.4, t), inst: ss(5.6, 6.45, t), stampPulse: 0,
    claim: t > 8.6 ? [[0, 1.2, -0.25], cl] : null, seal: t > 11.45 ? [[0.31, 1.07, -0.22], sl] : null }); }

// ================================================================ S3 12.95–21.2 the claimed inhabitants · a reader opens the page · a whole strange world · "confidence of a scientific report"
const CAM3 = [[12.8, 0.0, 1.3, 1.65, 0.0, 1.05, -0.2, 46], [14.2, -0.02, 1.15, 1.05, -0.06, 1.0, 0.0, 43], [15.6, -0.06, 1.05, 0.66, -0.12, 0.98, 0.1, 40],
  [16.6, 0.12, 1.42, 2.0, 0.0, 1.25, -0.5, 46], [17.7, 0.1, 1.4, 1.85, 0.0, 1.22, -0.45, 45], [18.9, -0.45, 1.3, 1.55, -0.05, 1.0, -0.1, 45], [20.0, -0.3, 1.2, 1.15, 0.05, 1.0, 0.0, 43], [21.4, -0.2, 1.18, 1.0, 0.08, 1.0, 0.0, 42]];
function seg3(t) { setCam(CAM3, t);
  const open = ss(16.3, 17.3, t);
  world(t, { up: 1, crit: [1, 1, 1], flap: 1, flag: true, seal: t > 19.6 ? [[0.02, 1.22, -0.02], pop(19.65, t, 0.2)] : null,
    reader: t < 15.95 ? null : { at: [0, -0.88], expr: t < 16.3 ? 'neutral' : (t < 17.6 ? 'shock' : (t < 19.3 ? 'greedy' : 'grin')), look: [0, -0.8],
      arms: { l: [-0.3, lerp(1.32, 1.05, open)], r: [0.3, lerp(1.32, 1.05, open)] }, items: { newspaper: { title: 'THE SUN', k: lerp(1, 0.0, open) } }, fx: { sparkle: t > 17.6 && t < 19.3 ? 1 : 0 } } }); }

// ================================================================ S4 21.2–29.8 the board: NAME is not EVIDENCE · not his discovery · the invented Moon
const BN = [Math.sin(0.35), Math.cos(0.35)]; // board normal (x, z)
const BC = [-1.75 + 0.1 * BN[0], -0.55 + 0.1 * BN[1]];
const bcam = (d, y = 1.5, dx = 0) => [BC[0] + BN[0] * d + dx * BN[1], y, BC[1] + BN[1] * d - dx * BN[0]];
const CAM4 = [[21.0, ...bcam(3.2, 1.55, 0.3), BC[0], 1.5, BC[1], 46], [22.4, ...bcam(2.85, 1.52, 0.1), BC[0], 1.52, BC[1], 45], [24.0, ...bcam(2.7, 1.5, -0.05), BC[0], 1.52, BC[1], 44],
  [25.3, ...bcam(2.5, 1.5, 0), BC[0], 1.5, BC[1], 44], [26.6, ...bcam(2.4, 1.5, 0), BC[0], 1.5, BC[1], 43],
  [27.6, 0.12, 1.38, 1.35, 0.08, 0.98, -0.05, 46], [28.6, 0.1, 1.3, 1.18, 0.08, 0.97, -0.05, 45], [30.0, 0.05, 1.25, 1.0, 0.05, 0.97, -0.03, 43]];
function seg4(t) { setCam(CAM4, t);
  world(t, { cool: 0.35, up: 1, crit: [1, 1, 1], flap: 0.6, flag: true, thread: ss(22.15, 22.9, t), cut: ss(24.35, 24.6, t), claimPulse: clamp((t - 23.0) / 0.5), evPulse: clamp((t - 24.5) / 0.5),
    not: ss(25.7, 25.95, t), inv: pop(28.35, t, 0.2) }); }

// ================================================================ S5 29.8–37.2 backward: wings fold → illustration → flat page → slides to the press
const CAM5 = [[29.7, -0.1, 1.15, 0.75, -0.12, 0.97, 0.05, 41], [31.6, -0.07, 1.08, 0.58, -0.13, 0.95, 0.08, 40], [32.8, -0.07, 1.08, 0.56, -0.13, 0.93, 0.08, 40],
  [34.0, 0.0, 1.65, 0.55, -0.02, 0.8, -0.02, 45], [35.2, 0.05, 1.75, 0.55, 0.0, 0.8, -0.05, 46], [36.4, 1.1, 1.8, 1.0, 1.4, 0.85, -0.35, 46], [37.4, 1.55, 1.75, 1.15, 1.95, 0.88, -0.45, 46]];
function seg5(t) { setCam(CAM5, t);
  const rewind = t < 31.9 ? ss(29.9, 30.4, t) : 0;
  const fold = ss(32.0, 32.7, t), c0 = 1 - ss(33.0, 33.6, t), up = 1 - ss(33.8, 34.6, t);
  const slide = ss(35.4, 36.85, t), dest = [PRESS.x, PRESS.bed + 0.066, PRESS.z + 0.36];
  const pg = [lerp(PAGE0.x, dest[0], slide), lerp(PAGE0.y, dest[1], slide) + Math.sin(slide * Math.PI) * 0.12, lerp(PAGE0.z, dest[2], slide)];
  world(t, { up, crit: [Math.min(c0, up), up, up], flap: (1 - fold) * (0.6 + 0.6 * rewind), fold, flag: up > 0.5, ill: pop(33.45, t, 0.18), page: pg, press: 0 }); }

// ================================================================ S6 37.2–45.9 Locke acknowledged writing it · family letters · two different files
const CAM6 = [[37.0, -0.15, 1.45, 2.0, -0.25, 1.12, -0.3, 46], [38.6, -0.2, 1.42, 1.75, -0.28, 1.12, -0.3, 45], [39.6, 0.35, 1.62, 1.05, 0.42, 0.85, 0.08, 43],
  [41.2, 0.4, 1.55, 0.95, 0.44, 0.84, 0.1, 42], [42.4, 0.1, 1.9, 2.3, 0.05, 1.0, 0.0, 48], [44.2, 0.0, 2.05, 2.65, 0.0, 0.98, 0.0, 50], [46.0, 0.0, 2.1, 2.8, 0.0, 0.97, 0.0, 50]];
function seg6(t) { setCam(CAM6, t);
  const fb = pop(37.95, t, 0.2), fa = pop(39.5, t, 0.2), apart = ss(44.6, 45.5, t);
  const L = i => { const t0 = 39.8 + i * 0.25; const k = ss(t0, t0 + 0.35, t); return k > 0 ? [lerp(0.95, FILE_A0[0] - 0.05 + i * 0.05, k), lerp(-0.3, FILE_A0[1] - 0.03 + i * 0.03, k) + (t > 41.0 && t < 41.6 ? Math.sin(t * 40) * 0.006 : 0), lerp(0.6, -0.2 + i * 0.2, k)] : null; };
  const nameIn = ss(42.4, 43.2, t);
  world(t, { cool: 0.15, page: [PRESS.x, PRESS.bed + 0.066, PRESS.z + 0.36], up: 0, flag: false,
    files: [t > 39.45 ? [lerp(FILE_A0[0], 0.62, apart), FILE_A0[1], fa, lerp(0, -0.12, apart)] : null, t > 37.9 ? [lerp(FILE_B0[0], -0.62, apart), FILE_B0[1], fb, lerp(0, 0.12, apart)] : null],
    letters: [L(0), L(1), L(2)],
    claim: t > 42.3 && nameIn < 0.99 ? [[lerp(0.05, FILE_A0[0], nameIn), lerp(1.25, DESK.y + 0.12, nameIn), lerp(-0.2, FILE_A0[1], nameIn)], lerp(0.8, 0.35, nameIn)] : null,
    locke: { at: [-0.35, -0.88], expr: t < 37.85 ? 'neutral' : (t < 39.3 ? 'ashamed' : (t < 42.3 ? 'worried' : 'sigh')), look: t > 39.3 && t < 42.3 ? [1, -0.6] : [0.3, -0.4],
      arms: t > 37.85 && t < 39.3 ? { l: [-0.12, 1.02], r: [0.3, 1.38] } : { l: [-0.27, 0.95], r: [0.27, 0.95] }, open: { r: t > 37.85 && t < 39.3 }, fx: { blush: t > 37.9 && t < 39.6 ? 1 : 0 } } }); }

// ================================================================ S7 45.9–49.2 "Moon creatures. Earthly printing." — the Moon pops up on the press bed, the platen comes down; hold
const CAM7 = [[45.7, 1.8, 1.45, 1.95, 1.95, 1.0, -0.2, 46], [47.0, 1.88, 1.4, 1.75, 1.95, 0.98, -0.2, 46], [49.4, 1.93, 1.36, 1.6, 1.95, 0.96, -0.2, 45]];
function seg7(t) { setCam(CAM7, t);
  const press = ss(47.1, 47.45, t), up = ss(46.15, 46.5, t) * (1 - press);
  world(t, { page: [PRESS.x, PRESS.bed + 0.066, PRESS.z + 0.36], up, crit: [up, up, up], flap: 1 - press, flag: false, press, ill: 1,
    files: [[0.62, FILE_A0[1], 1, -0.12], [-0.62, FILE_B0[1], 1, 0.12]] }); }

// ---------------------------------------------------------------- edit
const SEGS = [{ t0: 0, t1: 3.5, f: seg1 }, { t0: 3.5, t1: 12.95, f: seg2 }, { t0: 12.95, t1: 21.2, f: seg3 }, { t0: 21.2, t1: 29.8, f: seg4 }, { t0: 29.8, t1: 37.2, f: seg5 }, { t0: 37.2, t1: 45.9, f: seg6 }, { t0: 45.9, t1: DURATION, f: seg7 }];
const TRANS = { 3.5: 'dissolve', 12.95: 'dissolve', 21.2: 'dissolve', 29.8: 'dissolve', 37.2: 'dissolve', 45.9: 'dissolve' };
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
