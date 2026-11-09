# Handoff: continuing RickClips in a new Claude session

Read this first, then `memory/MEMORY.md` and the notes it links to. This folder is a copy of the Claude Code project memory as of 2026-11-09.
It holds notes only: no API keys, no sample videos, no chat transcript.

## Read in this order
1. `CLAUDE.md` (repo map, pipeline, known errors)
2. `docs/STYLE_V8.md` (current target look, measured targets, open gaps)
3. `docs/handoff/memory/rickclips-setup.md` (history and lessons per episode)
4. `episodes/PINK15` (template for v8 episodes)

## Owner's standing rules
- API keys live only in `~/.secrets/`; never in the repo, skills, memory, config or chat.
- Sample videos, their frames, audio and transcripts are never packaged or committed.
- Never enter passwords or credentials for the owner.
- Do not change the owner's Notion without asking.
- Do not commit or push unless asked. Binaries go to a release `assets-<EP>`, never into git.
- The owner reads Vietnamese: reply in Vietnamese.

## Where things are (owner's Windows machine)
- Repo: `H:\AUTO\MUSE ALL IN ONE\Claude creator\1\rickclips_repo` (WSL `/mnt/h/AUTO/MUSE ALL IN ONE/Claude creator/1/rickclips_repo`).
- The pipeline runs in WSL as root: `wsl.exe -u root bash <script.sh>`. Work output is in `/root/rc_work/<EP>`.
- Samples (WSL only): `/root/rc_work/ref_pink`, `/root/rc_work/ref_rail/rail.mp4`. vidclone styles: `/root/vc_styles/{pink,pink15,rail,v8}`.
- Some older notes still say `C:\Claude creator\1`: read that as the H: path. The C: copy is gone.
- A cloud session has none of the WSL paths above unless Remote Control is on for the owner's machine.

## State on 2026-11-09
- `main` has style v8 and the `render.js` fix (a6462f5). PINK15 v4 (720p, 16 s) is the latest test, delivered in `episodes\PINK15\v4_720p`.
- PINK15 v4 against the v8 gates: vidclone 33/44 after the audio and caption knobs. Kit QA 18/21 (test length, music floor, saturation).
- T015 regression after v8: audio, captions and QA identical; 20 of 25 reference frames identical; the other 5 match the pre-v8 engine.
- Other episode work is on branches: `t002-same-pixels`, `t006-mechanical-turk`, `t010-shade-included`, `t012-nanni-complaint`.

## Next work, in priority order (details: `docs/STYLE_V8.md` section 10)
1. v8 grade saturation +0.15 to +0.25, and pull-out and pan moves in the camera keys.
2. Exterior kit: sky and clouds, canyon strata, rails, bridge, station hall.
3. `chars2.js` fx (angry purple face with steam, flying hat) and crowds of extras.
4. Particles: steam, smoke, sparks, explosion.
5. Whip-pan helper and hand-held float.
6. In-world heat-map material.

## Lessons that cost a render
- Never put `//` in the middle of a code line. It disabled the READY wait in `render.js` and rendered T015 without its GLB jug.
- Compare stills with a sample (`tools/ep/compare_sample.sh`) before rendering. Matching numbers did not mean a matching look.
- Write bash scripts with LF line endings; PowerShell `Set-Content` writes CRLF and breaks them.
