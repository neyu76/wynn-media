#!/bin/bash
# episode hook called by tools/ep/sync_engine.sh: put this episode's textures into $E/mg
# market backdrop = Nano Banana 2.1 painting (art/market_back.png), saturation ×0.9 (kit rule: painted plates slightly calmer than the 3D props)
set -e
python3 -I -c "
from PIL import Image, ImageEnhance
im = Image.open('$SRC/art/market_back.png').convert('RGB')
ImageEnhance.Color(im).enhance(0.9).save('$E/mg/market_back.jpg', quality=95)"
