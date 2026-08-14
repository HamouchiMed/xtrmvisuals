import { useEffect, useRef } from "react";
import { WebGLReel } from "./WebGLReel.jsx";
import { getLenis } from "./lenis.js";

/* -------- layout knobs -------- */
const START_W = 0.39;   // video width at start, fraction of stage width (left column)
const START_LEFT = 0.05;
const START_TOP = 0.42; // start vertical position (under the heading)
const TARGET_W = 0.86;  // video width when fully grown (option A: big with margin)
const TARGET_MAXH = 0.82; // cap grown height to this fraction of stage height
const FADE_END = 0.5;   // text is fully gone by this scroll progress
const MARKS_IN = 0.55;  // + marks stay hidden until this progress, then fade in
const PIN_TRAVEL = 1.0; // extra viewport-heights of scroll used to play the animation

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function ShowcaseReel({ src }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const headingRef = useRef(null);
  const copyRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const heading = headingRef.current;
    const copy = copyRef.current;
    const frame = frameRef.current;
    if (!section || !stage || !frame) return;
    const marks = frame.querySelectorAll(".reel-marks");

    let raf = 0;
    let disposed = false;
    let enabled = true;
    let start0 = { scale: 1, tx: 0, ty: 0 };

    const layout = () => {
      const sw = stage.clientWidth;
      const sh = stage.clientHeight;
      enabled = sw > 860; // pin only on wider screens; mobile stacks statically

      if (!enabled) {
        section.style.height = "auto";
        frame.style.position = "";
        frame.style.left = frame.style.top = frame.style.width = frame.style.height = "";
        frame.style.transform = "";
        heading.style.opacity = copy.style.opacity = "";
        heading.style.transform = copy.style.transform = "";
        marks.forEach((m) => (m.style.opacity = ""));
        return;
      }

      section.style.height = `${(1 + PIN_TRAVEL) * 100}vh`;

      // grown (end) box — big, centered, 16:9, capped by height
      let targetW = Math.min(sw * TARGET_W, sh * TARGET_MAXH * (16 / 9));
      let targetH = (targetW * 9) / 16;
      const targetLeft = (sw - targetW) / 2;
      const targetTop = (sh - targetH) / 2;

      // frame's real layout box = the grown box (so it renders crisp when big)
      frame.style.position = "absolute";
      frame.style.left = `${targetLeft}px`;
      frame.style.top = `${targetTop}px`;
      frame.style.width = `${targetW}px`;
      frame.style.height = `${targetH}px`;

      // start (small, left) box — we reach it by transforming the grown frame down
      const startW = sw * START_W;
      const startH = (startW * 9) / 16;
      const startLeft = sw * START_LEFT;
      const startTop = sh * START_TOP;

      start0 = {
        scale: startW / targetW,
        tx: startLeft + startW / 2 - (targetLeft + targetW / 2),
        ty: startTop + startH / 2 - (targetTop + targetH / 2),
      };
    };

    const apply = (p) => {
      const t = easeInOut(p);
      const scale = lerp(start0.scale, 1, t);
      const tx = lerp(start0.tx, 0, t);
      const ty = lerp(start0.ty, 0, t);
      frame.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;

      const fade = clamp(1 - p / FADE_END, 0, 1);
      heading.style.opacity = fade;
      heading.style.transform = `translateY(${-p * 30}px)`;
      copy.style.opacity = fade;
      copy.style.transform = `translateX(${p * 48}px)`;

      // + marks: hidden while small, fade in as the video reaches full size
      const marksOp = clamp((p - MARKS_IN) / (1 - MARKS_IN), 0, 1);
      marks.forEach((m) => {
        m.style.opacity = marksOp;
      });
    };

    layout();

    if (reduced || !enabled) {
      if (enabled) apply(0);
      return;
    }

    getLenis(); // ensure the shared smooth-scroll engine is running

    const progress = () => {
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - stage.offsetHeight;
      return travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;
    };

    apply(progress()); // set the start state synchronously — no load flash

    const loop = () => {
      if (disposed) return;
      if (enabled) apply(progress());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="reel" id="reel" aria-label="Showreel" ref={sectionRef}>
      <div className="showcase-stage" ref={stageRef}>
        <h2 className="showcase-heading" ref={headingRef}>
          Every Frame. Every Detail. <span>Perfected</span>
        </h2>

        <div className="showcase-copy" ref={copyRef}>
          <p>
            I'm Spairo, a professional video editor specializing in every style of
            editing—from short-form content and commercials to documentaries,
            podcasts, YouTube videos, and cinematic brand films. I've worked with
            350+ clients worldwide, delivering edits that don't just look
            great—they drive results. For me, clients are more than projects;
            through trust and consistency, many become long-term partners and
            genuine friends.
          </p>

          <a
            className="showcase-cta"
            href="#approach"
            onClick={(e) => {
              const el = document.querySelector("#approach");
              if (!el) return;
              e.preventDefault();
              const lenis = getLenis();
              if (lenis) lenis.scrollTo(el, { offset: 0 });
              else el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="showcase-cta-dot" aria-hidden="true"></span>
            My Approach
          </a>
        </div>

        <div className="reel-group" ref={frameRef}>
          <div className="reel-marks reel-marks-top" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>+</span>
            ))}
          </div>

          <div className="reel-frame">
            <WebGLReel src={src} />

            <div className="reel-overlay" aria-hidden="true">
              <span>PLAY</span>
              <span className="reel-play">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span>REEL</span>
            </div>
          </div>

          <div className="reel-marks reel-marks-bottom" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>+</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
