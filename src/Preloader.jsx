import { useEffect, useState } from "react";

/* Critical, above-the-first-scroll media — roughly the site's ~2 MB initial
   payload. Full-res work videos are NOT here; they stream on demand in the
   lightbox, so the launch counter never waits on them. */
const ASSETS = [
  "/assets/spairo.webp",
  "/assets/logo1.webp",
  "/assets/avatar-logo.webp",
  "/assets/avatar-mark.webp",
  "/assets/posters/reel.webp",
  ...Array.from({ length: 8 }, (_, i) => `/assets/posters/work${i + 1}.webp`),
  "/assets/previews/reel.mp4",
  ...Array.from({ length: 8 }, (_, i) => `/assets/previews/work${i + 1}.mp4`),
];

const isVideo = (u) => u.endsWith(".mp4");

/* Resolves when an asset is ready enough to display, or on error/timeout so a
   single slow file can never stall the launch. */
function loadAsset(url) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(finish, 12000);

    if (isVideo(url)) {
      const v = document.createElement("video");
      v.preload = "auto";
      v.muted = true;
      v.oncanplaythrough = finish;
      v.onloadeddata = finish; // fallback: first frame decoded
      v.onerror = finish;
      v.src = url;
      v.load();
    } else {
      const img = new Image();
      img.onload = finish;
      img.onerror = finish;
      img.src = url;
    }
  });
}

export function Preloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.style.overflow = "hidden";

    const total = ASSETS.length;
    let loaded = 0;
    let target = 0;
    ASSETS.forEach((u) =>
      loadAsset(u).then(() => {
        loaded += 1;
        target = loaded / total;
      }),
    );

    const startTime = performance.now();
    const minTime = reduced ? 200 : 800; // let the animation breathe
    const maxTime = reduced ? 400 : 12000; // hard safety cap

    let raf = 0;
    let hardStop = 0;
    let display = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(hardStop);
      setCount(100);
      setDone(true);
      setTimeout(() => {
        setHidden(true);
        document.body.style.overflow = "";
      }, 650);
    };

    const tick = () => {
      const elapsed = performance.now() - startTime;
      // ease toward real progress; hold just under 100 until truly loaded
      const cap = loaded >= total ? 1 : 0.97;
      display += (Math.min(target, cap) - display) * 0.08;
      setCount(Math.round(display * 100));

      if ((loaded >= total && elapsed >= minTime) || elapsed >= maxTime) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Safety net independent of rAF (which pauses on hidden tabs): guarantees
    // the launch screen always clears even if the animation loop never runs.
    hardStop = setTimeout(finish, maxTime + 800);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hardStop);
      document.body.style.overflow = "";
    };
  }, []);

  if (hidden) return null;

  return (
    <div className={`preloader${done ? " done" : ""}`} aria-hidden="true">
      <div className="preloader-inner">
        <img className="preloader-logo" src="/assets/logo1.webp" alt="" />
        <span className="preloader-num">
          {count}
          <i>%</i>
        </span>
        <span className="preloader-bar">
          <i style={{ width: `${count}%` }} />
        </span>
        <span className="preloader-label">Loading experience</span>
      </div>
    </div>
  );
}
