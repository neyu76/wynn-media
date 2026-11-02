#!/bin/bash
# episode hook called by tools/ep/sync_engine.sh: put this episode's textures into $E/mg
# print-shop back wall = Nano Banana 2.1 painting (art/shop_back.png), saturation ×0.9
set -e
python3 -I -c "
from PIL import Image, ImageEnhance
im = Image.open('$SRC/art/shop_back.png').convert('RGB')
ImageEnhance.Color(im).enhance(0.9).save('$E/mg/shop_back.jpg', quality=95)"
