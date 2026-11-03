// RC01-T012 "Nanni's Clay Complaint" — set A: merchant courtyard (x = 0), set B: museum gallery (x = 300).
// History rules from the script package: ANIMATED RECONSTRUCTION label up front; clay marks are abstract (no real cuneiform copied);
// ACCORDING TO NANNI shown before the goods; PROMISED / OFFERED trays look alike (no colour used as purity evidence); the scribe is an
// illustration; FUTURE DELIVERIES is a wish inside a thought bubble, not an outcome; museum case labelled as an illustration.
import { THREE, scene, ctex, lam, toon, outline, box, R, setSeed, INK, signTex, Char, imgTex, paintedMat, clamp, lerp, ss } from './core.js';
import { TYPES } from './chars2.js';

TYPES.nanni = { coat: '#3f6fa0', shirt: '#efe2c4', tie: 'none', hat: 'none', hair: 'curly', hairCol: '#3a2618', beard: 'full', beardCol: '#3a2618', belly: 0.06, pants: '#5a4636' };
TYPES.dealer = { coat: '#a0522d', shirt: '#efe2c4', tie: 'none', hat: 'flat', hatCol: '#6b4a2e', hair: 'side', hairCol: '#1b1512', beard: 'full', beardCol: '#1b1512', belly: 0.12, pants: '#4a3a2a' };
TYPES.scribe = { coat: '#e2d4b4', shirt: '#f4ecdc', tie: 'none', hat: 'none', hair: 'bald', hairCol: '#2a1d14', belly: 0.03, pants: '#8a7a5a' };
TYPES.visitor = { coat: '#4d6b3a', shirt: '#efe8d8', tie: 'tie', tieCol: '#c8323a', hat: 'none', hair: 'side', hairCol: '#5a3a22', glasses: true, belly: 0.04, pants: '#2e2e36' };

const V = (x, y, z) => new THREE.Vector3(x, y, z);
function fit(c, txt, x, y, maxW, size, col = INK, font = '"DejaVu Serif", serif', wgt = 'bold') { let s = size; do { c.font = `${wgt} ${s}px ${font}`; s -= 2; } while (c.measureText(txt).width > maxW && s > 8);
  c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, x, y); }
const card = (w, h, tex, parent, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat || new THREE.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide })); parent.add(m); return m; };
const plaqueTex = (lines, bg = '#efe2c4', w = 640, h = 220) => ctex(w, h, (c) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = INK; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10); lines.forEach(L => fit(c, L.t, w / 2, L.y, w - 70, L.s, L.c || INK, L.f || '"DejaVu Sans", sans-serif', L.wgt || 'bold')); });
const woodD = toon(0x5a3a22), woodM = toon(0x8a5a32), clayM = toon(0xc8a47a), copperM = toon(0xb8733a, { emissive: 0x2a1406 });

// =================== A: COURTYARD (x = 0) ===================
setSeed(1201);
export const A = { g: new THREE.Group() }; scene.add(A.g);
const ag = A.g;
const earth = ctex(1024, 1024, (c, w, h) => { c.fillStyle = '#c9a77a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(${R(0, 1) < 0.5 ? '120,85,50' : '240,220,180'},${R(0.05, 0.18)})`; c.beginPath(); c.arc(R(0, w), R(0, h), R(1, 5), 0, 7); c.fill(); } }, [5, 5]);
{ const f = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), lam(0xffffff, { map: earth })); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; ag.add(f); }
const BW = 11, BH = BW * 768 / 1376;
{ const b = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), paintedMat(imgTex('mg/court_back.jpg'), 0.62)); b.position.set(0, BH / 2 - 0.24 * BH, -4.5); ag.add(b); }
// low table + reed mat
export const TOP = 0.8;
box(1.5, 0.05, 0.72, woodM, 0, TOP - 0.025, 0, ag, 0.008);
for (const x of [-0.68, 0.68]) for (const z of [-0.3, 0.3]) box(0.06, TOP - 0.05, 0.06, woodD, x, (TOP - 0.05) / 2, z, ag, 0.004);
{ const mat = ctex(512, 256, (c, w, h) => { for (let i = 0; i < 24; i++) { c.fillStyle = i % 2 ? '#c8aa6a' : '#b8964f'; c.fillRect(i * w / 24, 0, w / 24, h); } c.fillStyle = 'rgba(80,50,20,0.25)'; for (let j = 0; j < 8; j++) c.fillRect(0, j * h / 8, w, 3); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), lam(0xffffff, { map: mat })); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.003, 0.05); m.receiveShadow = true; ag.add(m); }
// a few jars + a crate for depth
const lathe = (pts, mat, x, y, z, s = 1, ol = 0.004, parent = ag) => { const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), 28), mat); m.position.set(x, y, z); m.scale.setScalar(s); m.castShadow = m.receiveShadow = true; if (ol) outline(m, ol); parent.add(m); return m; };
lathe([[0, 0], [0.1, 0], [0.18, 0.18], [0.16, 0.38], [0.08, 0.48], [0.09, 0.53], [0, 0.53]], toon(0xb86a3a), -1.55, 0, -0.9);
lathe([[0, 0], [0.08, 0], [0.14, 0.14], [0.12, 0.3], [0.06, 0.38], [0.07, 0.42], [0, 0.42]], toon(0xa85a2e), -1.3, 0, -1.2);
box(0.6, 0.4, 0.45, woodM, 1.55, 0.2, -0.85, ag, 0.006);

// clay tablet: abstract wedge marks grow with k (NOT a copy of a real text)
const markCanvas = document.createElement('canvas'); markCanvas.width = 360; markCanvas.height = 450; const mc = markCanvas.getContext('2d');
const MARKS = []; setSeed(4242); for (let row = 0; row < 11; row++) for (let i = 0; i < 9; i++) if (R(0, 1) > 0.18) MARKS.push([30 + i * 34 + R(-4, 4), 40 + row * 36 + R(-3, 3), R(0, 1) < 0.7 ? 0 : 1]);
const markTex = new THREE.CanvasTexture(markCanvas); markTex.colorSpace = THREE.SRGBColorSpace;
let lastK = -1;
function drawMarks(k) { if (Math.abs(k - lastK) < 0.004) return; lastK = k; mc.fillStyle = '#c8a47a'; mc.fillRect(0, 0, 360, 450); const g = mc.createRadialGradient(180, 200, 40, 180, 225, 300); g.addColorStop(0, 'rgba(255,240,210,0.25)'); g.addColorStop(1, 'rgba(90,60,30,0.35)'); mc.fillStyle = g; mc.fillRect(0, 0, 360, 450);
  const n = Math.floor(MARKS.length * clamp(k)); for (let i = 0; i < n; i++) { const [x, y, v] = MARKS[i]; mc.fillStyle = 'rgba(60,36,18,0.92)'; mc.beginPath(); if (v) { mc.moveTo(x - 1, y - 15); mc.lineTo(x + 7, y - 15); mc.lineTo(x + 2, y + 15); } else { mc.moveTo(x - 15, y - 6); mc.lineTo(x + 15, y); mc.lineTo(x - 15, y + 6); } mc.closePath(); mc.fill(); }
  markTex.needsUpdate = true; }
drawMarks(0);
export function makeTablet(parent) { const t = new THREE.Group(); parent.add(t); const sideM = clayM, topM = new THREE.MeshToonMaterial({ map: markTex, gradientMap: clayM.gradientMap });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.035), [sideM, sideM, sideM, sideM, topM, sideM]); m.castShadow = true; outline(m, 0.004); t.add(m); return t; }
export const tabA = makeTablet(ag); // upright (face +z) by default; lies flat with rotation.x = -PI/2
export function setMarks(k) { drawMarks(k); }
export const TAB_REST = V(-0.28, TOP + 0.02, 0.12); // lying on the table (centre)
export const stand = new THREE.Group(); ag.add(stand); box(0.2, 0.02, 0.08, woodD, 0, 0.01, 0, stand, 0.003); box(0.2, 0.08, 0.015, woodD, 0, 0.04, -0.03, stand).rotation.x = -0.25; stand.position.set(-0.28, TOP, 0.12);
// stylus (reed) — follows the scribe's hand
export const stylus = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.22, 8), toon(0xc8b070)); stylus.geometry.translate(0, 0.11, 0); outline(stylus, 0.002); ag.add(stylus);

// trays: PROMISED and OFFERED look alike (labels, not colour, carry the difference)
function tray(x, label) { const g = new THREE.Group(); g.position.set(x, TOP, 0.1); ag.add(g); box(0.32, 0.025, 0.22, woodD, 0, 0.012, 0, g, 0.004);
  const ingots = [-0.09, 0, 0.09].map((dx, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), copperM); m.scale.set(1, 0.55, 1); m.position.set(dx, 0.025, (i % 2) * 0.03 - 0.015); m.castShadow = true; outline(m, 0.003); g.add(m); return m; });
  const tag = new THREE.Group(); tag.position.set(0, 0, -0.12); g.add(tag); box(0.008, 0.18, 0.008, woodD, 0, 0.09, 0, tag);
  const lt = plaqueTex([{ t: label, y: 112, s: 104 }], '#efe2c4', 520, 220); const c = card(0.2, 0.085, lt, tag); c.position.set(0, 0.2, 0.006); return { g, ingots, tag }; }
export const trayP = tray(0.2, 'PROMISED'), trayO = tray(0.56, 'OFFERED');
// banners / plaques
export const recon = new THREE.Group(); recon.position.set(-0.08, TOP, 0.29); ag.add(recon);
{ box(0.01, 0.16, 0.01, woodD, 0, 0.08, 0, recon); const c = card(0.24, 0.083, plaqueTex([{ t: 'ANIMATED', y: 70, s: 80, c: '#8a2f2f' }, { t: 'RECONSTRUCTION', y: 158, s: 70, c: '#8a2f2f' }]), recon); c.position.set(0, 0.2, 0.006); }
export const according = new THREE.Group(); according.position.set(0.38, TOP, -0.28); ag.add(according);
{ for (const dx of [-0.26, 0.26]) box(0.012, 0.52, 0.012, woodD, dx, 0.26, 0, according); const c = card(0.6, 0.14, plaqueTex([{ t: 'ACCORDING TO NANNI', y: 112, s: 92, c: '#2b3f73' }], '#f6ecd4', 900, 220), according); c.position.set(0, 0.47, 0.008); }
function nameplate(x, z, name, role) { const g = new THREE.Group(); g.position.set(x, 0, z); ag.add(g); box(0.02, 0.62, 0.02, woodD, 0, 0.31, 0, g); const c = card(0.34, 0.12, plaqueTex([{ t: name, y: 82, s: 96, f: '"DejaVu Serif", serif' }, { t: role, y: 172, s: 50, c: '#6a5a44' }]), g); c.position.set(0, 0.66, 0.012); return g; }
export const npN = nameplate(-0.8, 0.5, 'NANNI', 'customer'), npE = nameplate(0.86, 0.5, 'EA-NASIR', 'copper dealer');
export const ill = new THREE.Group(); ill.position.set(0.68, TOP, 0.28); ag.add(ill);
{ box(0.008, 0.12, 0.008, woodD, 0, 0.06, 0, ill); const c = card(0.22, 0.06, plaqueTex([{ t: 'ILLUSTRATION', y: 112, s: 96, c: '#6a5a44' }], '#efe2c4', 640, 220), ill); c.position.set(0, 0.15, 0.006); }
export const compPlaque = new THREE.Group(); ag.add(compPlaque);
{ const c = card(0.34, 0.11, plaqueTex([{ t: 'COMPLAINT', y: 112, s: 110, c: '#8a2f2f' }], '#f6ecd4', 640, 220), compPlaque); }
// "no star rating / no comment box": modern UI cut-outs that get crossed out
const starsTex = ctex(640, 160, (c, w, h) => { c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 30); c.fill(); c.strokeStyle = '#9aa0aa'; c.lineWidth = 6; c.stroke();
  for (let i = 0; i < 5; i++) { const cx = 80 + i * 120, cy = h / 2; c.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 22 : 52, a = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } c.closePath(); c.fillStyle = '#f2c94c'; c.fill(); c.strokeStyle = '#b8902a'; c.lineWidth = 4; c.stroke(); } });
const boxTex = ctex(640, 300, (c, w, h) => { c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 26); c.fill(); c.strokeStyle = '#9aa0aa'; c.lineWidth = 6; c.stroke(); fit(c, 'Write a review…', w / 2 - 60, 90, 420, 44, '#9aa0aa', '"DejaVu Sans", sans-serif', 'normal'); c.fillStyle = '#4a7bd0'; c.beginPath(); c.roundRect(w - 200, h - 92, 170, 64, 18); c.fill(); fit(c, 'POST', w - 115, h - 60, 140, 40, '#ffffff', '"DejaVu Sans", sans-serif'); });
const xTex = ctex(256, 256, (c, w, h) => { c.strokeStyle = '#d0262e'; c.lineWidth = 30; c.lineCap = 'round'; c.beginPath(); c.moveTo(30, 30); c.lineTo(w - 30, h - 30); c.moveTo(w - 30, 30); c.lineTo(30, h - 30); c.stroke(); });
function uiCard(w, h, tex) { const g = new THREE.Group(); ag.add(g); const m = card(w, h, tex, g); const x = card(h * 1.2, h * 1.2, xTex, g); x.position.z = 0.01; g.visible = false; return { g, x }; }
export const uiStars = uiCard(0.52, 0.13, starsTex), uiBox = uiCard(0.5, 0.234, boxTex);
// thought bubble: FUTURE DELIVERIES — his own hand choosing ingots (a wish in the letter, not an outcome)
const bubbleTex = (check) => ctex(700, 560, (c, w, h) => { c.fillStyle = '#ffffff'; c.strokeStyle = INK; c.lineWidth = 10; c.beginPath(); c.ellipse(w / 2, 230, 320, 210, 0, 0, 7); c.fill(); c.stroke();
  for (const [x, y, r] of [[220, 470, 34], [170, 525, 20]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke(); }
  fit(c, 'FUTURE DELIVERIES', w / 2, 92, 460, 52, '#2b3f73', '"DejaVu Sans", sans-serif');
  for (let i = 0; i < 4; i++) { const x = 190 + i * 105, y = 300; c.fillStyle = '#b8733a'; c.beginPath(); c.ellipse(x, y, 44, 22, 0, Math.PI, 2 * Math.PI); c.lineTo(x + 44, y); c.fill(); c.strokeStyle = INK; c.lineWidth = 6; c.stroke(); }
  c.strokeStyle = '#23263b'; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(560, 140); c.quadraticCurveTo(470, 200, check ? 400 : 420, check ? 250 : 230); c.stroke(); c.fillStyle = '#23263b'; c.beginPath(); c.arc(check ? 400 : 420, check ? 250 : 230, 20, 0, 7); c.fill();
  if (check) { c.fillStyle = '#b8733a'; c.beginPath(); c.ellipse(400, 236, 44, 22, 0, Math.PI, 2 * Math.PI); c.fill(); c.strokeStyle = INK; c.lineWidth = 6; c.stroke(); c.strokeStyle = '#2f8a4a'; c.lineWidth = 18; c.beginPath(); c.moveTo(250, 380); c.lineTo(300, 420); c.lineTo(400, 340); c.stroke(); } });
const bubT0 = bubbleTex(false), bubT1 = bubbleTex(true);
export const bubble = card(0.62, 0.5, bubT0, ag); bubble.visible = false;
export function setBubble(k, check) { bubble.visible = k > 0.01; bubble.scale.setScalar(Math.max(0.01, k)); bubble.material.map = check ? bubT1 : bubT0; }

export const chA = { nanni: new Char('nanni', ag), dealer: new Char('dealer', ag), scribe: new Char('scribe', ag) };
export const keyA = new THREE.DirectionalLight(0xfff0d8, 2.0); keyA.position.set(-3, 6, 4); keyA.castShadow = true; keyA.shadow.mapSize.set(2048, 2048); { const c = keyA.shadow.camera; c.left = -3; c.right = 3; c.top = 3; c.bottom = -3; c.far = 20; } keyA.shadow.bias = -0.0005; ag.add(keyA); keyA.target.position.set(0, 0.5, 0); ag.add(keyA.target);

// =================== B: MUSEUM GALLERY (x = 300) ===================
setSeed(1202);
export const B = { g: new THREE.Group() }; B.g.position.set(300, 0, 0); scene.add(B.g); B.g.visible = false;
const bg = B.g;
{ const f = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshPhongMaterial({ color: 0x1c2230, shininess: 60, specular: 0x334055 })); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; bg.add(f);
  const b = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), paintedMat(imgTex('mg/museum_back.jpg'), 0.7)); b.position.set(0, BH / 2 - 0.24 * BH, -4.0); bg.add(b); }
export const PLINTH_TOP = 0.95;
box(0.5, PLINTH_TOP, 0.5, toon(0xe8e4dc), 0, PLINTH_TOP / 2, 0, bg, 0.006);
{ const glass = new THREE.MeshPhongMaterial({ color: 0xdfefff, transparent: true, opacity: 0.12, shininess: 120, specular: 0xffffff, depthWrite: false, side: THREE.DoubleSide });
  const gcase = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.42, 0.48), glass); gcase.position.set(0, PLINTH_TOP + 0.21, 0); gcase.renderOrder = 5; bg.add(gcase);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.48, 0.42, 0.48)), new THREE.LineBasicMaterial({ color: 0xc8d4e8, transparent: true, opacity: 0.6 })); edges.position.copy(gcase.position); bg.add(edges); }
export const tabB = makeTablet(bg); tabB.position.set(0, PLINTH_TOP + 0.13, 0.02); tabB.rotation.x = -0.12;
{ const st = box(0.14, 0.02, 0.08, toon(0x2a2e38), 0, PLINTH_TOP + 0.01, 0.0, bg); }
export const museumLabel = card(0.42, 0.18, plaqueTex([{ t: 'BRITISH MUSEUM COLLECTION', y: 62, s: 54, c: '#1b1e2e' }, { t: 'clay tablet · Nanni to Ea-nasir', y: 128, s: 40, c: '#3a3226', f: '"DejaVu Serif", serif', wgt: 'italic' }, { t: 'animated illustration — not a photograph', y: 182, s: 32, c: '#6a5a44', f: '"DejaVu Sans", sans-serif', wgt: 'normal' }], '#f4f1ea', 760, 230), bg, new THREE.MeshLambertMaterial({ map: plaqueTex([{ t: 'BRITISH MUSEUM COLLECTION', y: 62, s: 54, c: '#1b1e2e' }, { t: 'clay tablet · Nanni to Ea-nasir', y: 128, s: 40, c: '#3a3226', f: '"DejaVu Serif", serif', wgt: 'italic' }, { t: 'animated illustration — not a photograph', y: 182, s: 32, c: '#6a5a44', f: '"DejaVu Sans", sans-serif', wgt: 'normal' }], '#f4f1ea', 760, 230) }));
museumLabel.position.set(0, 0.72, 0.252);
export const spot = new THREE.SpotLight(0xfff2dc, 9, 6, 0.35, 0.5, 1.2); spot.position.set(0.2, 3.0, 1.0); spot.target.position.set(0, PLINTH_TOP + 0.1, 0); spot.castShadow = true; bg.add(spot); bg.add(spot.target);
export const chB = { visitor: new Char('visitor', bg) };
