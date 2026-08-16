import { useEffect, useRef } from "react";

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

const BAR_MS = 1200; // cinematic fill per bar
const GAP_MS = 130; // pause before the next bar starts

function SkillGroup({ group, items }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rows = Array.from(el.querySelectorAll(".bar-row")).map((row) => ({
      fill: row.querySelector(".bar-fill"),
      pct: row.querySelector(".bar-pct"),
      target: Number(row.dataset.level),
    }));

    let rafs = [];
    let timers = [];
    let runId = 0; // bumps on every play/reset so stale loops abort

    const clearPending = () => {
      rafs.forEach(cancelAnimationFrame);
      timers.forEach(clearTimeout);
      rafs = [];
      timers = [];
    };

    const reset = () => {
      runId += 1;
      clearPending();
      rows.forEach((r) => {
        r.fill.style.transition = "none";
        r.fill.style.width = "0%";
        r.pct.textContent = "0%";
        r.pct.style.opacity = "0";
      });
    };

    const animateRow = (r, token) =>
      new Promise((resolve) => {
        r.pct.style.opacity = "1";
        r.fill.style.transition = "none";
        r.fill.style.width = "0%";
        r.pct.textContent = "0%";
        const kick = requestAnimationFrame(() => {
          if (token !== runId) return;
          r.fill.style.transition = `width ${BAR_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
          r.fill.style.width = `${r.target}%`;
        });
        rafs.push(kick);

        let start = null;
        const step = (t) => {
          if (token !== runId) return resolve();
          if (start === null) start = t;
          const p = Math.min(1, (t - start) / BAR_MS);
          const eased = 1 - Math.pow(1 - p, 3);
          r.pct.textContent = `${Math.round(eased * r.target)}%`;
          if (p < 1) {
            rafs.push(requestAnimationFrame(step));
          } else {
            r.pct.textContent = `${r.target}%`;
            resolve();
          }
        };
        rafs.push(requestAnimationFrame(step));
      });

    const runSequence = async () => {
      runId += 1;
      const token = runId;
      clearPending();
      for (const r of rows) {
        if (token !== runId) return;
        await animateRow(r, token);
        if (token !== runId) return;
        await new Promise((res) => timers.push(setTimeout(res, GAP_MS)));
      }
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          runSequence();
        } else {
          el.classList.remove("in");
          reset();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      clearPending();
    };
  }, []);

  return (
    <div className="skill-group" ref={ref}>
      <span className="skill-label">{group}</span>
      <div className="skill-bars">
        {items.map((s) => (
          <div className="bar-row" key={s.name} data-level={s.level}>
            <div className="bar-meta">
              <span className="bar-name">{s.name}</span>
              <span className="bar-pct">0%</span>
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
          <p className="section-eyebrow">The toolkit</p>
          <h2 className="journey-heading">Technical Skills</h2>
        </header>

        <div className="skills-grid">
          {skills.map((g) => (
            <SkillGroup key={g.group} {...g} />
          ))}
        </div>
      </div>
    </section>
  );
}
