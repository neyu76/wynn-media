---
name: vidclone
description: "vidclone repo/plugin (2026-11-02) — generic any-niche \"learn style from sample videos → make + QA new videos\"; location, venv, test style, status"
metadata:
  node_type: memory
  type: project
  originSessionId: 3387cc0e-0bf7-4000-be87-c2cb8345b267
  modified: 2026-11-04T05:55:29.208Z
---

User asked (2026-11-02) for a repo/skill/plugin that learns every detail of sample videos and makes similar videos for **any niche**, not only RickClips.
Built `H:\AUTO\MUSE ALL IN ONE\Claude creator\1\vidclone`, pushed 2026-11-02 to private https://github.com/neyu76/vidclone (main = 567d0e8).
- CLI `bin/vidclone analyze|merge|qa|assemble|captions|transcribe`, venv `/root/.vidclone/venv` in WSL (opencv pinned <5 for Haar faces).
- Plugin skills setup/learn/make/qa; engines doc (stills-motion default, ai-video, footage, text/graphics, 3d-toon → rickclips).
- Test style from team samples S01–S04 at `/root/vc_styles/team` (WSL); assembler test `/root/vc_test` with T001 art/voice/music.
- Installed 2026-11-02 in this Claude Code account as plugin `vidclone@vidclone` (user scope, directory marketplace = the local repo, like rickclips); after code changes run `claude plugin update vidclone@vidclone`.
- Config now at `/root/.vidclone/config.json` (WSL root; written 2026-11-02, deliver_dir/voice still null).
- 2026-11-02 learned style `styles/animal-toon-eyes` (photoreal animals + flat cartoon eyes, 1-word orange caps, ~250 wpm myth-busting facts)
  from 5 user samples copied to `/root/vc_samples/new/S01–S05`; style.md + style.json written, face/caption_share gates off (unreliable).
  Anton (OFL) added to fonts/ with user OK; captions.py got a `shadow_rel` option. Pushed 2026-11-02 as main = 127f4be.
  Git is not on Windows PATH — run git inside WSL.
- animal-toon-eyes voice (user's choice 2026-11-02): ElevenLabs `UgBBYS2sOqTuMpoF3BR0` "Mark - Natural Conversations".
  Work + delivery folder: `H:\AUTO\MUSE ALL IN ONE\TIKTOK\animal toon eyes` (WSL `/mnt/h/...`), set in config work_dir/deliver_dir.
  User sends scripts separately, then run /vidclone:make.
- Scripts: Notion page "Animal Toon Eyes — Animal Science · ATE01" → database "ATE01 · Topic Tracker" (10 records, field Thứ tự,
  checkbox "Đã làm video" = mark done — user wants it ticked after each video). Built-in browser is NOT signed in to Notion (read only).
- 2026-11-03 first video ATE01-001 gecko done: `<work>/ATE01-001-gecko/` (gen_edl.py shot plan, ElevenLabs flow BQsEH2yoNl8lTqGrkUTu,
  gpt-image-2.5-sunburst 9:16 2K, edits chained from one base). Learned: Mark voice reads ~181 wpm with 0.6 s pauses → cap pauses 0.25 s
  + atempo 1.2 (≈238 wpm); full-file Whisper drops the first segment → map take timings through the cuts instead of re-transcribing;
  hook gate reads the first Whisper segment (false fail); long shots split into 2 continuous moves for move_run gate; grade temp 7400 for warmth.
- 2026-11-03 user rejected v1 ("chưa đạt"): samples animate INSIDE shots (eyes every 0.3-0.5 s, hands/props slide in, icons pop,
  caption pop 1.4x, big subject). Built vidclone layers.py (procedural eyes + animated props/icons/text), cutout.py, gemini.py;
  v2 = `gen_edl_v2.py`/`edl_v2.json`. Always check samples at 6 fps, not 1 fps sheets.
- User then said animals lack action/emotion; samples = cut-out puppets (part moves, body jiggle). Built parts.py (local motion
  analyser: samples 65-100 % moving, p95 6-11 px/f vs our stills 24 %, 1.5 px/f) + layers cutout/warp/parent; v3 = `gen_edl_v3.py`
  (BiRefNet cut-out + Nano Banana clean plate per picture, breathe/sway/nod/wag/paddle/pendulum, eyes as children).
- User's Gemini key in WSL `/root/.secrets/gemini_key` (chmod 600): image gen needs billing (free tier 429), vision works
  (gemini-3.8-flash, 20 req/day). Nano Banana 2.1 used via ElevenLabs model `gemini-nano-banana-2.1` meanwhile.
  Open: make step not run yet, assemble overlays are static (no animated stickers).
- 2026-11-03: `edit.py` camera_grammar (caption band masked; bursts/holds/kicks/whips in px/f @720; method from
  mromidev/claude-animated-shorts, clone at /root/ext/claude-animated-shorts) + 10 camera gates; team gates re-merged; main = 48b63b0.
  animal-toon-eyes re-measured too (gates wide: samples differ; S04/S05 had no caption band detected) → main = 445ac78.
- 2026-11-03 user: "animals stay in place" → stop Notion scripts, remake a sample's first 20 s. Key gap = pose drawings
  (S01 ~100 picture changes/min, ours 15-20). `<work>/REMAKE-S01-panda/` = reference pose-script build (gen_edl.py: own script,
  ~24 Nano Banana 2.1 poses on ElevenLabs flow B7a499aTkoxvhWYbVLmo, 2-frame loops, ranger cut-out rising behind ferns, hand pat,
  bubbles, headline): 111 changes/min vs S01 98 (fair detector ignoring camera), camera moving 55 % (S01 48 %), QA 39/39.
  Camera travel must stay small (CAM_GAIN 0.45) or swaps blur. Eye positions read off previews when Gemini vision stalls.
  seedvis models (NARWHAL/GEM_PIX_2) were in maintenance; ElevenLabs used instead.
- User then rejected v1 again: "samples keyframe the BLOCKS (cut-out object over background), not wiggle one point". v2 =
  `gen_edl_v2.py`: every pose BiRefNet-cut over one clean plate per scene, block keyframes (walk-in hops, landing squash,
  ease back snaps, slide in from the cut-off side, rise from bottom); layers.py keys got per-key `ease` + `hop`/`hops`.
  128 changes/min vs S01 98; QA 38/39 (camera ease-in gate reads block snaps as camera).
- User then: "too thrifty" — wants every prop drawn (bamboo, grass tufts, grass in mouth), side characters cut out WITH toon
  eyes, one eye in profile, more expressions, jaw separated + keyframed for eating, and asked me to find/fix more myself.
  v3 = `gen_edl_v3.py`: props/chars generated on green/white and keyed (cutout.py got --white), group rebuilt over empty plate,
  layers.py: cutout `parts` (jaw, hole + hinge, chew), `shadow`, eyes `single`/`rim`/`brow_w`/`pupil`/`low`/`mood`.
  115 changes/min, QA 38/39 (same camera ease-in gate). User accepted v3 ("ổn rồi") 2026-11-03.
- Then studied S02–S05 at 10 fps and added: `meter` (battery), cutout `fill` (silhouette gauge) + `glow`, `bubble` with
  changing `texts`, `tint` (list last), keyed `alpha`, icons skull/heart/clock/halo/fire/zap/note, `layers.shift_times`.
  Samples' own round channel logo (top-right) must never be copied. `.gitignore` covers samples/*/parts (frame heat-maps).
- User rule (2026-11-03): vidclone must stay generic for every niche — style-specific rules go in `styles/<name>/`
  (`recipe.md` = how to build it, optional `kit.py` helpers, `examples/` reference build), never in the generic skills/code.
  animal-toon-eyes now has recipe.md + kit.py + examples/remake_s01_edl.py (reproduces edl_v3 exactly). Generic: `analyze`
  records `motion` (frames.motion changes/min + parts local motion), 3 motion gates, `bin/vidclone motion <sample dirs>`.
- Notion now has S01-v1: 10 full scripts (274–298 words, ≥ 60 s) + beat boards per Topic Tracker record (all "Đã làm video"
  unticked; built-in browser can read but not edit — user must sign in). 2026-11-03 made ATE01-002 penguin knees:
  `<work>/ATE01-002-penguin/` (gen_edl.py on kit, make_overlays.py = PIL skeleton X-ray/diagram, ElevenLabs flow
  CxXdfSYWLJcSUGNOugcT), 68.95 s, QA 38/42 (hook/ease-in/saturation-on-snow/median-shot explained).
  kit got split_long (reframe cuts), IDLE, write_edl(handheld, bed_db); assemble any-shot "handheld" — pushed 9af3cb1.
- 2026-11-04 user signed in to Notion in the built-in browser; ticked "Đã làm video" on ATE01-001 and 002 (record pages
  app.notion.com/p/<id>; checkbox is in the property list). Tracker now has 25 records (S01 + S02 scripts); order by "Thứ tự".
- 2026-11-04 ATE01-003 wombat cubes done + ticked: `<work>/ATE01-003-wombat/` (gen_edl.py, make_overlays.py = PIL gut X-ray on
  WB2 profile, ring cross-sections stiff/soft, tube side view, material states, blueprint; ElevenLabs flow NdKj5eGmRrZ3zCjVyoPT),
  72.95 s, QA 39/42 (median-shot / ease-in known; jitter 14.9 from pop-ins + ring swaps, not camera). Lessons: put the
  "[casual, upbeat, fast-paced, playful ...]" tag in the TTS prompt (without it Mark read 216 wpm -> needed atempo 1.3);
  ffmpeg colortemperature: LOWER kelvin = warmer (sunset plates need ~8200 + saturation 0.82); parented png children keep
  frame-fraction w (only x/y follow the parent); WSL ffmpeg "Cannot allocate memory" on /mnt/h was transient - rerun.
  Recipe rules from the user's review (head swap, Flow, library SFX) pushed as 11c45f1; see [[ate-production-rules]].

**Why:** the user wants to scale to every niche by feeding sample videos + files.
**How to apply:** for "make videos like this sample" requests use vidclone skills; RickClips 3D episodes still go through [[rickclips-setup]]; analysis tools background in [[video-analysis-tools]].
