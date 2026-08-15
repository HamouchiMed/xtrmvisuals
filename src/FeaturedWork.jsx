import { useEffect, useRef, useState } from "react";
import { getLenis } from "./lenis.js";

const works = [
  { src: "/assets/work1.mp4", title: "Did You Know", tags: "Short-form • Hook • Retention" },
  { src: "/assets/work2.mp4", title: "XTRM Visuals", tags: "Brand Film • Motion • Grade" },
  { src: "/assets/work3.mp4", title: "XTRM Visuals II", tags: "Commercial • Pacing • Sound" },
  { src: "/assets/work4.mp4", title: "Playback", tags: "YouTube • Color • Edit" },
  { src: "/assets/work5.mp4", title: "Project Five", tags: "Short-form • Edit • Sound" },
  { src: "/assets/work6.mp4", title: "Project Six", tags: "Commercial • Motion • Grade" },
  { src: "/assets/work7.mp4", title: "Project Seven", tags: "Documentary • Pacing • Color" },
  { src: "/assets/work8.mp4", title: "Project Eight", tags: "Brand Film • Hook • Edit" },
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function Lightbox({ item, onClose }) {
  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={item.title}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close video">
        <span aria-hidden="true">✕</span>
      </button>
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <video src={item.src} controls autoPlay playsInline />
        <div className="lightbox-meta">
          <p className="work-tags">{item.tags}</p>
          <h3 className="work-title">{item.title}</h3>
        </div>
      </div>
    </div>
  );
}

function WorkCard({ src, title, tags, index, onOpen }) {
  const cardRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const video = videoRef.current;
    if (!card || !video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      card.classList.add("in");
      video.play().catch(() => {});
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            card.classList.add("in"); // reveal as it pans into view
            video.play().catch(() => {});
          } else {
            card.classList.remove("in"); // hide as it pans out (reverse)
            video.pause();
          }
        });
      },
      { threshold: 0.2 },
    );
    io.observe(card);

    const fallback = setTimeout(() => {
      const r = card.getBoundingClientRect();
      if (r.left < window.innerWidth && r.right > 0) {
        card.classList.add("in");
        video.play().catch(() => {});
      }
    }, 1200);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <article className="work-card" ref={cardRef} style={{ "--i": index }}>
      <button
        type="button"
        className="work-thumb"
        onClick={onOpen}
        aria-label={`Play ${title}`}
      >
        <video ref={videoRef} src={src} muted loop playsInline preload="metadata" />
        <span className="work-play" aria-hidden="true">
          <span className="work-play-icon">▶</span>
        </span>
      </button>
      <p className="work-tags">{tags}</p>
      <h3 className="work-title">{title}</h3>
    </article>
  );
}

export function FeaturedWork() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!section || !stage || !track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let disposed = false;
    let enabled = true;
    let travel = 0;

    const layout = () => {
      enabled = stage.clientWidth > 720; // horizontal pin on non-tiny screens
      if (reduced || !enabled) {
        section.style.height = "";
        track.style.transform = "";
        return;
      }
      // extra scroll room needed to slide the whole track past the viewport
      travel = Math.max(0, track.scrollWidth - stage.clientWidth);
      section.style.height = `${stage.clientHeight + travel}px`;
    };

    const apply = () => {
      if (!enabled) return;
      const rect = section.getBoundingClientRect();
      const denom = section.offsetHeight - stage.offsetHeight;
      const p = denom > 0 ? clamp(-rect.top / denom, 0, 1) : 0;
      track.style.transform = `translate3d(${-p * travel}px, 0, 0)`;
    };

    layout();
    apply();

    if (reduced || !enabled) return;

    getLenis();

    const loop = () => {
      if (disposed) return;
      apply();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => {
      layout();
      apply();
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="featured" id="work" aria-label="Featured work" ref={sectionRef}>
      <div className="featured-stage" ref={stageRef}>
        <div className="featured-head">
          <h2 className="featured-heading">Featured Work</h2>
          <p className="featured-sub">
            A selection of edits spanning short-form, commercials, podcasts, and
            cinematic brand films—crafted for creators and brands who want work
            that not only looks great, but drives results.
          </p>
        </div>

        <div className="work-track" ref={trackRef}>
          {works.map((w, i) => (
            <WorkCard key={w.src} {...w} index={i} onOpen={() => setActive(w)} />
          ))}
        </div>
      </div>

      {active && <Lightbox item={active} onClose={() => setActive(null)} />}
    </section>
  );
}
