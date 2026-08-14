import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const easings = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
};

function formatNumber(value, decimals) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function NumberCounter({
  start = 0,
  end = 100,
  duration = 1.5,
  delay = 0,
  decimals = 0,
  easing = "easeOut",
  color,
  align = "center",
  autoStart = true,
  loop = false,
  resetOnReentry = false,
  suffix = "",
  style,
  className = "",
}) {
  const ref = useRef(null);
  const timeoutRef = useRef(null);
  const rafRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(start);
  const [isCounting, setIsCounting] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const runCount = useCallback(() => {
    let startTime = null;
    let frameId = null;

    function animate(ts) {
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) / 1000;
      const t = Math.min(1, Math.max(0, elapsed / duration));
      const ease = easings[easing] || easings.easeOut;
      const value = start + (end - start) * ease(t);

      setDisplayValue(t < 1 ? value : end);

      if (t < 1) {
        frameId = requestAnimationFrame(animate);
        rafRef.current = frameId;
      } else if (loop) {
        timeoutRef.current = setTimeout(() => {
          setDisplayValue(start);
          setIteration((i) => i + 1);
        }, 300);
      }
    }

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setDisplayValue(start);
        frameId = requestAnimationFrame(animate);
        rafRef.current = frameId;
      }, delay * 1000);
    } else {
      setDisplayValue(start);
      frameId = requestAnimationFrame(animate);
      rafRef.current = frameId;
    }
  }, [start, end, duration, delay, easing, loop]);

  useEffect(() => {
    if (!autoStart) return;

    if (inView) {
      setIsCounting(true);
    } else if (resetOnReentry) {
      setIsCounting(false);
      setDisplayValue(start);
    }
  }, [inView, autoStart, resetOnReentry, start]);

  useEffect(() => {
    if (!isCounting) return undefined;

    runCount();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isCounting, iteration, runCount]);

  const containerStyle = useMemo(
    () => ({
      ...style,
      display: "inline-block",
      width: style?.width === "100%" ? "100%" : "max-content",
      height: style?.height === "100%" ? "100%" : "max-content",
      textAlign: align,
      color,
      cursor: autoStart ? "default" : "pointer",
      userSelect: "none",
    }),
    [style, align, color, autoStart]
  );

  return (
    <span
      ref={ref}
      style={containerStyle}
      className={className}
      aria-live="polite"
      tabIndex={0}
      onClick={() => {
        if (!autoStart) setIsCounting(true);
      }}
    >
      {formatNumber(displayValue, decimals)}
      {suffix}
    </span>
  );
}
