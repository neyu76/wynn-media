# RickClips style v8 — "real 3D world" look (2026-11-05)

v8 is the channel's new target look, learned from two sample shorts the owner picked:
**"The Pink Prison Cell Experiment"** (P01, 65.3 s, interiors) and **"Why Perfect Railroads Don't Work"** (R01, 65.2 s, exteriors).
Both measured with vidclone (`vidclone analyze` + `merge`); the numbers live in `references/style_v8/` (`gates.json` = 44 QA gates,
`profile.json` = merged, `profile_pink.json`, `profile_rail.json`). **The sample videos, their frames and transcripts are never in the repo**
(on this machine: WSL `~/rc_work/ref_pink`, `~/rc_work/ref_rail`).
Reference episode: **`episodes/PINK15`** (15 s test remake, own script), bản 4 = v4. It is the template for v8 episodes.

Where v8 overrides kit v7 (`docs/KIT_SKILL_v7.md`, `references/STYLE_BIBLE.md` — still valid for story writing, captions timing, mix levels):

| Rule | kit v7 (18 old samples) | v8 (2 new samples) |
|---|---|---|
| Sets | painted backdrop + 2.5D props | **real 3D rooms/landscapes** with textured walls, real windows, sun shafts, haze |
| Camera static share | ≤ 2–5 %, "holds never dead" | **18–39 %** real holds, then eased moves |
| Lens / height | ~40–50° at eye height | **wide 60–75°**, low (0.3–0.8 m) or high (2–2.5 m), floor + ceiling + corner in frame |
| Saturation (median) | 65–133, "soft colours" | **96–128**, one saturated accent |
| Caption size | Fontsize 81 | **66** (letter height ≈ 0.031 of the frame) |
| Mix | mono (side ≤ −20 dB) | **stereo bed**, side − mid ≈ −24…−26 dB |
| Closing sentence | ≤ 6 words | 11–21 words (the twist is told in full) |
| Transitions | dissolve 0.23 s, ≤ 2 cuts | **dissolves only, 0.30 s**, ~15 per minute, 0 cuts |

## 1. Measured targets (vidclone, 720 px width for motion)

| Metric | Pink P01 | Rail R01 | **v8 target** | PINK15 v4 |
|---|---|---|---|---|
| Duration (s) | 65.3 | 65.2 | 49–82 | 16 (test) |
| Narration wpm | 219 | 202 | 186–237 | 212 |
| Hook sentence ends (s) | 3.14 | 3.12 | ≤ 4.1 | 3.44 |
| Longest pause (s) | 0.36 | 0.38 | ≤ 0.63 | 0.34 |
| Median shot length (s) | 3.67 | 3.53 | 2.3–4.8 | 1.75 ✗ |
| Transitions / min | 14.7 | 14.7 | 9–22 | 26 ✗ (whips counted) |
| Dissolve length (s) | 0.32 | 0.30 | 0.18–0.42 | 0.23 |
| Hard cuts | 0 | 0 | ≤ 1 | 0 |
| Camera static share | 0.39 | 0.18 | 0.18–0.39 | 0.54 ✗ (too still) |
| Push-in / pull-out / pan share | .37 / .16 / .08 | .45 / .16 / .19 | ≈ .41 / .16 / .14 | .46 / 0 / 0 ✗ |
| Camera moves per 10 s | 3.6 | 6.4 | 3.6–6.4 | 4.8 |
| Move peak speed (px/f) median / p90 | 16.8 / 43 | 21.7 / 42 | ≈ 19 / 42 | 17.9 / 22 |
| Move ease-in (frames) / width at half speed | 9.5 / 11 | 12 / 12 | ≈ 11 / 11.5 | 12 / 25 |
| Whip pans per minute | 3.6 | 4.6 | ≈ 4 | 0 ✗ |
| Hand-held jitter (index) | 4.8 | 13.1 | 5–13 | 3.8 |
| Picture changes / min | 17.5 | 11 | 7–18 | 52 ✗ |
| Saturation median | 96 | 128 | 96–128 | 69 ✗ |
| Brightness median | 170 | 163 | 144–201 | 149 |
| Contrast (luma std) | 50.9 | 52.5 | 42–63 | 47.3 |
| Warmth (Lab b*) | −9.3 (cool) | +5.6 (warm) | per episode | −8.9 |
| Frames with a face | 0.20 | 0.28 | 0.08–0.48 | 0.44 |
| Caption baseline / letter height | 0.717 / 0.032 | 0.724 / 0.031 | 0.72 / 0.031 | 0.726 / 0.040 ✗ |
| Words per caption (1 / 2 / 3) | 79 / 17 / 4 % | 80 / 20 / 0 % | ~80 % one word | 68 % |
| Loudness / true peak | −14.2 / −1.9 | −14.1 / −2.2 | −14 / ≤ −1.7 | −14.3 / −4.4 |
| Bed in gaps vs voice (dB) | −13.7 | −14.1 | −11…−17 | −12.1 |
| Stereo side − mid (dB) | −25.5 | −23.9 | −30…−18 | mono ✗ |
| Music | E minor, 123 bpm | E minor, 112 bpm | minor, light pulse, no drums | — |
| Voice F0 (Hz) | 195 | 210 | young male, 190–215 | — |

Palettes (top colours by area): Pink `#4d5670 #798593 #b7b1c0 #dc6799 #dadfc5 #272a3f` (cool slate + hot-pink accent);
Rail `#905953 #462834 #8e97c0 #db7c42 #ddcfc4 #444897` (canyon red/brown + sky blue + orange accent).

## 2. Story grammar (both samples)
- Hook = one concrete strange action in the first 3.1 s (a cell painted an exact colour; a worker deliberately leaving gaps in new track).
- A rival/boss mocks the idea → the idea is tested in the world → a physical reason (heat, chemistry) explained **with objects**,
  never with diagrams → the opponent's "perfect" version fails spectacularly at 85–95 % → the closer states the irony in one longer sentence.
- 1–2 short in-character lines (the boss scolding the worker).

## 3. Camera grammar v8
- **Lens and height first.** fov 60–75° (vertical); camera low near the floor/ground (rail: at ballast height with sleepers in the
  foreground) or high over a big space. Always show depth lines: rails, corridor, table edge, wall corner. `sets3d.js cornerCam()`.
- **Shot = hold + one eased move.** Hold with only a tiny drift (static 18–39 % of the film), then a bell-shaped move: ease-in ~11 frames,
  ~19 px/f peak (keys ~0.85 s apart, `setCam(..., 0.1)`). Mix push-ins (~40 %), **pull-outs (~16 %)** to reveal, pans (~14 %).
  PINK15 v4 had no pull-outs/pans and moved too little — add them.
- **Whips ~4 per minute** (rail: canyon → station, station → interior): a fast pan with motion blur sub-frames ending on the new subject.
- **Variety of scale**: establishing shots with tiny figures (crane/drone over the canyon, the two-tier hall) ↔ extreme close-ups
  (a rail joint filling the frame, a coin in the gap, a face filling the frame). Foreground macro objects give depth.
- POV/frame-in-frame: through a train window, from the moving train down the track.
- Slight roll (≤ 2°) on dramatic beats; light hand-held float on exteriors (rail jitter index 13) — not yet in the engine.

## 4. Sets (engine_v4/sets3d.js)
- Build real rooms: `room()` / `holeWall()` (window holes → sun bar shadows), `mPlane()` metre-UV walls (bricks one size),
  `sPlane()` for every sign/poster (metre UVs make signs black), `bars()`, `fixture()` strip lights, `pendant()` hanging lamps in frame.
- Textures: `brickTex(h, s, l, mortar)` with the mortar close to the brick colour (low-contrast lines), `concreteTex`, `plainTex`;
  bump map from `brickTex(0,0,0,'',4,8,true)`. Light-tight outer skin behind window walls so the sun only enters through windows.
- Dense, story-specific set dressing: shelves of cans, calendar "SEATTLE 1979", signs ("PAINT SHOP", "BLOCK C"), benches, trays.
- Big spaces get haze (`scene.fog` near 3–5 m, far 20–26 m) so far walls fade — the main depth cue in both samples.
- Exterior kit (rail) **not built yet**: sky dome with clouds (core.js `daySky()` exists), layered canyon strata walls, ballast/sleepers/rails,
  bridges/trestles, a station hall with a glass roof, a train with a lit interior, crowds of extras, steam/smoke particles.

## 5. Light and colour (engine_v4/looks.js)
- `applyLook(name, sunAt)` presets: `cellTeal`, `cellAccent`, `workshop`, `hallHaze` (tuned on PINK15 v4), `desertDay`, `goldenHour` (rail, untuned).
- Contrast comes from a strong warm sun (5.5–6.5) through windows + practical lamps; the fill stays high (hemi 1.9–2.4) — the samples are
  bright overall (median 163–170) and dark only in ceilings/corners. PINK15 lesson: a dark low-key grade was wrong; so was a flat bright fill.
- Aim the sun so the shaft crosses the frame **sideways** and lands as a patch on the floor in shot (a shaft pointing at the camera is invisible).
- One saturated accent per episode (hot pink `#dc6799`, orange `#db7c42`); everything else is muted slate/sand. Finale may go golden hour.
- Grade: saturation **+0.15…+0.25** (v4 used 0.0 → measured 69, samples 96–128), brightness 0.14, contrast 0.1, vignette 0.48, bloom 0.32.
- Characters: `material.emissiveIntensity = 0.38` (`V8_CHAR_GLOW`) so they take the room light.

## 6. Characters and acting
- Same round-head toon characters; costume per role (police cap + badge, white coat, orange jumpsuit; rail: striped cap, bowler, top hat).
- Size in frame varies (≈ 35–45 % of the height in wides, full frame in close-ups). Face share 0.2–0.28.
- Emotion fx seen in the rail sample, **not yet in chars2.js**: face turns purple + steam puffs from the head (anger), sweat drop,
  wide round eyes (shock), hat flying off.
- People always handle the objects (roller, chip card, pint, newspaper); 3D arms (`arm3/setArm`) for top-down inserts.

## 7. Objects tell the numbers (both samples)
Paint-chip card crossed out / circled, LCD scale counting 0.00 → 0.47, tape "1 PT RED + 1 GAL WHITE" (pink);
calendar + thermometer for the season, a caliper on the rail gap, a coin then a sheet of paper in the shrinking gap,
**rails coloured by temperature** purple → pink → yellow (heat map in the world), newspaper headlines, banners (rail).

## 8. Workflow for a v8 episode
1. Scaffold from **PINK15** (not T015): `core.js` (res switch, v8 grade), `chars2.js` (police hat, badge, number tag, swatch/mug/clip items),
   `prison.js` as the set-file pattern, `main.js` as the timeline pattern; `sets3d.js` + `looks.js` come from engine_v4.
2. `episode.env`: `STYLE=v8`, `RES=1280` (draft), `CAP_SIZE=66`, `STEREO=1` (see `tools/ep/env.sh`).
3. Stills of every shot → **`bash tools/ep/compare_sample.sh <EP> cmp1 <sample.mp4> "<sample times>" "<our times>"`** → look at
   `~/rc_work/<EP>/preview/cmp1_vs_sample.jpg` (sample row over ours, luma/saturation printed). Fix framing, palette, light until the rows
   look like one film. Only then render.
4. Draft render at 720p (`RES=1280`): ≈ 13 min per 16 s with 10 workers (≈ 2.5× faster than 1080p).
5. QA: `finalize.sh` (kit gates switch to v8 with `STYLE=v8`) + `vidclone qa <mp4> --style references/style_v8` + eye review of `sheets.sh`.
6. Delivery: `RES=1920`, clear `frames/`, `SS=2` render, finalize again.

## 9. What PINK15 (bản 1 → bản 4) added to the kit
- Real 3D sets with metre-UV brick walls, window holes, sun shafts + motes, practical lamps, haze → `sets3d.js`.
- Lighting presets and the bright-fill/strong-sun rule → `looks.js`.
- Camera: hold + one eased move per beat (keys 0.85 s apart, σ 0.1); wide low/high corner framings → §3, `cornerCam()`.
- Palette: deep teal set + saturated hot-pink accent; hall light hazy blue.
- Fixes found on the way: hiding a character mid-move reads as a pop (keep them in frame); a crane must rise over heads;
  pendants must not cover signs; walking extras must pass ≥ 2.5 m from the lens; `RES`/`CAP_SIZE`/`STEREO`/`STYLE` knobs.

## 10. Still missing for "as close as possible" (priority order)
1. Saturation +0.2 in the v8 grade and pull-out/pan moves in the camera table (cheap; PINK15 fails both).
2. Exterior kit: sky + clouds, canyon strata, rails/sleepers/ballast, bridge, station hall (rail sample 50 % of shots are exteriors).
3. chars2.js fx: anger purple face + steam puffs, flying hat; crowds of extras (instanced billboards).
4. Particles: steam/smoke plume, sparks, explosion cloud (rail finale).
5. Whip-pan helper with motion-blur sub-frames ending on a new subject (`whip(keysA, keysB, t0)`), hand-held float for exteriors.
6. In-world heat-map material (object colour driven by a value over time).
