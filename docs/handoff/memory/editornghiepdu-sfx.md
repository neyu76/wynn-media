---
name: editornghiepdu-sfx
description: "EDITORNGHIEPDU desktop app SFX library as MCP server editornghiepdu-sfx (tools, trial status, paths)"
metadata:
  node_type: memory
  type: reference
  originSessionId: 274d2747-7b8b-41f3-8f09-f83b6b80252a
  modified: 2026-11-04T05:54:37.424Z
---

User installed EDITORNGHIEPDU 2.0 (2026-11-04) and connected it to Claude Code: `~/.claude.json` mcpServers
`editornghiepdu-sfx` (Electron exe as node + `resources/agent/sfx-mcp/bin/sfx-mcp.js`). The app keeps the token in its own
file — never read or print it. Tools: sfx_status (call first), sfx_categories, sfx_search (VI/EN, category/tag/duration),
sfx_get, sfx_similar, sfx_resolve (downloads the original into the cache, returns an absolute Windows path), sfx_plan
(scene sound plan), sfx_collection, sfx_favorites.
Status 2026-11-04: Trial active, all 43 categories, scopes read/preview/download/favorite, no All-Access subscription
(paid in CUTO — never buy). Cache `C:\Users\Admin\AppData\Roaming\DMT-EDITORNGHIEPDU\sfx-cache` (WSL /mnt/c/...), 2 GB max.
Sessions started before the connection do not see the tools: start a new session (the app says quit and reopen the agent).
Copy resolved files into the episode's `audio/` before the EDL references them. Used by [[ate-production-rules]].
