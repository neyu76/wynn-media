---
name: prop-3d-pipeline
description: How hero props are made (Nano Banana image → Hunyuan3D-2 in WSL → GLB) and the cutaway.js toolkit; install gotchas
metadata:
  node_type: memory
  type: project
  originSessionId: 3387cc0e-0bf7-4000-be87-c2cb8345b267
  modified: 2026-11-01T15:53:57.921Z
---

Decided 2026-11-01 (user agreed): props = CC0 libraries (Kenney/Quaternius/Poly Pizza) for common items, Hunyuan3D-2 image→3D for 1–3 unique hero props per episode, code-built geometry for mechanisms that animate or get cut open. Foreground DOF: skip. Cutaways: keep when the narration explains a hidden mechanism.

Hunyuan3D-2 install (WSL Ubuntu 26.04, RTX 3060 12 GB, ~5 GB already used by Windows):
- `/root/h3d/venv` (py3.10, torch 2.7.1+cu128), repo `/root/h3d/repo`, CUDA 12.8 at /usr/local/cuda-12.8, gcc-14.
- glibc 2.41 vs CUDA 12.8 header clash → `tools3d/fix_cuda_glibc.sh` patches math_functions.h (noexcept), then builds custom_rasterizer + differentiable_renderer.
- Must pin transformers 4.48.3, diffusers 0.32.2, huggingface_hub 0.27.1, accelerate 1.3.0 (newer transformers renames DINOv2 keys → state_dict load error).
- Run: `tools3d/pin_and_gen.sh <img> <out.glb>` (or run_gen.sh), log /root/h3d/gen.log. Mini-turbo shape ~60 s, paint-turbo ~35 s, peak 6.7 GB VRAM, output ~30k faces / 3 MB GLB.
- AI meshes are SOLID: section-cutting shows a filled face, not a hollow interior → interiors still need code-built shells.
- Long jobs: launch with `Start-Process wsl.exe ... -WindowStyle Hidden` (app kills background tasks after ~10 min; nohup inside a short wsl call dies with it).

cutaway.js (episodes/T015_demo30/engine/): strata() with embed()/fault(), sectionCut() (clipping plane + stencil caps; core.js v5 enables localClipping + composer stencil), xray(). Test scene engine_test/cuttest.js via tools/cut_test.sh. Related: [[rickclips-setup]], [[video-analysis-tools]].
