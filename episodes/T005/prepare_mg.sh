#!/bin/bash
# episode hook called by tools/ep/sync_engine.sh: put this episode's textures into $E/mg
# backdrops = Nano Banana 2.1 paintings (kept at original saturation)
set -e
python3 -I -c "
from PIL import Image
Image.open('$SRC/art/street_back.png').convert('RGB').save('$E/mg/street_back.jpg', quality=95)
Image.open('$SRC/art/office_back.png').convert('RGB').save('$E/mg/office_back.jpg', quality=95)"
