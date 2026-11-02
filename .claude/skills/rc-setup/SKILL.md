---
name: rc-setup
description: Install and verify the RickClips pipeline on a Linux machine (no GPU needed) — apt, Node, pinned Python venv, npm ci, Chromium, fonts, asset zip with SHA256 check. Use at the start of any session on a new machine or when a tool is missing.
---
# Setup

1. `bash setup.sh --assets <path>/rickclips_assets_T015.zip` (needs sudo/root for apt). Last line must be `SETUP OK`.
   - Without the zip: `bash setup.sh` installs tools only; the asset checks then fail until the zip is unpacked.
   - Only checks: `bash setup.sh --check`.
2. If the asset step prints SHA256 mismatches, the zip is damaged: re-copy it; never "fix" by regenerating MANIFEST.txt.
3. Smoke test: `bash tools/ep/stills.sh T015 smoke "0.6,27.5" 1` → look at `~/rc_work/T015/preview/smoke.png` (taverna with jug pouring; x-ray cup with ghost jug).

Notes
- Python runs from `.venv/` (pinned by `requirements.lock`); scripts pick it up via `tools/ep/env.sh`. Don't `pip install` into the system Python.
- `npm ci` uses `engine_v4/package-lock.json`; Playwright 1.64.1 downloads Chromium 1248 into `~/.cache/ms-playwright`.
- Work output goes to `RC_WORK` (default `~/rc_work`), not into the repo.
- GPU tools (Hunyuan3D-2) are separate: skill `rc-prop-3d`.
