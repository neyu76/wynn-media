// PINK15 — real 3D sets (not painted backdrops): C cell (x = 0, teal → pink), S paint shop (x = 300), B cell block hall (x = 600).
// Walls are textured planes with UVs in metres (bricks stay the same size everywhere), windows are real holes, so the sun casts
// bar shadows; light shafts are additive volumes extruded from the window along the sun direction.
import { THREE, scene, ctex, lam, toon, outline, box, R, setSeed, INK, signTex, Char, clamp, lerp, ss } from './core.js';
import { TYPES } from './chars2.js';
// v8: room/light toolkit shared by all new episodes (engine_v4/sets3d.js; this file was its origin)
import { TILE, brickTex, concreteTex, plainTex, wallMat, mPlane, sPlane, holeWall, shaft, motes, steel, steelD, dark, white, fixture, bars, pendant, arm3, setArm } from './sets3d.js';
export { shaft, motes, setArm };

TYPES.guard = { coat: '#2c3d63', shirt: '#c9d3e6', tie: 'tie', tieCol: '#151a2b', hat: 'police', hatCol: '#26355a', hair: 'side', hairCol: '#3a2a20', mustache: 'thin', belly: 0.05, pants: '#1f2a44', badge: true };
TYPES.guard2 = { coat: '#2c3d63', shirt: '#c9d3e6', tie: 'tie', tieCol: '#151a2b', hat: 'police', hatCol: '#26355a', hair: 'curly', hairCol: '#1b1512', belly: 0.12, pants: '#1f2a44', badge: true };
TYPES.sci = { coat: '#f3f2ee', shirt: '#ffffff', tie: 'tie', tieCol: '#9a6a2e', hat: 'none', hair: 'side', hairCol: '#6b4423', belly: 0.0, pants: '#4a4a52' };
TYPES.con = { coat: '#e8742a', shirt: '#e8742a', tie: 'none', hat: 'none', hair: 'bald', hairCol: '#3a2a20', belly: 0.2, pants: '#d9681f', number: '0417' };

// =================== C: CELL (x = 0) — back wall z = -1.7 with a barred window; teal now, pink later ===================
export const CW = 3.4, CD = 3.4, CHt = 3.0;
export const C = { g: new THREE.Group() }; scene.add(C.g); C.g.visible = false; const cg = C.g;
setSeed(77); const tealT = brickTex(193, 30, 50, '#3e5860'); setSeed(77); const pinkT = brickTex(326, 74, 60, '#a83a76'); setSeed(77); const bumpT = brickTex(0, 0, 0, '', 4, 8, true);
setSeed(77); const pink2T = brickTex(326, 78, 64, '#b4407e'); // second coat: a touch brighter + glossier
export const WIN = { x: 0.35, y: 2.2, w: 0.95, h: 0.62 };
const tealM = wallMat(tealT, bumpT), pinkM = wallMat(pinkT, bumpT), pink2M = wallMat(pink2T, bumpT, { emissive: 0x401020, emissiveIntensity: 0.25 });
export const cBack = holeWall(CW, CHt, [[WIN.x, WIN.y, WIN.w, WIN.h]], tealM); cBack.position.set(0, 0, -CD / 2); cg.add(cBack);
export const cLeft = mPlane(CD, CHt, tealM, 0, CHt / 2); cLeft.rotation.y = Math.PI / 2; cLeft.position.set(-CW / 2, CHt / 2, 0); cg.add(cLeft);
export const cRight = mPlane(CD, CHt, tealM, 0, CHt / 2); cRight.rotation.y = -Math.PI / 2; cRight.position.set(CW / 2, CHt / 2, 0); cg.add(cRight);
const ceilM = lam(0x8a9aa2, { map: plainTex('#9aa8ae', 600, 0.06), emissive: 0x30444a, emissiveIntensity: 0.4 }); { const c = mPlane(CW, CD, ceilM); c.rotation.x = Math.PI / 2; c.position.set(0, CHt, 0); cg.add(c); }
const floorT = concreteTex(60, 200, 5); const cFloor = mPlane(CW, CD, lam(0xc4ccd0, { map: floorT })); cFloor.rotation.x = -Math.PI / 2; cg.add(cFloor);
// outside skin so the room is light-tight except the window (the sun is behind the back wall)
{ const sk = holeWall(CW + 0.4, CHt + 0.4, [[WIN.x, WIN.y + 0.2, WIN.w, WIN.h]], dark); sk.position.set(0, -0.2, -CD / 2 - 0.16); cg.add(sk); }
// window reveal (concrete depth) + bars
{ const rv = toon(0x7d8f94), d = 0.3, z = -CD / 2 - d / 2; box(WIN.w + 0.06, 0.04, d, rv, WIN.x, WIN.y - WIN.h / 2 - 0.02, z, cg); box(WIN.w + 0.06, 0.04, d, rv, WIN.x, WIN.y + WIN.h / 2 + 0.02, z, cg); box(0.04, WIN.h, d, rv, WIN.x - WIN.w / 2 - 0.02, WIN.y, z, cg); box(0.04, WIN.h, d, rv, WIN.x + WIN.w / 2 + 0.02, WIN.y, z, cg);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(WIN.w, WIN.h), new THREE.MeshBasicMaterial({ color: 0xeaf6ff })); sky.position.set(WIN.x, WIN.y, -CD / 2 - 0.29); cg.add(sky);
  const b = bars(cg, WIN.x - WIN.w / 2 + 0.08, WIN.x + WIN.w / 2 - 0.08, WIN.y - WIN.h / 2, WIN.y + WIN.h / 2, -CD / 2 - 0.08, 6); }
// steel bunk on the right wall, sink, drain, light, vent
{ const bk = new THREE.Group(); bk.position.set(CW / 2 - 0.36, 0, 0.1); cg.add(bk); box(0.7, 0.06, 1.9, steel, 0, 0.48, 0, bk, 0.005); box(0.08, 0.42, 0.08, steelD, -0.28, 0.24, -0.85, bk); box(0.08, 0.42, 0.08, steelD, -0.28, 0.24, 0.85, bk);
  box(0.06, 0.3, 1.9, steelD, 0.33, 0.62, 0, bk); }
{ const sk = new THREE.Group(); sk.position.set(-CW / 2 + 0.25, 0, 0.9); cg.add(sk); box(0.4, 0.3, 0.42, steel, 0, 0.85, 0, sk, 0.005); box(0.3, 0.06, 0.3, steelD, 0, 1.0, 0, sk); }
{ const dr = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), new THREE.MeshLambertMaterial({ color: 0x2a3036 })); dr.rotation.x = -Math.PI / 2; dr.position.set(0.1, 0.004, 0.4); cg.add(dr); }
export const cLamp = fixture(cg, -0.25, CHt - 0.04, 0.2, 1.0, 0.24);
C.lamp = new THREE.PointLight(0xe6f4ff, 4.5, 7, 1.4); C.lamp.position.set(-0.25, CHt - 0.3, 0.4); cg.add(C.lamp);
{ const v = signTex(256, 160, '#5a646e', [], 0, (g, w, h) => { g.fillStyle = '#2b3138'; for (let i = 0; i < 6; i++) g.fillRect(16, 16 + i * 23, w - 32, 12); }); const m = sPlane(0.5, 0.3, lam(0xffffff, { map: v })); m.position.set(-1.0, CHt - 0.3, -CD / 2 + 0.005); cg.add(m); }
// wall calendar "SEATTLE 1979" (right of the window) — the year/place read as objects
const calT = signTex(512, 640, '#fbf8ef', [{ t: 'SEATTLE', size: 64, y: 70, col: '#2b3a67', font: '"DejaVu Sans", sans-serif' }, { t: '1979', size: 150, y: 190, col: '#c8323a', font: '"DejaVu Sans", sans-serif' }], 8,
  (g, w, h) => { g.fillStyle = '#c8323a'; g.fillRect(0, 0, w, 18); g.strokeStyle = '#8a8f96'; g.lineWidth = 3; for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) g.strokeRect(36 + c * 64, 300 + r * 64, 60, 60); g.fillStyle = '#555'; g.font = 'bold 22px "DejaVu Sans", sans-serif'; let d = 1; for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) if (d <= 31 && (r || c > 2)) g.fillText(String(d++), 44 + c * 64, 326 + r * 64); });
export const calendar = sPlane(0.42, 0.525, lam(0xffffff, { map: calT, emissive: 0xffffff, emissiveMap: calT, emissiveIntensity: 0.25, polygonOffset: true, polygonOffsetFactor: -2 })); calendar.position.set(1.0, 1.35, -CD / 2 + 0.01); calendar.rotation.z = 0.03; cg.add(calendar);
// the painted stripes (roller strokes) on the back wall: planes whose uvs follow world x/y so bricks line up with the wall
function stripe(mat) { const geo = new THREE.PlaneGeometry(1, 1); const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.renderOrder = 1; m.material.polygonOffset = true; m.material.polygonOffsetFactor = -1; cg.add(m); m.visible = false; return m; }
export function setStripe(m, x0, w, y0, y1, z = -CD / 2 + 0.004) { if (y1 <= y0 + 0.01) { m.visible = false; return; } m.visible = true; const p = m.geometry.attributes.position, uv = m.geometry.attributes.uv;
  const xs = [x0 - w / 2, x0 + w / 2, x0 - w / 2, x0 + w / 2], ys = [y1, y1, y0, y0]; for (let i = 0; i < 4; i++) { p.setXYZ(i, xs[i], ys[i], 0); uv.setXY(i, xs[i] / TILE, ys[i] / TILE); } p.needsUpdate = uv.needsUpdate = true; m.geometry.computeBoundingSphere(); m.position.set(0, 0, z); }
export const STR = [stripe(pinkM.clone()), stripe(pinkM.clone()), stripe(pinkM.clone())];
export const COAT2 = [stripe(pink2M.clone()), stripe(pink2M.clone())]; // second coat (pink room)
export function setCellColor(pink) { const m = pink ? pinkM : tealM; cBack.material = m; cLeft.material = m; cRight.material = m; ceilM.color.set(pink ? 0xd889b0 : 0x56707a); }
// the paint roller (3D): handle from the guard's hand to the roller head on the wall
export const roller = new THREE.Group(); cg.add(roller);
const rPole = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1, 10), toon(0xb9824a)); rPole.castShadow = true; roller.add(rPole);
const rHead = new THREE.Group(); roller.add(rHead);
export const rollM = toon(0xef6aa0); { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 18), rollM); c.rotation.z = Math.PI / 2; c.castShadow = true; outline(c, 0.006); rHead.add(c); const f = box(0.34, 0.02, 0.02, steelD, 0, -0.07, -0.0, rHead); }
const _a = new THREE.Vector3(), _b = new THREE.Vector3();
export function setRoller(grp, hand, head) { const pole = grp.children[0], hd = grp.children[1]; _a.copy(hand); _b.copy(head).add(new THREE.Vector3(0, -0.08, 0.07)); const mid = _a.clone().add(_b).multiplyScalar(0.5); pole.position.copy(mid); pole.scale.set(1, _a.distanceTo(_b), 1);
  pole.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), _b.clone().sub(_a).normalize()); hd.position.copy(head).add(new THREE.Vector3(0, 0, 0.065)); }
export const roller2 = roller.clone(true); cg.add(roller2); roller2.visible = false;
// paint chip card taped to the right wall: three chips; two crossed out on "any", the third circled on "pink"
const cardC = document.createElement('canvas'); cardC.width = 512; cardC.height = 700; const cardG = cardC.getContext('2d'); const cardT = new THREE.CanvasTexture(cardC); cardT.colorSpace = THREE.SRGBColorSpace; cardT.anisotropy = 8;
let cardKey = '';
export function setCard(x1, x2, circ) { const k = [x1, x2, circ].map(v => Math.round(clamp(v) * 20)).join(); if (k === cardKey) return; cardKey = k; const g = cardG, w = 512, h = 700;
  g.fillStyle = '#fbfbf6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9c9c0'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
  g.fillStyle = '#2b3a67'; g.font = 'bold 44px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.fillText('PAINT CHIPS', w / 2, 66);
  const chips = [['#f7c6d6', 'BLUSH'], ['#e0287f', 'HOT'], ['#f27aa6', 'P-618']];
  chips.forEach(([c, n], i) => { const y = 100 + i * 190; g.fillStyle = c; g.fillRect(50, y, 260, 150); g.strokeStyle = '#999'; g.lineWidth = 3; g.strokeRect(50, y, 260, 150); g.fillStyle = INK; g.textAlign = 'left'; g.font = 'bold 40px "DejaVu Sans", sans-serif'; g.fillText(n, 330, y + 90); });
  const X = (k, y) => { if (k <= 0) return; g.strokeStyle = '#2a2a2a'; g.lineWidth = 16; g.lineCap = 'round'; const a = clamp(k * 2), b = clamp(k * 2 - 1); g.beginPath(); g.moveTo(60, y + 10); g.lineTo(60 + 240 * a, y + 10 + 130 * a); g.stroke(); if (b > 0) { g.beginPath(); g.moveTo(300, y + 10); g.lineTo(300 - 240 * b, y + 10 + 130 * b); g.stroke(); } };
  X(x1, 100); X(x2, 290);
  if (circ > 0) { g.strokeStyle = '#d0262e'; g.lineWidth = 14; g.beginPath(); g.ellipse(w / 2, 555, 235, 110, -0.05, -1.6, -1.6 + 6.6 * clamp(circ)); g.stroke(); }
  g.fillStyle = '#4a4a4a'; g.font = 'bold 28px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.fillText('BAKER-MILLER PINK', w / 2, 680); cardT.needsUpdate = true; }
setCard(0, 0, 0);
export const CARD = new THREE.Vector3(CW / 2 - 0.005, 1.4, -0.75);
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.49), new THREE.MeshLambertMaterial({ map: cardT, emissive: 0xffffff, emissiveMap: cardT, emissiveIntensity: 0.3, polygonOffset: true, polygonOffsetFactor: -2 })); m.rotation.y = -Math.PI / 2; m.position.copy(CARD); m.rotation.z = -0.025; cg.add(m);
  const tape = lam(0x6f9fd8); for (const [dz, dy] of [[-0.15, 0.24], [0.15, 0.24]]) { const t = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.035), tape); t.rotation.y = -Math.PI / 2; t.position.set(CARD.x - 0.002, CARD.y + dy, CARD.z + dz); t.rotation.x = dz > 0 ? 0.5 : -0.5; cg.add(t); } }
// sun + shaft for the cell
export const C_SUN = { target: [0.4, 0.2, -0.3], dir: [0.9, 3.0, -1.25] }; // v3b: sun from the upper right ? shaft crosses the frame, patch on the floor by the guard
const cDir = new THREE.Vector3(...C_SUN.dir).normalize().negate();
{ const z = -CD / 2 - 0.1, x0 = WIN.x - WIN.w / 2, x1 = WIN.x + WIN.w / 2, y0 = WIN.y - WIN.h / 2, y1 = WIN.y + WIN.h / 2;
  C.shaft = shaft(cg, [[x0, y1, z], [x1, y1, z], [x1, y0, z], [x0, y0, z]], cDir, 3.2, 0xfff1d8, 0.6);
  C.motes = motes(cg, new THREE.Vector3(WIN.x, WIN.y, z), cDir, 2.6, 46, 0.36); }

// =================== S: PAINT SHOP (x = 300) ===================
const SX = 300; export const S = { g: new THREE.Group() }; scene.add(S.g); S.g.visible = false; S.g.position.x = SX; const sg = S.g;
export const SW = 4.4, SD = 4.0, SH = 3.0;
setSeed(91); const creamT = brickTex(40, 16, 80, '#c2b9aa'); setSeed(91); const sBump = brickTex(0, 0, 0, '', 4, 8, true);
export const SWIN = { x: 0.9, y: 1.85, w: 1.1, h: 0.95 };
const sBack = holeWall(SW, SH, [[SWIN.x, SWIN.y, SWIN.w, SWIN.h]], wallMat(creamT, sBump)); sBack.position.set(0, 0, -SD / 2); sg.add(sBack);
// lower wainscot: dark brown painted bricks up to 0.95 m
setSeed(91); const brownT = brickTex(20, 22, 28, '#332924'); { const wn = mPlane(SW, 0.95, wallMat(brownT, sBump), 0, 0.475); wn.position.set(0, 0.475, -SD / 2 + 0.006); sg.add(wn); box(SW, 0.05, 0.05, toon(0x2a1d16), 0, 0.97, -SD / 2 + 0.03, sg); }
{ const l = mPlane(SD, SH, wallMat(creamT, sBump), 0, SH / 2); l.rotation.y = Math.PI / 2; l.position.set(-SW / 2, SH / 2, 0); sg.add(l); const r = mPlane(SD, SH, wallMat(creamT, sBump), 0, SH / 2); r.rotation.y = -Math.PI / 2; r.position.set(SW / 2, SH / 2, 0); sg.add(r);
  const c = mPlane(SW, SD, lam(0xd8d2c4, { map: plainTex('#e2ddd0') })); c.rotation.x = Math.PI / 2; c.position.y = SH; sg.add(c);
  const f = mPlane(SW, SD, lam(0xb9b4aa, { map: concreteTex(55, 30, 8) })); f.rotation.x = -Math.PI / 2; sg.add(f); }
{ const sk = holeWall(SW + 0.4, SH + 0.4, [[SWIN.x, SWIN.y + 0.2, SWIN.w, SWIN.h]], dark); sk.position.set(0, -0.2, -SD / 2 - 0.2); sg.add(sk);
  const fr = toon(0xf0ede4), z = -SD / 2 - 0.05; box(SWIN.w + 0.1, 0.06, 0.12, fr, SWIN.x, SWIN.y - SWIN.h / 2, z, sg, 0.004); box(SWIN.w + 0.1, 0.06, 0.12, fr, SWIN.x, SWIN.y + SWIN.h / 2, z, sg, 0.004); box(0.06, SWIN.h, 0.12, fr, SWIN.x - SWIN.w / 2, SWIN.y, z, sg, 0.004); box(0.06, SWIN.h, 0.12, fr, SWIN.x + SWIN.w / 2, SWIN.y, z, sg, 0.004);
  box(0.04, SWIN.h, 0.06, fr, SWIN.x, SWIN.y, z, sg); box(SWIN.w, 0.04, 0.06, fr, SWIN.x, SWIN.y, z, sg);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(SWIN.w, SWIN.h), new THREE.MeshBasicMaterial({ color: 0xe6f2fb })); sky.position.set(SWIN.x, SWIN.y, -SD / 2 - 0.3); sg.add(sky); }
// shelves of paint cans on the back-left wall + "PAINT SHOP" sign
const CANCOL = [0xa8484c, 0x4a6f96, 0x56806a, 0xb8a060, 0xdedcd6, 0xc88aa4, 0x6e6088, 0xb87a52];
function can(parent, r, h, col, label, x, y, z, open = false) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 28, 1, open), toon(0xd9dde2, open ? { side: THREE.DoubleSide } : {})); body.position.y = h / 2; body.castShadow = body.receiveShadow = true; outline(body, 0.004); g.add(body);
  const lt = label ? ctex(512, 256, (gg, w, hh) => { gg.fillStyle = label.bg || '#ffffff'; gg.fillRect(0, 0, w, hh); gg.fillStyle = label.band; gg.fillRect(0, 40, w, 90); gg.fillStyle = label.ink || '#ffffff'; gg.font = 'bold 64px "DejaVu Sans", sans-serif'; gg.textAlign = 'center'; gg.textBaseline = 'middle'; for (const cx of [w * 0.25, w * 0.75]) gg.fillText(label.t, cx, 86); gg.fillStyle = '#555'; gg.font = 'bold 34px "DejaVu Sans", sans-serif'; for (const cx of [w * 0.25, w * 0.75]) gg.fillText(label.s || '', cx, 180); }) : null;
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.005, r * 1.005, h * 0.7, 28, 1, true), lam(0xffffff, { map: lt || undefined, color: lt ? 0xffffff : col })); lab.position.y = h * 0.48; g.add(lab);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r * 0.96, r * 0.06, 8, 28), steelD); rim.rotation.x = Math.PI / 2; rim.position.y = h; g.add(rim);
  const lid = new THREE.Mesh(new THREE.CircleGeometry(r * 0.95, 28), toon(col)); lid.rotation.x = -Math.PI / 2; lid.position.y = h - 0.004; g.add(lid);
  return g; }
{ setSeed(5); const wood = toon(0x8a5a32); for (let s = 0; s < 3; s++) { const y = 1.25 + s * 0.42; box(1.5, 0.04, 0.3, wood, -1.25, y, -SD / 2 + 0.16, sg, 0.004);
    for (let i = 0; i < 8; i++) { const c = CANCOL[(i + s * 3) % CANCOL.length]; can(sg, 0.06, 0.13, c, { t: '', band: '#' + c.toString(16).padStart(6, '0'), s: '' }, -1.9 + i * 0.18, y + 0.02, -SD / 2 + 0.16); } }
  box(0.04, 1.4, 0.3, wood, -2.0, 1.75, -SD / 2 + 0.16, sg); box(0.04, 1.4, 0.3, wood, -0.5, 1.75, -SD / 2 + 0.16, sg);
  const sign = sPlane(0.9, 0.24, lam(0xffffff, { map: signTex(600, 160, '#2b3a67', [{ t: 'PAINT SHOP', size: 84, y: 84, col: '#ffffff', font: '"DejaVu Sans", sans-serif' }], 0) })); sign.position.set(-1.25, 2.68, -SD / 2 + 0.01); sg.add(sign); }
// the bench: wood top, steel legs, lower shelf, cutting mat; scale + gallon of white + pint of red on it
export const BENCH = { x: 0.15, y: 0.92, z: -0.55, w: 1.7, d: 0.8 };
{ const top = box(BENCH.w, 0.06, BENCH.d, toon(0xa08466), BENCH.x, BENCH.y - 0.03, BENCH.z, sg, 0.005);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.06, BENCH.y - 0.06, 0.06, steelD, BENCH.x + sx * (BENCH.w / 2 - 0.08), (BENCH.y - 0.06) / 2, BENCH.z + sz * (BENCH.d / 2 - 0.08), sg);
  box(BENCH.w - 0.1, 0.04, BENCH.d - 0.1, toon(0x8a7258), BENCH.x, 0.3, BENCH.z, sg);
  can(sg, 0.12, 0.2, 0x2f6fb5, { t: 'BLUE', band: '#2f6fb5' }, BENCH.x - 0.55, 0.32, BENCH.z + 0.1); can(sg, 0.12, 0.2, 0xe0b13c, { t: 'YELLOW', band: '#e0b13c' }, BENCH.x - 0.25, 0.32, BENCH.z + 0.12); }
const matT = ctex(512, 512, (g, w, h) => { g.fillStyle = '#3e7a68'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; for (let i = 0; i <= 16; i++) { g.beginPath(); g.moveTo(i * w / 16, 0); g.lineTo(i * w / 16, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 16); g.lineTo(w, i * h / 16); g.stroke(); } g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 4; g.strokeRect(8, 8, w - 16, h - 16); });
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.62), lam(0xffffff, { map: matT })); m.rotation.x = -Math.PI / 2; m.position.set(BENCH.x + 0.2, BENCH.y + 0.003, BENCH.z); m.receiveShadow = true; sg.add(m); }
// masking-tape label on the mat: the recipe
{ const t = signTex(700, 110, '#efe0b4', [{ t: '1 PT RED + 1 GAL WHITE', size: 56, y: 58, col: '#3a2a20', font: '"DejaVu Sans", sans-serif' }], 0); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.08), lam(0xffffff, { map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.25 })); m.rotation.x = -Math.PI / 2; m.rotation.z = 0.06; m.position.set(BENCH.x + 0.2, BENCH.y + 0.005, BENCH.z + 0.25); sg.add(m); }
// digital scale with an LCD that reads the poured amount
export const SCALE = new THREE.Vector3(BENCH.x + 0.28, BENCH.y, BENCH.z - 0.02);
{ box(0.32, 0.05, 0.32, toon(0x30343c), SCALE.x, SCALE.y + 0.025, SCALE.z, sg, 0.004); box(0.27, 0.01, 0.27, steel, SCALE.x, SCALE.y + 0.055, SCALE.z, sg); box(0.32, 0.04, 0.07, toon(0x30343c), SCALE.x, SCALE.y + 0.02, SCALE.z + 0.19, sg, 0.003); }
const lcdC = document.createElement('canvas'); lcdC.width = 256; lcdC.height = 96; const lcdT = new THREE.CanvasTexture(lcdC); lcdT.colorSpace = THREE.SRGBColorSpace; let lcdKey = '';
export function setLCD(txt) { if (txt === lcdKey) return; lcdKey = txt; const g = lcdC.getContext('2d'); g.fillStyle = '#b9d8a8'; g.fillRect(0, 0, 256, 96); g.fillStyle = '#1d2a1a'; g.font = 'bold 64px "DejaVu Sans Mono", monospace'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(txt, 240, 52); lcdT.needsUpdate = true; }
setLCD('0.00');
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.06), new THREE.MeshBasicMaterial({ map: lcdT })); m.rotation.x = -Math.PI / 2 + 0.5; m.position.set(SCALE.x, SCALE.y + 0.045, SCALE.z + 0.2); sg.add(m); }
// gallon of white on the scale (open, liquid surface = canvas that shows the red pour and the stirring)
export const GAL = { r: 0.12, h: 0.19 };
export const gallon = can(sg, GAL.r, GAL.h, 0xf2f2ee, { t: 'WHITE', band: '#d9dde2', ink: '#2b3a67', s: '1 GALLON' }, SCALE.x, SCALE.y + 0.06, SCALE.z, true);
gallon.children[3].visible = false; // no lid
const liqC = document.createElement('canvas'); liqC.width = 512; liqC.height = 512; const liqT = new THREE.CanvasTexture(liqC); liqT.colorSpace = THREE.SRGBColorSpace;
export const liquid = new THREE.Mesh(new THREE.CircleGeometry(GAL.r * 0.93, 40), new THREE.MeshLambertMaterial({ map: liqT, emissive: 0xffffff, emissiveMap: liqT, emissiveIntensity: 0.3 })); liquid.rotation.x = -Math.PI / 2; liquid.position.y = GAL.h - 0.025; gallon.add(liquid);
let liqKey = '';
// red = poured amount 0..1, mix = stirred 0..1, ang = stir angle (rad)
export function setLiquid(red, mix, ang) { const k = [red, mix].map(v => Math.round(clamp(v) * 60)).join() + ':' + Math.round(ang * 20); if (k === liqKey) return; liqKey = k; const g = liqC.getContext('2d'), w = 512, c = w / 2;
  const pinkC = new THREE.Color('#f27aa6'), white = new THREE.Color('#f6f4ef'), redC = new THREE.Color('#d8262f');
  g.fillStyle = '#' + white.clone().lerp(pinkC, clamp(mix * 1.15 - 0.1)).getHexString(); g.fillRect(0, 0, w, w);
  if (red > 0 && mix < 0.98) { g.save(); g.translate(c, c); g.rotate(ang); const rc = '#' + redC.clone().lerp(pinkC, clamp(mix)).getHexString();
    if (mix <= 0.02) { g.fillStyle = rc; g.beginPath(); g.ellipse(14, -8, 40 + 150 * red, 34 + 130 * red, 0.3, 0, 7); g.fill(); }
    else { g.strokeStyle = rc; g.lineCap = 'round'; g.globalAlpha = 1 - mix * 0.6; for (let arm = 0; arm < 3; arm++) { g.lineWidth = 46 * (1 - mix) + 10; g.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40, a = arm * 2.1 + u * 5.5, r = 20 + u * 200; i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r); } g.stroke(); } }
    g.restore(); }
  g.globalAlpha = 0.35; const gr = g.createRadialGradient(c - 80, c - 90, 10, c, c, 260); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.4, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); g.globalAlpha = 1; liqT.needsUpdate = true; }
setLiquid(0, 0, 0);
// pint of red: held by a 3D arm in the top-down pour (group pivot = can's lip side); also a parked copy on the bench for the wide shot
export const PINT = { r: 0.075, h: 0.11 };
export const pint = can(sg, PINT.r, PINT.h, 0xc8323a, { t: 'RED', band: '#c8323a', s: '1 PINT' }, 0, 0, 0); sg.remove(pint);
export const pintG = new THREE.Group(); sg.add(pintG); pint.position.set(0, -PINT.h / 2, 0); pintG.add(pint); pint.children[3].material = toon(0xc8323a);
export const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.017, 1, 12), lam(0xd8262f, { emissive: 0x801010, emissiveIntensity: 0.3 })); sg.add(stream); stream.visible = false;
export function setStream(top, bot, wob) { stream.visible = true; const mid = top.clone().add(bot).multiplyScalar(0.5); stream.position.copy(mid); stream.position.x += wob; stream.scale.set(1, top.distanceTo(bot), 1); stream.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), top.clone().sub(bot).normalize()); }
// stir stick
export const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.42, 10), toon(0xd9b27a)); stick.castShadow = true; outline(stick, 0.003); sg.add(stick); stick.visible = false;
// 3D arms (dark noodle + round hand, same ink as the 2D characters) for the top-down close-up
export const armL = arm3(), armR = arm3(); sg.add(armL); sg.add(armR);
export const S_SUN = { target: [0.3, 0.9, -0.5], dir: [1.6, 2.6, -2.4] };
const sDir = new THREE.Vector3(...S_SUN.dir).normalize().negate();
{ const z = -SD / 2 - 0.08, x0 = SWIN.x - SWIN.w / 2, x1 = SWIN.x + SWIN.w / 2, y0 = SWIN.y - SWIN.h / 2, y1 = SWIN.y + SWIN.h / 2;
  S.shaft = shaft(sg, [[x0, y1, z], [x1, y1, z], [x1, y0, z], [x0, y0, z]], sDir, 3.0, 0xfff1d8, 0.16); }
export const sLamp = fixture(sg, -0.4, SH - 0.04, 0.0, 1.1, 0.26);

// =================== B: CELL BLOCK HALL (x = 600) — cell doors on the back wall (z = -4), the new pink cell is open ===================
const BX = 600; export const B = { g: new THREE.Group() }; scene.add(B.g); B.g.visible = false; B.g.position.x = BX; const bg = B.g;
export const BW = 9, BD = 8, BH = 5.6;
setSeed(33); const blueT = brickTex(205, 30, 76, '#93a8ba'); setSeed(33); const bBump = brickTex(0, 0, 0, '', 4, 8, true);
export const DOORS = [-2.6, -0.9, 0.9, 2.6]; export const PINKDOOR = 0.9; const DW = 1.0, DH = 2.15;
const bMat = wallMat(blueT, bBump);
{ const back = holeWall(BW, BH, DOORS.map(x => [x, DH / 2 + 0.001, DW, DH]).concat([[-1.75, 4.25, 0.9, 1.1], [1.75, 4.25, 0.9, 1.1]]), bMat); back.position.set(0, 0, -BD / 2); bg.add(back);
  const l = mPlane(BD, BH, bMat, 0, BH / 2); l.rotation.y = Math.PI / 2; l.position.set(-BW / 2, BH / 2, 0); bg.add(l); const r = mPlane(BD, BH, bMat, 0, BH / 2); r.rotation.y = -Math.PI / 2; r.position.set(BW / 2, BH / 2, 0); bg.add(r);
  const c = mPlane(BW, BD, lam(0x9aa8b4, { map: plainTex('#b4c0ca') })); c.rotation.x = Math.PI / 2; c.position.y = BH; bg.add(c);
  const f = mPlane(BW, BD, lam(0xdfe5ea, { map: concreteTex(80, 205, 8) })); f.rotation.x = -Math.PI / 2; bg.add(f);
  const yl = new THREE.Mesh(new THREE.PlaneGeometry(BW, 0.08), lam(0xe8c23a)); yl.rotation.x = -Math.PI / 2; yl.position.set(0, 0.003, -BD / 2 + 0.9); bg.add(yl);
  const sk = holeWall(BW + 0.4, BH + 0.4, [[-1.75, 4.45, 0.9, 1.1], [1.75, 4.45, 0.9, 1.1]], dark); sk.position.set(0, -0.2, -BD / 2 - 2.6); bg.add(sk); }
// upper walkway + railing (second tier)
{ box(BW, 0.12, 1.1, steel, 0, 2.95, -BD / 2 + 0.55, bg, 0.006); box(BW, 0.05, 0.05, steelD, 0, 3.95, -BD / 2 + 1.08, bg); box(BW, 0.04, 0.04, steelD, 0, 3.45, -BD / 2 + 1.08, bg);
  for (let x = -BW / 2 + 0.2; x < BW / 2; x += 0.22) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.0, 6), steelD); b.position.set(x, 3.45, -BD / 2 + 1.08); bg.add(b); }
  const podT = signTex(400, 130, '#2b3a67', [{ t: 'BLOCK C', size: 74, y: 68, col: '#ffffff', font: '"DejaVu Sans", sans-serif' }], 0); const pod = sPlane(0.9, 0.29, lam(0xffffff, { map: podT })); pod.position.set(0, 4.9, -BD / 2 + 0.01); bg.add(pod);
  for (const x of DOORS) { const d = box(0.85, 1.9, 0.05, toon(0x8796a6), x, 3.95, -BD / 2 + 0.02, bg, 0.004); box(0.3, 0.2, 0.06, dark, x, 4.45, -BD / 2 + 0.03, bg); } }
// cell doors: steel frames; closed doors grey; the pink cell's door slid open with a pink room behind it (its own light)
const frameM = toon(0x5d6773);
for (const x of DOORS) { box(0.08, DH + 0.08, 0.16, frameM, x - DW / 2 - 0.04, DH / 2, -BD / 2, bg, 0.004); box(0.08, DH + 0.08, 0.16, frameM, x + DW / 2 + 0.04, DH / 2, -BD / 2, bg, 0.004); box(DW + 0.16, 0.08, 0.16, frameM, x, DH + 0.04, -BD / 2, bg, 0.004);
  const numT = signTex(160, 100, '#fbf6e8', [{ t: 'C-' + (DOORS.indexOf(x) + 1), size: 54, y: 52, col: INK, font: '"DejaVu Sans", sans-serif' }], 5); const n = sPlane(0.24, 0.15, lam(0xffffff, { map: numT })); n.position.set(x, DH + 0.24, -BD / 2 + 0.1); bg.add(n);
  if (x === PINKDOOR) continue; const d = box(DW, DH, 0.06, toon(0x9aa7b5), x, DH / 2, -BD / 2 - 0.02, bg, 0.004); box(0.3, 0.25, 0.07, dark, x, 1.6, -BD / 2 - 0.01, bg); bars(bg, x - 0.13, x + 0.13, 1.48, 1.72, -BD / 2 + 0.03, 4, 0.01); }
export const slideDoor = box(DW, DH, 0.06, toon(0x9aa7b5), PINKDOOR + DW + 0.1, DH / 2, -BD / 2 + 0.06, bg, 0.004);
setSeed(77); const pinkT2 = brickTex(326, 74, 60, '#a83a76');
{ const pm = wallMat(pinkT2, bumpT, { emissive: 0xf27aa6, emissiveIntensity: 0.22 }); const pr = new THREE.Group(); pr.position.set(PINKDOOR, 0, -BD / 2 - 1.3); bg.add(pr);
  const w = mPlane(2.4, 3, pm, 0, 1.5); w.position.set(0, 1.5, -1.25); pr.add(w); const l = mPlane(2.5, 3, pm, 0, 1.5); l.rotation.y = Math.PI / 2; l.position.set(-1.2, 1.5, 0); pr.add(l); const r = mPlane(2.5, 3, pm, 0, 1.5); r.rotation.y = -Math.PI / 2; r.position.set(1.2, 1.5, 0); pr.add(r);
  const f = mPlane(2.4, 2.6, lam(0xe9d6de, { map: floorT })); f.rotation.x = -Math.PI / 2; pr.add(f); const c = mPlane(2.4, 2.6, lam(0xf6c4d8)); c.rotation.x = Math.PI / 2; c.position.y = 3; pr.add(c);
  box(1.6, 0.06, 0.6, steel, 0.2, 0.48, -0.9, pr, 0.004);
  B.pinkLight = new THREE.PointLight(0xff8ab8, 6, 5, 1.6); B.pinkLight.position.set(0, 2.4, -0.4); pr.add(B.pinkLight); }
// guards' table + benches + mugs (front left)
export const TABLE = { x: -1.1, z: -1.1 };
{ const tm = toon(0x75879a); box(2.0, 0.06, 0.8, tm, TABLE.x, 0.8, TABLE.z, bg, 0.005); box(0.08, 0.77, 0.08, steelD, TABLE.x - 0.8, 0.385, TABLE.z, bg); box(0.08, 0.77, 0.08, steelD, TABLE.x + 0.8, 0.385, TABLE.z, bg);
  box(2.0, 0.05, 0.32, tm, TABLE.x, 0.46, TABLE.z + 0.62, bg, 0.004); box(0.06, 0.44, 0.06, steelD, TABLE.x - 0.8, 0.22, TABLE.z + 0.62, bg); box(0.06, 0.44, 0.06, steelD, TABLE.x + 0.8, 0.22, TABLE.z + 0.62, bg);
  for (const [dx, dz] of [[-0.55, 0.1], [0.4, -0.05]]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.11, 18), white); m.position.set(TABLE.x + dx, 0.885, TABLE.z + dz); m.castShadow = true; outline(m, 0.004); bg.add(m); }
  for (const dx of [-0.2, 0.6]) { const tr = box(0.36, 0.02, 0.26, toon(0xd9dde2), TABLE.x + dx, 0.84, TABLE.z + 0.05, bg, 0.003); const food = box(0.1, 0.04, 0.08, toon(0xe0b13c), TABLE.x + dx - 0.06, 0.865, TABLE.z + 0.05, bg, 0.002); } }
export const bLamps = [-2.5, 0, 2.5].map(x => fixture(bg, x, BH - 0.05, -1.0, 1.4, 0.3));
export const B_SUN = { target: [0, 0.5, -1.5], dir: [-1.2, 3.0, -2.6] };
const bDir = new THREE.Vector3(...B_SUN.dir).normalize().negate();
for (const x of [-1.75, 1.75]) { const z = -BD / 2 - 0.1, y0 = 4.25 - 0.55, y1 = 4.25 + 0.55; shaft(bg, [[x - 0.45, y1, z], [x + 0.45, y1, z], [x + 0.45, y0, z], [x - 0.45, y0, z]], bDir, 5.0, 0xfff4e2, 0.14);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.1), new THREE.MeshBasicMaterial({ color: 0xeaf6ff })); sky.position.set(x, 4.25, -BD / 2 - 0.3); bg.add(sky); bars(bg, x - 0.38, x + 0.38, 3.7, 4.8, -BD / 2 - 0.05, 5); }
B.motes = motes(bg, new THREE.Vector3(1.75, 4.25, -BD / 2), bDir, 4.5, 40, 0.5);

// v3: hanging pendant lamps over the hall (practical lights in frame, like the sample) + a foreground bench
B.pendants = [[-2.4, -1.6], [2.8, -1.6], [-1.2, 0.6], [1.6, 0.6]].map(([x, z]) => pendant(bg, x, 3.75, z, BH));
{ const tm = toon(0x75879a); box(2.2, 0.05, 0.34, tm, 0.2, 0.46, 0.9, bg, 0.004); box(0.06, 0.44, 0.06, steelD, -0.7, 0.22, 0.9, bg); box(0.06, 0.44, 0.06, steelD, 1.1, 0.22, 0.9, bg); }
// characters per set
export const cc = { g1: new Char('guard', cg), g2: new Char('guard2', cg) };
export const sc = { sci: new Char('sci', sg) };
export const bc = { g1: new Char('guard', bg), g2: new Char('guard2', bg), con: new Char('con', bg) };
