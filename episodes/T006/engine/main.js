import { THREE, scene, camera, renderer, WIDTH, HEIGHT, hemi, sun, sky, setCam, setKicks, step, ss, clamp, lerp, lerpA, blinkLid, REACT_LEAD, pop, renderPost, POST, TEXLOAD } from './core.js';
import { S as SET, CAB, BRD, sqW, PIECES, START, fig, torso, head, armTo, setXray, inside, candle, setInd, lever, link, setLever, place, LAB, showLabel, setPlaque, ch, key } from './stage.js';

// RC01-T006 "Mechanical Turk" (48.0 s, animated / simplified reconstruction). Voice starts 0.10 s; all times are video time.
// Moves are a generic legal opening (1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5), not a historical game.
export const DURATION = 48.0;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const _p = new THREE.Vector3();
setKicks([[1.27, 0.5], [11.86, 0.4], [13.89, 0.5], [24.17, 0.4], [27.05, 0.5], [31.91, 0.6], [36.57, 0.5], [45.88, 0.5]]);

function light(k = 1) { sky.visible = false; scene.background = new THREE.Color(0x2a1a14); scene.fog.color.set(0x2a1a14); scene.fog.near = 30; scene.fog.far = 90; sun.intensity = 0;
  hemi.intensity = 0.85 * k; hemi.color.set(0xffeedd); hemi.groundColor.set(0x6a4a30); key.intensity = 1.9 * k; POST.vigOff = false;
  return { col: '#ffd59a', side: -1, a: 0.5 }; }
const EX = (list, t) => ({ expr: step(list, t + REACT_LEAD), swaps: list.slice(1).map(e => e[0] - REACT_LEAD) });
// characters: at [x, z], y, sc; hands either local [x, y] or world targets (hw: { l, r } Vector3)
function C(c, t, s, rim, seed) { if (!s) { c.mesh.visible = false; return; } c.mesh.visible = true; c.at(s.at[0], s.y || 0, s.at[1], s.sc || 1); c.face(camera); c.mesh.updateMatrixWorld();
  const e = Array.isArray(s.ex) ? EX(s.ex, t) : { expr: s.ex || 'neutral', swaps: [] }; const arms = { ...(s.arms || {}) };
  if (s.hw) for (const k of ['l', 'r']) if (s.hw[k]) { _p.copy(s.hw[k]); c.mesh.worldToLocal(_p); arms[k] = [_p.x, _p.y]; }
  c.set({ expr: e.expr, look: s.look || [0, 0], blink: blinkLid(t, seed, e.swaps), arms, open: s.open || {}, fx: s.fx || {}, lean: s.lean || 0, rim }, t); }

// ---------------- chess moves (by: 'fig' wooden hand, 'opp' opponent's hand) ----------------
const MOVES = [{ id: 'w41', to: [4, 3], t: 11.86, by: 'opp' }, { id: 'b46', to: [4, 4], t: 13.89, by: 'fig' }, { id: 'w60', to: [5, 2], t: 24.17, by: 'opp' },
  { id: 'b17', to: [2, 5], t: 27.05, by: 'fig' }, { id: 'w50', to: [2, 3], t: 28.1, by: 'opp' }, { id: 'b57', to: [2, 4], t: 29.01, by: 'fig' }];
const UPH = 0.085; // hand centre above the piece base while holding it
// S1 shows the last move early (flash-forward); S7 matches that shot
const S1MOVES = MOVES.map((m, i) => ({ ...m, t: i < 5 ? -10 : 1.27 }));
function hold(m, t, rest) { const A = sqW(...START(m.id)), B = sqW(...m.to), T = m.t; if (t < T - 0.95 || t > T + 0.55) return null;
  const up = (p, h) => p.clone().add(V(0, h, 0)); let hand, piece = null;
  if (t < T - 0.6) hand = rest.clone().lerp(up(A, UPH + 0.08), ss(T - 0.95, T - 0.6, t));
  else if (t < T - 0.45) hand = up(A, UPH + 0.08 * (1 - ss(T - 0.6, T - 0.45, t)));
  else if (t < T - 0.08) { const k = ss(T - 0.45, T - 0.08, t); hand = up(A.clone().lerp(B, k), UPH + 0.03 + 0.07 * Math.sin(Math.PI * k)); piece = up(hand, -UPH); }
  else if (t < T) { hand = up(B, UPH + 0.03 * (1 - ss(T - 0.08, T, t))); piece = up(hand, -UPH); }
  else hand = up(B, UPH + 0.1 * ss(T, T + 0.15, t)).lerp(rest, ss(T + 0.1, T + 0.55, t));
  return { hand, piece }; }
// place all pieces, return the active hands { fig, opp } and the indicator state
function board(t, moves) { const sq = {}, hands = {}; for (const id in PIECES) sq[id] = START(id);
  const held = {}; let hiSq = [];
  for (const m of moves) { if (t >= m.t) sq[m.id] = m.to; const h = hold(m, t, m.by === 'fig' ? FIG_REST : OPP_REST); if (h) { hands[m.by] = h.hand; if (h.piece) held[m.id] = h.piece; }
    if (t > m.t - 0.5 && t < m.t + 1.4) hiSq = [START(m.id), m.to]; }
  const occ = {}; for (const id in PIECES) { const p = PIECES[id]; p.position.copy(held[id] || sqW(...sq[id])); if (!held[id]) occ[`${sq[id][0]}${sq[id][1]}`] = 1; }
  for (let f = 0; f < 8; f++) for (let r = 0; r < 8; r++) { const k = `${f}${r}`; setInd(k, occ[k] ? 0 : 1, hiSq.some(s => s[0] === f && s[1] === r) ? 1 : 0); }
  return hands; }

// ---------------- the figure, the lever, the operator ----------------
const FIG_REST = V(0.34, BRD.y + 0.06, -0.34), FIG_RESTL = V(-0.36, BRD.y + 0.05, -0.36);
const OPP_REST = V(-0.47, 0.95, 0.35);
const POLE_R = V(1, -0.6, -0.4).normalize(), POLE_L = V(-1, -0.6, -0.4).normalize();
const KNOB_REST = V(0.06, 0.4, 0.1);
function figure(t, F, hand) { torso.rotation.x = 0.32 * (F.bow || 0); head.rotation.y = F.look ?? 0.25 * Math.sin(t * 0.7); head.rotation.x = F.nod || 0; fig.updateMatrixWorld(true);
  const H = hand || FIG_REST.clone().add(V(0, 0.012 * Math.sin(t * 1.3), 0)); armTo('r', H, POLE_R); armTo('l', FIG_RESTL, POLE_L);
  const knob = KNOB_REST.clone().add(H.clone().sub(FIG_REST).multiplyScalar(0.3)); setLever(knob);
  torso.updateMatrixWorld(true); const sh = torso.localToWorld(V(0.2, 0.6, 0)); link.visible = inside.visible; place(link, lever.pivot, sh); return knob; }
const OP_AT = [-0.2, 0.02], OP_Y = 0.05, OP_SC = 0.31;
const P_OPP = [-0.62, 0.3];
const CROWD = { c1: [-0.88, 1.75], c2: [0.86, 1.8], c3: [1.45, 0.9] };
function clap(t, on, ph = 0) { if (!on) return {}; const k = Math.abs(Math.sin((t + ph) * Math.PI * 3.2)); return { arms: { l: [-0.04 - 0.07 * k, 0.98], r: [0.04 + 0.07 * k, 0.98] }, open: { l: true, r: true } }; }

// world state W: { x: xray 0..1, dash, plaque, opp, op, crowd: { ex, clap }, F: figure options, moves, labels }
function world(t, W) {
  const rim = light(W.light ?? 1); setXray(W.x || 0, W.dash || 0); camera.updateMatrixWorld(); setPlaque(W.plaque || 'anim', camera);
  const hands = board(t, W.moves || MOVES); const knob = figure(t, W.F || {}, hands.fig);
  C(ch.opp, t, W.opp ? { at: P_OPP, ...W.opp, hw: hands.opp ? { r: hands.opp } : undefined } : null, rim, 1);
  C(ch.op, t, inside.visible && W.op ? { at: OP_AT, y: OP_Y, sc: OP_SC, ...W.op, hw: { r: knob } } : null, rim, 2);
  const cr = W.crowd; let i = 0; for (const k of ['c1', 'c2', 'c3']) { C(ch[k], t, cr ? { at: CROWD[k], sc: 0.8, ex: cr.ex || 'grin', look: k === 'c1' ? [1, 0.2] : [-1, 0.2], ...clap(t, cr.clap, i * 0.13) } : null, rim, 3 + i); i++; }
  for (const k in LAB) { const L = (W.labels || {})[k]; showLabel(LAB[k], L ? L[0] : 0, L ? L[1] : null, camera); }
}
const OPP = (ex, look = [1, -0.3], extra = {}) => ({ ex, look, ...extra });

// ================================================================ S1 0–3.42 hook: close on the board, the wooden hand plays; the cabinet front ghosts → the hidden player thinks
const CAM1 = [[0.0, -0.02, 1.3, 0.3, -0.12, 0.9, -0.17, 40], [1.4, 0.0, 1.32, 0.38, -0.1, 0.9, -0.19, 41], [2.05, 0.15, 0.72, 1.6, 0.0, 0.55, 0.1, 43], [3.6, 0.08, 0.6, 1.75, -0.05, 0.47, 0.05, 42]];
function seg1(t) { setCam(CAM1, t);
  world(t, { moves: S1MOVES, x: 0.75 * ss(1.95, 2.35, t), op: { ex: [[0, 'squint'], [2.85, 'smug']], look: [0.3, 1], fx: { bulb: ss(2.8, 2.95, t) } }, F: { look: 0.2 } }); }

// ================================================================ S2 3.42–10.6 the Mechanical Turk: figure seated at a board, cabinet underneath; looks self-playing
const CAM2 = [[3.3, 0.0, 1.5, 4.8, 0.0, 1.05, -0.2, 48], [5.3, 0.05, 1.42, 3.2, 0.0, 1.22, -0.5, 44], [6.1, -0.08, 1.25, 2.3, 0.0, 0.95, -0.1, 42], [7.2, 0.0, 0.78, 2.9, 0.0, 0.5, 0.1, 44],
  [8.4, 0.3, 1.15, 4.4, 0.0, 0.9, 0.0, 48], [10.8, -0.2, 1.22, 3.9, 0.0, 1.0, -0.2, 47]];
function seg2(t) { setCam(CAM2, t);
  world(t, { opp: OPP([[0, 'stare'], [5.3, 'grin'], [9.4, 'shock']], [1, 0.1]), F: { look: t > 9.2 && t < 10.4 ? -0.35 : undefined, nod: t > 9.3 && t < 9.9 ? 0.12 * Math.sin((t - 9.3) / 0.6 * Math.PI) : 0 } }); }

// ================================================================ S3 10.6–18.95 opponent moves · leans forward · the wooden hand answers · who decided?
const CAM3 = [[10.4, -0.55, 1.35, 2.7, -0.2, 0.98, 0.0, 44], [11.9, -0.4, 1.28, 2.2, -0.12, 0.95, -0.05, 42], [13.3, 0.25, 1.2, 1.4, 0.0, 0.98, -0.3, 40], [14.6, 0.42, 1.14, 0.5, 0.3, 0.96, -0.32, 38],
  [16.6, 0.46, 1.12, 0.42, 0.32, 0.96, -0.34, 37], [17.5, 0.05, 0.75, 2.4, 0.0, 0.5, 0.1, 44], [19.1, 0.0, 0.66, 2.3, 0.0, 0.47, 0.1, 44]];
function seg3(t) { setCam(CAM3, t);
  world(t, { opp: OPP([[0, 'grin'], [12.4, 'squint'], [13.95, 'shock'], [15.5, 'squint']], t > 12.3 ? [1, -0.6] : [1, -0.3], { lean: ss(12.3, 12.7, t) * (1 - ss(15.2, 15.8, t)), fx: { qmarks: ss(17.4, 17.6, t) } }),
    F: { look: t > 12.6 && t < 14.4 ? -0.3 : undefined } }); }

// ================================================================ S4 18.95–27.45 inside: concealed player · magnetic indicators follow the board above · lever works the arm
const CAM4 = [[18.8, 0.0, 0.62, 2.4, 0.0, 0.46, 0.1, 46], [20.0, -0.04, 0.55, 1.95, -0.08, 0.42, 0.05, 44], [21.2, -0.1, 0.46, 1.5, -0.15, 0.38, 0.05, 42], [22.4, 0.02, 0.62, 1.45, 0.0, 0.76, -0.05, 42],
  [23.6, 0.06, 0.66, 1.5, 0.05, 0.8, -0.05, 42], [24.6, 0.05, 1.02, 1.7, 0.0, 0.86, -0.1, 44], [25.5, 0.25, 0.85, 2.1, 0.1, 0.82, -0.25, 45], [27.6, 0.18, 0.92, 2.6, 0.06, 0.86, -0.2, 46]];
function seg4(t) { setCam(CAM4, t);
  world(t, { x: ss(19.0, 19.6, t), dash: ss(19.0, 19.6, t), plaque: 'simp', opp: OPP('squint', [1, -0.6]),
    op: { ex: [[0, 'stare'], [20.4, 'squint'], [21.8, 'smug'], [23.5, 'squint'], [26.2, 'smug']], look: t < 22.2 ? [0.4, 0.4] : [0.2, 1], fx: { bulb: ss(21.7, 21.9, t) * (1 - ss(23.0, 23.2, t)) } },
    labels: { player: [ss(20.4, 20.6, t) * (1 - ss(22.1, 22.3, t)), 0.31], skill: [ss(21.7, 21.9, t) * (1 - ss(22.1, 22.3, t)), 0.215],
      magnet: [ss(22.3, 22.5, t) * (1 - ss(24.5, 24.7, t)), 0.3], lever: [ss(25.4, 25.6, t), 0.3] } }); }

// ================================================================ S5 27.45–35.7 the movement is real; the independent mind is the trick; a human decides behind furniture
const CAM5 = [[27.3, 0.0, 0.98, 3.4, 0.0, 0.86, -0.1, 46], [29.3, 0.04, 1.0, 3.2, 0.0, 0.88, -0.15, 45], [30.4, 0.05, 1.35, 2.25, 0.0, 1.25, -0.5, 42], [31.4, 0.08, 1.34, 2.1, 0.0, 1.24, -0.5, 41],
  [32.2, 0.0, 0.85, 3.0, 0.0, 0.75, 0.0, 45], [33.4, -0.1, 0.48, 1.55, -0.15, 0.4, 0.05, 42], [34.6, 0.15, 0.82, 3.3, 0.0, 0.62, 0.0, 46], [35.9, 0.25, 0.9, 3.7, 0.0, 0.66, 0.0, 47]];
function seg5(t) { setCam(CAM5, t);
  const x = Math.max(1 - ss(29.55, 30.0, t), ss(31.85, 32.05, t) * (1 - ss(34.4, 34.9, t)));
  world(t, { x, dash: x, plaque: 'simp', opp: OPP([[0, 'squint'], [29.1, 'shock'], [30.6, 'grin']], [1, -0.4]),
    op: { ex: [[0, 'squint'], [29.05, 'smug'], [32.5, 'squint'], [33.3, 'smug']], look: [0.2, 1], fx: { bulb: ss(32.9, 33.1, t) * (1 - ss(34.2, 34.4, t)) } },
    labels: { lever: [ss(27.6, 27.8, t) * (1 - ss(29.4, 29.6, t)), 0.3] }, F: { look: t > 30.2 && t < 31.6 ? 0.0 : undefined } }); }

// ================================================================ S6 35.7–44.4 the final bow · opponent studies · crowd watches the figure · player out of sight · nobody applauds him
const CAM6 = [[35.5, 0.0, 1.35, 4.9, 0.0, 1.02, -0.1, 50], [36.9, 0.0, 1.38, 4.4, 0.0, 1.1, -0.2, 49], [37.6, -0.5, 1.3, 2.7, -0.3, 0.98, 0.0, 44], [38.6, 0.55, 1.6, 3.9, 0.0, 1.15, -0.3, 44],
  [39.8, 0.1, 0.64, 2.5, 0.0, 0.46, 0.1, 44], [41.3, 0.06, 0.58, 2.2, 0.0, 0.44, 0.1, 43], [42.6, 0.0, 0.6, 2.0, -0.05, 0.42, 0.05, 42], [43.8, 0.0, 1.25, 4.6, 0.0, 1.0, -0.1, 49], [44.6, 0.05, 1.28, 4.4, 0.0, 1.02, -0.1, 48]];
function seg6(t) { setCam(CAM6, t);
  const bow = ss(36.5, 36.9, t) * (1 - ss(37.2, 37.7, t)), x = 0.6 * ss(41.6, 42.0, t) * (1 - ss(43.2, 43.6, t));
  world(t, { x, dash: ss(39.8, 40.2, t), plaque: 'simp', F: { bow }, opp: OPP([[0, 'grin'], [37.1, 'squint']], [1, -0.7]), crowd: { ex: t > 43.1 ? 'laugh' : 'grin', clap: t > 36.2 },
    op: { ex: [[0, 'stare'], [43.0, 'sigh']], look: [0, 0.6], fx: { bulb: ss(41.8, 42.0, t) * (1 - ss(43.0, 43.2, t)) } } }); }

// ================================================================ S7 44.4–48.0 "Human intelligence. Wooden management." — the player looks up; the figure takes the applause (match S1)
const CAM7 = [[44.2, -0.1, 0.52, 1.45, -0.16, 0.44, 0.05, 41], [45.3, -0.12, 0.5, 1.35, -0.18, 0.46, 0.0, 40], [46.2, 0.0, 1.32, 0.38, -0.1, 0.9, -0.19, 41], [48.2, -0.02, 1.3, 0.32, -0.12, 0.9, -0.17, 40]];
function seg7(t) { setCam(CAM7, t);
  world(t, { x: 1 - ss(45.8, 46.1, t), plaque: 'simp', crowd: { ex: 'laugh', clap: true }, F: { look: 0 },
    op: { ex: [[0, 'stare'], [45.0, 'smug']], look: [0, 1], fx: { bulb: ss(44.6, 44.8, t) } } }); }

// ---------------------------------------------------------------- edit
const SEGS = [{ t0: 0, t1: 3.42, f: seg1 }, { t0: 3.42, t1: 10.6, f: seg2 }, { t0: 10.6, t1: 18.95, f: seg3 }, { t0: 18.95, t1: 27.45, f: seg4 }, { t0: 27.45, t1: 35.7, f: seg5 }, { t0: 35.7, t1: 44.4, f: seg6 }, { t0: 44.4, t1: DURATION, f: seg7 }];
const TRANS = { 3.42: 'dissolve', 10.6: 'dissolve', 18.95: 'dissolve', 27.45: 'dissolve', 35.7: 'dissolve', 44.4: 'dissolve' };
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
