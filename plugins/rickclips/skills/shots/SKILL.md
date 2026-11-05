---
name: shots
description: Write or fix an episode's shots in the three.js engine overlay (episodes/<EP>/engine/main.js + set file) — segments, camera keys, character poses/expressions, props, x-ray cutaways, labels — and check them with stills. Use for any visual change.
---

Run everything from the RickClips repo (`repo_dir` in `~/.rickclips/config.json`, through its `run_prefix`); no config → skill `setup`.
# Shots (engine overlay)

Files: `episodes/<EP>/engine/main.js` (timeline), a set file (T015: `taverna.js` = set A taverna + set B x-ray at x=300),
`core.js` (renderer, `Char`, grade), `chars2.js` (character drawing), `cutaway.js` (strata / sectionCut / xray helpers).
`sync_engine.sh` copies them over `engine_v4` into `~/rc_work/engine_<EP>/`.

main.js anatomy (T015):
- `SEGS = [{t0, t1, f: segX}]`, `TRANS = {time: 'dissolve'}` — one function per segment, called per frame with t.
- Camera: `setCam(KEYS, t)`; key = `[t, camX, camY, camZ, lookX, lookY, lookZ, fov]`; `far(keys, f)` pulls back along the view line.
  Monotone spline + 0.2 s smoothing; fast moves need ≥ 0.8 s between keys (no move faster than a 0.45 s bell).
- Camera grammar measured on the style (team samples S01–S04 with vidclone `camera_grammar`; 20 samples of the same toon style in
  mromidev/claude-animated-shorts `motion.md`), in px/frame at 720 px width:
  - a move is a symmetric ease-in-out bell: ~10–17 f up, ~10–17 f down, peak median 12–20 px/f, p90 ≤ ~40; 4–7 moves per 10 s;
  - holds are never dead: push in 0.15–0.25 %/frame (≈ 4.5–7.5 %/s), 0.6 %/f for ~1 s on punch words; ≤ ~25 % of frames below 0.3 px/f;
  - big reframes (> half a frame width or > 40 % zoom in < 1 s) are a dissolve/cut, not a fly;
  - whips 1–2.7 per minute in the team samples (T001 had none): 40–90 px/f for ~0.3 s, always with motion blur (sub-frames);
  - impacts: `setKicks([[t, gain], …])` (core.js) — offset flips sign every frame, ~3 px × gain, gone in 7 f; end the push at the hit;
  - no hand-held float.
  Check after a render: `bin/vidclone qa` (vidclone repo) or `edit.analyze` on the proxy → `camera_grammar`.
- Blinks: `blink: blinkLid(t, seed, swapTimes)` (core.js; chars2 draws 0.5 as a half lid): every 0.5–2.3 s, 4 frames
  half/shut/shut/half, and one across every expression swap. The old `blink(t, off)` (every 3.3 s, open/shut) stays for T015 only.
- Reactions (expression or action change) land 0–3 frames **before** their word: look expressions up at `t + REACT_LEAD` (2 f).
- Characters: `CH.set({expr, look, arms:{l,r}, open, fx}, t)`; expressions `neutral greedy grin squint shock worried stare smug laugh wink`;
  fx `sweat sparkle drool qmarks shame`. Hand targets are `[x, y]` in character space; jug follows the right hand
  (`REST`, `POUR`, `DOWN` = set on the counter).
- Lighting per story act: `ACTS` table, `lightAct(a, b, k)`.
- Labels in the x-ray: `lab(LB.x, x, y, t0, t1, scale)` + `setPointer`.

**v8 episodes (default since 2026-11-05) — `docs/STYLE_V8.md` §3–7 replaces the camera grammar above:**
- Real 3D sets from `engine_v4/sets3d.js` (`room`, `holeWall`, `mPlane` walls, `sPlane` signs, `shaft`, `motes`, `fixture`, `pendant`,
  `bars`, `arm3/setArm`) and light from `engine_v4/looks.js` (`applyLook(preset, sunAt)`); pattern: `episodes/PINK15/engine/prison.js`.
- Lens 60–75°, camera low (0.3–0.8 m) or high (2–2.5 m) in a front corner (`cornerCam`): floor + ceiling + two walls, depth lines.
- Each shot = near-still hold (tiny drift) + one eased move; keys ~0.85 s apart, `setCam(keys, t, 0.1)`; 3.6–6.4 moves / 10 s;
  mix push-ins with pull-outs (~16 %) and pans (~14 %); ~4 whips / min with blur sub-frames; dissolves 0.30 s, no cuts.
- Aim the sun so the shaft crosses the frame sideways and lands on the floor in shot; bright fill + strong sun, haze in big spaces.
- Characters: `C.mesh.material.emissiveIntensity = 0.38`; scale varies from tiny in wides to full-frame close-ups.
- Don't hide a character mid-shot (pop) — move the camera over/around; extras walk ≥ 2.5 m from the lens; lamps never cover signs.
- Check every changed shot side by side with a v8 sample: `bash tools/ep/compare_sample.sh <EP> cmpN <sample.mp4> "<t…>" "<t,…>"`.

Rules learned on T015:
- Every noun/verb in the narration has a visible action within ±0.15 s (reactions 0–3 f early, see above); people act on objects; nothing floats unheld.
- Text on props must fit its board (auto-fit or shrink); labels never cover the hero object; nothing important within ~5 % of the frame edge in close-ups.
- **Never put a comment in the middle of a line** (it silently removed the water from 9 s of T015). Comments at line end or on their own line.
- After every edit: `node --check` the file, then stills of each changed shot:
  `bash tools/ep/stills.sh <EP> fixN "12.5,14.9,16.2"` → look at `~/rc_work/<EP>/preview/fixN.png`.
- Only then re-render the affected frame ranges (skill `render`).

Style rules (story, camera grammar, transitions, technique library T01–T24): `docs/KIT_SKILL_v7.md`, `references/STYLE_BIBLE.md`.
