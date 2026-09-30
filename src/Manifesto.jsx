import { useRef } from "react";
import { useVisibleFrame } from "./reveal.jsx";

const text =
  "I turn raw footage into stories people can't scroll past — sharp pacing, clean sound, and hooks that keep viewers watching to the very last frame.";

const accent = new Set(["stories", "can't", "scroll", "past", "last", "frame."]);

/* Words light up one by one as the paragraph travels through the viewport. */
export function Manifesto() {
  const ref = useRef(null);
  const words = text.split(" ");

  useVisibleFrame(ref, () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.85;
    const end = vh * 0.35;
    const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height * 0.6)));
    el.style.setProperty("--p", (p * words.length).toFixed(2));
  });

  return (
    <section className="manifesto" aria-label="What I do">
      <p className="mono section-tag">( 02 — Philosophy )</p>
      <p className="manifesto-text" ref={ref}>
        {words.map((w, i) => (
          <span key={i} className={accent.has(w) ? "mw is-accent" : "mw"} style={{ "--i": i }}>
            {w}{" "}
          </span>
        ))}
      </p>
    </section>
  );
}
