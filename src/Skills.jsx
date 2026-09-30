import { useEffect, useRef } from "react";
import { Words } from "./reveal.jsx";

const skills = [
  {
    group: "Editing",
    items: [
      { name: "Premiere Pro", level: 95 },
      { name: "DaVinci Resolve", level: 88 },
      { name: "Final Cut Pro", level: 82 },
      { name: "CapCut", level: 90 },
    ],
  },
  {
    group: "Motion & VFX",
    items: [
      { name: "After Effects", level: 92 },
      { name: "Blender", level: 72 },
      { name: "Cinema 4D", level: 68 },
      { name: "Element 3D", level: 75 },
    ],
  },
  {
    group: "Color Grading",
    items: [
      { name: "DaVinci Color", level: 86 },
      { name: "Lumetri", level: 88 },
      { name: "LUT Design", level: 80 },
    ],
  },
  {
    group: "Sound Design",
    items: [
      { name: "Adobe Audition", level: 82 },
      { name: "SFX Mixing", level: 78 },
      { name: "Audio Cleanup", level: 85 },
    ],
  },
  {
    group: "Design & Graphics",
    items: [
      { name: "Photoshop", level: 88 },
      { name: "Illustrator", level: 75 },
      { name: "Figma", level: 80 },
    ],
  },
  {
    group: "Formats",
    items: [
      { name: "VSLs", level: 92 },
      { name: "Ads", level: 90 },
      { name: "Reels", level: 95 },
      { name: "Shorts", level: 93 },
      { name: "YouTube", level: 88 },
      { name: "Podcasts", level: 80 },
    ],
  },
];

const BAR_MS = 1400; // fill duration per bar
const STAGGER_MS = 110; // each bar starts a beat after the previous one

function SkillGroup({ group, items, index }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const rows = Array.from(el.querySelectorAll(".bar-row")).map((row) => ({
      pct: row.querySelector(".bar-pct"),
      fill: row.querySelector(".bar-fill"),
    }));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const run = () => {
      el.classList.add("in");
      if (reduced) {
        rows.forEach((r, i) => (r.pct.textContent = `${items[i].level}%`));
        return;
      }
      // The CSS transition drives the bars; the numbers read the live fill
      // width so the two can never drift apart.
      const t0 = performance.now();
      const total = BAR_MS + rows.length * STAGGER_MS + 100;
      const step = (t) => {
        rows.forEach((r, i) => {
          const m = getComputedStyle(r.fill).transform;
          const scale = m && m !== "none" ? parseFloat(m.slice(7)) : 0;
          r.pct.textContent = `${Math.round(Math.min(scale * 100, items[i].level))}%`;
        });
        if (t - t0 < total) raf = requestAnimationFrame(step);
        else rows.forEach((r, i) => (r.pct.textContent = `${items[i].level}%`));
      };
      raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        run();
      },
      { threshold: 0.35 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [items]);

  return (
    <div className="skill-group" ref={ref} style={{ "--g": index }}>
      <div className="skill-head">
        <span className="mono skill-idx">{String(index + 1).padStart(2, "0")}</span>
        <span className="skill-label">{group}</span>
      </div>
      <div className="skill-bars">
        {items.map((s, j) => (
          <div className="bar-row" key={s.name} style={{ "--j": j, "--level": s.level / 100 }}>
            <div className="bar-meta">
              <span className="bar-name">{s.name}</span>
              <span className="mono bar-pct">0%</span>
            </div>
            <span className="bar-track">
              <span className="bar-fill"></span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Skills() {
  return (
    <section className="journey" id="skills" aria-label="Technical skills">
      <div className="journey-inner">
        <header className="journey-head">
          <p className="mono section-tag">( 07 — The toolkit )</p>
          <h2 className="section-heading" data-reveal>
            <Words text="Technical" /> <em className="serif-accent"><Words text="Skills" /></em>
          </h2>
        </header>

        <div className="skills-grid">
          {skills.map((g, i) => (
            <SkillGroup key={g.group} {...g} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
