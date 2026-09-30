import { useEffect, useRef } from "react";

/* Custom cursor + magnetic buttons (fine pointers only).
   - default: small inverted dot trailing the pointer
   - links/buttons: dot grows into a ring
   - [data-cursor="Play"]: becomes a labelled bubble
   - [data-magnetic]: element leans toward the pointer while hovered */
export function Cursor() {
  const rootRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const cursor = rootRef.current;
    const label = labelRef.current;
    if (!fine.matches || !cursor || !label) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    let x = -100;
    let y = -100;
    let cx = x;
    let cy = y;
    let raf = 0;
    let visible = false;
    let mode = "";
    let magnet = null;

    const release = () => {
      if (magnet) magnet.style.transform = "";
      magnet = null;
    };

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        cx = x;
        cy = y;
        cursor.classList.add("is-visible");
      }

      if (reduced) return;
      const m = e.target.closest?.("[data-magnetic]");
      if (m !== magnet) {
        release();
        magnet = m;
      }
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const dx = x - (r.left + r.width / 2);
        const dy = y - (r.top + r.height / 2);
        magnet.style.transform = `translate(${dx * 0.3}px, ${dy * 0.4}px)`;
      }
    };

    const onOver = (e) => {
      const t = e.target.closest?.("[data-cursor], a, button, input, textarea, select, label");
      let next = "";
      if (t) {
        if (t.matches("input, textarea, select")) next = "text";
        else if (t.dataset.cursor) {
          next = "label";
          label.textContent = t.dataset.cursor;
        } else next = "link";
      }
      if (next !== mode) {
        mode = next;
        cursor.dataset.mode = next;
      }
    };

    const onLeave = () => {
      visible = false;
      cursor.classList.remove("is-visible");
      release();
    };
    const onDown = () => cursor.classList.add("is-down");
    const onUp = () => cursor.classList.remove("is-down");

    const loop = () => {
      const k = reduced ? 1 : 0.22;
      cx += (x - cx) * k;
      cy += (y - cy) * k;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      release();
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div className="cursor" ref={rootRef} aria-hidden="true">
      <span className="cursor-ring"></span>
      <span className="cursor-label" ref={labelRef}></span>
    </div>
  );
}
