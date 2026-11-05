// Gallery lightbox / slideshow. Data comes from <script id="gallery-data">.
(() => {
  const dataEl = document.getElementById("gallery-data"); if (!dataEl) return;
  const projects = JSON.parse(dataEl.textContent);
  // flatten: every image (and video) of every project is one slide
  const slides = [];
  projects.forEach((p, pi) => {
    const parts = p.images.length + (p.video ? 1 : 0);
    let k = 0;
    if (p.video) slides.push({ pi, p, video: p.video, part: ++k, parts });
    p.images.forEach((im) => slides.push({ pi, p, im, part: ++k, parts }));
  });
  const firstOf = (pi) => slides.findIndex((s) => s.pi === pi);

  const lb = document.createElement("div");
  lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Gallery viewer");
  lb.innerHTML = `
    <div class="lb-stage"></div>
    <div class="lb-cap"><h2 class="lb-title"></h2><p class="lb-count"><span></span><button class="lb-play" type="button">&#9654; Slideshow</button></p><p class="lb-desc"></p></div>
    <button class="lb-close" type="button" aria-label="Close">&times;</button>
    <button class="lb-nav lb-prev" type="button" aria-label="Previous"><svg viewBox="0 0 20 40"><polyline points="18,2 2,20 18,38"/></svg></button>
    <button class="lb-nav lb-next" type="button" aria-label="Next"><svg viewBox="0 0 20 40"><polyline points="2,2 18,20 2,38"/></svg></button>`;
  document.body.appendChild(lb);
  const stage = lb.querySelector(".lb-stage"), title = lb.querySelector(".lb-title"),
        desc = lb.querySelector(".lb-desc"), count = lb.querySelector(".lb-count span"), playBtn = lb.querySelector(".lb-play");
  let cur = 0, lastFocus = null, timer = null;

  const preload = (s) => { if (s && s.im) { const i = new Image(); i.srcset = s.im.srcset; i.sizes = "100vw"; i.src = s.im.src; } };
  function render() {
    const s = slides[cur];
    stage.innerHTML = "";
    if (s.video) {
      const wrap = document.createElement("div"); wrap.className = "lb-video";
      if (s.video.type === "file") wrap.innerHTML = `<video src="${s.video.embed}" controls autoplay playsinline></video>`;
      else wrap.innerHTML = `<iframe src="${s.video.embed}${s.video.embed.includes("?") ? "&" : "?"}autoplay=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title=""></iframe>`;
      wrap.firstElementChild.title = s.p.title;
      stage.appendChild(wrap);
    } else {
      const img = document.createElement("img");
      img.src = s.im.src; if (s.im.srcset) { img.srcset = s.im.srcset; img.sizes = "100vw"; }
      img.width = s.im.w; img.height = s.im.h; img.alt = s.p.title; img.decoding = "async";
      stage.appendChild(img);
    }
    title.textContent = s.p.title + (s.p.price ? ` – ${s.p.price}` : "");
    desc.textContent = s.p.description || "";
    count.textContent = `${s.pi + 1}/${projects.length}` + (s.parts > 1 ? `  ·  photo ${s.part} of ${s.parts}` : "");
    preload(slides[(cur + 1) % slides.length]); preload(slides[(cur - 1 + slides.length) % slides.length]);
  }
  const go = (n) => { cur = (n + slides.length) % slides.length; render(); };
  const stopShow = () => { clearInterval(timer); timer = null; playBtn.innerHTML = "&#9654; Slideshow"; };
  const startShow = () => { stopShow(); timer = setInterval(() => go(cur + 1), 3500); playBtn.innerHTML = "&#10074;&#10074; Pause"; };
  function open(pi) {
    lastFocus = document.activeElement; cur = Math.max(0, firstOf(pi));
    lb.classList.add("open"); document.documentElement.style.overflow = "hidden"; render(); lb.querySelector(".lb-close").focus();
  }
  function close() {
    stopShow(); lb.classList.remove("open"); stage.innerHTML = ""; document.documentElement.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll(".tile-btn").forEach((b) => b.addEventListener("click", () => open(+b.dataset.project)));
  lb.querySelector(".lb-close").onclick = close;
  lb.querySelector(".lb-prev").onclick = () => { stopShow(); go(cur - 1); };
  lb.querySelector(".lb-next").onclick = () => { stopShow(); go(cur + 1); };
  playBtn.onclick = () => (timer ? stopShow() : startShow());
  stage.addEventListener("click", (e) => { if (e.target === stage) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") { stopShow(); go(cur + 1); }
    else if (e.key === "ArrowLeft") { stopShow(); go(cur - 1); }
    else if (e.key === "Tab") { // keep focus inside
      const f = [...lb.querySelectorAll("button")]; const i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  let x0 = null;
  stage.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  stage.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { stopShow(); go(cur + (dx < 0 ? 1 : -1)); } x0 = null; });
  // deep link: /painting/#3 opens the 3rd project
  const h = parseInt(location.hash.slice(1), 10); if (h > 0 && h <= projects.length) open(h - 1);
})();
