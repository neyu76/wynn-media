# RickClips pipeline

CPU-only pipeline for 3D vertical story shorts (three.js + headless Chromium), with the reference episode T015.

```bash
gh release download assets-T015 --repo neyu76/rickclips --pattern 'rickclips_assets_T015.zip*'
sha256sum -c rickclips_assets_T015.zip.sha256
bash setup.sh --assets rickclips_assets_T015.zip   # Ubuntu, no GPU needed
bash tools/ep/run_all.sh T015                       # rebuild the reference episode (~2 h)
# more episodes: one release each (assets-T001, …), e.g.
#   gh release download assets-T001 --repo neyu76/rickclips --pattern 'rickclips_assets_T001.zip*' && bash setup.sh --assets rickclips_assets_T001.zip
```
## Claude Code plugin (the workflow knowledge)
```
/plugin marketplace add neyu76/rickclips        # needs read access to this private repo
/plugin install rickclips@rickclips
/rickclips:setup                                 # once per machine: code, toolchain, ElevenLabs/Notion, voice → ~/.rickclips/config.json
/rickclips:episode <Notion link> script 3        # a whole episode
```

Read `CLAUDE.md` for the full workflow, render/encode settings, QA gates, known bugs and what needs a GPU.
The asset zip (models, audio, fonts, Kdenlive project, reference episode) is distributed separately; `MANIFEST.txt` inside it lists every file with its SHA256.
