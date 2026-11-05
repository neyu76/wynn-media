# source tools/ep/env.sh <EPISODE>      e.g.  source tools/ep/env.sh T015
# Sets the paths every pipeline script uses. Nothing here is machine-specific.
#   RC   repo root                      SRC  $RC/episodes/<EP>  (tracked sources + binaries unpacked from the asset zip)
#   WORK ${RC_WORK:-$HOME/rc_work}      EP   $WORK/<EP>         (frames, voice, audio, out, deliver, qa_out, logs)
#   E    $WORK/engine_<EP>              (engine_v4 + episode overlay + mg/ textures; built by sync_engine.sh)
RC=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
EPN=${1:-${EPN:-}}; [ -n "$EPN" ] || { echo "usage: <script> <EPISODE>  (folder name under episodes/)"; exit 2; }
SRC=$RC/episodes/$EPN; [ -d "$SRC" ] || { echo "no episode folder $SRC"; exit 2; }
WORK=${RC_WORK:-$HOME/rc_work}; EP=$WORK/$EPN; E=$WORK/engine_$EPN; KIT=$RC
# per-episode settings: NAME DUR TAKE TEMPO VOICE_OFFSET MUSIC
source "$SRC/episode.env"
NFRAMES=$(python3 -c "print(round($DUR*30))")
[ -x "$RC/.venv/bin/python3" ] && export PATH="$RC/.venv/bin:$PATH"
mkdir -p "$EP"/{voice,out,audio,frames,logs}
export RC EPN SRC WORK EP E KIT NAME DUR NFRAMES
# optional per-episode knobs (unset = kit v7 behaviour, T015 unchanged):
#   STYLE=v8      QA gates of docs/STYLE_V8.md (tools/analysis/qa_compare.py)
#   RES=1280      frame height for v8 core.js (1280 = fast 720p draft, 1920 = delivery); clear frames/ when it changes
#   CAP_SIZE=66   caption font size @ PlayRes 720×1280 (default 81; v8 samples ≈ 66)
#   STEREO=1      keep the music bed's stereo width (mix side ≈ −25 dB like the v8 samples; default 0 = mono)
export STYLE=${STYLE:-} RES=${RES:-} CAP_SIZE=${CAP_SIZE:-81} STEREO=${STEREO:-0}
