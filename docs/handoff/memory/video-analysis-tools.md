---
name: video-analysis-tools
description: "Installed video-understanding tools (watch skill + WhisperX, kit analyze_sample in WSL) and where team sample videos live"
metadata:
  node_type: memory
  type: project
  originSessionId: 3387cc0e-0bf7-4000-be87-c2cb8345b267
  modified: 2026-11-01T13:57:55.721Z
---

Installed 2026-11-01 for analysing reference videos:
- `watch` skill (bradautomates/claude-video v0.3.2) at `~/.claude/skills/watch`, engine local (no Gemini key), detail balanced, WhisperX small on Windows CPU. Run: `python C:\Users\Admin\.claude\skills\watch\scripts\watch.py <file> --whisper whisperx --max-frames N --out-dir <dir>`. WhisperX first install failed on WinError 1314 (HF symlinks); a plain rerun of `setup.py --install-whisperx` succeeded.
- Kit analysis in WSL: `RickClips_KIT/tools/analysis/analyze_sample.sh` (needed `tesseract-ocr` + `bc`, now installed). Wrapper: `samples/team/tools/analyze_all.sh S01..S04`.
- Team samples copied to `H:\AUTO\MUSE ALL IN ONE\Claude creator\1\samples\team\S01–S05.mp4` (1080×1920). S05 is a byte-identical duplicate of S02. S01 = kit V18 (grave bell), S03 = kit V01 (Japan gambling window).
- Of the 18 "Opus 5.5 film crew" repos, none improve analysis; three.js/postprocessing/GSAP/FFmpeg already in the kit. Satori (crisp labels) and Rapier (physics) are candidates only if an episode needs them.

**Why:** user wants to replicate team sample videos and asked for better video-analysis ability first.
**How to apply:** analyse references with watch (visual+transcript) plus kit metrics before building; relates to [[rickclips-setup]].
