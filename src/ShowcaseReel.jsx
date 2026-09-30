import { useEffect, useRef } from "react";
import { WebGLReel } from "./WebGLReel.jsx";
import { anchorClick } from "./lenis.js";
import { openLightbox } from "./Lightbox.jsx";
import { Words, useVisibleFrame } from "./reveal.jsx";
import { reel } from "./site.jsx";

/* -------- layout knobs -------- */
const START_W = 0.39;   // video width at start, fraction of stage width (left column)
const START_LEFT = 0.05;
const START_TOP = 0.46; // start vertical position (under the heading)
const TARGET_W = 0.86;  // video width when fully grown
const TARGET_MAXH = 0.8; // cap grown height to this fraction of stage height
const FADE_END = 0.5;   // text is fully gone by this scroll progress
const MARKS_IN = 0.55;  // + marks stay hidden until this progress, then fade in
const PIN_TRAVEL = 1.0; // extra viewport-heights of scroll used to play the animation

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function ShowcaseReel({ src, preview, poster }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const tagRef = useRef(null);
  const headingRef = useRef(null);
  const copyRef = useRef(null);
  const frameRef = useRef(null);
  const layoutRef = useRef({ enabled: false, start: { scale: 1, tx: 0, ty: 0 } });

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const frame = frameRef.current;
    if (!section || !stage || !frame) return undefined;

    const layout = () => {
      const sw = stage.clientWidth;
      const sh = window.innerHeight;
      const L = layoutRef.current;
      L.enabled = sw > 860; // pin only on wider screens; mobile stacks statically

      if (!L.enabled) {
        section.style.height = "";
        frame.style.position = "";
        frame.style.left = frame.style.top = frame.style.width = frame.style.height = "";
        frame.style.transform = "";
        return;
      }

      section.style.height = `${(1 + PIN_TRAVEL) * 100}vh`;

      // grown (end) box — big, centered, 16:9, capped by height
      const targetW = Math.min(sw * TARGET_W, sh * TARGET_MAXH * (16 / 9));
      const targetH = (targetW * 9) / 16;
      const targetLeft = (sw - targetW) / 2;
      const targetTop = (sh - targetH) / 2;

      // frame's real layout box = the grown box (so it renders crisp when big)
      frame.style.position = "absolute";
      frame.style.left = `${targetLeft}px`;
      frame.style.top = `${targetTop}px`;
      frame.style.width = `${targetW}px`;
      frame.style.height = `${targetH}px`;

      // start (small, left) box — reached by transforming the grown frame down
      const startW = sw * START_W;
      const startH = (startW * 9) / 16;
      const startLeft = sw * START_LEFT;
      const startTop = sh * START_TOP;

      L.start = {
        scale: startW / targetW,
        tx: startLeft + startW / 2 - (targetLeft + targetW / 2),
        ty: startTop + startH / 2 - (targetTop + targetH / 2),
      };
    };

    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, []);

  useVisibleFrame(sectionRef, () => {
    const L = layoutRef.current;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const frame = frameRef.current;
    if (!L.enabled || !section || !stage || !frame) return;

    const rect = section.getBoundingClientRect();
    const travel = section.offsetHeight - stage.offsetHeight;
    const p = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;

    const t = easeInOut(p);
    const scale = lerp(L.start.scale, 1, t);
    const tx = lerp(L.start.tx, 0, t);
    const ty = lerp(L.start.ty, 0, t);
    frame.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;

    const fade = clamp(1 - p / FADE_END, 0, 1);
    tagRef.current.style.opacity = fade;
    headingRef.current.style.opacity = fade;
    headingRef.current.style.transform = `translate3d(0, ${-p * 40}px, 0)`;
    copyRef.current.style.opacity = fade;
    copyRef.current.style.transform = `translate3d(${p * 60}px, 0, 0)`;
    frame.style.setProperty("--marks", clamp((p - MARKS_IN) / (1 - MARKS_IN), 0, 1));
  });

  return (
    <section className="reel" id="about" aria-label="About and showreel" ref={sectionRef}>
      <div className="showcase-stage" ref={stageRef}>
        <p className="mono section-tag showcase-tag" ref={tagRef}>
          ( 01 — About )
        </p>

        <h2 className="showcase-heading" ref={headingRef}>
          <span data-reveal className="reveal-block">
            <Words text="Every Frame." /> <br />
            <Words text="Every Detail." /> <br />
            <em className="serif-accent">
              <Words text="Perfected." />
            </em>
          </span>
        </h2>

        <div className="showcase-copy" ref={copyRef}>
          <p data-reveal="fade">
            I'm Spairo, a professional video editor specializing in every style of editing—from
            short-form content and commercials to documentaries, podcasts, YouTube videos, and
            cinematic brand films. I've worked with 350+ clients worldwide, delivering edits that
            don't just look great—they drive results. For me, clients are more than projects;
            through trust and consistency, many become long-term partners and genuine friends.
          </p>

          <div data-reveal="fade" style={{ "--d": "0.15s" }}>
            <a className="btn btn-light" href="#approach" onClick={anchorClick("#approach")} data-magnetic>
              <span className="btn-dot" aria-hidden="true"></span>
              <span>My approach</span>
            </a>
          </div>
        </div>

        <div className="reel-group" ref={frameRef}>
          <div className="reel-marks reel-marks-top" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>+</span>
            ))}
          </div>

          <button
            type="button"
            className="reel-frame"
            onClick={() => openLightbox({ ...reel, src })}
            data-cursor="Play reel"
            aria-label="Play the showreel"
          >
            <WebGLReel src={src} preview={preview} poster={poster} />

            <span className="reel-overlay" aria-hidden="true">
              <span>PLAY</span>
              <span className="reel-play">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span>REEL</span>
            </span>
          </button>

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
