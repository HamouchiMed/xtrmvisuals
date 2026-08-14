import { NumberCounter } from "./NumberCounter.jsx";

/* Adjust these to your real numbers. */
const stats = [
  { end: 350, suffix: "+", label: "Clients worldwide" },
  { end: 500, suffix: "+", label: "Projects delivered" },
  { end: 50, suffix: "M+", label: "Views generated" },
  { end: 6, suffix: "+", label: "Years editing" },
];

export function StatsBand() {
  return (
    <section className="stats" aria-label="By the numbers">
      <div className="stats-inner">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <span className="stat-num">
              <NumberCounter end={s.end} suffix={s.suffix} duration={2} easing="easeOut" />
            </span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
