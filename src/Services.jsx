import { useEffect, useRef } from "react";

const services = [
  { n: "01", title: "Short-form Content", desc: "Reels, TikToks & Shorts built to hook fast and hold to the end." },
  { n: "02", title: "Commercials", desc: "Punchy, on-brand spots that grab attention and convert." },
  { n: "03", title: "Documentaries", desc: "Story-first long-form with rhythm, tension, and emotion." },
  { n: "04", title: "Podcasts", desc: "Multi-cam episodes, punch-ins, and social clips." },
  { n: "05", title: "YouTube Videos", desc: "Retention-optimized edits that grow channels." },
  { n: "06", title: "Cinematic Brand Films", desc: "High-end films with color grade and sound design." },
];

function ServiceRow({ n, title, desc }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && el.classList.add("in"),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="service-row" ref={ref}>
      <span className="service-n">{n}</span>
      <h3 className="service-title">{title}</h3>
      <p className="service-desc">{desc}</p>
      <span className="service-arrow" aria-hidden="true">↗</span>
    </div>
  );
}

export function Services() {
  return (
    <section className="services" id="services" aria-label="What I edit">
      <div className="services-inner">
        <div className="services-head">
          <p className="section-eyebrow">Services</p>
          <h2 className="services-heading">What I Edit</h2>
        </div>
        <div className="services-list">
          {services.map((s) => (
            <ServiceRow key={s.n} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
