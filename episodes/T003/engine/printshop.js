// RC01-T003 "Bat People on the Moon" — one set: an 1830s print shop (x = 0). History: The Sun's 1835 Moon hoax.
// Rules from the script package: FALSE REPORT is on the page before and during every creature shot; Herschel appears only as a
// printed NAME (never as a character); no quoted letters; no telescope "discovering" anything.
// Layout (metres, floor y = 0, camera side = +z): desk x −0.9…0.9, z −0.5…0.5, top 0.8, THE SUN page on it; hand press at x 1.95;
// claim board on an easel at x −1.75; files on the desk in the last act.
import { THREE, scene, ctex, lam, toon, outline, box, R, setSeed, INK, signTex, stampTex, DIG, Char, imgTex, paintedMat, clamp, lerp, ss, sun, placeSun } from './core.js';
import { TYPES } from './chars2.js';

TYPES.reader = { coat: '#3f8a52', shirt: '#efe8d8', tie: 'bow', tieCol: '#c8323a', hat: 'flat', hatCol: '#6f6a62', hair: 'side', hairCol: '#2a1d14', belly: 0.05, pants: '#3a3a40' };
TYPES.locke = { coat: '#6b4a2e', shirt: '#f4ecdc', tie: 'tie', tieCol: '#2f4f8f', vest: '#d9c8a0', hat: 'none', hair: 'curly', hairCol: '#3a2a20', mustache: 'thin', glasses: true, belly: 0.06, pants: '#2e2e36' };

setSeed(3003);
export const S = { g: new THREE.Group() }; scene.add(S.g);
const g = S.g;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const woodD = toon(0x5a3a22), woodM = toon(0x7a4b25), woodL = toon(0x9a6a3a), iron = toon(0x2e3138), brass = toon(0xc9a44a);
const PAPER = '#f3ead6';

// text that always fits its box: shrink the font until measureText fits maxW
function fit(c, txt, x, y, maxW, size, col = INK, font = '"DejaVu Serif", serif', wgt = 'bold') { let s = size; do { c.font = `${wgt} ${s}px ${font}`; s -= 2; } while (c.measureText(txt).width > maxW && s > 8);
  c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, x, y); }
const card = (w, h, tex, parent = g, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat || new THREE.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide })); m.castShadow = true; parent.add(m); return m; };

// ---------- floor + painted back wall ----------
const planks = ctex(1024, 1024, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = `hsl(${R(24, 30)}, ${R(40, 50)}%, ${R(30, 38)}%)`; c.fillRect(0, i * h / 8, w, h / 8); c.fillStyle = 'rgba(20,10,0,0.5)'; c.fillRect(0, i * h / 8, w, 4);
  c.strokeStyle = 'rgba(40,20,5,0.3)'; c.lineWidth = 2; for (let k = 0; k < 10; k++) { const y = i * h / 8 + R(8, h / 8 - 8); c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(w / 3, y + R(-6, 6), 2 * w / 3, y + R(-6, 6), w, y); c.stroke(); } } }, [4, 4]);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), lam(0xffffff, { map: planks })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);
const BW = 11, BH = BW * 768 / 1376;
export const back = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), paintedMat(imgTex('mg/shop_back.jpg'), 0.62)); back.position.set(0, BH / 2 - 0.19 * BH, -4.0); g.add(back); // floor line of the painting (19 % up) on y = 0

// ---------- desk ----------
export const DESK = { y: 0.8 };
box(1.9, 0.06, 1.05, toon(0xffffff, { map: ctex(512, 256, (c, w, h) => { for (let i = 0; i < 5; i++) { c.fillStyle = `hsl(26, 45%, ${R(34, 40)}%)`; c.fillRect(0, i * h / 5, w, h / 5); c.fillStyle = 'rgba(20,10,0,0.45)'; c.fillRect(0, i * h / 5, w, 3); } }) }), 0, DESK.y - 0.03, 0, g, 0.008);
for (const x of [-0.88, 0.88]) for (const z of [-0.45, 0.45]) box(0.07, DESK.y - 0.06, 0.07, woodD, x, (DESK.y - 0.06) / 2, z, g, 0.005);
box(1.8, 0.18, 0.04, woodM, 0, DESK.y - 0.15, 0.5, g, 0.005); // front apron
// desk clutter: ink pot + quill, type sticks, lamp
const lathe = (pts, mat, x, y, z, s = 1, ol = 0.003, parent = g) => { const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), 28), mat); m.position.set(x, y, z); m.scale.setScalar(s); m.castShadow = m.receiveShadow = true; if (ol) outline(m, ol); parent.add(m); return m; };
lathe([[0, 0], [0.05, 0], [0.055, 0.05], [0.025, 0.07], [0.02, 0.085], [0, 0.085]], toon(0x22263a), -0.72, DESK.y, -0.3);
{ const q = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.32, 8), toon(0xf4f0e6)); q.position.set(-0.7, DESK.y + 0.2, -0.3); q.rotation.z = -0.35; outline(q, 0.003); g.add(q); }
lathe([[0, 0], [0.07, 0], [0.07, 0.02], [0.02, 0.05], [0.02, 0.25], [0.05, 0.27], [0.06, 0.34], [0.03, 0.4], [0, 0.4]], brass, 0.75, DESK.y, -0.35);
export const lampLight = new THREE.PointLight(0xffb060, 1.8, 3.5, 1.6); lampLight.position.set(0.75, DESK.y + 0.42, -0.3); g.add(lampLight);
{ const f = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd27a })); f.scale.set(0.8, 1.5, 0.8); f.position.set(0.75, DESK.y + 0.37, -0.35); g.add(f); }

// ---------- THE SUN page (lies on the desk; slides to the press in act 5) ----------
const pageTex = ctex(1400, 960, (c, w, h) => { c.fillStyle = PAPER; c.fillRect(0, 0, w, h); c.strokeStyle = '#3a3226'; c.lineWidth = 6; c.strokeRect(20, 20, w - 40, h - 40);
  fit(c, 'THE SUN', w / 2, 110, 900, 150, '#1b1e2e', '"DejaVu Serif", serif'); c.fillStyle = '#3a3226'; c.fillRect(60, 180, w - 120, 6);
  fit(c, 'NEW-YORK · AUGUST 1835', w / 2, 220, 900, 42, '#3a3226', '"DejaVu Serif", serif', 'normal'); c.fillRect(60, 250, w - 120, 3);
  fit(c, 'GREAT LUNAR DISCOVERIES', w / 2, 320, 1200, 92, '#1b1e2e'); fit(c, '— so the paper claimed —', w / 2, 400, 900, 44, '#6a5a44', '"DejaVu Serif", serif', 'italic');
  c.fillStyle = 'rgba(60,50,40,0.55)'; for (let col = 0; col < 4; col++) for (let i = 0; i < 13; i++) c.fillRect(70 + col * 330, 450 + i * 36, R(250, 300), 12);
  c.strokeStyle = 'rgba(60,50,40,0.6)'; c.lineWidth = 3; for (let col = 1; col < 4; col++) { c.beginPath(); c.moveTo(60 + col * 330, 440); c.lineTo(60 + col * 330, h - 50); c.stroke(); } });
export const PAGE0 = V(0, DESK.y + 0.004, 0.02);
export const page = new THREE.Group(); page.position.copy(PAGE0); g.add(page);
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.672), lam(0xffffff, { map: pageTex })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; page.add(m); }
// FALSE REPORT stamp: on the page from the first frame
const falseTex = stampTex('FALSE', '#d0262e');
export const stamp = new THREE.Group(); page.add(stamp); stamp.position.set(0.28, 0.003, 0.2); stamp.rotation.set(-Math.PI / 2, 0, 0.18);
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.17), new THREE.MeshLambertMaterial({ map: falseTex, transparent: true, depthWrite: false })); stamp.add(m);
  const t2 = ctex(512, 120, (c, w, h) => fit(c, 'REPORT', w / 2, h / 2, 460, 96, '#d0262e', '"DejaVu Sans", sans-serif')); const m2 = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.066), new THREE.MeshLambertMaterial({ map: t2, transparent: true, depthWrite: false })); m2.position.y = -0.12; stamp.add(m2); }
// standing FALSE REPORT flag: keeps the label in frame in low/close creature shots
export const flag = new THREE.Group(); page.add(flag); flag.position.set(0.36, 0, 0.12);
{ box(0.012, 0.42, 0.012, woodD, 0, 0.21, 0, flag); const ft = signTex(520, 200, '#fbf6e8', [{ t: 'FALSE', size: 96, y: 66, col: '#d0262e', font: '"DejaVu Sans", sans-serif' }, { t: 'REPORT', size: 80, y: 150, col: '#d0262e', font: '"DejaVu Sans", sans-serif' }], 10);
  const m = card(0.26, 0.1, ft, flag); m.position.set(0.13, 0.36, 0); }

// ---------- pop-up paper Moon world (hinged at the back third of the page) ----------
export const pop = new THREE.Group(); page.add(pop); pop.position.set(-0.04, 0, -0.05);
const moonTex = ctex(768, 420, (c, w, h) => { c.fillStyle = '#efe6cf'; c.beginPath(); c.ellipse(w / 2, h, w / 2 - 8, h - 8, 0, Math.PI, 2 * Math.PI); c.fill(); c.strokeStyle = INK; c.lineWidth = 8; c.stroke();
  for (let i = 0; i < 9; i++) { const x = R(120, w - 120), y = R(h * 0.35, h - 30), r = R(14, 40); c.fillStyle = 'rgba(150,130,100,0.45)'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.strokeStyle = 'rgba(80,60,40,0.5)'; c.lineWidth = 3; c.stroke(); }
  c.setLineDash([12, 10]); c.strokeStyle = 'rgba(80,60,40,0.55)'; c.lineWidth = 3; c.beginPath(); c.moveTo(20, h - 6); c.lineTo(w - 20, h - 6); c.stroke(); c.setLineDash([]);
  c.save(); c.translate(w / 2, 118); c.rotate(-0.05); c.fillStyle = '#c8323a'; c.fillRect(-250, -40, 500, 80); c.strokeStyle = INK; c.lineWidth = 6; c.strokeRect(-250, -40, 500, 80); fit(c, 'FALSE REPORT', 0, 2, 460, 60, '#fbf6e8', '"DejaVu Sans", sans-serif'); c.restore(); }); // label on the Moon itself: in frame in every creature close-up
export const moon = card(0.62, 0.34, moonTex, pop); moon.geometry.translate(0, 0.17, 0);
const treeTex = ctex(160, 260, (c, w, h) => { c.fillStyle = '#5f8a3a'; c.beginPath(); c.moveTo(w / 2, 10); c.lineTo(w - 12, h - 50); c.lineTo(12, h - 50); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 6; c.stroke(); c.fillStyle = '#6b4a2e'; c.fillRect(w / 2 - 12, h - 52, 24, 46); c.strokeRect(w / 2 - 12, h - 52, 24, 46); });
export const trees = [[-0.26, 0.06, 0.16], [0.25, 0.08, 0.13], [-0.12, 0.1, 0.11]].map(([x, z, s]) => { const m = card(s * 0.62, s, treeTex, pop); m.geometry.translate(0, s / 2, 0); m.position.set(x, 0, z); return m; });
// bat-winged creature cut-out (body card + two hinged wing cards so the wings can fold)
const bodyTex = ctex(256, 384, (c, w, h) => { c.fillStyle = '#fbf6e8'; c.beginPath(); c.ellipse(w / 2, 250, 66, 110, 0, 0, 7); c.fill(); c.beginPath(); c.arc(w / 2, 108, 92, 0, 7); c.fill(); // paper margin
  c.fillStyle = '#8a6a4a'; c.beginPath(); c.ellipse(w / 2, 250, 50, 96, 0, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 6; c.stroke();
  c.fillStyle = '#fdfdfb'; c.beginPath(); c.arc(w / 2, 108, 76, 0, 7); c.fill(); c.stroke(); c.fillStyle = INK; c.beginPath(); c.ellipse(w / 2 - 24, 110, 9, 13, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(w / 2 + 24, 110, 9, 13, 0, 0, 7); c.fill();
  c.lineWidth = 5; c.beginPath(); c.arc(w / 2, 136, 16, 0.2, Math.PI - 0.2); c.stroke(); c.fillStyle = '#5a4030'; c.beginPath(); c.moveTo(w / 2 - 70, 70); c.lineTo(w / 2 - 50, 20); c.lineTo(w / 2 - 30, 52); c.fill(); c.beginPath(); c.moveTo(w / 2 + 70, 70); c.lineTo(w / 2 + 50, 20); c.lineTo(w / 2 + 30, 52); c.fill(); });
const wingTex = ctex(320, 256, (c, w, h) => { c.fillStyle = '#fbf6e8'; c.beginPath(); c.moveTo(4, 70); c.lineTo(w - 4, 8); c.quadraticCurveTo(w - 40, 120, w - 20, 240); c.quadraticCurveTo(w - 90, 190, w - 130, 236); c.quadraticCurveTo(w - 170, 180, w - 220, 220); c.quadraticCurveTo(w - 240, 150, 4, 150); c.closePath(); c.fill();
  c.fillStyle = '#5a4030'; c.beginPath(); c.moveTo(14, 78); c.lineTo(w - 16, 22); c.quadraticCurveTo(w - 52, 120, w - 32, 222); c.quadraticCurveTo(w - 92, 176, w - 130, 220); c.quadraticCurveTo(w - 170, 168, w - 216, 204); c.quadraticCurveTo(w - 236, 140, 14, 140); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 6; c.stroke();
  c.strokeStyle = '#3a2a20'; c.lineWidth = 4; for (const [x, y] of [[w - 32, 222], [w - 130, 220], [w - 216, 204]]) { c.beginPath(); c.moveTo(14, 100); c.lineTo(x, y); c.stroke(); } });
function creature(x, z, s) { const cg = new THREE.Group(); cg.position.set(x, 0, z); cg.scale.setScalar(s); pop.add(cg);
  const body = card(0.16, 0.24, bodyTex, cg); body.geometry.translate(0, 0.12, 0);
  const mk = side => { const hinge = new THREE.Group(); hinge.position.set(side * 0.03, 0.15, -0.004); cg.add(hinge); const wm = card(0.2, 0.16, wingTex, hinge); wm.geometry.translate(0.1, 0, 0); if (side < 0) wm.scale.x = -1; return hinge; };
  return { g: cg, wl: mk(-1), wr: mk(1) }; }
export const crits = [creature(-0.08, 0.12, 1.0), creature(0.12, 0.17, 0.82), creature(-0.22, 0.2, 0.7)];
// pop-up state: up 0..1 (cards rise on their hinges), flap 0..1 (wing beat amount), fold 0..1 (wings shut), each creature's own pop
export function setPop(up, crit, flap, fold, t) { pop.visible = up > 0.001;
  moon.rotation.x = -(1 - up) * Math.PI / 2; trees.forEach((m, i) => m.rotation.x = -(1 - clamp(up * 1.3 - i * 0.1)) * Math.PI / 2);
  crits.forEach((c, i) => { const k = crit[i] ?? up; c.g.visible = k > 0.01; c.g.rotation.x = -(1 - k) * Math.PI / 2; c.g.position.y = 0.06 * Math.sin(k * Math.PI) * 0.5;
    const beat = flap * (0.35 + 0.35 * Math.sin(t * 9 + i * 2)); const f = clamp(fold); c.wl.rotation.y = lerp(beat, -1.45, f); c.wr.rotation.y = lerp(-beat, 1.45, f); }); }
// the "illustration" the first creature flattens into (printed engraving on the page)
const illTex = ctex(256, 256, (c, w, h) => { c.strokeStyle = '#3a3226'; c.lineWidth = 6; c.strokeRect(10, 10, w - 20, h - 20); c.globalAlpha = 0.8; c.drawImage(bodyTex.userData.canvas, 70, 30, 116, 174); c.globalAlpha = 1; fit(c, 'FIG. 1', w / 2, h - 34, 200, 30, '#3a3226'); });
export const ill = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshLambertMaterial({ map: illTex, transparent: true, depthWrite: false })); ill.rotation.x = -Math.PI / 2; ill.position.set(-0.12, 0.004, 0.14); page.add(ill); ill.visible = false;

// ---------- six instalments + the 1835 counter (act 2) ----------
const instTex = n => ctex(300, 400, (c, w, h) => { c.fillStyle = PAPER; c.fillRect(0, 0, w, h); c.strokeStyle = '#3a3226'; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12); fit(c, 'THE SUN', w / 2, 52, 240, 44); c.fillStyle = 'rgba(60,50,40,0.5)'; for (let i = 0; i < 6; i++) c.fillRect(30, 110 + i * 22, R(180, 240), 8);
  c.fillStyle = '#c8323a'; c.beginPath(); c.arc(w / 2, 300, 62, 0, 7); c.fill(); fit(c, String(n), w / 2, 304, 90, 96, '#fbf6e8', '"DejaVu Sans", sans-serif'); });
export const insts = [1, 2, 3, 4, 5, 6].map(n => { const m = card(0.21, 0.28, instTex(n)); m.visible = false; return m; });
export const INST = V(0, 1.55, -0.9); // row centre, standing above the back edge of the desk
export const year = new THREE.Group(); g.add(year); year.position.set(0, 1.92, -0.9);
const yearDigits = [1, 8, 3, 5].map((d, i) => { const m = card(0.16, 0.24, null, year, new THREE.MeshLambertMaterial({ map: DIG[d] })); m.position.x = (i - 1.5) * 0.17; return m; });
export function setInst(k, yk) { insts.forEach((m, i) => { const ki = clamp(k * 6 - i); m.visible = ki > 0.01; m.position.set(INST.x + (i - 2.5) * 0.235, INST.y + (1 - ki) * 0.3, INST.z); m.rotation.z = (1 - ki) * 0.6 * (i % 2 ? 1 : -1); m.scale.setScalar(Math.max(0.01, ki)); });
  year.visible = yk > 0.01; yearDigits.forEach((m, i) => { const ki = clamp(yk * 4 - i); m.rotation.x = (1 - ki) * Math.PI / 2; }); }
// "THE PAPER CLAIMED" header + name strip (act 2, re-used on the board in act 4)
const claimTex = ctex(640, 300, (c, w, h) => { c.fillStyle = '#fbf6e8'; c.fillRect(0, 0, w, h); c.strokeStyle = INK; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = '#c8323a'; c.fillRect(4, 4, w - 8, 80);
  fit(c, 'THE PAPER CLAIMED', w / 2, 46, 560, 52, '#fbf6e8', '"DejaVu Sans", sans-serif'); fit(c, 'JOHN HERSCHEL', w / 2, 160, 580, 84, INK); fit(c, 'astronomer · name printed', w / 2, 244, 560, 40, '#6a5a44', '"DejaVu Serif", serif', 'italic'); });
export const claim = card(0.5, 0.234, claimTex); claim.visible = false;
const sealTex = ctex(256, 256, (c, w, h) => { c.fillStyle = '#d9b44a'; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; c.beginPath(); c.arc(w / 2 + Math.cos(a) * 104, h / 2 + Math.sin(a) * 104, 18, 0, 7); c.fill(); } c.beginPath(); c.arc(w / 2, h / 2, 104, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 6; c.stroke();
  fit(c, 'SCIENCE', w / 2, h / 2 - 12, 170, 46, INK, '"DejaVu Sans", sans-serif'); fit(c, '(paper)', w / 2, h / 2 + 34, 150, 30, '#6a5a44', '"DejaVu Serif", serif', 'italic'); });
export const seal = card(0.17, 0.17, sealTex); seal.visible = false;

// ---------- claim board on an easel (act 4): NAME frame vs EVIDENCE frame, red thread to the claim ----------
export const BOARD = new THREE.Group(); BOARD.position.set(-1.75, 0, -0.55); BOARD.rotation.y = 0.35; g.add(BOARD);
{ for (const x of [-0.5, 0.5]) { const l = box(0.05, 2.0, 0.05, woodD, x, 1.0, 0.05, BOARD, 0.004); l.rotation.z = x * 0.08; } box(0.05, 1.7, 0.05, woodD, 0, 0.85, -0.35, BOARD).rotation.x = 0.25;
  const cork = ctex(512, 400, (c, w, h) => { c.fillStyle = '#b98a5a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(${R(0, 1) < 0.5 ? '90,60,30' : '230,200,160'},0.25)`; c.fillRect(R(0, w), R(0, h), 3, 3); } });
  box(1.2, 0.95, 0.03, [woodD, woodD, woodD, woodD, lam(0xffffff, { map: cork }), woodD], 0, 1.45, 0.08, BOARD, 0.006); }
const frameTex = (title, body, sub) => ctex(420, 520, (c, w, h) => { c.fillStyle = '#fbf6e8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#7a4b25'; c.lineWidth = 22; c.strokeRect(11, 11, w - 22, h - 22); fit(c, title, w / 2, 70, 340, 58, '#2b3f73', '"DejaVu Sans", sans-serif');
  if (body) { fit(c, body[0], w / 2, 230, 340, 56, INK); fit(c, body[1], w / 2, 300, 340, 56, INK); } if (sub) fit(c, sub, w / 2, 420, 340, sub.length > 2 ? 34 : 150, sub.length > 2 ? '#6a5a44' : '#c8323a', '"DejaVu Sans", sans-serif'); });
export const fName = card(0.36, 0.446, frameTex('NAME', ['JOHN', 'HERSCHEL'], 'printed in the paper'), BOARD); fName.position.set(-0.3, 1.5, 0.1);
export const fEvid = card(0.36, 0.446, frameTex('EVIDENCE', null, '?'), BOARD); fEvid.position.set(0.3, 1.5, 0.1);
const notTex = ctex(512, 256, (c, w, h) => { c.strokeStyle = '#d0262e'; c.lineWidth = 20; c.strokeRect(16, 16, w - 32, h - 32); fit(c, 'NOT HIS', w / 2, h / 2 - 22, 430, 104, '#d0262e', '"DejaVu Sans", sans-serif'); fit(c, 'DISCOVERY', w / 2, h / 2 + 62, 400, 56, '#d0262e', '"DejaVu Sans", sans-serif'); }); export const notStamp = card(0.34, 0.17, null, BOARD, new THREE.MeshLambertMaterial({ map: notTex, transparent: true, depthWrite: false })); notStamp.position.set(-0.3, 1.36, 0.115); notStamp.rotation.z = 0.2;
const tag2 = ctex(640, 160, (c, w, h) => { c.fillStyle = '#fbf6e8'; c.fillRect(0, 0, w, h); c.strokeStyle = INK; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); fit(c, 'BAT PEOPLE ON THE MOON', w / 2, h / 2 + 2, 580, 60, '#c8323a', '"DejaVu Sans", sans-serif'); });
export const claimCard = card(0.6, 0.15, tag2, BOARD); claimCard.position.set(0, 1.85, 0.1);
export const thread = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 1, 6), new THREE.MeshBasicMaterial({ color: 0xc8323a })); BOARD.add(thread);
export function setThread(k, cut) { thread.visible = k > 0.01 && cut < 0.99; if (!thread.visible) return; const a = V(-0.3, 1.72, 0.12), b = V(0, 1.78, 0.12); const d = b.clone().sub(a); const L = d.length() * k * (1 - cut * 0.6); thread.position.copy(a).addScaledVector(d.normalize(), L / 2); thread.quaternion.setFromUnitVectors(V(0, 1, 0), d); thread.scale.set(1, L, 1); }
// INVENTED REPORT tab on the Moon stage (act 4)
export const invTab = new THREE.Group(); page.add(invTab); invTab.position.set(0.08, 0, 0.3);
{ box(0.01, 0.16, 0.01, woodD, 0, 0.08, 0, invTab); const it = ctex(560, 160, (c, w, h) => { c.fillStyle = '#2b3f73'; c.fillRect(0, 0, w, h); fit(c, 'INVENTED REPORT', w / 2, h / 2 + 2, 520, 70, '#fbf6e8', '"DejaVu Sans", sans-serif'); }); const m = card(0.19, 0.054, it, invTab); m.position.set(0, 0.16, 0.01); }

// ---------- hand press (act 5 + closer) ----------
export const PRESS = { x: 1.95, z: -0.55, bed: 0.82 };
const pressG = new THREE.Group(); pressG.position.set(PRESS.x, 0, PRESS.z); g.add(pressG);
for (const x of [-0.5, 0.5]) box(0.12, 2.2, 0.16, woodD, x, 1.1, 0, pressG, 0.008);
box(1.2, 0.14, 0.2, woodD, 0, 2.15, 0, pressG, 0.008); box(1.0, 0.12, 0.8, woodM, 0, PRESS.bed - 0.06, 0.1, pressG, 0.006); // head + bed
box(0.9, 0.06, 0.7, iron, 0, PRESS.bed + 0.03, 0.1, pressG, 0.004); // forme (type bed)
export const platen = new THREE.Group(); pressG.add(platen);
box(0.92, 0.1, 0.72, iron, 0, 0, 0.1, platen, 0.006); { const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 16), brass); sc.position.set(0, 0.55, 0.1); platen.add(sc); }
export const lever = new THREE.Group(); lever.position.set(0.1, 1.95, 0.1); pressG.add(lever); { const b = box(0.7, 0.05, 0.05, iron, 0.35, 0, 0, lever, 0.004); }
export function setPress(k) { platen.position.y = lerp(1.62, PRESS.bed + 0.18, clamp(k)); lever.rotation.y = -1.1 * clamp(k); }
const typeTex = ctex(512, 400, (c, w, h) => { c.fillStyle = '#2a2a30'; c.fillRect(0, 0, w, h); for (let i = 0; i < 20; i++) for (let j = 0; j < 26; j++) { c.fillStyle = `rgba(200,200,210,${R(0.2, 0.5)})`; c.fillRect(8 + j * 19, 8 + i * 19, 15, 15); } });
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.68), lam(0xffffff, { map: typeTex })); m.rotation.x = -Math.PI / 2; m.position.set(0, PRESS.bed + 0.062, 0.1); pressG.add(m); }

// ---------- two files + letters (act 6) ----------
const fileTex = (tab, line1, line2, col) => ctex(600, 420, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 60, w, h - 60); c.fillRect(30, 0, 300, 80); c.strokeStyle = INK; c.lineWidth = 8; c.strokeRect(4, 60, w - 8, h - 64);
  c.fillStyle = '#fbf6e8'; c.fillRect(60, 130, w - 120, 220); fit(c, tab, 180, 40, 270, 44, INK, '"DejaVu Sans", sans-serif'); fit(c, line1, w / 2, 200, w - 160, 70, INK); fit(c, line2, w / 2, 290, w - 160, 54, '#c8323a', '"DejaVu Sans", sans-serif'); });
export const files = [fileTex('FILE A', 'HERSCHEL', 'NAME USED', '#d9c08a'), fileTex('FILE B', 'R. A. LOCKE', 'WRITER', '#a8c3d9')].map(tx => { const fg = new THREE.Group(); g.add(fg); fg.visible = false;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), lam(0xffffff, { map: tx, transparent: true, alphaTest: 0.05 })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; fg.add(m); return fg; });
const envTex = ctex(300, 200, (c, w, h) => { c.fillStyle = '#efe0bd'; c.fillRect(0, 0, w, h); c.strokeStyle = '#6a5a44'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); c.beginPath(); c.moveTo(3, 3); c.lineTo(w / 2, h * 0.55); c.lineTo(w - 3, 3); c.stroke(); c.fillStyle = '#a8262e'; c.beginPath(); c.arc(w / 2, h * 0.55, 24, 0, 7); c.fill(); });
export const letters = [0, 1, 2].map(i => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.133), lam(0xffffff, { map: envTex })); m.rotation.x = -Math.PI / 2; m.castShadow = true; g.add(m); m.visible = false; return m; });

// ---------- characters ----------
export const ch = { reader: new Char('reader', g), locke: new Char('locke', g) };

// ---------- light: warm lamp-lit shop, evening blue from the window side ----------
export const key = sun; // directional key with shadows (upper-left front)
export function light(cool = 0) { placeSun([0, 0.8, 0], [-2.5, 6, 4], 4, 30); sun.intensity = lerp(1.9, 1.5, cool); sun.color.set(new THREE.Color(0xffe0b8).lerp(new THREE.Color(0xc8d4ff), cool)); }
