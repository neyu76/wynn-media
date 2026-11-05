#!/bin/bash
# bash tools/ep/compare_sample.sh <EP> <name> <sample.mp4> "<sample t1 t2 …>" "<our t1,t2,…>"
# v8 look check BEFORE any full render (docs/STYLE_V8.md §8): renders stills of our shots (SS=1, ~2 s each at RES=1280) and puts them
# under the sample frames of the same story beats → $EP/preview/<name>_vs_sample.jpg, plus luma/saturation medians per frame.
# The sample stays where it is (never copy samples, their frames or this sheet into the repo — review only).
set -e; source "$(dirname "$0")/env.sh" "$1"
NAMEC=$2; S=$3; ST=$4; OT=$5
[ -f "$S" ] || { echo "sample not found: $S"; exit 2; }
bash "$RC/tools/ep/stills.sh" "$EPN" "$NAMEC" "$OT" | tail -1
O=/tmp/rc_cmp_${EPN}_$NAMEC; rm -rf "$O"; mkdir -p "$O"
i=0; for t in $ST; do ffmpeg -v error -y -ss "$t" -i "$S" -frames:v 1 -vf scale=300:533 "$O/a_$(printf %02d $i).jpg"; i=$((i+1)); done
python3 -I - "$O" "/tmp/rc_stills_$EPN/$NAMEC" "$EP/preview/${NAMEC}_vs_sample.jpg" <<'PY'
import sys, glob
from PIL import Image, ImageStat, ImageDraw
o, ours, dst = sys.argv[1:4]
a = sorted(glob.glob(o + '/a_*.jpg')); b = sorted(glob.glob(ours + '/still_*.jpg'), key=lambda f: float(f.split('_')[-1][:-4]))
def st(im): hsv = im.convert('HSV'); return round(ImageStat.Stat(im.convert('L')).median[0]), round(ImageStat.Stat(hsv).median[1])
n = max(len(a), len(b)); sheet = Image.new('RGB', (n * 300, 1066)); d = ImageDraw.Draw(sheet)
for row, fs in enumerate([a, b]):
    for i, f in enumerate(fs):
        im = Image.open(f).convert('RGB').resize((300, 533)); sheet.paste(im, (i * 300, row * 533)); l, s = st(im)
        d.rectangle([i * 300, row * 533, i * 300 + 150, row * 533 + 18], fill=(0, 0, 0)); d.text((i * 300 + 4, row * 533 + 3), f"{'sample' if row == 0 else 'ours'} L{l} S{s}", fill='yellow')
sheet.save(dst)
la = [st(Image.open(f).convert('RGB'))[0] for f in a]; lb = [st(Image.open(f).convert('RGB'))[0] for f in b]
print('luma sample', la, ' ours', lb); print('sheet', dst)
PY
