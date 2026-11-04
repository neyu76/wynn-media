// RC01-T006 "Mechanical Turk" — one set: an 18th-century salon stage (x = 0). ANIMATED / SIMPLIFIED RECONSTRUCTION, not a replica.
// A wooden chess cabinet with a board on top; a carved wooden figure seated behind it (neutral robe and cap, no costume caricature);
// a concealed human player inside; simplified magnetic indicators under the board and an arm-control lever (dashed = reconstruction).
import { THREE, scene, ctex, lam, toon, outline, box, R, setSeed, INK, Char, imgTex, paintedMat, woodTex, clamp, lerp, ss } from './core.js';
import { TYPES } from './chars2.js';

TYPES.opp = { coat: '#5b4a8a', shirt: '#f4ecdc', tie: 'bow', tieCol: '#e8e0cc', vest: '#d9c58f', hat: 'none', hair: 'side', hairCol: '#e8e4dc', belly: 0.06, pants: '#3a3448' };
TYPES.op = { coat: '#8a6a4a', shirt: '#efe6d2', tie: 'none', vest: '#6d5238', hat: 'none', hair: 'curly', hairCol: '#2a1d14', belly: 0.02, pants: '#4a3c30' };
TYPES.c1 = { coat: '#2f6e8a', shirt: '#f4ecdc', tie: 'bow', tieCol: '#c8323a', vest: '#e8dcc0', hat: 'top', hatCol: '#24252b', hair: 'slick', hairCol: '#3a2618', mustache: 'thin', belly: 0.05, pants: '#2b2b33' };
TYPES.c2 = { coat: '#b8434a', shirt: '#f4ecdc', tie: 'none', vest: '#f1e9d6', hat: 'bowler', hatCol: '#3a2a1e', hair: 'side', hairCol: '#7a4a22', belly: 0.08, pants: '#4a4048' };
TYPES.c3 = { coat: '#4f8a52', shirt: '#f4ecdc', tie: 'tie', tieCol: '#e0b13c', vest: '#e8dcc0', hat: 'none', hair: 'curly', hairCol: '#1b1512', belly: 0.03, pants: '#3a3a40' };

const V = (x, y, z) => new THREE.Vector3(x, y, z);
export function fit(c, txt, x, y, maxW, size, col = INK, font = '"DejaVu Sans", sans-serif', wgt = 'bold') { let s = size; do { c.font = `${wgt} ${s}px ${font}`; s -= 2; } while (c.measureText(txt).width > maxW && s > 8);
  c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, x, y); }
function rawTex(w, h, paint) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
const card = (w, h, tex, parent, opts = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, toneMapped: false, fog: false, ...opts })); parent.add(m); return m; };

setSeed(6006);
export const S = { g: new THREE.Group() }; scene.add(S.g);
const g = S.g;
// stage floor + painted back wall
{ const f = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), lam(0xffffff, { map: woodTex(26, 34, 10, false, 1024) })); f.material.map.wrapS = f.material.map.wrapT = THREE.RepeatWrapping; f.material.map.repeat.set(5, 5);
  f.rotation.x = -Math.PI / 2; f.receiveShadow = true; g.add(f);
  const BW = 11, BH = BW * 768 / 1376; const b = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), paintedMat(imgTex('mg/stage_b.jpg'), 0.6)); b.position.set(0, BH / 2 - 0.1 * BH, -4.0); g.add(b); }

// ---------- cabinet ----------
export const CAB = { x: 0, w: 1.3, h: 0.86, z0: -0.42, z1: 0.38 };
const wood = toon(0x7a4a26), woodL = toon(0x9a6438), gold = toon(0xd9a93c), inner = toon(0x3a2416);
const cab = new THREE.Group(); g.add(cab);
{ const { w, h, z0, z1 } = CAB, d = z1 - z0, zc = (z0 + z1) / 2, t = 0.035;
  box(w + 0.06, t, d + 0.06, woodL, 0, h - t / 2, zc, cab, 0.006); box(w, t, d, inner, 0, 0.09, zc, cab); box(w, h - 0.1, t, inner, 0, (h + 0.08) / 2, z0 + t / 2, cab);
  for (const s of [-1, 1]) box(t, h - 0.1, d, wood, s * (w / 2 - t / 2), (h + 0.08) / 2, zc, cab, 0.005);
  for (const sx of [-1, 1]) for (const sz of [z0 + 0.04, z1 - 0.04]) box(0.07, 0.09, 0.07, gold, sx * (w / 2 - 0.04), 0.045, sz, cab); }
// front panel (doors with gilded trim); it fades for the x-ray cutaway
const frontTex = ctex(1024, 640, (c, w, h) => { c.fillStyle = '#7a4a26'; c.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { c.strokeStyle = `rgba(50,25,8,${R(0.1, 0.25)})`; c.lineWidth = 2; c.beginPath(); const y = R(0, h); c.moveTo(0, y); c.bezierCurveTo(w / 3, y + R(-8, 8), 2 * w / 3, y + R(-8, 8), w, y); c.stroke(); }
  c.strokeStyle = '#d9a93c'; c.lineWidth = 12; c.strokeRect(14, 14, w - 28, h - 28); c.lineWidth = 7;
  for (const [x0, x1] of [[50, 340], [372, 652], [684, 974]]) { c.strokeRect(x0, 60, x1 - x0, h - 230); c.beginPath(); c.arc((x0 + x1) / 2, h - 300, 10, 0, 7); c.fillStyle = '#d9a93c'; c.fill(); }
  c.strokeRect(50, h - 140, 924, 86); for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(220 + i * 290, h - 97, 9, 0, 7); c.fill(); } });
export const front = new THREE.Mesh(new THREE.PlaneGeometry(CAB.w, CAB.h - 0.1), new THREE.MeshLambertMaterial({ map: frontTex, transparent: true, side: THREE.DoubleSide }));
front.position.set(0, (CAB.h + 0.08) / 2, CAB.z1 + 0.002); cab.add(front);
// dashed outline = "this part is reconstructed"
const dashTex = rawTex(1024, 680, (c, w, h) => { c.strokeStyle = '#ffd24a'; c.lineWidth = 12; c.setLineDash([42, 26]); c.strokeRect(10, 10, w - 20, h - 20); });
export const dash = card(CAB.w + 0.08, CAB.h + 0.06, dashTex, g, { depthWrite: false, opacity: 0 }); dash.position.set(0, CAB.h / 2 + 0.02, CAB.z1 + 0.03);
export function setXray(k, d = 0) { front.material.opacity = 1 - 0.88 * clamp(k); front.material.depthWrite = k < 0.5; front.renderOrder = 2; dash.material.opacity = clamp(d); dash.visible = d > 0.01; inside.visible = k > 0.01; candle.intensity = 1.6 * clamp(k); }

// ---------- chessboard + pieces ----------
export const BRD = { x: -0.02, y: CAB.h + 0.02, z: -0.1, sq: 0.07 };
{ const tex = ctex(512, 512, (c, w) => { const s = w / 8; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#6b3e1e' : '#e8d2a6'; c.fillRect(i * s, j * s, s, s); } });
  const b = box(BRD.sq * 8, 0.025, BRD.sq * 8, [wood, wood, toon(0xffffff, { map: tex }), wood, wood, wood], BRD.x, BRD.y - 0.0125, BRD.z, g, 0.004); b.receiveShadow = true;
  box(BRD.sq * 8 + 0.05, 0.02, BRD.sq * 8 + 0.05, gold, BRD.x, BRD.y - 0.03, BRD.z, g); }
// square → world (file 0..7 = a..h along +x, rank 0..7 = 1..8 away from the camera)
export const sqW = (f, r, y = BRD.y) => V(BRD.x + (f - 3.5) * BRD.sq, y, BRD.z + (3.5 - r) * BRD.sq);
const PROF = { p: [[0, 0], [0.026, 0], [0.026, 0.006], [0.016, 0.012], [0.011, 0.03], [0.016, 0.034], [0.009, 0.04], [0.014, 0.05], [0.006, 0.058], [0, 0.06]],
  r: [[0, 0], [0.028, 0], [0.028, 0.007], [0.018, 0.014], [0.016, 0.05], [0.022, 0.054], [0.022, 0.068], [0, 0.068]],
  n: [[0, 0], [0.028, 0], [0.028, 0.007], [0.018, 0.014], [0.015, 0.04], [0, 0.04]],
  b: [[0, 0], [0.028, 0], [0.028, 0.007], [0.017, 0.014], [0.01, 0.05], [0.016, 0.062], [0.012, 0.075], [0.004, 0.084], [0, 0.086]],
  q: [[0, 0], [0.03, 0], [0.03, 0.008], [0.019, 0.016], [0.011, 0.07], [0.02, 0.08], [0.012, 0.094], [0, 0.098]],
  k: [[0, 0], [0.03, 0], [0.03, 0.008], [0.019, 0.016], [0.012, 0.074], [0.02, 0.082], [0.016, 0.098], [0, 0.1]] };
const pmat = { w: toon(0xf3e6c8), b: toon(0x2b1d14) };
function piece(kind, col) { const grp = new THREE.Group(); const m = new THREE.Mesh(new THREE.LatheGeometry(PROF[kind].map(([x, y]) => new THREE.Vector2(x, y)), 20), pmat[col]); m.castShadow = true; outline(m, 0.0025); grp.add(m);
  if (kind === 'n') { const h = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.04, 0.036), pmat[col]); h.position.set(0, 0.056, 0.006); h.rotation.x = 0.35; outline(h, 0.0025); grp.add(h); }
  if (kind === 'k') { box(0.006, 0.026, 0.006, pmat[col], 0, 0.11, 0, grp); box(0.018, 0.006, 0.006, pmat[col], 0, 0.114, 0, grp); }
  if (kind === 'b') { const s = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 6), pmat[col]); s.position.y = 0.09; grp.add(s); }
  if (col === 'b') grp.rotation.y = Math.PI; g.add(grp); return grp; }
export const PIECES = {};
{ const back = 'rnbqkbnr'; for (let f = 0; f < 8; f++) { PIECES[`w${f}0`] = piece(back[f], 'w'); PIECES[`w${f}1`] = piece('p', 'w'); PIECES[`b${f}6`] = piece('p', 'b'); PIECES[`b${f}7`] = piece(back[f], 'b'); } }
// id = colour + starting file + starting rank; board state is placed from main.js
export const START = id => [+id[1], +id[2]];

// ---------- the wooden figure (seated behind the cabinet) ----------
export const FIG = { x: 0.0, z: -0.66 };
const robe = toon(0x2f5a4a), robeD = toon(0x24463a), woodF = toon(0xc99a62), capM = toon(0x7a2e2e);
export const fig = new THREE.Group(); fig.position.set(FIG.x, 0, FIG.z); g.add(fig);
box(0.5, 0.62, 0.42, wood, 0, 0.31, -0.05, fig, 0.005);
export const torso = new THREE.Group(); torso.position.set(0, 0.62, 0); fig.add(torso);
{ const body = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.24, 0], [0.25, 0.1], [0.22, 0.4], [0.17, 0.62], [0.09, 0.7], [0, 0.71]].map(([x, y]) => new THREE.Vector2(x, y)), 24), robe); body.scale.z = 0.75; body.castShadow = true; outline(body, 0.006); torso.add(body);
  const trim = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 8, 24), gold); trim.rotation.x = Math.PI / 2; trim.position.y = 0.68; torso.add(trim);
  const sash = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.022, 8, 28), gold); sash.rotation.x = Math.PI / 2; sash.scale.y = 0.75; sash.position.y = 0.3; torso.add(sash);
  for (const s of [-1, 1]) { const sh = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 10), robeD); sh.position.set(s * 0.2, 0.6, 0); outline(sh, 0.005); torso.add(sh); } }
export const head = new THREE.Group(); head.position.set(0, 0.86, 0); torso.add(head);
{ const faceTex = ctex(512, 512, (c, w, h) => { c.fillStyle = '#c99a62'; c.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) { c.strokeStyle = `rgba(110,70,30,${R(0.1, 0.25)})`; c.lineWidth = 3; c.beginPath(); const x = R(0, w); c.moveTo(x, 0); c.bezierCurveTo(x + R(-20, 20), h / 3, x + R(-20, 20), 2 * h / 3, x, h); c.stroke(); }
    c.fillStyle = INK; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(256 + s * 60, 238, 16, 22, 0, 0, 7); c.fill(); c.fillRect(256 + s * 60 - 34, 190, 68, 12); }
    c.strokeStyle = INK; c.lineWidth = 9; c.beginPath(); c.moveTo(220, 330); c.lineTo(292, 330); c.stroke(); c.fillStyle = 'rgba(180,90,60,0.35)'; for (const s of [-1, 1]) { c.beginPath(); c.arc(256 + s * 92, 300, 26, 0, 7); c.fill(); } });
  faceTex.offset.x = 0.25; faceTex.wrapS = THREE.RepeatWrapping;
  const hm = new THREE.Mesh(new THREE.SphereGeometry(0.17, 28, 20), toon(0xffffff, { map: faceTex })); hm.scale.set(1, 1.08, 0.95); hm.castShadow = true; outline(hm, 0.006); head.add(hm);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.168, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.2), capM); cap.position.y = 0.045; cap.scale.set(1.05, 0.7, 1.0); outline(cap, 0.005); head.add(cap);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.168, 0.016, 8, 28), gold); band.rotation.x = Math.PI / 2; band.position.y = 0.05; head.add(band);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 12), woodF); neck.position.y = -0.17; head.add(neck); }
// arms: upper/fore cylinders placed between joints each frame (2-bone IK in main.js); hands = carved wooden mitts
const limb = (r, m) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.9, 1, 12), m); c.castShadow = true; outline(c, 0.005); g.add(c); return c; };
export const ARM = { L1: 0.4, L2: 0.4, r: { up: limb(0.06, robe), fo: limb(0.05, robe), hand: null }, l: { up: limb(0.06, robe), fo: limb(0.05, robe), hand: null } };
for (const s of ['r', 'l']) { const hg = new THREE.Group(); const p = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), woodF); p.scale.set(1, 0.75, 1.25); p.castShadow = true; outline(p, 0.004); hg.add(p);
  const th = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.03, 4, 8), woodF); th.position.set(0.03, -0.01, 0.02); th.rotation.z = 0.8; hg.add(th); g.add(hg); ARM[s].hand = hg; }
export const SHOULDER = { r: V(0.2, 0.6, 0), l: V(-0.2, 0.6, 0) }; // torso-local
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _d = new THREE.Vector3(), _n = new THREE.Vector3(), UP = V(0, 1, 0);
export function place(m, a, b) { _d.subVectors(b, a); const L = _d.length(); m.position.copy(a).addScaledVector(_d, 0.5); m.quaternion.setFromUnitVectors(UP, _d.normalize()); m.scale.set(1, L, 1); }
// side 'r' | 'l', target hand position (world), pole hint (world dir the elbow bends toward)
export function armTo(side, T, pole) { torso.updateMatrixWorld(true); const Sw = torso.localToWorld(SHOULDER[side].clone()); const { L1, L2 } = ARM;
  _d.subVectors(T, Sw); let d = _d.length(); d = Math.min(d, L1 + L2 - 0.005); _d.normalize(); const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  _n.copy(pole).addScaledVector(_d, -pole.dot(_d)).normalize(); const E = Sw.clone().addScaledVector(_d, a).addScaledVector(_n, h); const H = Sw.clone().addScaledVector(_d, d);
  const A = ARM[side]; place(A.up, Sw, E); place(A.fo, E, H); A.hand.position.copy(H); A.hand.quaternion.setFromUnitVectors(UP, _b.subVectors(H, E).normalize()); return { S: Sw, E, H }; }

// ---------- inside the cabinet (visible in the cutaway) ----------
export const inside = new THREE.Group(); g.add(inside); inside.visible = false;
export const candle = new THREE.PointLight(0xffb060, 0, 1.6, 1.5); candle.position.set(0.42, 0.42, 0.05); inside.add(candle);
{ box(0.03, 0.12, 0.03, toon(0xf3ead6), 0.42, 0.16, 0.05, inside); const fl = card(0.04, 0.06, rawTex(64, 96, (c) => { const gr = c.createRadialGradient(32, 60, 2, 32, 56, 30); gr.addColorStop(0, '#fff6c0'); gr.addColorStop(0.5, '#ffb040'); gr.addColorStop(1, 'rgba(255,140,40,0)'); c.fillStyle = gr; c.beginPath(); c.ellipse(32, 56, 18, 34, 0, 0, 7); c.fill(); }), inside, { depthWrite: false }); fl.position.set(0.42, 0.25, 0.05);
  // the operator's own small peg board
  const pb = ctex(256, 256, (c, w) => { const s = w / 8; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#6b3e1e' : '#e8d2a6'; c.fillRect(i * s, j * s, s, s); } });
  const peg = box(0.2, 0.012, 0.2, [wood, wood, toon(0xffffff, { map: pb }), wood, wood, wood], -0.1, 0.34, 0.12, inside, 0.003); peg.rotation.x = 0.5; }
// magnetic indicators: one small iron disc on a thread under each square (simplified); up = piece above, down = empty
export const IND = {};
{ const thread = lam(0x2a2a2a), disc = toon(0x8a8f98); for (let f = 0; f < 8; f++) for (let r = 0; r < 8; r++) { const p = sqW(f, r, CAB.h - 0.04); const grp = new THREE.Group(); grp.position.copy(p); inside.add(grp);
    const th = box(0.003, 1, 0.003, thread, 0, 0, 0, grp); const d = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.006, 14), disc); d.userData.base = disc; grp.add(d); IND[`${f}${r}`] = { grp, th, d }; } }
export function setInd(key, down, hi) { const o = IND[key]; const y = -0.015 - 0.06 * clamp(down); o.d.position.y = y; o.th.position.y = y / 2; o.th.scale.y = Math.max(0.001, -y); o.d.material = hi > 0.01 ? HI : o.d.userData.base; }
const HI = toon(0xffd24a, { emissive: 0x8a5a00 });
// arm-control lever: pivot at the cabinet back, knob in the operator's hand; dashed link up to the figure's arm
export const lever = { rod: limb(0.012, toon(0x3a3a3a)), knob: new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), toon(0xb8862e)), pivot: V(0.2, 0.74, CAB.z0 + 0.06) };
inside.add(lever.rod, lever.knob);
const linkTex = rawTex(32, 256, (c, w, h) => { c.fillStyle = '#ffd24a'; for (let y = 0; y < h; y += 32) c.fillRect(8, y, 16, 18); });
export const link = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 1), new THREE.MeshBasicMaterial({ map: linkTex, transparent: true, depthTest: false, toneMapped: false })); link.renderOrder = 5; inside.add(link);
export function setLever(knob) { lever.knob.position.copy(knob); place(lever.rod, lever.pivot, knob); }

// ---------- labels ----------
function labelTex(txt, sub, col = '#2b3f73') { return rawTex(760, sub ? 200 : 140, (c, w, h) => { c.fillStyle = 'rgba(250,246,236,0.96)'; c.beginPath(); c.roundRect(6, 6, w - 12, h - 12, 26); c.fill(); c.strokeStyle = INK; c.lineWidth = 8; c.stroke();
  fit(c, txt, w / 2, sub ? 72 : h / 2, w - 70, 66, col); if (sub) fit(c, sub, w / 2, 144, w - 80, 40, '#6a5a44', '"DejaVu Serif", serif', 'italic'); }); }
export function label(txt, sub, w = 0.42) { const m = card(w, w * (sub ? 200 : 140) / 760, labelTex(txt, sub), g, { depthTest: false, opacity: 0 }); m.renderOrder = 6; m.visible = false; return m; }
export const LAB = { player: label('CONCEALED PLAYER', null, 0.34), magnet: label('MAGNETIC INDICATORS', 'simplified', 0.3), lever: label('ARM CONTROL', 'simplified', 0.36), skill: label('CHESS SKILL: HUMAN', null, 0.42) };
export function showLabel(m, k, pos, cam) { m.visible = k > 0.01; m.material.opacity = clamp(k); if (pos) m.position.copy(pos); if (cam) m.quaternion.copy(cam.quaternion); m.scale.setScalar(0.85 + 0.15 * clamp(k)); }
// plaque on the stage floor in front of the cabinet (always visible)
const plaqueTex = (a, b) => rawTex(900, 170, (c, w, h) => { c.fillStyle = '#f4f1ea'; c.fillRect(0, 0, w, h); c.strokeStyle = INK; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); fit(c, a, w / 2, 62, w - 60, 62, '#2b3f73'); fit(c, b, w / 2, 128, w - 80, 40, '#6a5a44', '"DejaVu Serif", serif', 'italic'); });
const PQ = { anim: plaqueTex('ANIMATED RECONSTRUCTION', 'staged scene · not a historical game'), simp: plaqueTex('SIMPLIFIED RECONSTRUCTION', 'mechanism shown as a simplified model') };
// the notice rides with the camera (top of the frame, above the captions): readable in every shot, never clipped
export const plaque = card(0.62, 0.117, PQ.anim, scene, { depthTest: false, depthWrite: false }); plaque.renderOrder = 9;
export function setPlaque(kind, cam) { plaque.material.map = PQ[kind]; const h = 2 * Math.tan(cam.fov * Math.PI / 360); const w = h * cam.aspect;
  plaque.position.set(0, 0.405 * h, -1).applyMatrix4(cam.matrixWorld); plaque.quaternion.copy(cam.quaternion); plaque.scale.setScalar(0.5 * w / 0.62); }

// ---------- characters ----------
export const ch = { opp: new Char('opp', g), op: new Char('op', g), c1: new Char('c1', g), c2: new Char('c2', g), c3: new Char('c3', g) };
export const key = new THREE.DirectionalLight(0xffe8c8, 2.0); key.position.set(-2.5, 5.5, 4.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); { const c = key.shadow.camera; c.left = -3; c.right = 3; c.top = 3; c.bottom = -3; c.far = 20; } key.shadow.bias = -0.0005; g.add(key); key.target.position.set(0, 0.8, 0); g.add(key.target);
