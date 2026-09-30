import { useEffect, useRef } from "react";
import { onReady } from "./ready.js";

/* Splits a string into masked words. Any ancestor with [data-reveal] slides
   the words up (staggered) once it scrolls into view. */
export function Words({ text }) {
  return text.split(/(\s+)/).map((part, i) =>
    /^\s+$/.test(part) ? (
      " "
    ) : (
      <span className="w" key={i}>
        <span>{part}</span>
      </span>
    ),
  );
}

/* One IntersectionObserver for every [data-reveal] element on the page.
   Adds .is-in once, after the launch screen has cleared. */
export function useRevealRoot() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    els.forEach((el) =>
      el.querySelectorAll(".w > span").forEach((s, i) => s.style.setProperty("--wi", i)),
    );

    let io = null;
    const off = onReady(() => {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
      );
      els.forEach((el) => io.observe(el));
    });

    return () => {
      off();
      io?.disconnect();
    };
  }, []);
}

/* Runs `cb(time)` every animation frame, but only while `ref` is on (or near)
   the screen, so off-screen sections cost nothing. */
export function useVisibleFrame(ref, cb, margin = "20%") {
  const cbRef = useRef(cb);
  cbRef.current = cb;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    let running = false;

    const loop = (t) => {
      cbRef.current(t);
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(loop);
        } else if (!e.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: `${margin} 0px ${margin} 0px` },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ref, margin]);
}
