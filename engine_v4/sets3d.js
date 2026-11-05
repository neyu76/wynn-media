// sets3d.js — v8 toolkit for REAL 3D sets (docs/STYLE_V8.md §4), extracted from PINK15 prison.js.
// Rooms are textured planes with UVs in metres (bricks keep one size everywhere), windows are real holes so the sun casts bar
// shadows, light shafts are additive volumes, dust motes drift in them, practical lamps hang in frame.
// Import from an episode set file:  import { brickTex, wallMat, mPlane, holeWall, shaft, motes, ... } from './sets3d.js';
// Needs the episode core.js (T015/PINK15 lineage: exports THREE, ctex, lam, toon, outline, box, R, setSeed, lerp).
import { THREE, ctex, toon, outline, box, R, setSeed, lerp } from './core.js';

export const TILE = 1.2; // one brick texture = 1.2 m × 1.2 m

// ---------- textures (deterministic: call setSeed(n) before each one) ----------
// brick: hsl colour, mortar colour; bump = grey version for bumpMap. v8 palette: mortar close to the brick (low contrast lines)
export function brickTex(h, s, l, mortar, cols = 4, rows = 8, bump = false) {
  return ctex(512, 512, (g, w, hh) => { g.fillStyle = bump ? '#202020' : mortar; g.fillRect(0, 0, w, hh); const bw = w / cols, bh = hh / rows;
    for (let r = 0; r < rows; r++) for (let c = -1; c <= cols; c++) { const x = c * bw + (r % 2) * bw / 2, y = r * bh, dl = R(-5, 5);
      g.fillStyle = bump ? `hsl(0,0%,${78 + dl}%)` : `hsl(${h + R(-3, 3)}, ${s}%, ${l + dl}%)`; g.fillRect(x + 3, y + 3, bw - 6, bh - 6);
      g.fillStyle = bump ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.13)'; g.fillRect(x + 3, y + 3, bw - 6, 4); g.fillStyle = 'rgba(0,0,0,0.13)'; g.fillRect(x + 3, y + bh - 8, bw - 6, 5); } }, [1, 1]);
}
export function concreteTex(l = 62, h = 205, s = 6) { return ctex(512, 512, (g, w, hh) => { g.fillStyle = `hsl(${h}, ${s}%, ${l}%)`; g.fillRect(0, 0, w, hh); for (let i = 0; i < 900; i++) { g.fillStyle = `hsla(${h}, ${s}%, ${l + R(-9, 9)}%, 0.5)`; g.beginPath(); g.arc(R(0, w), R(0, hh), R(2, 9), 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(0,0,0,0.16)'; g.lineWidth = 3; g.strokeRect(0, 0, w, hh); }, [1, 1]); }
export function plainTex(col, n = 300, a = 0.05) { return ctex(256, 256, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(R(0, w), R(0, h), R(1, 4), R(1, 4)); } }, [1, 1]); }
export const wallMat = (map, bumpMap, o = {}) => new THREE.MeshLambertMaterial({ map, bumpMap, bumpScale: 2.2, shadowSide: THREE.DoubleSide, ...o });

// ---------- geometry ----------
// plane with UVs in metres (u = x / TILE, v = y / TILE in the plane's own coordinates) — tiling walls/floors only
export function mPlane(w, h, mat, ox = 0, oy = 0) { const geo = new THREE.PlaneGeometry(w, h); const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + ox) / TILE, (p.getY(i) + oy) / TILE); const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.castShadow = true; return m; }
// sign/poster plane with normal 0..1 uvs (metre UVs make signs black/tiled — PINK15 bug)
export function sPlane(w, h, mat) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.receiveShadow = true; return m; }
// wall with rectangular holes [[x, y, w, h]]; local coords x ∈ [-w/2, w/2], y ∈ [0, h]
export function holeWall(w, h, holes, mat) { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.closePath();
  holes.forEach(([x, y, hw, hh]) => { const p = new THREE.Path(); p.moveTo(x - hw / 2, y - hh / 2); p.lineTo(x - hw / 2, y + hh / 2); p.lineTo(x + hw / 2, y + hh / 2); p.lineTo(x + hw / 2, y - hh / 2); p.closePath(); s.holes.push(p); });
  const geo = new THREE.ShapeGeometry(s); const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / TILE, p.getY(i) / TILE);
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = m.castShadow = true; return m; }

// ---------- light ----------
// light shaft: window rectangle (4 world corners) extruded along dir (unit, pointing away from the sun) by L; fades with length and at
// grazing angles. k 0.2–0.6: a shaft that crosses the frame sideways reads best (aim the sun so the camera sees the volume from the side)
const shaftMat = (col, k) => new THREE.ShaderMaterial({ uniforms: { col: { value: new THREE.Color(col) }, k: { value: k } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: 'varying float vv; varying vec3 vn; varying vec3 vw; void main(){ vv = uv.y; vn = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position,1.0); vw = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
  fragmentShader: 'uniform vec3 col; uniform float k; varying float vv; varying vec3 vn; varying vec3 vw; void main(){ vec3 vd = normalize(cameraPosition - vw); float f = pow(abs(dot(vn, vd)), 1.6); float a = k * f * pow(1.0 - vv, 1.3) * smoothstep(0.0, 0.08, vv); gl_FragColor = vec4(col * a, a);\n#include <colorspace_fragment>\n}' });
export function shaft(parent, corners, dir, L, col = 0xfff2d8, k = 0.22) {
  const P = corners.map(c => new THREE.Vector3(...c)), Q = P.map(p => p.clone().addScaledVector(dir, L)); const pos = [], uv = [], idx = [];
  for (let i = 0; i < 4; i++) { const a = P[i], b = P[(i + 1) % 4], c = Q[(i + 1) % 4], d = Q[i], o = pos.length / 3; [a, b, c, d].forEach(v => pos.push(v.x, v.y, v.z)); uv.push(0, 0, 1, 0, 1, 1, 0, 1); idx.push(o, o + 1, o + 2, o, o + 2, o + 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, shaftMat(col, k)); m.renderOrder = 5; m.castShadow = false; m.receiveShadow = false; parent.add(m); return m; }
// dust motes drifting in a shaft (deterministic in t): const upd = motes(...); upd(t) every frame
export function motes(parent, origin, dir, L, n = 40, spread = 0.45) { setSeed(4242); const base = []; for (let i = 0; i < n; i++) base.push([R(0.05, 0.95), R(-spread, spread), R(-spread * 0.6, spread * 0.6), R(0, 6.28), R(0.6, 1.4)]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
  const sp = ctex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,250,235,1)'); gr.addColorStop(1, 'rgba(255,250,235,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.022, map: sp, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 })); parent.add(pts);
  const side = new THREE.Vector3(1, 0, 0), up = new THREE.Vector3().crossVectors(dir, side).normalize();
  return t => { const p = geo.attributes.position; base.forEach(([u, a, b, ph, sp2], i) => { const v = origin.clone().addScaledVector(dir, L * u).addScaledVector(side, a + 0.04 * Math.sin(t * 0.7 * sp2 + ph)).addScaledVector(up, b + 0.05 * Math.sin(t * 0.5 * sp2 + ph * 2) - 0.02 * t); p.setXYZ(i, v.x, v.y, v.z); }); p.needsUpdate = true; }; }

// ---------- shared materials + fittings ----------
export const steel = toon(0x8c97a3), steelD = toon(0x5d6773), dark = toon(0x20242c), white = toon(0xf2f2ee);
// ceiling strip light (emissive panel; add a PointLight next to it for the light itself)
export function fixture(parent, x, y, z, w = 0.9, d = 0.25) { box(w, 0.06, d, steelD, x, y, z, parent, 0.004); const panel = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.08, d - 0.07), new THREE.MeshBasicMaterial({ color: 0xf4fbff })); panel.rotation.x = Math.PI / 2; panel.position.set(x, y - 0.032, z); parent.add(panel); return panel; }
// row of vertical bars (window/cell bars) with two cross bars
export function bars(parent, x0, x1, y0, y1, z, n, r = 0.018, rot = 0) { const g = new THREE.Group(); for (let i = 0; i <= n; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(r, r, y1 - y0, 10), steelD); b.position.set(lerp(x0, x1, i / n), (y0 + y1) / 2, 0); b.castShadow = true; g.add(b); }
  const top = box(x1 - x0 + 0.04, 0.035, 0.035, steelD, (x0 + x1) / 2, y1, 0, g); top.castShadow = true; box(x1 - x0 + 0.04, 0.035, 0.035, steelD, (x0 + x1) / 2, (y0 + y1) / 2, 0, g); g.position.z = z; g.rotation.y = rot; parent.add(g); return g; }
// hanging pendant lamp (cone shade + glowing disc + PointLight) — practical light IN the frame like the samples; keep it off signs
const shadeM = toon(0x4a5560, { side: THREE.DoubleSide }), glowM = new THREE.MeshBasicMaterial({ color: 0xfff6e6 });
export function pendant(parent, x, y, z, ceilY, { r = 0.32, h = 0.26, light = 2.2, dist = 6, col = 0xffefd8 } = {}) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, ceilY - y, 6), steelD); cord.position.y = (ceilY - y) / 2 + 0.1; g.add(cord);
  const sh = new THREE.Mesh(new THREE.ConeGeometry(r, h, 24, 1, true), shadeM); sh.castShadow = false; g.add(sh); outline(sh, 0.006);
  const bulb = new THREE.Mesh(new THREE.CircleGeometry(r - 0.05, 24), glowM); bulb.rotation.x = Math.PI / 2; bulb.position.y = -h / 2 + 0.01; g.add(bulb);
  const L = new THREE.PointLight(col, light, dist, 1.5); L.position.y = -0.3; g.add(L); g.userData.light = L; return g; }

// ---------- 3D arms for close-ups where the billboard character is out of frame (top-down inserts) ----------
const LIMB = toon(0x23263b);
export function arm3(r = 0.024) { const g = new THREE.Group(); const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(0, 0, 1)]), 8, r, 10), LIMB); g.add(tube); const hand = new THREE.Mesh(new THREE.SphereGeometry(r * 1.5, 16, 12), LIMB); g.add(hand); g.userData = { tube, hand, r }; return g; }
export function setArm(a, sh, el, hd) { const { tube, hand, r } = a.userData; tube.geometry.dispose(); tube.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([sh, el, hd]), 16, r, 10); hand.position.copy(hd); }

// ---------- a simple room: back wall (with holes), side walls, floor, ceiling, light-tight outer skin behind the back wall ----------
// returns { g, back, left, right, floor, ceil }. Sun goes through the back-wall holes; front stays open for the camera.
export function room(parent, { w, d, h, wall, floor, ceil, holes = [], skin = true }) { const g = new THREE.Group(); parent.add(g);
  const back = holeWall(w, h, holes, wall); back.position.set(0, 0, -d / 2); g.add(back);
  const left = mPlane(d, h, wall, 0, h / 2); left.rotation.y = Math.PI / 2; left.position.set(-w / 2, h / 2, 0); g.add(left);
  const right = mPlane(d, h, wall, 0, h / 2); right.rotation.y = -Math.PI / 2; right.position.set(w / 2, h / 2, 0); g.add(right);
  const fl = mPlane(w, d, floor); fl.rotation.x = -Math.PI / 2; g.add(fl);
  const ce = mPlane(w, d, ceil); ce.rotation.x = Math.PI / 2; ce.position.y = h; g.add(ce);
  if (skin) { const sk = holeWall(w + 0.4, h + 0.4, holes.map(([x, y, hw, hh]) => [x, y + 0.2, hw, hh]), dark); sk.position.set(0, -0.2, -d / 2 - 0.16); g.add(sk); }
  return { g, back, left, right, floor: fl, ceil: ce }; }

// ---------- v8 camera framing helper ----------
// cornerCam(room {w, d, ox}, look [x, y, z], 'low'|'high'|'eye', fov) → one camera key body [x, y, z, lx, ly, lz, fov] from the front
// corner opposite the look point: floor + ceiling + two walls in frame (docs/STYLE_V8.md §3). Wrap as [t, ...cornerCam(...), roll].
export function cornerCam(rm, look, height = 'low', fov = 70, inset = 0.25) { const side = look[0] - (rm.ox || 0) < 0 ? 1 : -1;
  const y = { low: 0.8, eye: 1.35, high: 2.1 }[height] ?? height;
  return [(rm.ox || 0) + side * (rm.w / 2 - inset - 0.35), y, rm.d / 2 - inset, ...look, fov]; }
