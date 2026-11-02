---
name: rc-shots
description: Write or fix an episode's shots in the three.js engine overlay (episodes/<EP>/engine/main.js + set file) — segments, camera keys, character poses/expressions, props, x-ray cutaways, labels — and check them with stills. Use for any visual change.
---
# Shots (engine overlay)

Files: `episodes/<EP>/engine/main.js` (timeline), a set file (T015: `taverna.js` = set A taverna + set B x-ray at x=300),
`core.js` (renderer, `Char`, grade), `chars2.js` (character drawing), `cutaway.js` (strata / sectionCut / xray helpers).
`sync_engine.sh` copies them over `engine_v4` into `~/rc_work/engine_<EP>/`.

main.js anatomy (T015):
- `SEGS = [{t0, t1, f: segX}]`, `TRANS = {time: 'dissolve'}` — one function per segment, called per frame with t.
- Camera: `setCam(KEYS, t)`; key = `[t, camX, camY, camZ, lookX, lookY, lookZ, fov]`; `far(keys, f)` pulls back along the view line.
  Monotone spline + 0.2 s smoothing; fast moves need ≥ 0.8 s between keys (no move faster than a 0.45 s bell).
- Characters: `CH.set({expr, look, arms:{l,r}, open, fx}, t)`; expressions `neutral greedy grin squint shock worried stare smug laugh wink`;
  fx `sweat sparkle drool qmarks shame`. Hand targets are `[x, y]` in character space; jug follows the right hand
  (`REST`, `POUR`, `DOWN` = set on the counter).
- Lighting per story act: `ACTS` table, `lightAct(a, b, k)`.
- Labels in the x-ray: `lab(LB.x, x, y, t0, t1, scale)` + `setPointer`.

Rules learned on T015:
- Every noun/verb in the narration has a visible action within ±0.15 s; people act on objects; nothing floats unheld.
- Text on props must fit its board (auto-fit or shrink); labels never cover the hero object; nothing important within ~5 % of the frame edge in close-ups.
- **Never put a comment in the middle of a line** (it silently removed the water from 9 s of T015). Comments at line end or on their own line.
- After every edit: `node --check` the file, then stills of each changed shot:
  `bash tools/ep/stills.sh <EP> fixN "12.5,14.9,16.2"` → look at `~/rc_work/<EP>/preview/fixN.png`.
- Only then re-render the affected frame ranges (skill `rc-render`).

Style rules (story, camera grammar, transitions, technique library T01–T24): `docs/KIT_SKILL_v7.md`, `references/STYLE_BIBLE.md`.
