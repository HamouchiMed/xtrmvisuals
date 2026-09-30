import { useEffect, useRef } from "react";
import { getLenis } from "./lenis.js";
import { openLightbox } from "./Lightbox.jsx";
import { Words, useVisibleFrame } from "./reveal.jsx";

export const works = [
  { src: "/assets/work1.mp4", preview: "/assets/previews/work1.mp4", poster: "/assets/posters/work1.webp", title: "Did You Know", tags: "Short-form • Hook • Retention" },
  { src: "/assets/work2.mp4", preview: "/assets/previews/work2.mp4", poster: "/assets/posters/work2.webp", title: "XTRM Visuals", tags: "Brand Film • Motion • Grade" },
  { src: "/assets/work3.mp4", preview: "/assets/previews/work3.mp4", poster: "/assets/posters/work3.webp", title: "XTRM Visuals II", tags: "Commercial • Pacing • Sound" },
  { src: "/assets/work4.mp4", preview: "/assets/previews/work4.mp4", poster: "/assets/posters/work4.webp", title: "Playback", tags: "YouTube • Color • Edit" },
  { src: "/assets/work5.mp4", preview: "/assets/previews/work5.mp4", poster: "/assets/posters/work5.webp", title: "Project Five", tags: "Short-form • Edit • Sound" },
  { src: "/assets/work6.mp4", preview: "/assets/previews/work6.mp4", poster: "/assets/posters/work6.webp", title: "Project Six", tags: "Commercial • Motion • Grade" },
  { src: "/assets/work7.mp4", preview: "/assets/previews/work7.mp4", poster: "/assets/posters/work7.webp", title: "Project Seven", tags: "Documentary • Pacing • Color" },
  { src: "/assets/work8.mp4", preview: "/assets/previews/work8.mp4", poster: "/assets/posters/work8.webp", title: "Project Eight", tags: "Brand Film • Hook • Edit" },
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad = (n) => String(n).padStart(2, "0");

function WorkCard({ item, index }) {
  const cardRef = useRef(null);
  const videoRef = useRef(null);

  // Previews stream only while the card is actually on screen.
  useEffect(() => {
    const card = cardRef.current;
    const video = videoRef.current;
    if (!card || !video) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(card);
    return () => io.disconnect();
  }, []);

  return (
    <article className="work-card" ref={cardRef}>
      <button
        type="button"
        className="work-thumb"
        onClick={() => openLightbox(item)}
        data-cursor="Play"
        aria-label={`Play ${item.title}`}
      >
        <span className="work-media">
          <video ref={videoRef} src={item.preview || item.src} poster={item.poster} muted loop playsInline preload="none" />
        </span>
        <span className="work-index mono" aria-hidden="true">
          {pad(index + 1)}
        </span>
      </button>
      <div className="work-meta">
        <h3 className="work-title">{item.title}</h3>
        <p className="mono work-tags">{item.tags}</p>
      </div>
    </article>
  );
}

export function FeaturedWork() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const countRef = useRef(null);
  const L = useRef({ enabled: false, travel: 0, cards: [], skew: 0, current: -1 });

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!section || !stage || !track) return undefined;

    const layout = () => {
      const s = L.current;
      s.enabled = stage.clientWidth > 720; // horizontal pin on non-tiny screens
      s.cards = Array.from(track.children).map((el) => ({
        el,
        media: el.querySelector(".work-media"),
        left: el.offsetLeft,
        width: el.offsetWidth,
      }));
      if (!s.enabled) {
        section.style.height = "";
        track.style.transform = "";
        s.cards.forEach((c) => (c.media.style.transform = ""));
        return;
      }
      // extra scroll room needed to slide the whole track past the viewport
      s.travel = Math.max(0, track.scrollWidth - stage.clientWidth);
      section.style.height = `${window.innerHeight + s.travel}px`;
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  useVisibleFrame(sectionRef, () => {
    const s = L.current;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!s.enabled || !section || !stage || !track) return;

    const rect = section.getBoundingClientRect();
    const denom = section.offsetHeight - stage.offsetHeight;
    const p = denom > 0 ? clamp(-rect.top / denom, 0, 1) : 0;
    const x = -p * s.travel;

    const v = getLenis()?.velocity || 0;
    s.skew += (clamp(v * -0.12, -5, 5) - s.skew) * 0.12;
    track.style.transform = `translate3d(${x}px, 0, 0)`;

    // inner parallax: media drifts against the track + leans with velocity
    const vw = stage.clientWidth;
    s.cards.forEach((c) => {
      const center = c.left + x + c.width / 2;
      const off = (center - vw / 2) / vw; // -1..1 across the screen
      c.media.style.transform = `translate3d(${off * -8}%, 0, 0) skewX(${s.skew}deg) scale(1.18)`;
    });

    if (barRef.current) barRef.current.style.transform = `scaleX(${Math.max(0.02, p)})`;
    const current = Math.min(works.length, Math.floor(p * (works.length - 0.001)) + 1);
    if (current !== s.current && countRef.current) {
      s.current = current;
      countRef.current.textContent = pad(current);
    }
  });

  return (
    <section className="featured" id="work" aria-label="Featured work" ref={sectionRef}>
      <div className="featured-stage" ref={stageRef}>
        <div className="featured-head">
          <div>
            <p className="mono section-tag">( 03 — Selected work )</p>
            <h2 className="featured-heading" data-reveal>
              <Words text="Featured" /> <em className="serif-accent"><Words text="Work" /></em>
            </h2>
          </div>
          <p className="featured-sub" data-reveal="fade">
            A selection of edits spanning short-form, commercials, podcasts, and cinematic brand
            films—crafted for creators and brands who want work that not only looks great, but
            drives results.
          </p>
        </div>

        <div className="work-track" ref={trackRef}>
          {works.map((w, i) => (
            <WorkCard key={w.src} item={w} index={i} />
          ))}
        </div>

        <div className="featured-progress" aria-hidden="true">
          <span className="mono">
            <span ref={countRef}>01</span> / {pad(works.length)}
          </span>
          <span className="featured-bar">
            <i ref={barRef}></i>
          </span>
          <span className="mono">Scroll</span>
        </div>
      </div>
    </section>
  );
}
