import { useEffect, useState } from "react";
import { onReady } from "./ready.js";

/* Cycles through words with a masked slide: the current word rises out as the
   next one rises in. The sizer keeps the line from jumping between words. */
export function RotatingWord({ words, interval = 2400 }) {
  const [i, setI] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (words.length <= 1) return undefined;
    let id = 0;
    // start cycling once the launch screen has lifted, so the first word is seen
    const off = onReady(() => {
      id = setInterval(() => {
        setStarted(true);
        setI((p) => (p + 1) % words.length);
      }, interval);
    });
    return () => {
      off();
      clearInterval(id);
    };
  }, [words.length, interval]);

  const prev = (i - 1 + words.length) % words.length;

  return (
    <span className="rotator" aria-live="off">
      <span className="rotator-sizer" aria-hidden="true">
        {words.reduce((a, b) => (b.length > a.length ? b : a), "")}
      </span>
      {started && (
        <span className="rotator-word is-out" key={`out-${i}`} aria-hidden="true">
          {words[prev]}
        </span>
      )}
      <span className={`rotator-word${started ? " is-in" : ""}`} key={`in-${i}`}>
        {words[i]}
      </span>
    </span>
  );
}
