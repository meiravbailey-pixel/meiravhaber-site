import fs from "node:fs";
import * as yaml from "js-yaml";
import { HtmlBasePlugin } from "@11ty/eleventy";

const PATH_PREFIX = process.env.PATH_PREFIX || "/";

const SIZES = { thumb: 700, medium: 1200, large: 2000 };

function loadMeta() {
  try { return JSON.parse(fs.readFileSync("src/_data/imagemeta.json", "utf8")); } catch { return {}; }
}

export default function (eleventyConfig) {
  // Rewrites root-relative URLs in HTML attributes (href/src/srcset) with PATH_PREFIX
  eleventyConfig.addPlugin(HtmlBasePlugin);
  // For URLs inside JSON/JS (lightbox data) that HtmlBasePlugin can't see
  const pre = PATH_PREFIX.replace(/\/$/, "");
  eleventyConfig.addFilter("pfx", (v) => typeof v === "string"
    ? v.split(", ").map((u) => (u.startsWith("/") && !u.startsWith("//") ? pre + u : u)).join(", ") : v);
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addWatchTarget("media/");
  // _site/media is produced by scripts/optimize-images.mjs – keep it between builds
  eleventyConfig.setServerOptions({ watch: ["_site/media/**/*"] });

  // --- images: "/media/foo.jpg" -> web versions ---------------------------------
  const meta = loadMeta();
  const variant = (src, size) => {
    if (!src) return "";
    if (!src.startsWith("/media/")) return src; // external URL
    return src.replace(/^\/media\//, `/media/${size}/`).replace(/\.[a-z0-9]+$/i, ".webp");
  };
  eleventyConfig.addFilter("img", (src, size = "large") => variant(src, size));
  eleventyConfig.addFilter("imgsize", (src) => meta[src] || { w: 1600, h: 1200 });
  eleventyConfig.addFilter("srcset", (src) => {
    if (!src || !src.startsWith("/media/")) return "";
    const m = meta[src] || { w: 2000, h: 1500 };
    const long = Math.max(m.w, m.h);
    const seen = new Set();
    return Object.entries(SIZES).map(([name, max]) => {
      const w = Math.round(m.w * Math.min(1, max / long));
      if (seen.has(w)) return null; seen.add(w);
      return `${variant(src, name)} ${w}w`;
    }).filter(Boolean).join(", ");
  });

  // --- video links (YouTube / Vimeo / direct .mp4) --------------------------------
  const parseVideo = (url) => {
    if (!url) return null;
    url = String(url).trim();
    let m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
    if (m) return { type: "youtube", id: m[1],
      embed: `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0`,
      thumb: `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` };
    m = url.match(/vimeo\.com\/(?:video\/|channels\/[\w-]+\/|groups\/[\w-]+\/videos\/)?(\d+)(?:\/([0-9a-f]+))?/);
    if (m) {
      const h = m[2] || (url.match(/[?&]h=([0-9a-f]+)/) || [])[1];
      return { type: "vimeo", id: m[1],
        embed: `https://player.vimeo.com/video/${m[1]}?${h ? `h=${h}&` : ""}title=0&byline=0&portrait=0&dnt=1`,
        thumb: `https://vumbnail.com/${m[1]}.jpg` };
    }
    if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return { type: "file", embed: url, thumb: "" };
    return null;
  };
  eleventyConfig.addFilter("video", parseVideo);

  // --- collections --------------------------------------------------------------
  const byOrder = (a, b) =>
    (Number(a.data.order) || 0) - (Number(b.data.order) || 0) ||
    String(b.data.project_date || "").localeCompare(String(a.data.project_date || "")) ||
    String(a.data.title).localeCompare(String(b.data.title));
  eleventyConfig.addCollection("projectsSorted", (api) => api.getFilteredByGlob("src/projects/*.md").sort(byOrder));
  eleventyConfig.addCollection("filmsSorted", (api) => api.getFilteredByGlob("src/films/*.md").sort(byOrder));
  eleventyConfig.addFilter("inCategory", (items, key) => items.filter((p) => p.data.category === key));
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v).replace(/</g, "\\u003c"));
  eleventyConfig.addFilter("telHref", (p) => "tel:+1" + String(p).replace(/\D/g, ""));
  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    pathPrefix: PATH_PREFIX,
  };
}
