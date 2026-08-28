import { useEffect, useRef, useState } from "react";
import { ShowcaseReel } from "./ShowcaseReel.jsx";
import { StatsBand } from "./StatsBand.jsx";
import { Services } from "./Services.jsx";
import { Approach } from "./Approach.jsx";
import { WhyMe } from "./WhyMe.jsx";
import { Skills } from "./Skills.jsx";
import { FeaturedWork } from "./FeaturedWork.jsx";
import { Testimonials } from "./Testimonials.jsx";
import { Contact } from "./Contact.jsx";
import { Scrollbar } from "./Scrollbar.jsx";
import { Starfield } from "./Starfield.jsx";
import { Preloader } from "./Preloader.jsx";
import { RotatingWord } from "./RotatingWord.jsx";
import { getLenis } from "./lenis.js";

const roles = ["Video Editor.", "Storyteller.", "Colorist.", "Motion Designer."];

const proofInitials = ["A", "M", "T", "+"];

function scrollToSelector(e, selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  e.preventDefault();
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset: 0 });
  else el.scrollIntoView({ behavior: "smooth" });
}

const navLeft = ["Home", "About"];
const navRight = ["Work", "Contact"];

const navTargets = {
  home: "#top",
  about: "#reel",
  work: "#work",
  contact: "#contact",
};

function scrollToNav(e, link) {
  const selector = navTargets[link.toLowerCase()];
  const el = selector && document.querySelector(selector);
  if (!el) return;
  e.preventDefault();
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset: 0 });
  else el.scrollIntoView({ behavior: "smooth" });
}

function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const update = (y) => setShow(y > window.innerHeight * 0.8);
    const onScroll = () => update(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const lenis = getLenis();
    const onLenis = ({ scroll }) => update(scroll);
    if (lenis) lenis.on("scroll", onLenis);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (lenis) lenis.off("scroll", onLenis);
    };
  }, []);

  const toTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { offset: 0 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      className={`back-to-top${show ? " show" : ""}`}
      onClick={toTop}
      aria-label="Back to top"
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}

const comments = [
  {
    user: "@tomas",
    text: "Bestest edit in 48 hours.",
    avatar: "/assets/avatar-mark.webp",
  },
  {
    user: "@mark_locus",
    text: "This edit boosted my retention rate by 35%!",
    avatar: "/assets/avatar-logo.webp",
  },
];

export function App() {
  const heroRef = useRef(null);

  // Start the shared scroll engine at the app boundary. Several sections use
  // its frame loop for scroll-driven transforms; initializing it here prevents
  // those effects from depending on mount order.
  useEffect(() => {
    getLenis();
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layers = [
      [hero.querySelector(".tool-chips"), 26],
      [hero.querySelector(".floating-comments"), 16],
      [hero.querySelector(".photo-img"), -14],
    ].filter(([el]) => el);

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let disposed = false;

    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const loop = () => {
      if (disposed) return;
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      layers.forEach(([el, d]) => {
        el.style.transform = `translate(${cx * d}px, ${cy * d}px)`;
      });
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <>
      <Preloader />
      <Starfield />
      <main className="site-shell">
        <Scrollbar />
      <div className="hero-card">
        <div className="hero-vignette" aria-hidden="true"></div>
        <div className="hero-grain" aria-hidden="true"></div>
        <header className="nav-bar">
          <nav className="nav-links" aria-label="Main navigation">
            <div className="nav-group">
              {navLeft.map((link) => (
                <a
                  key={link}
                  href={navTargets[link.toLowerCase()] || `#${link.toLowerCase()}`}
                  onClick={(e) => scrollToNav(e, link)}
                >
                  {link}
                </a>
              ))}
            </div>
            <div className="nav-notch">
              <img src="/assets/logo1.webp" alt="xtrm visuals" width="68" height="68" />
            </div>
            <div className="nav-group">
              {navRight.map((link) => (
                <a
                  key={link}
                  href={navTargets[link.toLowerCase()] || `#${link.toLowerCase()}`}
                  onClick={(e) => scrollToNav(e, link)}
                >
                  {link}
                </a>
              ))}
            </div>
          </nav>
          <a
            className="nav-cta"
            href="#contact"
            onClick={(e) => scrollToNav(e, "Contact")}
          >
            Let's talk
            <span aria-hidden="true">→</span>
          </a>
        </header>

        <section className="hero" id="top" ref={heroRef}>
          <div className="hero-copy">
            <span className="avail-pill">
              <span className="avail-dot" aria-hidden="true"></span>
              Available for work
            </span>

            <h1>
              Hi, I'm Spairo
              <span>
                <RotatingWord words={roles} />
              </span>
            </h1>

            <p className="hero-subtitle">
              A self-taught video editor turning raw footage into scroll-stopping
              stories. I focus on sharp pacing, clean sound, and hooks that keep
              viewers watching to the end.
            </p>

            <div className="hero-actions">
              <a
                className="contact-btn"
                href="#contact"
                onClick={(e) => scrollToSelector(e, "#contact")}
              >
                Contact
              </a>
              <a
                className="reel-btn"
                href="#reel"
                onClick={(e) => scrollToSelector(e, "#reel")}
              >
                <span className="reel-btn-play" aria-hidden="true">▶</span>
                Watch Showreel
              </a>
            </div>

            <div className="social-proof">
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

          <div className="hero-photo" id="work">
            <div className="photo-glow" aria-hidden="true"></div>
            <div className="photo-stage" aria-hidden="true"></div>

            <img className="photo-img" src="/assets/spairo.webp" alt="Spairo" decoding="async" />

            <div className="tool-chips" aria-hidden="true">
              <span className="tool-chip chip-pr">Pr</span>
              <span className="tool-chip chip-ae">Ae</span>
              <span className="tool-chip chip-ps">Ps</span>
              <span className="tool-chip chip-au">Au</span>
              <span className="tool-chip chip-ai">Ai</span>
              <span className="tool-chip chip-dv">Dv</span>
            </div>
          </div>

          <div className="floating-comments" aria-hidden="true">
            {comments.map((comment, index) => (
              <article className={`comment-card card-${index + 1}`} key={comment.user}>
                <img src={comment.avatar} alt="" loading="lazy" decoding="async" />
                <div>
                  <strong>{comment.user}</strong>
                  <p>{comment.text}</p>
                  <span className="reply">Reply</span>
                </div>
              </article>
            ))}
          </div>

          <a className="scroll-cue" href="#reel" aria-label="Scroll to the reel">
            <span className="scroll-cue-mouse" aria-hidden="true">
              <span></span>
            </span>
            <span className="scroll-cue-text">SCROLL</span>
          </a>
        </section>
      </div>

      <ShowcaseReel src="/assets/reel.mp4" preview="/assets/previews/reel.mp4" poster="/assets/posters/reel.webp" />

      <StatsBand />

      <FeaturedWork />

      <Services />

      <Approach />

      <WhyMe />

      <Skills />

      <Testimonials />

      <Contact />
      </main>
      <BackToTop />
    </>
  );
}
