// Home page slideshow: fade, arrows, dots, swipe, autoplay (pauses on hover/hidden tab)
(() => {
  const hero = document.querySelector(".hero"); if (!hero) return;
  const slides = [...hero.querySelectorAll(".hero-slide")];
  const dots = [...hero.querySelectorAll(".hero-dots button")];
  let i = 0, timer = null;
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("is-active", k === i));
    dots.forEach((d, k) => d.setAttribute("aria-selected", k === i ? "true" : "false"));
    const next = slides[(i + 1) % slides.length].querySelector("img");
    if (next) next.loading = "eager";
  };
  const play = () => { stop(); if (!matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(() => show(i + 1), 5000); };
  const stop = () => clearInterval(timer);
  hero.querySelector(".prev").onclick = () => { show(i - 1); play(); };
  hero.querySelector(".next").onclick = () => { show(i + 1); play(); };
  dots.forEach((d, k) => d.onclick = () => { show(k); play(); });
  hero.addEventListener("mouseenter", stop); hero.addEventListener("mouseleave", play);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : play());
  let x0 = null;
  hero.addEventListener("touchstart", (e) => x0 = e.touches[0].clientX, { passive: true });
  hero.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { show(i + (dx < 0 ? 1 : -1)); play(); } x0 = null; });
  play();
})();
