// RC01-T010 "Shade Included" — one set: sunny market square (x = 0). Fiction: a mayor sells shade, a lemonade seller buys an old awning.
// Layout (metres, ground y = 0, camera side = +z):
//   public shelter (roof x −1.9…−0.7, z −1.3…−0.3, h 2.3) with 3 painted PAID bays in its early-afternoon shadow; toll box right of it;
//   rule board left of it; lemonade stall x 0.8…2.0, z −1.2…−0.7; café tables in front-right (where the awning's shadow lands later);
//   old awning for sale lying at the back (x 0.25, z −2.6).
import { THREE, scene, ctex, lam, toon, outline, box, R, setSeed, INK, signTex, Char, imgTex, paintedMat, clamp, lerp, ss, sun, placeSun } from './core.js';
import { TYPES } from './chars2.js';

TYPES.mayor = { coat: '#2b3f73', shirt: '#f4ecdc', tie: 'bow', tieCol: '#c8323a', vest: '#d9b44a', hat: 'top', hatCol: '#1c1c22', hair: 'side', hairCol: '#3a2a20', mustache: 'walrus', belly: 0.16, pants: '#23232b' };
TYPES.seller = { coat: '#e9a23b', shirt: '#fbf6e8', tie: 'none', hat: 'none', hair: 'bun', hairCol: '#6b3a1e', apron: '#fbf6e8', lashes: true, belly: 0, pants: '#5a4636' };
TYPES.t1 = { coat: '#3f8a52', shirt: '#efe8d8', tie: 'none', hat: 'flat', hatCol: '#6f6a62', hair: 'side', hairCol: '#2a1d14', belly: 0.05, pants: '#3a3a40' };
TYPES.t2 = { coat: '#b8483a', shirt: '#efe8d8', tie: 'none', hat: 'none', hair: 'curly', hairCol: '#1b1512', mustache: 'thin', belly: 0.03, pants: '#333' };
TYPES.t3 = { coat: '#5b3f7a', shirt: '#efe8d8', tie: 'none', hat: 'bowler', hatCol: '#222', hair: 'side', hairCol: '#e0d9cf', glasses: true, belly: 0.1, pants: '#2e2e36' };

setSeed(1001);
export const M = { g: new THREE.Group() }; scene.add(M.g);
const g = M.g;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- ground + painted backdrop ----------
const cobble = ctex(1024, 1024, (c, w, h) => { c.fillStyle = '#9c8a72'; c.fillRect(0, 0, w, h); const n = 12, s = w / n;
  for (let j = 0; j < n; j++) for (let i = -1; i <= n; i++) { const x = i * s + (j % 2) * s / 2 + R(-4, 4), y = j * s + R(-3, 3); c.fillStyle = `hsl(${R(28, 38)}, ${R(16, 26)}%, ${R(60, 72)}%)`;
    c.beginPath(); c.ellipse(x + s / 2, y + s / 2, s * 0.44, s * 0.4, R(-0.2, 0.2), 0, 7); c.fill(); c.fillStyle = 'rgba(255,248,230,0.22)'; c.beginPath(); c.ellipse(x + s / 2 - 6, y + s / 2 - 6, s * 0.26, s * 0.16, 0, 0, 7); c.fill(); } }, [6, 6]);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), lam(0xffffff, { map: cobble })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
const BW = 13, BH = BW * 768 / 1376;
const backTex = imgTex('mg/market_back.jpg');
export const back = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), paintedMat(backTex, 0.62)); back.position.set(0.2, BH / 2 - 0.23 * BH, -5.5); g.add(back); // building bases (23 % up the painting) sit on the ground line

// ---------- public shelter (pergola with tiled roof) ----------
const woodD = toon(0x7a4b25), woodL = toon(0x9a6a3a), tile = toon(0xc0603a), cream = toon(0xf2ead8), brass = toon(0xd2a64a);
export const SHEL = { x0: -1.9, x1: -0.7, z0: -1.3, z1: -0.3, h: 2.75 };
for (const x of [SHEL.x0 + 0.06, SHEL.x1 - 0.06]) for (const z of [SHEL.z0 + 0.06, SHEL.z1 - 0.06]) box(0.09, SHEL.h, 0.09, woodD, x, SHEL.h / 2, z, g, 0.008);
box(SHEL.x1 - SHEL.x0 + 0.16, 0.08, SHEL.z1 - SHEL.z0 + 0.16, woodL, (SHEL.x0 + SHEL.x1) / 2, SHEL.h + 0.04, (SHEL.z0 + SHEL.z1) / 2, g, 0.008);
for (let i = 0; i < 7; i++) { const r = box(SHEL.x1 - SHEL.x0 + 0.24, 0.07, 0.2, tile, (SHEL.x0 + SHEL.x1) / 2, SHEL.h + 0.11 + i * 0.012, SHEL.z0 - 0.04 + i * 0.17, g, 0.006); r.rotation.x = -0.08; }
const shelSign = signTex(640, 140, '#f3e3b8', [{ t: 'TOWN SHELTER', size: 74, y: 74, col: '#2b3f73' }], 10);
box(0.95, 0.2, 0.03, [woodD, woodD, woodD, woodD, lam(0xffffff, { map: shelSign }), woodD], (SHEL.x0 + SHEL.x1) / 2, SHEL.h - 0.08, SHEL.z1 + 0.03, g, 0.006);

// painted PAID bays on the ground (in the early shadow). k: outline highlight 0..1 each, paid: label scale
const bayTex = (hl) => ctex(256, 512, (c, w, h) => { c.strokeStyle = hl ? '#ffe27a' : '#fbf6e8'; c.lineWidth = 18; c.setLineDash([46, 22]); c.strokeRect(14, 14, w - 28, h - 28); });
const paidTex = ctex(256, 256, (c, w, h) => { c.fillStyle = '#d9b44a'; c.beginPath(); c.arc(w / 2, 82, 54, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 8; c.stroke(); c.fillStyle = INK; c.font = 'bold 64px "DejaVu Sans", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('2', w / 2, 86);
  c.fillStyle = '#fbf6e8'; c.font = 'bold 74px "DejaVu Sans", sans-serif'; c.fillText('PAID', w / 2, 196); });
export const BAYS = [-1.45, -1.05, -0.65].map(x => { const bg = new THREE.Group(); bg.position.set(x, 0.006, -0.15); g.add(bg);
  const mk = (tex, y) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.37, 0.8), new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = y; bg.add(m); return m; };
  const base = mk(bayTex(false), 0), hl = mk(bayTex(true), 0.001); hl.material.opacity = 0;
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshLambertMaterial({ map: paidTex, transparent: true, depthWrite: false })); lab.rotation.x = -Math.PI / 2; lab.position.set(0, 0.002, 0.12); bg.add(lab);
  return { g: bg, hl, lab, x }; });
export function setBays(hls, paid) { BAYS.forEach((b, i) => { b.hl.material.opacity = hls[i] || 0; const k = paid[i] ?? 1; b.lab.visible = k > 0.01; b.lab.scale.setScalar(Math.max(0.01, k)); }); }

// toll box on a post (coin slot on top)
export const TOLL = V(-0.42, 1.02, 0.12);
box(0.07, 0.92, 0.07, woodD, TOLL.x, 0.46, TOLL.z, g, 0.006);
const tollTex = signTex(256, 200, '#2b3f73', [{ t: 'SHADE', size: 50, y: 62, col: '#f3e3b8' }, { t: 'TOLL', size: 60, y: 136, col: '#ffd24a' }], 8);
box(0.3, 0.24, 0.24, [toon(0x2b3f73), toon(0x2b3f73), toon(0x22325c), toon(0x2b3f73), lam(0xffffff, { map: tollTex }), toon(0x2b3f73)], TOLL.x, 0.92 + 0.12, TOLL.z, g, 0.008);
box(0.12, 0.01, 0.02, toon(0x111111), TOLL.x, 1.165, TOLL.z, g);

// rule board (the seed for the twist): readable in close-up. k = highlight of the exempt lines
export const RULE = V(-2.55, 1.55, -0.15);
const ruleCanvasTex = (hl) => signTex(900, 620, '#f3e3b8', [
  { t: 'TOWN RULES', size: 66, y: 74, col: '#2b3f73', font: '"DejaVu Sans", sans-serif' },
  { t: 'PUBLIC SHELTER', size: 80, y: 190, col: INK }, { t: 'SHADE: PAID', size: 92, y: 290, col: '#c8323a' },
  { t: 'PRIVATE AWNINGS', size: 80, y: 420, col: INK }, { t: 'EXEMPT', size: 104, y: 528, col: '#2f7a3f' }], 14,
  hl ? (c) => { c.fillStyle = 'rgba(255,226,122,0.75)'; c.fillRect(40, 362, 820, 220); } : null);
const ruleMat = lam(0xffffff, { map: ruleCanvasTex(false) }), ruleMatHL = lam(0xffffff, { map: ruleCanvasTex(true) });
for (const dx of [-0.52, 0.52]) box(0.07, 2.0, 0.07, woodD, RULE.x + dx, 1.0, RULE.z - 0.03, g, 0.006);
export const ruleBoard = box(1.2, 0.83, 0.04, [woodD, woodD, woodD, woodD, ruleMat, woodD], RULE.x, RULE.y, RULE.z, g, 0.01);
export function setRuleHL(on) { ruleBoard.material[4] = on ? ruleMatHL : ruleMat; }

// fiction plaque (hook only)
export const fiction = new THREE.Group(); fiction.position.set(0.35, 0, 2.3); g.add(fiction);
{ const ft = signTex(820, 300, '#fbf6e8', [{ t: 'A MADE-UP TOWN', size: 84, y: 112, col: '#2b3f73' }, { t: 'FICTION · ORIGINAL STORY', size: 54, y: 214, col: '#c8323a', font: '"DejaVu Sans", sans-serif' }], 12);
  box(0.06, 1.25, 0.06, woodD, 0, 0.62, -0.02, fiction, 0.005); box(0.82, 0.3, 0.03, [woodD, woodD, woodD, woodD, lam(0xffffff, { map: ft }), woodD], 0, 1.3, 0, fiction, 0.006); }

// ---------- lemonade stall ----------
export const STALL = { x: 1.4, z: -0.95, w: 1.2, d: 0.5, h: 0.95 };
const stripes = ctex(512, 256, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fbf6e8' : '#f2c84a'; c.fillRect(i * w / 8, 0, w / 8, h); } c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, h - 18, w, 18); });
const lemSign = signTex(900, 260, '#fbf6e8', [{ t: 'LEMONADE', size: 128, y: 132, col: '#e0a020', stroke: INK, sw: 10 }], 0);
box(STALL.w, STALL.h, STALL.d, [toon(0xd8b060), toon(0xd8b060), toon(0x9a6a3a), toon(0xd8b060), lam(0xffffff, { map: stripes }), toon(0xd8b060)], STALL.x, STALL.h / 2, STALL.z, g, 0.008);
box(STALL.w + 0.08, 0.05, STALL.d + 0.08, woodL, STALL.x, STALL.h + 0.025, STALL.z, g, 0.006);
box(0.9, 0.26, 0.02, lam(0xffffff, { map: lemSign }), STALL.x, 0.6, STALL.z + STALL.d / 2 + 0.02, g); // sign on the counter front
const TOPY = STALL.h + 0.05;
function lathe(pts, mat, x, y, z, s = 1, ol = 0.004, parent = g) { const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), 32), mat); m.position.set(x, y, z); m.scale.setScalar(s); m.castShadow = m.receiveShadow = true; if (ol) outline(m, ol); parent.add(m); return m; }
const glassM = new THREE.MeshPhongMaterial({ color: 0xfff3a0, emissive: 0x6a5a10, shininess: 80, transparent: true, opacity: 0.85 });
export const pitcher = lathe([[0, 0], [0.08, 0], [0.09, 0.12], [0.07, 0.22], [0.075, 0.25], [0, 0.25]], glassM, STALL.x - 0.35, TOPY, STALL.z + 0.05);
lathe([[0, 0], [0.07, 0], [0.075, 0.03], [0, 0.03]], toon(0xf2cf3a), STALL.x - 0.35, TOPY + 0.25, STALL.z + 0.05, 1, 0.003); // lemon slice lid
for (let i = 0; i < 4; i++) lathe([[0, 0], [0.035, 0], [0.042, 0.11], [0, 0.11]], glassM, STALL.x - 0.05 + i * 0.1, TOPY, STALL.z + 0.1, 1, 0.003);
for (const [x, z] of [[STALL.x + 0.42, STALL.z - 0.05], [STALL.x + 0.5, STALL.z + 0.06], [STALL.x + 0.34, STALL.z + 0.08]]) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), toon(0xf2cf3a)); l.scale.set(1.25, 1, 1); l.position.set(x, TOPY + 0.04, z); l.castShadow = true; outline(l, 0.003); g.add(l); }
// coin jar (end match: the coin goes here instead of the toll box)
export const JAR = V(STALL.x + 0.15, TOPY, STALL.z + 0.12);
lathe([[0, 0], [0.06, 0], [0.065, 0.14], [0.05, 0.16], [0, 0.16]], new THREE.MeshPhongMaterial({ color: 0xd8f0ff, transparent: true, opacity: 0.4, shininess: 100 }), JAR.x, JAR.y, JAR.z, 1, 0.003);
const jarTex = signTex(200, 80, '#fbf6e8', [{ t: '1 COIN', size: 44, y: 42, col: '#c8323a', font: '"DejaVu Sans", sans-serif' }], 4);
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.048), lam(0xffffff, { map: jarTex })); m.position.set(JAR.x, JAR.y + 0.07, JAR.z + 0.067); g.add(m); }
for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 20), brass); c.position.set(JAR.x + R(-0.02, 0.02), JAR.y + 0.004 + i * 0.007, JAR.z + R(-0.02, 0.02)); g.add(c); }

// ---------- awning: lying for sale (old, folded) → installed over the stall ----------
const canvasTex = ctex(512, 512, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fbf6e8' : '#2f8a7a'; c.fillRect(i * w / 8, 0, w / 8, h); } c.fillStyle = 'rgba(60,40,20,0.12)'; for (let k = 0; k < 30; k++) c.fillRect(R(0, w), R(0, h), R(10, 40), R(2, 6)); });
export const SALE = new THREE.Group(); SALE.position.set(0.25, 0, -2.6); g.add(SALE);
export const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.3, 24), toon(0xffffff, { map: canvasTex })); roll.rotation.z = Math.PI / 2; roll.position.set(0, 0.11, 0.12); roll.castShadow = true; outline(roll, 0.006); SALE.add(roll);
export const frameBundle = new THREE.Group(); SALE.add(frameBundle);
for (let i = 0; i < 4; i++) { const p = box(1.5, 0.045, 0.045, woodD, 0, 0.03 + (i % 2) * 0.045, -0.22 + i * 0.05, frameBundle, 0.004); p.rotation.y = R(-0.05, 0.05); }
box(0.05, 0.12, 0.2, toon(0x8a6a4a), -0.4, 0.07, -0.15, frameBundle); box(0.05, 0.12, 0.2, toon(0x8a6a4a), 0.4, 0.07, -0.15, frameBundle); // rope ties
const saleTex = signTex(520, 320, '#fbf6e8', [{ t: 'FOR SALE', size: 92, y: 92, col: '#c8323a' }, { t: 'OLD AWNING', size: 64, y: 186, col: INK }, { t: 'TOWN', size: 54, y: 262, col: '#2b3f73', font: '"DejaVu Sans", sans-serif' }], 10);
export const saleTag = new THREE.Group(); saleTag.position.set(0.55, 0, 0.2); SALE.add(saleTag);
box(0.04, 0.7, 0.04, woodD, 0, 0.35, -0.02, saleTag, 0.004); box(0.46, 0.28, 0.02, [woodD, woodD, woodD, woodD, lam(0xffffff, { map: saleTex }), woodD], 0, 0.78, 0, saleTag, 0.005);
export function setSale(on, bounceFrame = 0, bounceRoll = 0) { SALE.visible = on; frameBundle.position.y = 0.08 * bounceFrame; roll.position.y = 0.11 + 0.08 * bounceRoll; }

// installed awning: posts at the front (rise = 0..1), canvas from the stall back edge sloping toward the camera (open = 0..1)
export const AWN = { x0: 0.75, x1: 2.05, zb: -1.25, zf: 0.65, yb: 2.15, yf: 1.85 };
export const awning = new THREE.Group(); g.add(awning);
const posts = [AWN.x0 + 0.04, AWN.x1 - 0.04].map(x => { const p = box(0.07, 1, 0.07, woodD, x, 0.5, AWN.zf, awning, 0.006); return p; });
const backPosts = [AWN.x0 + 0.04, AWN.x1 - 0.04].map(x => box(0.07, AWN.yb, 0.07, woodD, x, AWN.yb / 2, AWN.zb, awning, 0.006));
const rail = box(AWN.x1 - AWN.x0, 0.06, 0.06, woodD, (AWN.x0 + AWN.x1) / 2, AWN.yf, AWN.zf, awning, 0.006);
const canvasG = new THREE.Group(); canvasG.position.set((AWN.x0 + AWN.x1) / 2, AWN.yb, AWN.zb); awning.add(canvasG);
const SLOPE = Math.atan2(AWN.yb - AWN.yf, AWN.zf - AWN.zb), CLEN = Math.hypot(AWN.zf - AWN.zb, AWN.yb - AWN.yf);
canvasG.rotation.x = SLOPE;
const cTex2 = canvasTex.clone(); cTex2.needsUpdate = true; cTex2.wrapS = cTex2.wrapT = THREE.RepeatWrapping;
export const canvas = new THREE.Mesh(new THREE.BoxGeometry(AWN.x1 - AWN.x0 + 0.1, 0.02, 1), toon(0xffffff, { map: cTex2 })); canvas.castShadow = true; canvas.receiveShadow = true; canvasG.add(canvas);
const valTex = ctex(1024, 128, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#fbf6e8' : '#2f8a7a'; c.beginPath(); c.moveTo(i * w / 16, 0); c.lineTo((i + 1) * w / 16, 0); c.lineTo((i + 1) * w / 16, h * 0.55); c.arc((i + 0.5) * w / 16, h * 0.55, w / 32, 0, Math.PI); c.fill(); }
  c.fillStyle = INK; c.font = 'bold 70px "DejaVu Sans", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.strokeStyle = '#fbf6e8'; c.lineWidth = 10; c.strokeText('PRIVATE AWNING', w / 2, 46); c.fillText('PRIVATE AWNING', w / 2, 46); });
export const valance = new THREE.Mesh(new THREE.PlaneGeometry(AWN.x1 - AWN.x0 + 0.1, 0.24), new THREE.MeshLambertMaterial({ map: valTex, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide })); valance.castShadow = true; awning.add(valance);
const rolled = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, AWN.x1 - AWN.x0 + 0.1, 24), toon(0xffffff, { map: canvasTex })); rolled.rotation.z = Math.PI / 2; outline(rolled, 0.005); rolled.castShadow = true; canvasG.add(rolled);
export function setAwning(on, rise, open) { awning.visible = on; if (!on) return;
  const r = clamp(rise); posts.forEach(p => { p.scale.y = Math.max(0.01, r * AWN.yf); p.position.y = r * AWN.yf / 2; }); rail.visible = r > 0.98; rail.position.y = AWN.yf;
  const k = clamp(open), L = Math.max(0.01, k * CLEN); canvas.scale.z = L; canvas.position.z = L / 2; cTex2.repeat.set(1, k); canvas.visible = k > 0.01;
  rolled.position.set(0, 0.0, L + 0.06); rolled.visible = k < 0.98; rolled.rotation.x = -k * 12;
  valance.visible = k > 0.98; valance.position.set((AWN.x0 + AWN.x1) / 2, AWN.yf - 0.1, AWN.zf + 0.03); }

// ---------- chairs + tables (movable) ----------
const chairM = toon(0x6b8a3a), chairD = toon(0x4f6a2a);
function makeChair() { const c = new THREE.Group(); box(0.42, 0.04, 0.4, chairM, 0, 0.44, 0, c, 0.005);
  for (const [x, z] of [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]]) box(0.035, 0.44, 0.035, chairD, x, 0.22, z, c, 0.003);
  box(0.42, 0.42, 0.035, chairM, 0, 0.66, -0.19, c, 0.005); g.add(c); return c; }
export const chairs = [0, 1, 2, 3].map(makeChair);
function makeTable(x, z) { const t = new THREE.Group(); t.position.set(x, 0, z); lathe([[0, 0], [0.18, 0], [0.18, 0.03], [0.03, 0.05], [0.03, 0.7], [0.3, 0.7], [0.3, 0.74], [0, 0.74]], toon(0xb98a5a), 0, 0, 0, 1, 0.004, t); g.add(t); return t; }
export const TABLES = [makeTable(1.9, 1.3), makeTable(2.48, 0.92)]; // inside the awning's late-afternoon shadow (ground and table top)
export const tGlass = [0, 1].map(i => lathe([[0, 0], [0.035, 0], [0.042, 0.11], [0, 0.11]], glassM, 0, 0, 0, 1, 0.003)); // drinks on the café tables
tGlass.forEach(m => m.visible = false);
export const handGlass = lathe([[0, 0], [0.035, 0], [0.042, 0.11], [0, 0.11]], glassM, 0, 0, 0, 1, 0.003); handGlass.visible = false;

// ---------- hand props: price sign (mayor), coin ----------
export const priceSign = new THREE.Group(); g.add(priceSign);
{ const pt = signTex(600, 380, '#fbf6e8', [{ t: 'SHADE', size: 108, y: 112, col: '#2b3f73' }, { t: '2 COINS', size: 116, y: 262, col: '#c8323a' }], 14);
  box(0.035, 0.75, 0.035, woodD, 0, 0.0, 0, priceSign, 0.004); box(0.5, 0.32, 0.025, [woodD, woodD, woodD, woodD, lam(0xffffff, { map: pt }), woodD], 0, 0.5, 0.02, priceSign, 0.005); }
export const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 24), toon(0xe2b33b, { emissive: 0x3a2a00 })); outline(coin, 0.003); coin.visible = false; g.add(coin);
export function flyCoin(a, b, k, lift = 0.25) { coin.visible = k > 0 && k < 1; if (!coin.visible) return; const p = a.clone().lerp(b, k); p.y += Math.sin(k * Math.PI) * lift; coin.position.copy(p); coin.rotation.set(k * 9, 0, k * 4); }

// ---------- characters ----------
export const ch = { mayor: new Char('mayor', g), seller: new Char('seller', g), t1: new Char('t1', g), t2: new Char('t2', g), t3: new Char('t3', g) };

// ---------- sun: early afternoon (shadow under the shelter, on the PAID bays) → late afternoon (shadow slid toward the camera, bays in sun) ----------
export const SUN0 = [-1.0, 10, -2.5], SUN1 = [-3.6, 8, -7.2];
export function setSun(k, warm = 0) { const d = SUN0.map((v, i) => lerp(v, SUN1[i], k)); placeSun([0.2, 0, 0.0], d, 5.5, 40); sun.color.set(new THREE.Color(0xfff1d6).lerp(new THREE.Color(0xffb46a), warm)); }
// key from the camera side so faces are lit (the shadow-casting sun comes from behind the roof line)
export const fill = new THREE.DirectionalLight(0xfff4e4, 0.6); fill.position.set(1.5, 4, 8); g.add(fill); fill.target.position.set(0, 1, 0); g.add(fill.target);
