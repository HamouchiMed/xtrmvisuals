import { useEffect, useState } from "react";

export function Preloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }
    let raf = 0;
    let start = 0;
    const duration = 1700;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      setCount(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(step);
      else setTimeout(() => setDone(true), 350);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`preloader${done ? " done" : ""}`} aria-hidden="true">
      <span className="preloader-num">{count}</span>
      <span className="preloader-label">Loading experience</span>
    </div>
  );
}
