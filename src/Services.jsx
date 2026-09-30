import { useEffect, useRef, useState } from "react";
import { Words } from "./reveal.jsx";

const services = [
  { n: "01", title: "Short-form Content", desc: "Reels, TikToks & Shorts built to hook fast and hold to the end.", poster: "/assets/posters/work1.webp" },
  { n: "02", title: "Commercials", desc: "Punchy, on-brand spots that grab attention and convert.", poster: "/assets/posters/work3.webp" },
  { n: "03", title: "Documentaries", desc: "Story-first long-form with rhythm, tension, and emotion.", poster: "/assets/posters/work7.webp" },
  { n: "04", title: "Podcasts", desc: "Multi-cam episodes, punch-ins, and social clips.", poster: "/assets/posters/work4.webp" },
  { n: "05", title: "YouTube Videos", desc: "Retention-optimized edits that grow channels.", poster: "/assets/posters/work5.webp" },
  { n: "06", title: "Cinematic Brand Films", desc: "High-end films with color grade and sound design.", poster: "/assets/posters/work2.webp" },
];

/* Floating preview that trails the pointer across the list (fine pointers). */
function useFollower(listRef, floatRef) {
  useEffect(() => {
    const list = listRef.current;
    const float = floatRef.current;
    if (!list || !float) return undefined;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;

    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let running = false;
    const loop = () => {
      const dx = x - cx;
      cx += dx * 0.12;
      cy += (y - cy) * 0.12;
      const rot = Math.max(-12, Math.min(12, dx * 0.05));
      float.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) rotate(${rot}deg)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e) => {
      const r = list.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!running) {
        running = true;
        cx = x;
        cy = y;
        raf = requestAnimationFrame(loop);
      }
    };
    const onLeave = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    list.addEventListener("pointermove", onMove);
    list.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      list.removeEventListener("pointermove", onMove);
      list.removeEventListener("pointerleave", onLeave);
    };
  }, [listRef, floatRef]);
}

export function Services() {
  const [active, setActive] = useState(-1);
  const listRef = useRef(null);
  const floatRef = useRef(null);
  useFollower(listRef, floatRef);

  return (
    <section className="services" id="services" aria-label="What I edit">
      <div className="services-inner">
        <div className="services-head">
          <p className="mono section-tag">( 04 — Services )</p>
          <h2 className="section-heading" data-reveal>
            <Words text="What I" /> <em className="serif-accent"><Words text="Edit" /></em>
          </h2>
        </div>

        <div className="services-list" ref={listRef} onPointerLeave={() => setActive(-1)}>
          {services.map((s, i) => (
            <div
              className={`service-row${active === i ? " is-active" : ""}`}
              key={s.n}
              data-reveal="fade"
              onPointerEnter={() => setActive(i)}
            >
              <span className="mono service-n">{s.n}</span>
              <h3 className="service-title">
                <span>{s.title}</span>
              </h3>
              <p className="service-desc">{s.desc}</p>
              <span className="service-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>
            </div>
          ))}

          <div className={`service-float${active >= 0 ? " is-on" : ""}`} ref={floatRef} aria-hidden="true">
            <div className="service-float-inner" style={{ "--k": Math.max(0, active) }}>
              {services.map((s) => (
                <img key={s.n} src={s.poster} alt="" loading="lazy" decoding="async" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
