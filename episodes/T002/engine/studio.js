// RC01-T002 "Same Pixels" — one set: a painters' workshop (x = 0) with an ORIGINAL designed checkerboard picture on an easel.
// The picture is a 2D raster drawn here with exact numbers (not a copy of any published figure):
//   light tiles 196, dark tiles 112 (neutral grey, R=G=B); a painted can casts a soft shadow that multiplies by 112/196.
//   B = light tile fully inside the shadow core → 112.  A = dark tile outside the shadow → 112.  Same image value, by construction.
// The picture, the cover and the swatches use unlit MeshBasicMaterial (no tone mapping, no fog), and main.js renders board shots with
// vignette and AO off, so screen position does not change the values. tools: window.__ab() reports A/B screen positions for the pixel check.
import { THREE, scene, ctex, lam, toon, outline, box, R, setSeed, INK, Char, imgTex, paintedMat, clamp, lerp, ss } from './core.js';
import { TYPES } from './chars2.js';

TYPES.p1 = { coat: '#d9534f', shirt: '#f4ecdc', tie: 'none', vest: '#f1e9d6', hat: 'flat', hatCol: '#f1e9d6', hair: 'side', hairCol: '#3a2618', mustache: 'thin', belly: 0.08, pants: '#4a4a55' };
TYPES.p2 = { coat: '#3f7fbf', shirt: '#f4ecdc', tie: 'none', vest: '#f1e9d6', hat: 'flat', hatCol: '#f1e9d6', hair: 'curly', hairCol: '#1b1512', belly: 0.03, pants: '#4a4a55' };

const V = (x, y, z) => new THREE.Vector3(x, y, z);
function fit(c, txt, x, y, maxW, size, col = INK, font = '"DejaVu Sans", sans-serif', wgt = 'bold') { let s = size; do { c.font = `${wgt} ${s}px ${font}`; s -= 2; } while (c.measureText(txt).width > maxW && s > 8);
  c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, x, y); }
const card = (w, h, tex, parent, opts = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide, ...opts })); parent.add(m); return m; };
const basic = (tex, opts = {}) => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, fog: false, ...opts });
// plain canvas texture (no paint-over noise: the picture must stay exact)
function rawTex(w, h, paint) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.userData = { canvas: c }; return t; }

setSeed(2002);
export const S = { g: new THREE.Group() }; scene.add(S.g);
const g = S.g;
// floor + painted back wall
{ const conc = ctex(1024, 1024, (c, w, h) => { c.fillStyle = '#b8b4ac'; c.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(${R(0, 1) < 0.5 ? '90,90,90' : '235,235,230'},${R(0.05, 0.15)})`; c.fillRect(R(0, w), R(0, h), R(1, 4), R(1, 4)); }
    for (let i = 0; i < 18; i++) { c.fillStyle = ['#d9534f', '#3f7fbf', '#f2c94c', '#5fa05a'][i % 4]; c.globalAlpha = 0.35; c.beginPath(); c.arc(R(0, w), R(0, h), R(4, 14), 0, 7); c.fill(); } c.globalAlpha = 1; }, [4, 4]);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), lam(0xffffff, { map: conc })); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; g.add(f);
  const BW = 11, BH = BW * 768 / 1376; const b = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), paintedMat(imgTex('mg/shop_back.jpg'), 0.62)); b.position.set(0, BH / 2 - 0.19 * BH, -4.0); g.add(b); }

// ---------- the designed picture ----------
export const VAL = { light: 196, dark: 112, s: 112 / 196 };
const N = 6, TP = 200, PX = N * TP; // tiles, px per tile
export const TILE_A = [1, 4], TILE_B = [3, 3]; // (col, row), row 0 = top
const SHADOW = [[3.6, 1.15], [5.25, 1.75], [4.75, 4.95], [2.3, 4.95], [2.15, 3.0]]; // tile units
const CAN = { cx: 4.45, top: 0.35, w: 0.95, h: 1.05 };
const boardTex = rawTex(PX, PX, (c, w, h) => {
  // shadow mask (soft edge), then exact per-pixel values
  const mc = document.createElement('canvas'); mc.width = w; mc.height = h; const m = mc.getContext('2d'); m.filter = 'blur(18px)'; m.fillStyle = '#fff'; m.beginPath(); SHADOW.forEach(([x, y], i) => i ? m.lineTo(x * TP, y * TP) : m.moveTo(x * TP, y * TP)); m.closePath(); m.fill();
  const mask = m.getImageData(0, 0, w, h).data, img = c.createImageData(w, h), d = img.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, tile = ((Math.floor(x / TP) + Math.floor(y / TP)) % 2 === 0) ? VAL.light : VAL.dark, k = mask[i] / 255;
    const v = Math.round(tile * (1 - (1 - VAL.s) * k)); d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  c.putImageData(img, 0, 0);
  // the painted can that casts the shadow (top right, outside A and B)
  const x0 = (CAN.cx - CAN.w / 2) * TP, x1 = (CAN.cx + CAN.w / 2) * TP, y0 = CAN.top * TP, y1 = (CAN.top + CAN.h) * TP, ry = 0.16 * TP;
  c.fillStyle = '#5f9a6a'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y1); c.ellipse((x0 + x1) / 2, y1, (x1 - x0) / 2, ry, 0, Math.PI, 0, true); c.lineTo(x1, y0); c.closePath(); c.fill();
  c.fillStyle = '#7fbf8a'; c.beginPath(); c.ellipse((x0 + x1) / 2, y0, (x1 - x0) / 2, ry, 0, 0, 7); c.fill(); c.strokeStyle = '#2b3a2e'; c.lineWidth = 6; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x0 + 18, y0 + 30, 22, y1 - y0 - 40);
  // A / B letters in the tile corners (the flat centre stays untouched)
  for (const [lab, [tc, tr]] of [['A', TILE_A], ['B', TILE_B]]) { const lx = tc * TP + 30, ly = tr * TP + 30; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(lx, ly, 22, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 4; c.stroke(); fit(c, lab, lx, ly + 1, 30, 30, INK); }
  c.strokeStyle = '#3a3226'; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10); });
export const BOARD = { x: 0, y: 1.55, z: -0.3, size: 1.2 };
const UNIT = BOARD.size / N;
export const tileCenter = ([c, r]) => V(BOARD.x - BOARD.size / 2 + (c + 0.5) * UNIT, BOARD.y + BOARD.size / 2 - (r + 0.5) * UNIT, BOARD.z + 0.004);
export const board = new THREE.Mesh(new THREE.PlaneGeometry(BOARD.size, BOARD.size), basic(boardTex)); board.position.set(BOARD.x, BOARD.y, BOARD.z); g.add(board);
// easel
const woodD = toon(0x6b4423), woodM = toon(0x8a5a32);
{ for (const s of [-1, 1]) { const l = box(0.06, 2.4, 0.06, woodD, s * 0.55, 1.15, BOARD.z - 0.08, g, 0.005); l.rotation.z = -s * 0.06; } const b = box(0.06, 2.3, 0.06, woodD, 0, 1.1, BOARD.z - 0.5, g); b.rotation.x = 0.25;
  box(1.35, 0.06, 0.12, woodM, 0, BOARD.y - BOARD.size / 2 - 0.03, BOARD.z + 0.02, g, 0.005); box(BOARD.size + 0.06, 0.04, 0.04, woodD, 0, BOARD.y + BOARD.size / 2 + 0.02, BOARD.z, g, 0.004); }
// tag on the easel ledge
const tagTex = rawTex(900, 170, (c, w, h) => { c.fillStyle = '#f4f1ea'; c.fillRect(0, 0, w, h); c.strokeStyle = INK; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); fit(c, 'ILLUSTRATIVE DEMONSTRATION', w / 2, 62, w - 60, 64, '#2b3f73'); fit(c, 'designed image · same values in A and B', w / 2, 128, w - 80, 40, '#6a5a44', '"DejaVu Serif", serif', 'italic'); });
export const tag = card(0.62, 0.117, tagTex, g); tag.position.set(0, BOARD.y - BOARD.size / 2 - 0.12, BOARD.z + 0.09);

// ---------- overlays (outside the A/B centres): shadow outline, pattern grid, A/B tile rings ----------
const ovl = (paint) => { const t = rawTex(PX, PX, paint); const m = new THREE.Mesh(new THREE.PlaneGeometry(BOARD.size, BOARD.size), basic(t, { transparent: true, depthWrite: false, opacity: 0 })); m.position.set(BOARD.x, BOARD.y, BOARD.z + 0.006); g.add(m); return m; };
export const ovShadow = ovl((c) => { c.strokeStyle = '#ffd24a'; c.lineWidth = 12; c.setLineDash([30, 18]); c.beginPath(); SHADOW.forEach(([x, y], i) => i ? c.lineTo(x * TP, y * TP) : c.moveTo(x * TP, y * TP)); c.closePath(); c.stroke(); });
export const ovGrid = ovl((c) => { c.strokeStyle = '#4fd2ff'; c.lineWidth = 8; for (let i = 1; i < N; i++) { c.beginPath(); c.moveTo(i * TP, 0); c.lineTo(i * TP, PX); c.stroke(); c.beginPath(); c.moveTo(0, i * TP); c.lineTo(PX, i * TP); c.stroke(); } });
export const ovAB = ovl((c) => { c.strokeStyle = '#ff5ad2'; c.lineWidth = 12; for (const [tc, tr] of [TILE_A, TILE_B]) c.strokeRect(tc * TP + 8, tr * TP + 8, TP - 16, TP - 16); });
export function setOverlays(sh, gr, ab) { ovShadow.material.opacity = sh; ovShadow.visible = sh > 0.01; ovGrid.material.opacity = gr; ovGrid.visible = gr > 0.01; ovAB.material.opacity = ab; ovAB.visible = ab > 0.01; }

// ---------- the cover: two equal windows over the flat centres of A and B ----------
const HOLE = 0.5; // fraction of a tile
const coverTex = rawTex(PX, PX, (c, w, h) => { c.fillStyle = '#d6cdbb'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(80,60,40,0.12)'; for (let i = 0; i < 400; i++) c.fillRect(R(0, w), R(0, h), 3, 3);
  c.strokeStyle = '#6a5a44'; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10);
  for (const [tc, tr] of [TILE_A, TILE_B]) { const x = (tc + (1 - HOLE) / 2) * TP, y = (tr + (1 - HOLE) / 2) * TP, s = HOLE * TP; c.clearRect(x, y, s, s); c.strokeStyle = '#3a3226'; c.lineWidth = 6; c.strokeRect(x - 3, y - 3, s + 6, s + 6); } });
export const cover = new THREE.Mesh(new THREE.PlaneGeometry(BOARD.size, BOARD.size), basic(coverTex, { transparent: true, depthWrite: false })); g.add(cover); cover.visible = false;
export function setCover(k) { cover.visible = k > 0.001; cover.position.set(BOARD.x, BOARD.y + (1 - clamp(k)) * 1.6, BOARD.z + 0.01); } // slides down from above and back up the same path

// ---------- swatches on a neutral stand (same value as the image: 112) ----------
const swTex = rawTex(512, 400, (c, w, h) => { c.fillStyle = '#9a9a9a'; c.fillRect(0, 0, w, h); const v = VAL.dark; c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(40, 60, 180, 180); c.fillRect(292, 60, 180, 180);
  c.strokeStyle = '#2a2a2a'; c.lineWidth = 4; c.strokeRect(40, 60, 180, 180); c.strokeRect(292, 60, 180, 180); fit(c, 'A', 130, 30, 60, 40, '#1b1e2e'); fit(c, 'B', 382, 30, 60, 40, '#1b1e2e');
  fit(c, `image value ${v} · ${v} · ${v}`, w / 2, 290, w - 40, 38, '#1b1e2e'); fit(c, 'sampled from the designed image', w / 2, 345, w - 60, 28, '#3a3a3a', '"DejaVu Serif", serif', 'italic'); });
export const SW = V(0.78, 1.18, 0.35);
export const swatch = new THREE.Group(); swatch.position.copy(SW); g.add(swatch);
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.406), basic(swTex)); swatch.add(m); }
const eqTex = rawTex(128, 128, (c) => { c.fillStyle = '#2f8a4a'; c.fillRect(20, 38, 88, 16); c.fillRect(20, 74, 88, 16); });
export const eq = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.08), basic(eqTex, { transparent: true })); eq.position.set(0, 0.06, 0.005); swatch.add(eq);
{ box(0.04, 1.0, 0.04, woodD, SW.x, 0.5, SW.z - 0.03, g, 0.004); box(0.3, 0.03, 0.3, woodD, SW.x, 0.015, SW.z - 0.03, g); }
export function setSwatch(k, e) { swatch.visible = k > 0.01; swatch.scale.setScalar(Math.max(0.01, k)); eq.visible = e > 0.01; eq.scale.setScalar(Math.max(0.01, e)); }

// ---------- paint cans (DARK / LIGHT) and the pipette ----------
function can(label, body, lid) { const cg = new THREE.Group(); g.add(cg); const lt = ctex(512, 200, (c, w, h) => { c.fillStyle = '#f4f1ea'; c.fillRect(0, 0, w, h); c.fillStyle = body; c.fillRect(0, 40, w, 120); fit(c, label, w / 2, 100, w * 0.4, 80, label.startsWith('DARK') ? '#ffffff' : INK); }); lt.wrapS = THREE.RepeatWrapping; lt.offset.x = 0.5;
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.24, 28), [toon(0xffffff, { map: lt }), toon(new THREE.Color(lid).getHex()), toon(0x888888)]); m.position.y = 0.12; m.castShadow = true; outline(m, 0.004); cg.add(m);
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.006, 6, 24, Math.PI), toon(0x777777)); h.position.y = 0.24; cg.add(h); return cg; }
export const canDark = can('DARK GRAY', '#4a4a4a', '#3a3a3a'), canLight = can('LIGHT GRAY', '#d0d0d0', '#bdbdbd');
export const pipette = new THREE.Group(); g.add(pipette);
{ const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.2, 12), new THREE.MeshPhongMaterial({ color: 0xdfefff, transparent: true, opacity: 0.6, shininess: 100 })); tube.position.y = 0.1; pipette.add(tube);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 10), toon(0xc8323a)); bulb.scale.set(1, 1.4, 1); bulb.position.y = 0.22; outline(bulb, 0.003); pipette.add(bulb); }

export const ch = { p1: new Char('p1', g), p2: new Char('p2', g) };
export const key = new THREE.DirectionalLight(0xfff0d8, 2.0); key.position.set(-3, 6, 5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); { const c = key.shadow.camera; c.left = -3; c.right = 3; c.top = 3; c.bottom = -3; c.far = 20; } key.shadow.bias = -0.0005; g.add(key); key.target.position.set(0, 0.8, 0); g.add(key.target);
