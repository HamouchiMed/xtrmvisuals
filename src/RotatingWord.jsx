import { useEffect, useState } from "react";

export function RotatingWord({ words, interval = 2200 }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="rotating-word" key={i}>
      {words[i]}
    </span>
  );
}
