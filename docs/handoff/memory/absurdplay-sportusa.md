---
name: absurdplay-sportusa
description: "AbsurdPlay P01 Sport USA kit (whatifbagel-style 3D sports what-if) — working copy, v0.6 fixes from sample measurement, WSL engine, QA tool"
metadata:
  node_type: memory
  type: project
  originSessionId: 93c2fd05-8842-40a3-ac2a-90fe1f3c2d87
  modified: 2026-11-05T08:13:41.886Z
---

2026-11-05: user gave kit zips + samples; samples in `C:\Claude creator\1\samples\sportusa\` (V1 McGregor/Anne Frank, V2 Cowboys vs 50 babies; V3 = dup of V1).
Report: `samples/sportusa/BAO_CAO_SO_SANH_KIT_VS_MAU.md`. User said "Sửa kit luôn" → kit v0.6 working copy at `C:\Claude creator\1\absurdplay_kit\`
(repacked zips in `absurdplay_kit\goi_v06\`). v0.6: captions Inter ExtraBold ASS 66 / MarginV 594 (= sample 572 px wide, baseline 1309) + TTF via
cong_cu/cai_font.sh (libass ignores woff2); camera.js style layer (push/arrive 0.6/hand); hau_ky.py grade (no colortemperature ≤4600 K: orange skin);
lib/goi_truyenhinh.js fixed TV package + flashAlpha; nhanvat2 maskLow; lib/hieuung.js; cong_cu/kiem_theo_mau.py QA (measure camera on hinh.mp4 without gfx).
E04 v0.6 re-rendered in WSL `/root/work/engine` (playwright symlinked); silent cut `samples/sportusa/E04_v06_cat_thu_khong_tieng.mp4`. Still off: 49 s, 174 wpm (voice).

**Why:** user wants the kit's videos to look like the samples.
**How to apply:** new episodes start from absurdplay_kit v0.6 and must pass kiem_theo_mau.py; related [[vidclone]], [[video-analysis-tools]].
