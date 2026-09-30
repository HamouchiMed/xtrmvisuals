import { useEffect, useRef } from "react";
import { Words, useVisibleFrame } from "./reveal.jsx";

const reasons = [
  { title: "Every Niche", label: "Marketing agencies, real estate, SAAS, podcasts, B2B, digital products & more." },
  { title: "Every Content Type", label: "VSLs, ads, reels, shorts and long-form — edited to convert." },
  { title: "Bilingual", label: "Fluent in English & French." },
  { title: "Marketing-Trained", label: "Master's degree in Marketing behind every cut." },
  { title: "Premium Animations", label: "Motion graphics that elevate every frame." },
  { title: "Unlimited Revisions", label: "Refined until you're 100% satisfied." },
  { title: "Fast Turnaround", label: "Quick delivery — without cutting corners." },
];

function ReasonRow({ title, label, i }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && el.classList.add("in"), {
      threshold: 0.45,
      rootMargin: "0px 0px -12% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <li className="whyme-item" ref={ref} style={{ "--i": i }}>
      <span className="whyme-node" aria-hidden="true">
        <span className="whyme-node-core"></span>
      </span>
      <div className="whyme-body">
        <span className="mono whyme-idx">{String(i + 1).padStart(2, "0")}</span>
        <h3 className="whyme-title">{title}</h3>
        <p className="whyme-text">{label}</p>
      </div>
    </li>
  );
}

export function WhyMe() {
  const lineRef = useRef(null);
  const listRef = useRef(null);

  // Scroll-drawn line: fill grows as the list passes through the viewport.
  useVisibleFrame(listRef, () => {
    const list = listRef.current;
    const line = lineRef.current;
    if (!list || !line) return;
    const rect = list.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.75;
    const end = vh * 0.35;
    const p = (start - rect.top) / (rect.height + (start - end));
    line.style.transform = `scaleY(${Math.max(0, Math.min(1, p))})`;
  });

  return (
    <section className="whyme" id="why-me" aria-label="Why work with me">
      <div className="whyme-inner">
        <div className="whyme-head">
          <span className="whyme-glow" aria-hidden="true"></span>
          <p className="mono section-tag">( 06 — What sets me apart )</p>
          <h2 className="whyme-heading" data-reveal>
            <em className="serif-accent">
              <Words text="Why me?" />
            </em>
          </h2>
          <p className="whyme-lede" data-reveal="fade">
            Seven reasons creators and brands keep coming back — and why many become long-term
            partners.
          </p>
        </div>

        <div className="whyme-track" ref={listRef}>
          <div className="whyme-rail" aria-hidden="true">
            <span className="whyme-rail-fill" ref={lineRef}></span>
          </div>
          <ul className="whyme-list">
            {reasons.map((r, i) => (
              <ReasonRow key={r.title} i={i} {...r} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
