import { useEffect, useState } from "react";
import { markReady } from "./ready.js";
import { getLenis } from "./lenis.js";

/* Only what the first screen needs. Work posters/previews stream in lazily as
   their sections approach, so the launch counter never waits on them. */
const ASSETS = ["/assets/spairo.webp", "/assets/logo1.webp", "/assets/avatar-mark.webp", "/assets/avatar-logo.webp", "/assets/posters/reel.webp"];

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = url;
  });
}

/* Resolves after `ms` even if the promise hasn't, so one slow file (or a
   blocked font CDN) can never stall the launch. */
const withTimeout = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]);

export function Preloader() {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState("loading"); // loading | leaving | gone

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Always open on the hero; the launch screen covers any restored position.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!location.hash) window.scrollTo(0, 0);
    const lenis = getLenis();
    lenis?.stop();

    const jobs = [
      ...ASSETS.map((u) => withTimeout(loadImage(u), 6000)),
      withTimeout(document.fonts?.ready ?? Promise.resolve(), 4000),
    ];
    const total = jobs.length;
    let loaded = 0;
    jobs.forEach((j) => j.then(() => (loaded += 1)));

    const start = performance.now();
    const minTime = reduced ? 150 : 1100;
    const maxTime = 7000;
    let display = 0;
    let raf = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      lenis?.start();
      setCount(100);
      setPhase("leaving");
      // hero intro starts while the curtain lifts
      setTimeout(markReady, reduced ? 0 : 380);
      setTimeout(() => setPhase("gone"), reduced ? 250 : 1300);
    };

    const tick = () => {
      const elapsed = performance.now() - start;
      // ease toward real progress, but never faster than the minimum runtime
      const real = loaded / total;
      const timeCap = Math.min(1, elapsed / minTime);
      const target = Math.min(real, timeCap, loaded >= total ? 1 : 0.96);
      display += (target - display) * 0.12;
      setCount(Math.round(display * 100));
      if ((loaded >= total && elapsed >= minTime && display > 0.985) || elapsed >= maxTime) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // rAF pauses in background tabs; this guarantees the page always opens.
    const hardStop = setTimeout(finish, maxTime + 600);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hardStop);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div className={`preloader${phase === "leaving" ? " is-leaving" : ""}`} aria-hidden="true">
      <div className="preloader-top">
        <img className="preloader-logo" src="/assets/logo1.webp" alt="" />
        <span className="mono">Spairo — Video Editor</span>
      </div>
      <div className="preloader-bottom">
        <span className="mono preloader-label">Loading experience</span>
        <span className="preloader-num">
          {String(count).padStart(3, "0")}
        </span>
      </div>
      <span className="preloader-bar">
        <i style={{ transform: `scaleX(${count / 100})` }} />
      </span>
    </div>
  );
}
