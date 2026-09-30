import { useEffect, useRef } from "react";
import { HeroGL } from "./HeroGL.jsx";
import { RotatingWord } from "./RotatingWord.jsx";
import { Words, useVisibleFrame } from "./reveal.jsx";
import { anchorClick, getLenis } from "./lenis.js";
import { openLightbox } from "./Lightbox.jsx";
import { Arrow, reel } from "./site.jsx";

const roles = ["Video Editor.", "Storyteller.", "Colorist.", "Motion Designer."];
const proofInitials = ["A", "M", "T", "+"];

const comments = [
  { user: "@tomas", text: "Bestest edit in 48 hours.", avatar: "/assets/avatar-mark.webp" },
  { user: "@mark_locus", text: "This edit boosted my retention rate by 35%!", avatar: "/assets/avatar-logo.webp" },
];

const chips = ["pr", "ae", "ps", "au", "ai", "dv"];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function Hero() {
  const heroRef = useRef(null);
  const figureRef = useRef(null);
  const state = useRef({ tx: 0, ty: 0, cx: 0, cy: 0, layers: null });

  useEffect(() => {
    const hero = heroRef.current;
    const s = state.current;
    s.fine =window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    s.layers = [
      [hero.querySelector(".tool-chips"), 22],
      [hero.querySelector(".floating-comments"), 14],
      [hero.querySelector(".photo-img"), -12],
    ].filter(([el]) => el);
    s.copy = hero.querySelector(".hero-copy");
    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      s.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      s.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Pointer parallax (chips / comments / portrait at different depths) and a
  // gentle scroll-away drift of the copy. Runs only while the hero is visible.
  useVisibleFrame(heroRef, () => {
    const hero = heroRef.current;
    const s = state.current;
    if (!hero || !s.layers) return;

    if (s.fine) {
      s.cx += (s.tx - s.cx) * 0.06;
      s.cy += (s.ty - s.cy) * 0.06;
      s.layers.forEach(([el, d]) => {
        el.style.transform = `translate3d(${s.cx * d}px, ${s.cy * d}px, 0)`;
      });
    }

    const y = getLenis()?.scroll ?? window.scrollY;
    const p = clamp(y / hero.offsetHeight, 0, 1);
    if (s.copy) {
      s.copy.style.transform = `translate3d(0, ${p * -90}px, 0)`;
      s.copy.style.opacity = String(1 - p * 1.1);
    }
    if (figureRef.current) figureRef.current.style.transform = `translate3d(0, ${p * 70}px, 0)`;
  });

  return (
    <div className="hero-shell">
      <section className="hero" id="top" ref={heroRef} aria-label="Introduction">
        <HeroGL glowRef={figureRef} />
        <div className="hero-grain" aria-hidden="true"></div>

        <div className="hero-copy">
          <span className="avail-pill" data-reveal="fade">
            <span className="avail-dot" aria-hidden="true"></span>
            Available for work
          </span>

          <h1 className="hero-title" data-reveal>
            <span className="hero-line">
              <Words text="Hi, I'm Spairo" />
            </span>
            <span className="hero-role">
              <span className="w">
                <span>
                  <RotatingWord words={roles} />
                </span>
              </span>
            </span>
          </h1>

          <p className="hero-subtitle" data-reveal="fade" style={{ "--d": "0.35s" }}>
            A self-taught video editor turning raw footage into scroll-stopping stories. I focus on
            sharp pacing, clean sound, and hooks that keep viewers watching to the end.
          </p>

          <div className="hero-actions" data-reveal="fade" style={{ "--d": "0.45s" }}>
            <a className="btn btn-primary" href="#contact" onClick={anchorClick("#contact")} data-magnetic>
              <span>Start a project</span>
              <span className="btn-icon" aria-hidden="true">
                <Arrow />
              </span>
            </a>
            <button type="button" className="btn btn-ghost" onClick={() => openLightbox(reel)} data-magnetic>
              <span className="btn-play" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span>Watch showreel</span>
            </button>
          </div>

          <div className="social-proof" data-reveal="fade" style={{ "--d": "0.55s" }}>
            <div className="proof-avatars" aria-hidden="true">
              {proofInitials.map((t, i) => (
                <span key={t} className={`proof-avatar pa-${i + 1}`}>
                  {t}
                </span>
              ))}
            </div>
            <span className="proof-text">
              <strong>350+</strong> happy clients worldwide
            </span>
          </div>
        </div>

        <div className="hero-figure" ref={figureRef}>
          <div className="photo-glow" aria-hidden="true"></div>
          <div className="photo-stage" aria-hidden="true"></div>
          <img className="photo-img" src="/assets/spairo.webp" alt="Portrait of Spairo" width="375" height="666" decoding="async" fetchPriority="high" />

          <div className="tool-chips" aria-hidden="true">
            {chips.map((c) => (
              <span key={c} className={`tool-chip chip-${c}`}>
                {c[0].toUpperCase() + c[1]}
              </span>
            ))}
          </div>

          <div className="floating-comments" aria-hidden="true">
            {comments.map((c, i) => (
              <article className={`comment-card card-${i + 1}`} key={c.user}>
                <img src={c.avatar} alt="" decoding="async" />
                <div>
                  <strong>{c.user}</strong>
                  <p>{c.text}</p>
                  <span className="reply">Reply</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="hero-foot">
          <a className="scroll-cue" href="#about" onClick={anchorClick("#about")}>
            <span className="scroll-cue-line" aria-hidden="true"></span>
            <span className="mono">Scroll to explore</span>
          </a>
          <span className="mono hero-foot-mid">Editing · Motion · Color · Sound</span>
          <span className="mono hero-foot-end">XTRM Visuals ©2026</span>
        </div>
      </section>
    </div>
  );
}
