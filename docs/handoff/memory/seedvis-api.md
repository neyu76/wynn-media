---
name: seedvis-api
description: "Seedvis image/video generation API — key location, client script, models, account plan"
metadata:
  node_type: memory
  type: reference
  originSessionId: dcd6d9f1-ca5d-4279-90dc-6f8521afbdc5
  modified: 2026-11-03T06:12:05.845Z
---

Seedvis API (https://seedvis.com/api/v1), connected 2026-11-03.
- Key: user env var SEEDVIS_API_KEY + file ~/.seedvis/api_key (never put in code/URLs).
- Client: `H:\AUTO\MUSE ALL IN ONE\Claude creator\1\seedvis\seedvis.py` — `models`, `account`, `gen MODEL "prompt" --image --video --last-frame --param k=v --out DIR`, `poll ID`, `cancel ID`. Routes gpt-image-2 → /images/*, GEM_PIX_2/NARWHAL/HARBOR_SEAL → /google/v1beta/interactions, rest → /developer/generations.
- Account (2026-11-03): plan Credit Mini (payg), 1595 credits, 2 concurrent streams, queue 4.
- Live models: gpt-image-2, GEM_PIX_2, NARWHAL, HARBOR_SEAL, grok-image, grok-image-2.0, Veo-3.1, Omni-Flash, grok-imagine-video-1.5. Seedance family under maintenance (503).
- Each gen costs credits: never resend a queued job; follow next.url. Ask before spending.

Possible video source for [[vidclone]] / [[rickclips-setup]].
