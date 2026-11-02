---
name: rc-new-episode
description: Start a new RickClips episode from the T015 template — folder scaffold, script rules, episode.env, assets to generate, and the order of work up to delivery. Use when the user gives a new topic or script.
---
# New episode

1. Script (rules: `docs/KIT_SKILL_v7.md` §3, samples `references/scripts/`): hook in 0–4 s with a concrete image, "You see," before the
   mechanism, twist near 75–90 %, ≤ 6-word ironic closer that loops to the opening object. 45 s ≈ 160–170 words. Numbers spelled out.
2. Scaffold:
   ```bash
   EP=T016; mkdir -p episodes/$EP/{engine,art,audio/sfx_el,voice}
   cp episodes/T015/{episode.env,build_sfx.py,prepare_mg.sh} episodes/$EP/
   cp episodes/T015/engine/{core.js,chars2.js,cutaway.js} episodes/$EP/engine/     # shared v5 engine parts
   # write episodes/$EP/script.txt, a set file and main.js (T015's taverna.js/main.js as the pattern)
   ```
   Edit `episode.env` (NAME, DUR = voice length + ~1.3 s, TAKE, TEMPO, MUSIC) and `prepare_mg.sh` (this episode's textures/models).
   In `core.js` `Char.set`, add t to the cache key when fx are active (see CLAUDE.md, determinism) — T015 keeps the old behaviour only to match its delivery.
3. Generate (external services, outside the repo): voice takes → `voice/`, music → `audio/`, water/foley SFX → `audio/sfx_el/`,
   backdrop painting(s) → `art/`, prop images → GLB (skill `rc-prop-3d`, GPU) → `art/`. Binaries stay out of git (`.gitignore`).
4. `rc-voice` → `rc-audio-captions` → `rc-shots` (stills for every shot) → `rc-render` → `rc-finalize-qa`.
5. Add the episode's binaries to an asset zip with a MANIFEST (`sha256sum` of every file) if it must be reproducible elsewhere.
