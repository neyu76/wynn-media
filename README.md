# RickClips pipeline

CPU-only pipeline for 3D vertical story shorts (three.js + headless Chromium), with the reference episode T015.

```bash
gh release download assets-T015 --repo neyu76/rickclips --pattern 'rickclips_assets_T015.zip*'
sha256sum -c rickclips_assets_T015.zip.sha256
bash setup.sh --assets rickclips_assets_T015.zip   # Ubuntu, no GPU needed
bash tools/ep/run_all.sh T015                       # rebuild the reference episode (~2 h)
```
Read `CLAUDE.md` for the full workflow, render/encode settings, QA gates, known bugs and what needs a GPU.
The asset zip (models, audio, fonts, Kdenlive project, reference episode) is distributed separately; `MANIFEST.txt` inside it lists every file with its SHA256.
