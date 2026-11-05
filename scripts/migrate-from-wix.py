"""One-time migration: turns the Wix inventory (../assets, ../galleries_full.json)
into web-sized masters in media/ and Markdown entries in src/. Kept for reference."""
import json, re, os, sys, unicodedata
from PIL import Image, ImageOps
Image.MAX_IMAGE_PIXELS = None
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # site/
INV = os.path.dirname(ROOT)                                          # meirav-site/
A = os.path.join(INV, "assets")
MAX = 2000

def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s or "untitled"

def find(name):
    for d, _, fs in os.walk(A):
        if name in fs: return os.path.join(d, name)
    raise FileNotFoundError(name)

def master(name, dest_rel):
    """Write a <=2000px master to media/<dest_rel>.(jpg|png); return public path."""
    im = Image.open(find(name)); im = ImageOps.exif_transpose(im)
    has_alpha = im.mode in ("RGBA", "LA", "P") and im.convert("RGBA").getextrema()[3][0] < 250
    im = im.convert("RGBA" if has_alpha else "RGB")
    im.thumbnail((MAX, MAX), Image.LANCZOS)
    ext = "png" if has_alpha else "jpg"
    out = os.path.join(ROOT, "media", dest_rel + "." + ext)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    if has_alpha: im.save(out, optimize=True)
    else: im.save(out, quality=86, optimize=True, progressive=True)
    return "/media/" + dest_rel + "." + ext

def yq(s):
    return json.dumps(s, ensure_ascii=False)

def write_md(path, fm):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    lines = ["---"]
    for k, v in fm.items():
        if isinstance(v, list):
            lines.append(f"{k}:" + ("" if v else " []"))
            lines += [f"  - {yq(x)}" for x in v]
        else:
            lines.append(f"{k}: {yq(v)}" if isinstance(v, str) else f"{k}: {v}")
    lines.append("---\n")
    open(path, "w").write("\n".join(lines))

gal = json.load(open(os.path.join(INV, "galleries_full.json")))
CATS = {"character-fabrication": "character-fabrication", "painting": "painting",
        "prop-building": "drawing", "sculpting": "sculpting"}
for wixslug, cat in CATS.items():
    used = set()
    for i, it in enumerate(gal[wixslug][0]["items"]):
        s = slug(it["title"]); base = s; n = 2
        while s in used: s = f"{base}-{n}"; n += 1
        used.add(s)
        img = master(it["uri"], f"{cat}/{s}")
        write_md(os.path.join(ROOT, "src/projects", cat, s + ".md"), {
            "title": it["title"], "category": cat,
            "description": it["desc"].strip(), "images": [img],
            "video": "", "date": "", "order": (i + 1) * 10})

home = ["9c0038_2e07ba4764b34d4b8364daebecf72d4d~mv2.jpg", "9c0038_8da8ec6ab5bb4181a0981bea517a1dfc~mv2.jpg",
        "9c0038_eb98c67a27d54105aa44668610f97b5a~mv2.jpg", "9c0038_f393c64d32c54f5e8c26147cabdc3482~mv2.jpg",
        "9c0038_1f2584b29b6d444fbdbc88b44f18fc36~mv2.jpg", "9c0038_f99130af54ea4c148ef3fa9c4fd80a34~mv2.jpg",
        "9c0038_abf764b9116d4d37bff702b111c89da9~mv2.jpg", "9c0038_dc421eb2c08d46f4ab9bc182dac9160b~mv2.jpg",
        "9c0038_e65b0f8194634662914ec0b6fb5f67f2~mv2.jpg", "9c0038_26d14bacf14c4360a846b95bee76b368~mv2.jpg",
        "9c0038_860844b8e4d24c41a523eec65fe2e10a~mv2.jpg"]
slides = [master(u, f"home/slide-{i+1:02d}") for i, u in enumerate(home)]
with open(os.path.join(ROOT, "src/_data/home.yml"), "w") as f:
    f.write("# Home page slideshow. Order = order shown.\nslides:\n" + "".join(f"  - {yq(s)}\n" for s in slides))

L = lambda names, film: [master(n, f"laurels/{film}-{i+1:02d}") for i, n in enumerate(names)]
stan = L(["9c0038_a3af3998c7c840a88854aac137afa25a.jpg", "9c0038_18061b2c1c14422b8e672941601b6ce3.jpg",
          "9c0038_570a05840ced4eac810e68ebfe9a6582.png", "9c0038_2bcb4f57855041a79b22521988abb219.jpg",
          "9c0038_598b24c6e5034812a481a54858129008.jpg", "9c0038_86d6d7f1153944dcae3fa66efd918e3b.jpg",
          "9c0038_a080c27bf5484e2580150a57b258ab1d.png", "9c0038_5ca62a6a4b3243d4b6a49706c33494c4.png",
          "9c0038_f6b45c5a846741b2b62a4625a702313c.jpg", "9c0038_cacf31695da74b70bb4aa08cac9bfe57.png",
          "9c0038_1215d94b8a644882b82e81b0510ee41e.jpg", "9c0038_8a12be5ce20746119858c17c8163bd7c.jpg"], "stan")
sylvia = L(["9c0038_82977d97554242c0a958dbb463f2d783~mv2.jpg", "9c0038_bd862856abbc4ceaa64e788cfe596c9a~mv2.png",
            "9c0038_1437f4ec705a444b8d7bd5ce2bccd7b0~mv2.png", "9c0038_79b89f4d05824f568c656a526655bbce~mv2.png",
            "9c0038_90e4d684fcfc4274bf3d0c54223d1d7b~mv2.png", "9c0038_e7cdba8b92a64fdb991c16d4d0bd05ae~mv2.png",
            "9c0038_e98f4f227b974ac69f1197eb709e3eb8~mv2.png", "9c0038_89469145067a4ffd94a4c2e1150fc170~mv2.png",
            "9c0038_e0c6df2dcc874ab1bf7b765a27d2eb01~mv2.png", "9c0038_f605badbde1b446783fe46c70b945327~mv2.png",
            "9c0038_c1f87a508a574b49ae0ad14950332e59~mv2.png", "9c0038_f23384418e174569902a7e0e3ba81e4c~mv2.png",
            "9c0038_45b5a9875de64078b2d6faf3d6444a77~mv2.png"], "sylvia")
write_md(os.path.join(ROOT, "src/films/stan.md"), {"title": "STAN", "year": "2014",
    "video": "https://vimeo.com/93214833", "heading": "", "link_label": "", "link_url": "", "laurels": stan, "order": 10})
write_md(os.path.join(ROOT, "src/films/sylvia.md"), {"title": "Sylvia", "year": "2019",
    "video": "https://vimeo.com/374435306", "heading": "", "link_label": "", "link_url": "", "laurels": sylvia, "order": 20})
write_md(os.path.join(ROOT, "src/films/soulstice.md"), {"title": "Soulstice", "year": "",
    "video": "https://vimeo.com/953454120", "heading": "\"SOULSTICE\" - COMING SOON",
    "link_label": "New Project Launched!", "link_url": "https://www.kickstarter.com/projects/soulstice/soulstice",
    "laurels": [], "order": 30})

site_imgs = {
  "about-background": "9c0038_65dbdddf201945d39d5bb107ad9ced34.jpg",
  "about-avatar": "9c0038_0449ca003c4f4c339cfdcb3638c3ef3c~mv2.png",
  "contact-photo": "9c0038_0cd000e5f85a43209cea0ba90bbe1544~mv2.jpg",
  "speech-bubble": "9c0038_f7424cfd042e41289b92fedf2b425b00.png",
  "paper-plane": "bfdf85_bb32704cfdf641b78b2207124c945fc8.png",
  "the-end": "9c0038_4c749d5289c54f7a99512b9dd3a1642f.jpg",
  "icon-instagram": "1668fefe9eca1566d239f5101c2af490.png",
  "icon-linkedin": "f81288cef4de8223015ce3dabe23a0c4.png",
  "store-placeholder": "9c0038_99c337956f974ba3bc8be8abfb831604.jpg",
}
for k, v in site_imgs.items(): print(k, master(v, f"site/{k}"))
print("done")
