#!/bin/bash
# episode hook called by tools/ep/sync_engine.sh: put this episode's textures into $E/mg
# courtyard + museum back walls = Nano Banana 2.1 paintings (art/*.png), saturation ×0.9
set -e
python3 -I -c "
from PIL import Image, ImageEnhance
for n in ('shop_back',):
    ImageEnhance.Color(Image.open('$SRC/art/' + n + '.png').convert('RGB')).enhance(0.9).save('$E/mg/' + n + '.jpg', quality=95)"
