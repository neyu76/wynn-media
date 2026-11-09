---
name: ate-production-rules
description: "animal-toon-eyes episodes — user rules from 2026-11-04: swap human heads for meme heads, images via Google Flow, every prop drawn, SFX from the editornghiepdu library"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 274d2747-7b8b-41f3-8f09-f83b6b80252a
  modified: 2026-11-04T05:54:32.167Z
---

User feedback on ATE01-003 (2026-11-04, video kept as is):
1. **People: replace the whole head** with the samples' flat 2D meme head (thick outline, beige fill, white-oval eyes with
   dot pupils, line nose, flat hair, real hat/mask kept on top). Never put toon eyes on a real human face. Details in
   `styles/animal-toon-eyes/recipe.md` section 4b. **Why:** the user finds the swapped heads more meme-like and that is
   what the samples do. **How to apply:** every human pose = photo -> head-swap edit, one head base per character.
2. **Images: draw with Google Flow** (flow.google.com, the user is signed in in the built-in browser, ULTRA plan,
   Nano Banana 2.1, 9:16, image generation shows 0 credits) instead of ElevenLabs. Draw generously — every prop its own
   picture, as many poses/expressions as the beats need. **Why:** ElevenLabs credits cost; Flow is free on the plan.
3. **SFX: use the EDITORNGHIEPDU app library** through MCP server `editornghiepdu-sfx` (see [[editornghiepdu-sfx]]),
   one searched sound per cue, not the 8 reused generic clips.
4. Put the upbeat direction tag in the TTS prompt (see [[vidclone]]).
