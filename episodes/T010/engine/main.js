import { THREE, scene, camera, renderer, WIDTH, HEIGHT, hemi, sun, sky, daySky, setCam, step, ss, clamp, lerp, lerpA, blink, pop, renderPost, POST, TEXLOAD } from './core.js';
import { M, BAYS, setBays, TOLL, RULE, setRuleHL, fiction, STALL, JAR, setSale, saleTag, setAwning, AWN, chairs, TABLES, tGlass, handGlass, priceSign, coin, flyCoin, ch, setSun, fill } from './market.js';

// RC01-T010 "Shade Included" (51.9 s, fiction). Voice starts 0.10 s; all times are video time (voice/align.json + 0.10).
export const DURATION = 51.9;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const _p = new THREE.Vector3(), _c = new THREE.Vector3();

// piecewise smooth path through [t, value] keys (value number or array)
function P(keys, t) { if (t <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [t0, a] = keys[i], [t1, b] = keys[i + 1]; if (t < t1) { const k = ss(t0, t1, t); return Array.isArray(a) ? lerpA(a, b, k) : lerp(a, b, k); } } return keys[keys.length - 1][1]; }
const moving = (keys, t) => keys.some((k, i) => i < keys.length - 1 && t > k[0] && t < keys[i + 1][0] && JSON.stringify(k[1]) !== JSON.stringify(keys[i + 1][1]));

// light acts: early afternoon → late golden
function light(sunK, warm) { daySky(); setSun(sunK, warm); sun.intensity = lerp(2.7, 2.4, warm); hemi.intensity = lerp(0.62, 0.55, warm); hemi.color.set(new THREE.Color(0xdfefff).lerp(new THREE.Color(0xffe2bc), warm)); fill.intensity = lerp(0.6, 0.55, warm); fill.color.set(new THREE.Color(0xfff4e4).lerp(new THREE.Color(0xffd6a6), warm)); return { col: warm > 0.5 ? '#ffb35a' : '#ffe2a8', side: -1, a: lerp(0.45, 0.8, warm) }; }

// one character: s = {at:[x,z,(y)], expr, look, arms:{l,r}, open, fx, walk, items, bob, s}
function C(c, t, s, rim) { if (!s) { c.mesh.visible = false; return; } c.mesh.visible = true; c.at(s.at[0], s.at[2] || 0, s.at[1], s.s || 1); c.face(camera); c.mesh.updateMatrixWorld();
  c.set({ expr: s.expr || 'neutral', look: s.look || [0, 0], blink: s.noBlink ? false : blink(t, s.bo || 0.7), arms: s.arms || {}, open: s.open || {}, fx: s.fx || {}, walk: s.walk || 0, items: s.items || {}, bob: s.bob || 0, rim }, t); }
// world point of a character's hand (char-local units), nudged toward the camera so props draw in front of the arm
function handW(c, h, toward = 0.05) { c.mesh.localToWorld(_p.set(h[0], h[1], 0)); _c.subVectors(camera.position, _p).normalize(); return _p.clone().addScaledVector(_c, toward); }
const SIT = -0.26, SZ0 = 0.22; // seated: hips at seat height, billboard just in front of the seat so the legs hang down to the ground

// default world state, each segment overrides
const BAYX = BAYS.map(b => b.x);
const CH0 = [[BAYX[0], -0.2], [BAYX[1], -0.2], [BAYX[2], -0.2], [2.3, 0.73]]; // chairs: 3 in the PAID bays, 1 at the café table
function world(t, S) {
  const rim = light(S.sun ?? 0, S.warm ?? 0);
  setBays(S.hl || [0, 0, 0], S.paid || [1, 1, 1]); setRuleHL(!!S.ruleHL); fiction.visible = !!S.fiction;
  setSale(S.sale !== false, S.bf || 0, S.br || 0); saleTag.visible = S.sale !== false;
  setAwning(!!S.awn, S.awn ? S.awn[0] : 0, S.awn ? S.awn[1] : 0);
  (S.chairs || CH0).forEach((p, i) => { chairs[i].position.set(p[0], 0, p[1]); chairs[i].rotation.y = p[2] || 0; chairs[i].visible = p[3] !== false; });
  tGlass.forEach((m, i) => { const k = (S.tg || [0, 0])[i]; m.visible = k > 0.01; m.scale.setScalar(Math.max(0.01, k)); m.position.set(TABLES[i].position.x + 0.08, 0.74, TABLES[i].position.z + 0.05); });
  for (const n of ['mayor', 'seller', 't1', 't2', 't3']) C(ch[n], t, S.c[n], rim);
  // price sign: in the mayor's right hand, on the ground, or hidden
  const ps = S.sign || 'hidden'; priceSign.visible = ps !== 'hidden';
  if (ps === 'hand') { const w = handW(ch.mayor, S.c.mayor.arms.r, 0.08); priceSign.position.copy(M.g.worldToLocal(w)); priceSign.position.y += 0.05; priceSign.rotation.set(0, ch.mayor.mesh.rotation.y, S.signTilt || 0); }
  else if (Array.isArray(ps)) { priceSign.position.set(ps[0], ps[1], ps[2]); priceSign.rotation.set(ps[3] || 0, ps[4] || 0, ps[5] || 0); }
  handGlass.visible = false; if (S.glass) { const w = handW(ch[S.glass[0]], S.glass[1], 0.08); handGlass.visible = true; handGlass.position.copy(M.g.worldToLocal(w)); handGlass.position.y -= 0.06; }
  if (S.coin) flyCoin(S.coin[0], S.coin[1], S.coin[2], S.coin[3]); else coin.visible = false;
}
const seated = (x, z, extra = {}) => ({ at: [x, z + SZ0, SIT], ...extra }); // x, z = the chair

// ================================================================ S1 0–3.45 hook: "In this made-up town, the mayor charged people to sit in the shade."
const CAM1 = [[0.0, 0.62, 1.5, 4.9, 0.3, 1.22, 2.0, 46], [0.9, 0.5, 1.5, 4.7, -0.1, 1.15, 1.2, 46], [1.6, 0.25, 1.5, 4.4, -0.65, 1.05, -0.2, 47], [2.4, -0.05, 1.42, 3.5, -0.75, 0.98, -0.2, 45], [3.6, -0.25, 1.38, 2.9, -0.82, 0.95, -0.2, 44]];
function seg1(t) { setCam(CAM1, t);
  const pay = ss(1.35, 1.6, t) * (1 - ss(2.2, 2.5, t));
  world(t, { sun: 0, warm: 0, fiction: true,
    coin: t > 1.35 && t < 1.85 ? [handW(ch.t1, [0.34, 1.15]), V(TOLL.x, TOLL.y + 0.16, TOLL.z), ss(1.45, 1.8, t), 0.12] : null,
    c: { t1: { at: [-0.05, 0.42], expr: t < 1.75 ? 'worried' : 'sigh', look: [-1, 0], arms: { r: lerpA([0.27, 0.84], [-0.34, 1.12], pay), l: [-0.27, 0.84] }, open: { r: pay > 0.5 } },
         t2: seated(BAYX[0], -0.2, { expr: 'smug', look: [0.6, -0.2], fx: { sparkle: t > 2.6 ? 1 : 0 } }), t3: seated(BAYX[2], -0.2, { expr: 'grin', look: [-0.5, 0] }),
         mayor: { at: [-1.25, -1.15], s: 1.05, expr: t < 1.7 ? 'smug' : 'greedy', look: [0.9, -0.3], arms: { l: [-0.12, 1.02], r: [0.3, lerp(1.0, 1.3, ss(1.7, 2.0, t))] }, open: { r: t > 1.7 } },
         seller: { at: [STALL.x, STALL.z - 0.4], expr: 'neutral', look: [-1, 0] } } }); }

// ================================================================ S2 3.45–12.55 the paid bays, the rule board, nobody has an awning
const CAM2 = [[3.3, -0.4, 2.05, 3.7, -0.85, 0.55, -0.25, 50], [4.6, -0.6, 1.95, 3.2, -0.9, 0.45, -0.25, 48], [5.9, -0.95, 1.85, 2.6, -1.05, 0.35, -0.25, 45],
  [6.9, -2.5, 1.6, 3.2, -2.55, 1.5, -0.15, 46], [8.0, -2.55, 1.58, 2.95, -2.55, 1.5, -0.15, 45], [10.5, -2.55, 1.56, 2.8, -2.55, 1.49, -0.15, 45],
  [11.4, 0.2, 1.65, 3.8, 0.75, 0.9, -1.6, 50], [12.7, 0.75, 1.55, 3.4, 0.85, 0.85, -1.8, 48]];
function seg2(t) { setCam(CAM2, t);
  const hl = [0, 1, 2].map(i => { const t0 = 4.1 + i * 0.5; return ss(t0, t0 + 0.12, t) * (1 - ss(t0 + 0.9, t0 + 1.3, t)); });
  const paid = [0, 1, 2].map(i => pop(5.55 + i * 0.08, t, 0.16));
  const point = t > 3.7 && t < 6.5;
  world(t, { sun: 0, warm: 0.05, hl, paid, ruleHL: t > 7.95 && t < 10.6,
    c: { mayor: { at: [-0.3, -0.25], s: 1.05, expr: t < 5.5 ? 'smug' : (t < 6.5 ? 'grin' : 'smug'), look: [-1, -0.6], arms: { l: point ? [-0.62, lerp(0.9, 1.05, Math.sin(t * 3) * 0.5 + 0.5)] : [-0.12, 1.02], r: [0.12, 1.0] }, open: { l: point } },
         t2: seated(BAYX[0], -0.2, { expr: t > 5.6 ? 'worried' : 'neutral', look: [0.8, 0], fx: { sweat: t > 5.7 && t < 6.6 ? 1 : 0 } }), t3: seated(BAYX[2], -0.2, { expr: t > 5.6 ? 'sigh' : 'neutral', look: [0.6, 0] }),
         t1: null,
         seller: { at: [STALL.x, STALL.z - 0.4], expr: t > 11.5 ? 'sigh' : 'neutral', look: [-0.6, 0], arms: t > 11.6 ? { l: [-0.42, 1.12], r: [0.42, 1.12] } : {}, open: { l: t > 11.6, r: t > 11.6 } } } }); }

// ================================================================ S3 12.55–22.85 afternoon: the shadow slides off the bays, chairs follow it, the mayor points, the seller watches
const SHADE1 = [[-0.4, 1.42], [0.25, 1.52]]; // new seats in the moved shadow
const CAM3 = [[12.4, -0.2, 3.6, 4.9, -0.7, 0.3, 0.4, 50], [14.9, -0.35, 3.4, 4.5, -0.7, 0.3, 0.45, 49], [16.1, -0.6, 2.4, 4.4, -0.55, 0.6, 0.8, 48],
  [17.2, -1.85, 1.55, 2.5, -0.8, 0.9, -0.5, 46], [18.7, -1.8, 1.5, 2.25, -0.75, 0.9, -0.5, 44], [19.3, -0.3, 2.6, 4.7, 0.4, 0.9, -0.6, 48], [19.9, 0.95, 1.5, 2.9, 1.2, 1.05, -0.9, 44], [20.9, 1.05, 1.47, 2.6, 1.25, 1.05, -0.9, 43], [22.5, 1.45, 2.0, 4.8, 0.85, 0.95, 0.3, 48], [23.0, 1.5, 2.05, 4.9, 0.8, 0.95, 0.3, 48]];
function seg3(t) { setCam(CAM3, t);
  const sk = ss(13.1, 15.0, t), mv = ss(15.15, 16.6, t);
  const c0 = lerpA([BAYX[0], -0.2], SHADE1[0], mv), c2 = lerpA([BAYX[2], -0.2], SHADE1[1], mv);
  const sitting = t < 15.1 || t > 16.65;
  const t1k = [[20.95, [2.3, 0.95]], [22.6, [-0.25, 1.97]]], t1p = P(t1k, t), t1m = moving(t1k, t);
  const ch3 = [t1p[0], t1p[1] - SZ0];
  world(t, { sun: sk, warm: ss(12.6, 22.5, t) * 0.75,
    chairs: [[...c0, 0], [BAYX[1], -0.2, 0], [...c2, 0], [...ch3, t1m ? 0.4 : 0]],
    c: { t2: { at: [c0[0], c0[1] + SZ0, sitting ? SIT : 0], expr: t < 15.0 ? (t > 13.9 ? 'shock' : 'neutral') : 'worried', look: [0.6, 0.4], walk: sitting ? 0 : (t * 2.2) % 1, fx: { sweat: t > 13.9 && t < 16.6 ? 2 : 0 }, arms: sitting ? {} : { l: [-0.3, 0.6], r: [0.3, 0.6] } },
         t3: { at: [c2[0], c2[1] + SZ0, sitting ? SIT : 0], expr: t < 15.0 ? (t > 14.0 ? 'shock' : 'neutral') : 'sigh', look: [0.4, 0.4], walk: sitting ? 0 : (t * 2.2 + 0.5) % 1, arms: sitting ? {} : { l: [-0.3, 0.6], r: [0.3, 0.6] } },
         mayor: { at: [-0.25, -0.5], s: 1.05, expr: t < 16.8 ? 'smug' : 'angry', look: [-1, -0.5], arms: t > 16.8 ? { l: [-0.66, lerp(0.95, 1.12, (Math.sin(t * 9) + 1) / 2)], r: [0.12, 1.0] } : { l: [-0.12, 1.02], r: [0.12, 1.0] }, open: { l: t > 16.8 }, fx: { puff: t > 17.6 && t < 18.9 ? 1 : 0 } },
         t1: { at: [t1p[0], t1p[1], t1m ? 0 : SIT], expr: t1m ? 'worried' : 'neutral', look: [-1, 0], walk: t1m ? (t * 2.4) % 1 : 0, arms: t1m ? { l: [-0.3, 0.55], r: [0.32, 0.55] } : {} },
         seller: { at: [STALL.x, STALL.z - 0.4], expr: t > 19.1 ? (t > 21.2 ? 'sigh' : 'worried') : 'neutral', look: [-1, -0.1], arms: t > 21.2 ? { l: [-0.12, 1.02], r: [0.28, 1.4] } : {}, fx: { sweat: t > 21.5 ? 1 : 0 } } } }); }

// ================================================================ S4 22.85–31.85 the town sells the old awning; the mayor waves it off; the seller pays and keeps the receipt
const SX = 0.25, SZ = -2.6;
const CAM4 = [[22.7, 0.6, 2.5, -0.35, 0.5, -0.3, -2.6, 46], [24.3, 0.55, 2.3, -0.75, 0.48, -0.3, -2.6, 45], [25.6, 0.5, 2.1, -1.0, 0.45, -0.3, -2.6, 44],
  [27.2, 0.3, 1.95, -1.05, 0.3, -0.1, -2.6, 44], [28.4, 0.25, 1.6, 1.0, 0.25, 1.0, -2.4, 50], [30.3, 0.3, 1.55, 0.75, 0.3, 1.05, -2.4, 49], [31.95, 0.45, 1.5, 0.35, 0.45, 1.1, -2.35, 47]];
function seg4(t) { setCam(CAM4, t);
  const wave = t > 28.1 && t < 29.7; const pay = ss(30.3, 30.55, t) * (1 - ss(31.0, 31.2, t));
  const receipt = pop(31.3, t, 0.18);
  world(t, { sun: 0.85, warm: 0.75, bf: Math.sin(clamp((t - 25.95) / 0.35) * Math.PI), br: Math.sin(clamp((t - 27.05) / 0.35) * Math.PI),
    chairs: [[...SHADE1[0], 0], [BAYX[1], -0.2, 0], [...SHADE1[1], 0], [-0.25, 1.75, 0]],
    coin: t > 30.4 && t < 30.95 ? [handW(ch.seller, [-0.34, 1.12]), handW(ch.mayor, [0.36, 1.08]), ss(30.45, 30.9, t), 0.18] : null,
    c: { mayor: t < 27.75 ? null : { at: [SX - 0.6, SZ + 0.4], s: 1.05, expr: wave ? 'smug' : (t > 29.7 ? 'greedy' : 'neutral'), look: wave ? [-0.8, 0.2] : [1, -0.3], arms: { l: [-0.12, 1.02], r: wave ? [lerp(0.3, 0.55, (Math.sin(t * 10) + 1) / 2), 1.25] : (t > 30.3 ? [0.36, 1.08] : [0.12, 1.0]) }, open: { r: wave || t > 30.3 }, fx: { puff: wave ? 1 : 0 } },
         seller: t < 27.75 ? null : { at: [SX + 0.6, SZ + 0.4], expr: t < 27.7 ? 'squint' : (t < 30.2 ? 'stare' : 'grin'), look: t < 27.7 ? [-0.6, -0.8] : [-1, 0], arms: { l: t > 30.2 ? lerpA([-0.27, 0.84], [-0.34, 1.12], pay) : [-0.27, 0.84], r: receipt > 0.01 ? [0.3, 1.18] : [0.27, 0.84] }, open: { l: pay > 0.5 },
           items: receipt > 0.01 ? { paper: { hand: 'r', title: 'RECEIPT', sub: 'OLD AWNING', w: 0.36 * receipt, h: 0.46 * receipt, oy: 0.02 } } : {}, fx: { sparkle: t > 31.35 ? 1 : 0 } },
         t2: seated(...SHADE1[0]), t3: seated(...SHADE1[1]), t1: seated(-0.25, 1.75) } }); }

// ================================================================ S5 31.85–40.2 repair, open the awning, private shade, chairs move over, drinks
const CAM5 = [[31.7, 1.35, 1.5, 5.1, 1.4, 1.3, 0.2, 50], [33.2, 1.45, 1.8, 5.2, 1.45, 1.35, 0.2, 50], [34.9, 1.6, 2.7, 5.2, 1.55, 1.1, 0.3, 50],
  [36.4, 2.3, 1.55, 3.9, 2.15, 0.65, 1.1, 46], [37.6, 1.6, 1.6, 4.7, 1.35, 0.8, 0.6, 50], [39.0, 1.75, 1.5, 4.3, 1.75, 0.85, 0.7, 48], [40.35, 1.9, 1.45, 3.9, 1.9, 0.9, 0.7, 46]];
const SEATS = [[1.6, 0.95], [2.95, 1.15]];
function seg5(t) { setCam(CAM5, t);
  const rise = ss(32.75, 33.45, t), open = ss(33.8, 34.9, t);
  const tap = t > 32.7 && t < 33.5 ? Math.abs(Math.sin(t * 14)) : 0;
  const k = [[37.75, 0], [38.85, 1]]; const mv = P(k, t), m = moving(k, t);
  const p2 = lerpA(SHADE1[0], SEATS[0], mv), p3 = lerpA(SHADE1[1], SEATS[1], mv);
  const sit = t < 37.75 || t > 38.9;
  world(t, { sun: 1, warm: 0.8, sale: false, awn: [rise, open], tg: [pop(39.5, t, 0.16), pop(39.75, t, 0.16)],
    chairs: [[p2[0], p2[1], 0], [BAYX[1], -0.2, 0], [p3[0], p3[1], 0], [-0.25, 1.75, 0]],
    coin: t > 39.4 && t < 39.85 ? [handW(ch.t2, [0.34, 1.1]), V(JAR.x, JAR.y + 0.17, JAR.z), ss(39.45, 39.8, t), 0.25] : null,
    c: { seller: { at: t < 35.2 ? [AWN.x1 + 0.3, AWN.zf + 0.05] : [STALL.x + 0.1, STALL.z - 0.4], expr: t < 34.9 ? 'squint' : (t < 37.7 ? 'grin' : 'smug'), look: t < 34.9 ? [-0.8, 0.8] : [-0.6, 0],
           arms: t < 34.9 ? { l: [-0.3, lerp(1.45, 1.3, tap)], r: [-0.05, 1.4] } : (t > 39.4 ? { l: [-0.12, 1.02], r: [0.3, 1.35] } : {}), open: { r: t > 39.4 }, fx: { sparkle: t > 35.4 && t < 36.8 ? 1 : 0 } },
         t1: { at: [AWN.x0 - 0.3, AWN.zf + 0.05], expr: t < 34.9 ? 'stare' : 'grin', look: [1, 0.6], arms: t < 34.9 ? { r: [0.32, 1.45], l: [0.05, 1.35] } : {} },
         t2: { at: [p2[0], p2[1] + SZ0, sit ? SIT : 0], expr: t > 37.6 ? 'grin' : 'worried', look: [1, 0], walk: m ? (t * 2.4) % 1 : 0, arms: t > 39.3 && t < 40.0 ? { r: [0.34, 1.1] } : (m ? { l: [-0.3, 0.55], r: [0.3, 0.55] } : {}), open: { r: t > 39.3 && t < 40.0 } },
         t3: { at: [p3[0], p3[1] + SZ0, sit ? SIT : 0], expr: t > 37.6 ? 'laugh' : 'sigh', look: [-0.6, 0], walk: m ? (t * 2.4 + 0.5) % 1 : 0, arms: m ? { l: [-0.3, 0.55], r: [0.3, 0.55] } : {} } } }); }

// ================================================================ S6 40.2–48.15 the mayor with his price sign; the rule; the receipt; empty bays; sign down; a lemonade
const CAM6 = [[40.0, 0.9, 1.6, 5.0, 0.6, 1.15, 0.5, 50], [41.6, 0.95, 1.5, 4.3, 0.8, 1.1, 0.5, 47], [41.85, 0.9, 1.45, 3.7, 0.75, 1.1, 0.5, 46],
  [42.45, -2.55, 1.56, 3.0, -2.55, 1.5, -0.15, 45], [42.95, -2.55, 1.55, 2.9, -2.55, 1.49, -0.15, 45],
  [43.65, 0.85, 1.5, 1.85, 1.55, 1.38, 0.3, 45], [44.35, 0.86, 1.5, 1.75, 1.55, 1.38, 0.3, 45],
  [45.1, 1.25, 1.8, 2.5, -1.0, 0.3, -0.3, 44], [45.9, 1.15, 1.75, 2.35, -1.05, 0.25, -0.3, 43],
  [46.7, 0.75, 1.3, 3.6, 0.0, 0.75, 0.75, 50], [47.5, 0.95, 1.9, 2.8, 1.0, 1.0, -0.6, 44], [48.3, 0.95, 1.85, 2.5, 1.05, 1.0, -0.65, 42]];
function seg6(t) { setCam(CAM6, t);
  const mk = [[40.2, [-0.6, 0.95]], [41.7, [0.1, 0.85]], [46.85, [0.1, 0.85]], [47.35, [0.95, -0.45]]]; const mp = P(mk, t), mm = moving(mk, t);
  const showRule = t > 42.05 && t < 43.4, showRec = t > 43.4 && t < 44.4;
  const down = ss(46.1, 46.7, t);
  const signHand = t < 46.1;
  world(t, { sun: 1, warm: 0.85, sale: false, awn: [1, 1], tg: [1, 1], ruleHL: t > 42.3 && t < 43.5,
    chairs: [[...SEATS[0], 0], [BAYX[1], -0.2, 0], [...SEATS[1], 0], [-0.25, 1.75, 0, false]],
    sign: signHand ? 'hand' : [lerp(0.42, -0.05, down), lerp(1.05, 0.38, down), lerp(0.93, 0.55, down), 0, 0, lerp(0, 0.35, down)],
    coin: t > 47.3 && t < 47.75 ? [handW(ch.mayor, [0.33, 1.08]), V(JAR.x, JAR.y + 0.17, JAR.z), ss(47.35, 47.7, t), 0.2] : null,
    glass: t > 47.75 ? ['mayor', [-0.3, 1.0]] : null,
    c: { mayor: { at: [mp[0], mp[1]], s: 1.05, walk: mm ? (t * 2.2) % 1 : 0,
           expr: t < 42.05 ? 'smug' : (t < 43.4 ? 'squint' : (t < 44.4 ? 'shock' : (t < 46.0 ? 'stare' : (t < 47.2 ? 'sigh' : 'grin')))), look: t > 44.4 && t < 46.0 ? [-1, -0.6] : (t > 42.05 && t < 43.4 ? [-1, 0.2] : [1, -0.1]),
           arms: { r: signHand ? [0.32, lerp(1.15, 1.45, mm ? 1 : 0)] : (t > 47.2 ? [0.33, 1.08] : [0.27, 0.84]), l: t > 47.75 ? [-0.3, 1.0] : [-0.12, 1.02] }, open: { r: t > 47.2 && t < 47.75 },
           fx: { sweat: t > 43.5 && t < 46.0 ? 2 : 0, shame: t > 44.6 && t < 46.2 ? ss(44.6, 44.9, t) : 0 } },
         seller: { at: t < 47.0 ? [1.25, 0.3] : [STALL.x + 0.1, STALL.z - 0.4], expr: showRule ? 'smug' : (showRec ? 'grin' : (t > 47.0 ? 'wink' : 'smug')), look: [-1, 0],
           arms: showRule ? { l: [-0.68, 1.35], r: [0.12, 1.0] } : (showRec ? { l: [-0.12, 1.02], r: [0.46, 1.12] } : (t > 47.4 && t < 47.9 ? { l: [-0.34, 1.1] } : {})), open: { l: showRule },
           items: showRec || (t > 43.3 && t < 46.0) ? { paper: { hand: 'r', title: 'RECEIPT', sub: 'OLD AWNING', w: 0.42, h: 0.52, ox: 0.06, oy: 0.02, stamp: 1, stampText: 'PAID' } } : {} },
         t2: seated(...SEATS[0], { expr: 'grin', look: [-0.8, 0], arms: { r: [0.34, 0.95] } }), t3: seated(...SEATS[1], { expr: t > 46.4 ? 'laugh' : 'smug', look: [-1, 0] }),
         t1: null } }); }

// ================================================================ S7 48.15–51.9 "Shade included. Lesson extra." — the coin goes in the lemonade jar; pull back: sign left in the sun
const CAM7 = [[48.0, 1.75, 1.3, 0.25, 1.55, 1.0, -0.85, 40], [49.0, 1.65, 1.4, 0.7, 1.5, 1.02, -0.8, 41], [49.75, 1.7, 1.75, 2.6, 1.7, 0.95, -0.4, 46], [50.5, 1.7, 2.6, 4.6, 1.9, 0.75, 0.35, 50], [52.0, 1.65, 2.9, 5.15, 1.9, 0.75, 0.35, 50]];
function seg7(t) { setCam(CAM7, t);
  world(t, { sun: 1, warm: 0.9, sale: false, awn: [1, 1], tg: [1, 1], sign: [0.85, 0.38, 0.9, 0, 0, 0.35],
    chairs: [[1.15, 1.25, 0], [BAYX[1], -0.2, 0], [...SEATS[1], 0], [2.5, 0.5, 0]],
    coin: t < 48.75 ? [V(JAR.x + 0.02, JAR.y + 0.42, JAR.z + 0.05), V(JAR.x, JAR.y + 0.05, JAR.z), ss(48.2, 48.7, t), 0.02] : null,
    glass: ['mayor', [-0.3, 0.95]],
    c: { mayor: seated(2.5, 0.5, { s: 1.05, expr: t < 49.6 ? 'sigh' : 'grin', look: [0.4, 0], arms: { l: [-0.3, 0.95] } }),
         seller: { at: [STALL.x + 0.1, STALL.z - 0.4], expr: t > 49.6 ? 'wink' : 'grin', look: [-0.6, -0.2], arms: t > 49.6 ? { r: [0.33, 1.4] } : {}, open: { r: t > 49.6 }, fx: { sparkle: t > 49.7 ? 1 : 0 } },
         t2: seated(1.15, 1.25, { expr: 'grin', look: [0.5, 0] }), t3: seated(...SEATS[1], { expr: 'laugh', look: [-1, 0] }), t1: { at: [-0.25, 1.97], expr: 'grin', look: [0.8, 0] } } }); }

// ---------------------------------------------------------------- edit
const SEGS = [{ t0: 0, t1: 3.45, f: seg1 }, { t0: 3.45, t1: 12.55, f: seg2 }, { t0: 12.55, t1: 22.85, f: seg3 }, { t0: 22.85, t1: 31.85, f: seg4 }, { t0: 31.85, t1: 40.2, f: seg5 }, { t0: 40.2, t1: 48.15, f: seg6 }, { t0: 48.15, t1: DURATION, f: seg7 }];
const TRANS = { 3.45: 'dissolve', 12.55: 'dissolve', 22.85: 'dissolve', 31.85: 'dissolve', 40.2: 'dissolve', 48.15: 'dissolve' };
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
