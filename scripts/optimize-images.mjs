// Builds web-sized WebP versions of everything in media/ into _site/media/{thumb,medium,large}/
// and writes src/_data/imagemeta.json (width/height per image) for the templates.
// Runs before every Eleventy build (locally and in GitHub Actions), so photos uploaded
// through Pages CMS straight from a phone/camera are resized automatically.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "media";
const OUT = "_site/media";
const SIZES = { thumb: 700, medium: 1200, large: 2000 }; // long edge, px
const QUALITY = { thumb: 72, medium: 80, large: 80 };
const EXT = /\.(jpe?g|png|webp|gif|tiff?|avif)$/i;

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (EXT.test(e.name)) out.push(p);
  }
  return out;
}
const newer = async (a, b) => {
  try { return (await fs.stat(b)).mtimeMs >= (await fs.stat(a)).mtimeMs; } catch { return false; }
};

const files = await walk(SRC);
const meta = {};
let made = 0;
for (const file of files) {
  const rel = path.relative(SRC, file).split(path.sep).join("/");
  const key = "/media/" + rel;
  const relWebp = rel.replace(EXT, ".webp");
  let info;
  try { info = await sharp(file, { limitInputPixels: false }).rotate().metadata(); }
  catch (e) { console.warn("skip (unreadable):", rel, e.message); continue; }
  const rotated = (info.orientation || 1) >= 5;
  const w = rotated ? info.height : info.width, h = rotated ? info.width : info.height;
  meta[key] = { w, h };
  for (const [name, max] of Object.entries(SIZES)) {
    const dst = path.join(OUT, name, relWebp);
    if (await newer(file, dst)) continue;
    await fs.mkdir(path.dirname(dst), { recursive: true });
    await sharp(file, { limitInputPixels: false }).rotate()
      .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY[name], effort: 5 }).toFile(dst);
    made++;
  }
}
await fs.mkdir("src/_data", { recursive: true });
await fs.writeFile("src/_data/imagemeta.json", JSON.stringify(meta, null, 1));
console.log(`[images] ${files.length} source images, ${made} new web versions written`);
