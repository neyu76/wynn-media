// RC01-T005 — sets: A town street + ticket printer (x = 0), O mayor's office (x = 300)
import { THREE, scene, ctex, lam, toon, outline, box, R, setSeed, INK, signTex, Char, imgTex, paintedMat, woodTex, stoneTex, DIG, clamp, lerp, ss } from './core.js';
import { TYPES } from './chars2.js';

TYPES.mayor = { coat: '#2b3a67', shirt: '#f4ecdc', tie: 'bow', tieCol: '#c8323a', vest: '#c9a44a', hat: 'top', hatCol: '#1c1c24', hair: 'side', hairCol: '#5a4a3a', mustache: 'walrus', belly: 0.14, pants: '#25283a' };
TYPES.cleaner = { coat: '#e8742c', shirt: '#f4ecdc', tie: 'none', hat: 'flat', hatCol: '#3f5a3a', hair: 'curly', hairCol: '#3a2a20', belly: 0.03, pants: '#3a4a5a' };

// ---------- shared: fine ticket texture + geometry ----------
export const TK = { w: 0.13, h: 0.21 };
const tkTex = ctex(256, 412, (g, w, h) => { g.fillStyle = '#fffdf3'; g.fillRect(0, 0, w, h); g.fillStyle = '#d0262e'; g.fillRect(0, 0, w, 92);
  g.fillStyle = '#ffffff'; g.font = 'bold 70px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FINE', w / 2, 50);
  g.fillStyle = '#8a857a'; for (let i = 0; i < 5; i++) g.fillRect(28, 130 + i * 40, w - 56 - (i % 2) * 40, 12);
  g.fillStyle = '#555'; g.font = 'bold 26px "DejaVu Sans", sans-serif'; g.fillText('TOWN HALL', w / 2, 362);
  g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); });
const tkGeo = new THREE.PlaneGeometry(TK.w, TK.h);
const tkMat = new THREE.MeshLambertMaterial({ map: tkTex, emissive: 0xffffff, emissiveMap: tkTex, emissiveIntensity: 0.35, side: THREE.DoubleSide });
export function ticket(parent) { const m = new THREE.Mesh(tkGeo, tkMat); m.castShadow = true; m.visible = false; parent.add(m); return m; }
const plateTex = signTex(512, 180, '#d4ad52', [{ t: 'OWNER:', size: 50, y: 52, col: '#4a3510', font: '"DejaVu Sans", sans-serif' }, { t: 'TOWN HALL', size: 74, y: 122, col: '#4a3510', font: '"DejaVu Sans", sans-serif' }], 10,
  (g, w, h) => { g.fillStyle = '#7a5a20'; for (const [x, y] of [[22, 22], [w - 22, 22], [22, h - 22], [w - 22, h - 22]]) { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); } });
export function ownerPlate(parent, w = 0.2) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 180 / 512), new THREE.MeshLambertMaterial({ map: plateTex, emissive: 0xffffff, emissiveMap: plateTex, emissiveIntensity: 0.4, polygonOffset: true, polygonOffsetFactor: -2 })); parent.add(m); return m; }

// =================== A: STREET (x = 0) ===================
setSeed(501);
export const A = { g: new THREE.Group() }; scene.add(A.g); A.g.visible = false;
const ag = A.g;
const cob = stoneTex('hsl(34,18%,70%)', 14, 7); cob.repeat.set(9, 9);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), lam(0xd8cdb8, { map: cob })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ag.add(ground);
const stTex = imgTex('mg/street_back.jpg');
const BW = 18, BH = 18 * 768 / 1376;
export const aBack = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), paintedMat(stTex, 0.72, 0xd0d0d0, { fog: false })); aBack.position.set(0, BH / 2 - 2.2, -8); ag.add(aBack); // painted vanishing point ≈ camera height
// kerb + pavement strip the machine stands on
box(9, 0.08, 1.6, toon(0xcfc4ae), 0, 0.04, -0.2, ag, 0.004);
box(9, 0.12, 0.12, toon(0xb5aa94), 0, 0.06, 0.62, ag, 0.004);

// ---------- the ticket printer (primitives after art/printer_ref.png: municipal green, brass trim, camera eye, red light, slot, side switch, plate on the base) ----------
export const MC = new THREE.Vector3(0.35, 0.08, -0.25);
export const mach = new THREE.Group(); mach.position.copy(MC); ag.add(mach);
const green = toon(0x4f8a5a), greenD = toon(0x3b6e46), brass = toon(0xc9a44a), steel = toon(0x8a8f96), dark = toon(0x1f232c);
{ const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.13, 32), greenD); base.position.y = 0.065; base.castShadow = base.receiveShadow = true; outline(base, 0.006); mach.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.5, 20), greenD); post.position.y = 0.38; post.castShadow = true; outline(post, 0.005); mach.add(post); }
export const BODY = { y: 0.86, w: 0.5, h: 0.46, d: 0.36 };
const body = box(BODY.w, BODY.h, BODY.d, green, 0, BODY.y, 0, mach, 0.008);
for (const sx of [-1, 1]) for (const sy of [-1, 1]) box(0.09, 0.09, BODY.d + 0.02, brass, sx * (BODY.w / 2 - 0.035), BODY.y + sy * (BODY.h / 2 - 0.035), 0, mach, 0.004);
// slot (front, upper half): brass frame + dark mouth; tickets come out of SLOT
export const SLOT = new THREE.Vector3(0, BODY.y + 0.07, BODY.d / 2 + 0.01);
box(0.26, 0.07, 0.03, brass, 0, SLOT.y, BODY.d / 2 + 0.005, mach, 0.003); box(0.2, 0.025, 0.035, dark, 0, SLOT.y, BODY.d / 2 + 0.01, mach);
// countdown display under the slot
const dispFrame = box(0.13, 0.13, 0.02, dark, 0, BODY.y - 0.1, BODY.d / 2 + 0.005, mach, 0.003);
export const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.11), new THREE.MeshBasicMaterial({ map: DIG[3] })); disp.position.set(0, BODY.y - 0.1, BODY.d / 2 + 0.017); mach.add(disp);
const lcdOff = ctex(128, 192, (g, w, h) => { g.fillStyle = '#4a5a48'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(8, 8, w - 16, 30); });
const lcdIdle = ctex(128, 192, (g, w, h) => { g.fillStyle = '#e8f2d8'; g.fillRect(0, 0, w, h); g.fillStyle = '#1b1e2e'; g.fillRect(30, h / 2 - 8, w - 60, 16); });
// camera eye on top (pitch = eye.rotation.x, yaw = eye.rotation.y), red light beside it
export const eye = new THREE.Group(); eye.position.set(-0.05, BODY.y + BODY.h / 2 + 0.13, 0.04); eye.rotation.order = 'YXZ'; mach.add(eye);
{ const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.1, 14), greenD); neck.position.set(-0.05, BODY.y + BODY.h / 2 + 0.05, 0.04); outline(neck, 0.004); mach.add(neck); }
// pitch/yaw that point the lens at a world point (eye looks at the paper it is about to fine)
export function eyeAim(p) { mach.updateMatrixWorld(); const e = eye.getWorldPosition(new THREE.Vector3()); const dx = p.x - e.x, dy = p.y - e.y, dz = p.z - e.z; return [Math.atan2(-dy, Math.hypot(dx, dz)), Math.atan2(dx, dz)]; }
{ const dome = new THREE.Mesh(new THREE.SphereGeometry(0.085, 24, 16), green); outline(dome, 0.005); eye.add(dome);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.012, 10, 28), brass); ring.position.z = 0.072; eye.add(ring); }
export const lens = new THREE.Mesh(new THREE.CircleGeometry(0.045, 28), new THREE.MeshBasicMaterial({ color: 0x1a2a3a })); lens.position.z = 0.079; eye.add(lens);
export const lensGlow = new THREE.Mesh(new THREE.CircleGeometry(0.02, 20), new THREE.MeshBasicMaterial({ color: 0x8fe0ff, transparent: true, opacity: 0.9 })); lensGlow.position.z = 0.081; eye.add(lensGlow);
export const redLight = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), new THREE.MeshBasicMaterial({ color: 0x7a1010 })); redLight.position.set(0.12, BODY.y + BODY.h / 2 + 0.03, 0.05); mach.add(redLight);
box(0.07, 0.02, 0.07, steel, 0.12, BODY.y + BODY.h / 2 + 0.01, 0.05, mach, 0.002);
// power switch on the front, right of the display (lever rotation.x: up = on)
box(0.07, 0.11, 0.02, dark, 0.15, BODY.y - 0.1, BODY.d / 2 + 0.005, mach, 0.003);
export const lever = new THREE.Group(); lever.position.set(0.15, BODY.y - 0.1, BODY.d / 2 + 0.02); mach.add(lever);
box(0.025, 0.08, 0.025, toon(0xc8323a), 0, 0.035, 0.0, lever, 0.003);
{ const k = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 10), toon(0xc8323a)); k.position.y = 0.075; outline(k, 0.002); lever.add(k); }
// ownership plate on the base front (removable)
export const plateM = ownerPlate(mach, 0.2); plateM.position.set(0, 0.07, 0.235); plateM.rotation.x = -0.2;
export function setMachine({ on = 1, digit = 0, eyeP = 0, eyeY = 0, red = 0, plate = true, drop = 0 } = {}) {
  mach.position.set(MC.x, MC.y + drop, MC.z); mach.visible = drop < 2.9;
  eye.rotation.set(Math.min(0.72, eyeP), eyeY, 0); // ≤ 41° down so the lens stays readable from the front
  const dm = on < 0.5 ? lcdOff : (digit > 0 ? DIG[digit] : lcdIdle); if (disp.material.map !== dm) { disp.material.map = dm; disp.material.needsUpdate = true; }
  lensGlow.material.opacity = 0.9 * on; lens.material.color.set(on > 0.5 ? 0x1a2a3a : 0x0c0e12);
  redLight.material.color.set(red > 0.5 && on > 0.5 ? 0xff3030 : 0x5a1010); lever.rotation.x = on > 0.5 ? -0.45 : 2.4;
  plateM.visible = plate; }
// world point of the slot / lens (for camera aims and ticket paths)
const _w = new THREE.Vector3();
export const slotW = () => { mach.updateMatrixWorld(); return mach.localToWorld(_w.copy(SLOT)).clone(); };

// ---------- street tickets: a pool; each has an emerge time, a landing spot, and optional pick / gather times ----------
export const POOL = []; for (let i = 0; i < 90; i++) POOL.push(ticket(ag));
// pose of a ticket at time t: emerging (0.3 s) → flutter down (dur fl) → lying flat at land
const _p = new THREE.Vector3();
export function poseTicket(m, t, tk) { const { te, land, fl = 1.2, yaw = 0, pick, gather, carry } = tk;
  if (t < te || (pick !== undefined && t >= pick) ) { m.visible = false; return; }
  m.visible = true; const s0 = slotW();
  if (t < te + 0.3) { const k = (t - te) / 0.3; m.position.set(s0.x, s0.y - 0.005 - k * TK.h * 0.45, s0.z + 0.02 + k * 0.02); m.rotation.set(-0.15, 0, 0); m.scale.set(1, Math.max(0.05, k), 1); return; }
  m.scale.set(1, 1, 1);
  const k = clamp((t - te - 0.3) / fl), e = k * k * (3 - 2 * k);
  const gx = land[0], gz = land[1], gy = 0.087 + (land[2] || 0);
  _p.set(lerp(s0.x, gx, e) + Math.sin(k * 9 + te) * 0.08 * (1 - k), lerp(s0.y - TK.h * 0.5, gy, k * k * 0.6 + e * 0.4), lerp(s0.z + 0.05, gz, e));
  if (gather !== undefined && t >= gather) { const g = clamp((t - gather) / 0.45), c = carry(t); _p.lerp(c, g * g); _p.y += Math.sin(g * Math.PI) * 0.3; if (g >= 1) { m.visible = false; return; } }
  m.position.copy(_p);
  const flat = k >= 1 ? 1 : k * k; m.rotation.set(lerp(-0.15 + Math.sin(k * 11 + te) * 0.9, -Math.PI / 2, flat), yaw * flat + Math.sin(k * 7) * 0.6 * (1 - flat), Math.sin(k * 13 + te) * 0.5 * (1 - flat)); }
// crumpled scrap (the first "litter")
export const scrap = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 1), toon(0xf1ead8)); scrap.castShadow = true; outline(scrap, 0.004); ag.add(scrap); scrap.visible = false;
{ const p = scrap.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * R(0.75, 1.2), p.getY(i) * R(0.7, 1.1), p.getZ(i) * R(0.75, 1.2)); scrap.geometry.computeVertexNormals(); }

// ---------- rule sign (2 lines + 3-tick clock) ----------
const ruleCanvas = document.createElement('canvas'); ruleCanvas.width = 900; ruleCanvas.height = 640; const rg = ruleCanvas.getContext('2d');
const ruleTex = new THREE.CanvasTexture(ruleCanvas); ruleTex.colorSpace = THREE.SRGBColorSpace; ruleTex.anisotropy = 8;
let ruleKey = '';
// k = [title, line1, clock ticks 0..3, line2, stamp], hi = highlight line 2 (cleaner points at it)
export function setRule(k, hi = 0) { const key = k.map(v => Math.round(clamp(v / (v > 1 ? 3 : 1)) * 30)).join(',') + ':' + Math.round(hi * 10); if (key === ruleKey) return; ruleKey = key; const g = rg, w = 900, h = 640;
  g.fillStyle = '#f6efdc'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2b3a67'; g.lineWidth = 22; g.strokeRect(11, 11, w - 22, h - 22);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.globalAlpha = clamp(k[0]); g.fillStyle = '#2b3a67'; g.font = 'bold 96px "DejaVu Serif", serif'; g.fillText('TOWN RULE', w / 2, 100); g.fillRect(90, 160, w - 180, 8); g.globalAlpha = 1;
  const a1 = clamp(k[1]); if (a1 > 0) { g.save(); g.globalAlpha = a1; g.translate((1 - a1) * -50, 0); g.fillStyle = INK; g.font = 'bold 62px "DejaVu Sans", sans-serif'; g.fillText('PAPER + 3 s = FINE', w / 2 - 70, 255);
    // clock: 3 ticks fill on "three seconds"
    const cx = w - 110, cy = 255, n = Math.round(clamp(k[2] / 3) * 3); g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, 52, 0, 7); g.stroke();
    for (let i = 0; i < 3; i++) { g.fillStyle = i < n ? '#d0262e' : 'rgba(0,0,0,0.12)'; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 44, -Math.PI / 2 + i * 2 * Math.PI / 3, -Math.PI / 2 + (i + 1) * 2 * Math.PI / 3 - 0.08); g.closePath(); g.fill(); } g.restore(); }
  const a2 = clamp(k[3]); if (a2 > 0) { g.save(); g.globalAlpha = a2; g.translate((1 - a2) * -50, 0);
    if (hi > 0) { g.fillStyle = `rgba(255,214,74,${0.85 * clamp(hi)})`; g.fillRect(50, 350, w - 100, 210); }
    g.fillStyle = INK; g.font = 'bold 64px "DejaVu Sans", sans-serif'; g.fillText('MACHINE DROPS IT', w / 2, 400); g.fillStyle = '#d0262e'; g.font = 'bold 84px "DejaVu Sans", sans-serif'; g.fillText('→ OWNER PAYS', w / 2, 500); g.restore(); }
  const s = clamp(k[4]); if (s > 0) { const sc = 1 + (1 - s) * 1.2; g.save(); g.translate(w - 170, 120); g.rotate(-0.2); g.scale(sc, sc); g.globalAlpha = Math.min(1, s * 1.5); g.strokeStyle = '#d0262e'; g.lineWidth = 10; g.strokeRect(-110, -44, 220, 88); g.fillStyle = '#d0262e'; g.font = 'bold 62px "DejaVu Sans", sans-serif'; g.fillText('FINE', 0, 4); g.restore(); }
  ruleTex.needsUpdate = true; }
setRule([0, 0, 0, 0, 0]);
export const RS = new THREE.Vector3(-1.05, 0, -0.55);
export const rule = new THREE.Group(); rule.position.copy(RS); rule.rotation.y = 0.32; ag.add(rule);
{ const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.64), new THREE.MeshLambertMaterial({ map: ruleTex, emissive: 0xffffff, emissiveMap: ruleTex, emissiveIntensity: 0.4 })); pm.position.set(0, 1.62, 0.026); rule.add(pm);
  box(0.96, 0.7, 0.04, toon(0x2b3a67), 0, 1.62, 0, rule, 0.006); box(0.06, 1.3, 0.06, toon(0x2b2b33), 0, 0.65, -0.03, rule, 0.005); }
export const RULE_C = new THREE.Vector3(RS.x, 1.62, RS.z); // sign centre (camera aims)
// set dressing: bench, lamp post, flower tubs, a litter bin
{ box(1.1, 0.06, 0.34, toon(0x8a5a32), 2.2, 0.46, -0.6, ag, 0.004); box(1.1, 0.3, 0.05, toon(0x8a5a32), 2.2, 0.68, -0.76, ag, 0.004); for (const x of [1.75, 2.65]) box(0.06, 0.44, 0.3, toon(0x2b2b33), x, 0.22, -0.6, ag);
  const lp = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3.0, 12), toon(0x2b2b33)); lp.position.set(-2.3, 1.5, -0.7); outline(lp, 0.005); ag.add(lp);
  const lb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff1c8 })); lb.position.set(-2.3, 3.1, -0.7); ag.add(lb);
  for (const [x, z] of [[-1.85, 0.25], [1.6, 0.2]]) { const tub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.36, 18), toon(0xb0603a)); tub.position.set(x, 0.18, z); outline(tub, 0.005); ag.add(tub);
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), toon(0x5f9a4a)); fl.scale.y = 0.6; fl.position.set(x, 0.42, z); outline(fl, 0.005); ag.add(fl);
    for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), toon([0xe8504a, 0xf2c94c, 0xf3f0e8][i % 3])); f.position.set(x + R(-0.15, 0.15), 0.5, z + R(-0.15, 0.15)); ag.add(f); } } }
export const aKey = new THREE.DirectionalLight(0xfff1d6, 2.0); aKey.position.set(-4, 7, 5); aKey.castShadow = true; aKey.shadow.mapSize.set(2048, 2048); { const c = aKey.shadow.camera; c.left = -5; c.right = 5; c.top = 5; c.bottom = -3; c.far = 30; } aKey.shadow.bias = -0.0005; ag.add(aKey); aKey.target.position.set(0, 0.8, -0.3); ag.add(aKey.target);
export const ac = { mayor: new Char('mayor', ag), cleaner: new Char('cleaner', ag) };

// =================== O: MAYOR'S OFFICE (x = 300) ===================
setSeed(601);
export const O = { g: new THREE.Group() }; O.g.position.set(300, 0, 0); scene.add(O.g); O.g.visible = false;
const og = O.g;
const floorT = woodTex(30, 40, 8, false, 1024); floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(4, 4);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), lam(0xffffff, { map: floorT })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; og.add(floor);
const ofTex = imgTex('mg/office_back.jpg');
const OW = 8, OH = 8 * 768 / 1376;
export const oBack = new THREE.Mesh(new THREE.PlaneGeometry(OW, OH), paintedMat(ofTex, 0.62)); oBack.position.set(0, OH / 2 - 0.8, -2.6); oBack.receiveShadow = true; og.add(oBack); // painted floor line ≈ y 0
for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), lam(0x8a5a32)); sw.rotation.y = -s * Math.PI / 2; sw.position.set(s * 4.0, 2.5, 0.4); sw.receiveShadow = true; og.add(sw); }
// desk: dark wood, green leather top, inkwell + nameplate + stamp
export const DESK = { x: 0, z: -0.6, w: 1.7, h: 0.78, d: 0.8 };
const deskWood = toon(0xffffff, { map: woodTex(22, 30, 6, false, 512) });
box(DESK.w, 0.06, DESK.d, deskWood, DESK.x, DESK.h - 0.03, DESK.z, og, 0.008);
box(DESK.w - 0.2, 0.012, DESK.d - 0.2, toon(0x2f5d4a), DESK.x, DESK.h + 0.006, DESK.z, og);
box(DESK.w - 0.04, DESK.h - 0.06, 0.06, deskWood, DESK.x, (DESK.h - 0.06) / 2, DESK.z + DESK.d / 2 - 0.03, og, 0.008);
for (const s of [-1, 1]) box(0.06, DESK.h - 0.06, DESK.d - 0.04, deskWood, DESK.x + s * (DESK.w / 2 - 0.03), (DESK.h - 0.06) / 2, DESK.z, og, 0.006);
const npT = signTex(600, 140, '#2b2420', [{ t: 'THE MAYOR', size: 80, y: 74, col: '#e2c46a' }], 8);
export const namePlate = new THREE.Group(); namePlate.position.set(DESK.x - 0.4, DESK.h + 0.05, DESK.z + 0.25); og.add(namePlate);
{ const m = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.084), new THREE.MeshLambertMaterial({ map: npT, emissive: 0xffffff, emissiveMap: npT, emissiveIntensity: 0.35 })); m.position.z = 0.02; m.rotation.x = -0.35; namePlate.add(m); box(0.38, 0.1, 0.04, toon(0x2b2420), 0, 0, 0, namePlate, 0.003).rotation.x = -0.35; }
{ const ink = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.07, 16), toon(0x1f2a3a)); ink.position.set(DESK.x + 0.55, DESK.h + 0.04, DESK.z + 0.15); outline(ink, 0.003); og.add(ink);
  box(0.3, 0.04, 0.22, toon(0x7a2f22), DESK.x + 0.35, DESK.h + 0.03, DESK.z - 0.1, og, 0.003); }
// chair behind the desk
box(0.6, 0.9, 0.08, toon(0x6b2a2a), DESK.x, 1.0, DESK.z - 0.75, og, 0.006);
// the pile on the desk: a white core + instanced tickets over its surface; k grows it, big = buries the desk
export const PILE_C = new THREE.Vector3(DESK.x, DESK.h, DESK.z + 0.05);
const pileG = new THREE.Group(); pileG.position.copy(PILE_C); og.add(pileG); pileG.visible = false;
const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xf3eee0)); core.scale.set(1.2, 0.8, 0.9); core.castShadow = true; outline(core, 0.008); pileG.add(core);
const NT = 220; const inst = new THREE.InstancedMesh(tkGeo, tkMat, NT); inst.castShadow = true; pileG.add(inst);
const SURF = []; for (let i = 0; i < NT; i++) { const u = R(0, Math.PI * 2), v = Math.acos(R(0.05, 1)); SURF.push([Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u), R(-1, 1), R(-1, 1), R(-1, 1)]); }
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(1, 1, 1), _t = new THREE.Vector3();
export const pilePlate = ownerPlate(pileG, 0.24); pilePlate.visible = false;
// k: 0..1 pile size on the desk top, big: 0..1 grows until the desk is buried; plate: 0 = not there, 0..1 = being laid, 1 = on top
export function setPile(k, big = 0, plate = 0) { pileG.visible = k > 0.01; if (!pileG.visible) return;
  const sx = lerp(0.55, 1.15, k) * lerp(1, 1.9, big), sy = lerp(0.35, 0.9, k) * lerp(1, 2.0, big); core.scale.set(1.2 * sx, 0.8 * sy, 0.9 * lerp(1, 1.8, big));
  pileG.position.set(PILE_C.x, PILE_C.y - big * 0.55, PILE_C.z + big * 0.2);
  const n = Math.round(NT * clamp(0.35 + 0.65 * k)); inst.count = n;
  for (let i = 0; i < n; i++) { const [x, y, z, a, b, c] = SURF[i]; _t.set(x * 0.6 * sx, y * 0.4 * sy + 0.01, z * 0.45 * lerp(1, 1.8, big)); _e.set(-Math.PI / 2 + a * 0.6 + (1 - y) * 0.8 * Math.sign(z), b * 3, c * 0.6); _q.setFromEuler(_e); _m4.compose(_t, _q, _s); inst.setMatrixAt(i, _m4); }
  inst.instanceMatrix.needsUpdate = true;
  pilePlate.visible = plate > 0.01; if (pilePlate.visible) { const top = 0.4 * sy + 0.03; pilePlate.position.set(0.05, top + (1 - plate) * 0.35, 0.08); pilePlate.rotation.set(-1.15, 0.12, 0); } }
export const pileTop = () => { pileG.updateMatrixWorld(); return pileG.localToWorld(new THREE.Vector3(0.05, 0.4 * core.scale.y / 0.8 + 0.03, 0.08)); };
export const oKey = new THREE.DirectionalLight(0xffe2b8, 1.5); oKey.position.set(-3.0, 4.5, 3.5); oKey.castShadow = true; oKey.shadow.mapSize.set(2048, 2048); { const c = oKey.shadow.camera; c.left = -3; c.right = 3; c.top = 3; c.bottom = -2; c.far = 20; } oKey.shadow.bias = -0.0005; og.add(oKey); oKey.target.position.set(0, 0.8, -0.5); og.add(oKey.target);
export const oLight = new THREE.PointLight(0xffd6a0, 3.5, 8, 1.6); oLight.position.set(-1.5, 2.4, 1.0); og.add(oLight);
export const oc = { mayor: new Char('mayor', og), cleaner: new Char('cleaner', og) };
