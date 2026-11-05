---
name: episode
description: Make a complete RickClips episode from a script — a Notion page link (optionally "script N" / a title / an ID like RC01-T015) or pasted text — through voice, music, SFX, art, 3D shots, render, captions, Kdenlive project, QA and preview. Use when the user invokes /rickclips:episode or asks for a new video from a script.
---
# RickClips episode: script → delivered video

Input = the text after the command: a Notion URL and which script (number, title or ID), or the script itself.
Before anything: read `~/.rickclips/config.json` (missing → run skill `setup` first), then `<repo_dir>/CLAUDE.md` (+ `CLAUDE.local.md`).
All pipeline commands run in `<repo_dir>` on the Linux side (prefix with `run_prefix`); long jobs start the way `long_jobs` says.
Keep the user's task list current; this takes ~2–4 h, most of it rendering.

## 1. Script
- Notion: open the page (Notion connector → page/database tools; else a browser tool), find the script the user named. Take the
  narration **verbatim**; also take the ID, title, topic outline/notes if the page has them. Several scripts and none named → list them and ask.
- Write `episodes/<EP>/script.txt`: exactly the words to be spoken, numbers spelled out ("nineteen twenty-five"). EP = the Notion ID's short
  form (RC01-T016 → `T016`) or the next free `T0NN`.
- Check against the style rules (`docs/KIT_SKILL_v7.md` §3): hook in 0–4 s with a concrete image; ≤ 6-word closer; 45 s ≈ 160–170 words.
  Don't rewrite the user's script silently — suggest changes and ask.

## 1b. Style: v8 is the default for new episodes
Read `docs/STYLE_V8.md` first (the owner's current target look: real 3D rooms/landscapes, wide low/high lens, real holds + eased moves,
saturated accent, stereo bed, smaller captions). Use the kit v7 path below (T015 template, painted backdrops) only if the user asks for the old look.
v8 scaffold (template = PINK15):
```bash
EP=T016; mkdir -p episodes/$EP/{engine,art,audio/sfx_el,voice}
cp episodes/PINK15/{episode.env,build_sfx.py,prepare_mg.sh} episodes/$EP/
cp episodes/PINK15/engine/{core.js,chars2.js} episodes/$EP/engine/     # core.js: ?res switch, v8 grade, fx cache fix already in
cp episodes/PINK15/engine/main.js episodes/$EP/engine/main.js            # timeline pattern: segments, camera keys, ch(), dissolves
# new set file episodes/$EP/engine/<set>.js: import from './sets3d.js' + './looks.js' (engine_v4) the way PINK15 prison.js does
```
`episode.env` keeps `STYLE=v8 RES=1280 CAP_SIZE=66 STEREO=1`; in `core.js` raise `HueSaturationEffect` saturation to +0.15…+0.25.
No painted backdrops in v8: art = prop reference images only (GLB via `prop-3d`) and textures drawn in code.
Before the full render: `bash tools/ep/compare_sample.sh <EP> cmp1 <v8 sample.mp4> "<sample t…>" "<our t,…>"` (samples on this machine:
`~/rc_work/ref_pink/*.mp4`, `~/rc_work/ref_rail/rail.mp4`; never copy them into the repo). Render the draft at 720p, QA, then `RES=1920` for delivery.

## 2. Scaffold, kit v7 path (template = T015)
```bash
EP=T016; mkdir -p episodes/$EP/{engine,art,audio/sfx_el,voice}
cp episodes/T015/{episode.env,build_sfx.py,prepare_mg.sh} episodes/$EP/
cp episodes/T015/engine/{core.js,chars2.js,cutaway.js} episodes/$EP/engine/
```
In the copied `core.js` `Char.set`, add `+ (state.fx && Object.values(state.fx).some(Boolean) ? Math.round(t * 30) : '')` to the cache key
(new episodes: animated fx must not depend on how frames are split between workers — see CLAUDE.md, determinism).
`episode.env`: NAME (Title_Words_RickClips), TAKE, TEMPO (from config), VOICE_OFFSET 0.10, MUSIC; DUR after step 3.

## 3. Media (ElevenLabs; download every output with its full-resolution URL into the episode folder)
1. **Voice**: 2 takes of `script.txt`, `voice_id`/`voice_model` from config → `voice/take1.mp3`, `voice/take2.mp3`.
   `bash tools/ep/voice_prep.sh <EP> take1` and `take2`; keep the take with the cleaner delivery and wpm in 208–244; aligned words must equal script words.
   Set `DUR` = voice length + ~1.3 s (rounded to 0.1).
2. **Music**: one continuous instrumental bed, no drums, minor key, light and curious, length ≥ DUR + 5 s → `audio/music1.mp3`.
3. **SFX**: the story's physical sounds (pour, drain, door, coins…) as 1–3 s clips → `audio/sfx_el/<name>.mp3`; generic cues
   (whoosh, pop, ting, sparkle, boing, crowd_laugh, crickets…) are synthesized by `production/audio_kit.py`.
4. **Art**: one painted backdrop per set (Nano Banana: vertical, painterly, warm, no characters, no text) → `art/`; a reference image per hero
   prop (plain background, 3/4 view) → GLB with skill `prop-3d` if this machine has a GPU, else build the prop from primitives in the set file.
   Register textures in `prepare_mg.sh`.

## 4. Shots — the biggest part (skill `shots`)
Write `episodes/<EP>/engine/<set>.js` (sets, props, characters' TYPES, lights) and `main.js` (segments per story beat, camera keys,
per-frame actions) using T015's `taverna.js`/`main.js` as the pattern. Rules that made T015 pass:
- Every sentence → a visible action on an object within ±0.15 s of its key word; characters react (expression changes on the word).
- Mechanism/explanation → a cutaway set (x-ray / section / strata via `cutaway.js`) with call-out labels, a tracer, water that behaves as narrated.
- Camera always moving (push-ins ~45 %, change of move every ~1 s), ≤ 2 hard cuts, dissolves 0.23 s between sets, per-act lighting.
- Closer loops back to the opening object/set; second character reacts (laugh, wink).
- Stills of every shot (`bash tools/ep/stills.sh <EP> sN "t1,t2,…"`) and look at them before any full render.

## 5. Audio + captions
`bash tools/ep/audio_mix.sh <EP>` after writing `build_sfx.py` cues on word times from `~/…/out/words.json` (skill `audio-captions`).

## 6. Render → finalize → QA → review (skills `render`, `finalize-qa`)
Full render detached; then `finalize.sh`, `sheets.sh`, eye review of every sheet, fix → stills → partial re-render → finalize, until
**21/21 QA + no flat frames + clean eye review**. Then `preview.sh`.
v8: the kit gates switch with `STYLE=v8`; also run `vidclone qa <mp4> --style references/style_v8` (44 gates from the two samples)
and report the failing gates by name. Draft at `RES=1280`; the 1920 delivery render needs `frames/` cleared first.

## 7. Deliver
Copy `<NAME>.mp4`, `<NAME>_preview.mp4`, `<NAME>_kdenlive.zip` where the user can open them (ask once; remember in config as `deliver_dir`),
send the preview, and report: duration, QA result, what you checked by eye, anything not done or not verified, credits used if known.
Commit the episode's sources (not binaries) to the repo on a branch if the user wants it kept.
Binaries (art, audio, voice) go to their own release `assets-<EP>`: zip them with paths from the repo root plus a `MANIFEST.txt`
(sha256sum of every file) at the zip root, so `bash setup.sh --assets rickclips_assets_<EP>.zip` unpacks and verifies them.
