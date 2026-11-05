"""Generates src/assets/img/plaster.webp: dusty-pink plaster wall with soft leafy shadows
(our own replacement for the Wix stock background video)."""
import numpy as np, os, math, random
from PIL import Image, ImageDraw, ImageFilter
W, H = 1920, 1200
rng = np.random.default_rng(7); random.seed(7)
def noise(scale):
    small = rng.random((H // scale + 2, W // scale + 2))
    return np.asarray(Image.fromarray((small * 255).astype("uint8")).resize((W, H), Image.BICUBIC), dtype=np.float32) / 255
plaster = 0.45 * noise(160) + 0.25 * noise(40) + 0.18 * noise(8) + 0.12 * noise(2)
plaster = (plaster - plaster.mean()) * 0.9
y, x = np.mgrid[0:H, 0:W].astype(np.float32)
base_a = np.array([214, 182, 167], np.float32); base_b = np.array([196, 160, 144], np.float32)
t = (x / W * 0.6 + y / H * 0.4)[..., None]
img = base_a * (1 - t) + base_b * t
img += plaster[..., None] * 28
# soft leaf shadows (top-left) – ellipses scattered along a few curving branches
sh = Image.new("L", (W, H), 0); d = ImageDraw.Draw(sh)
for b in range(7):
    x0, y0 = random.uniform(-200, 650), random.uniform(-200, 420)
    ang = random.uniform(0.2, 1.2)
    for s in range(16):
        x0 += math.cos(ang) * 38; y0 += math.sin(ang) * 30; ang += random.uniform(-0.35, 0.35)
        for side in (-1, 1):
            la = ang + side * random.uniform(0.6, 1.2)
            cx, cy = x0 + math.cos(la) * 34, y0 + math.sin(la) * 34
            lw, lh = random.uniform(40, 75), random.uniform(18, 32)
            leaf = Image.new("L", (160, 160), 0)
            ImageDraw.Draw(leaf).ellipse((80 - lw / 2, 80 - lh / 2, 80 + lw / 2, 80 + lh / 2), fill=random.randint(150, 230))
            leaf = leaf.rotate(-math.degrees(la), resample=Image.BICUBIC)
            sh.paste(255, (int(cx - 80), int(cy - 80)), leaf)
sh = sh.filter(ImageFilter.GaussianBlur(14))
# diagonal window-edge shadow (top-right)
diag = Image.new("L", (W, H), 0)
ImageDraw.Draw(diag).polygon([(W * 0.42, 0), (W, 0), (W, H * 0.72)], fill=200)
diag = diag.filter(ImageFilter.GaussianBlur(40))
shade = (np.asarray(sh, np.float32) / 255 * 0.33 + np.asarray(diag, np.float32) / 255 * 0.30)
img *= 1 - np.clip(shade, 0, 0.6)[..., None] * np.array([0.82, 1.0, 1.1], np.float32)
out = Image.fromarray(np.clip(img, 0, 255).astype("uint8"))
dst = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src/assets/img/plaster.webp")
out.save(dst, quality=62, method=6)
out.resize((640, 400)).save("/tmp/plaster_preview.png")
print(dst, os.path.getsize(dst))
