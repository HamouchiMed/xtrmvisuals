import { useEffect, useRef } from "react";
import { getLenis } from "./lenis.js";

export function Scrollbar() {
  const trackRef = useRef(null);
  const thumbRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    const lenis = getLenis();
    let thumbH = 30;
    let dragging = false;

    const scrollable = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const update = () => {
      const max = scrollable();
      if (max <= 0) {
        track.style.opacity = "0";
        return;
      }
      track.style.opacity = "1";
      const trackH = track.clientHeight;
      const winH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      thumbH = Math.max(30, (winH / docH) * trackH);
      const progress = window.scrollY / max;
      const maxY = trackH - thumbH;
      thumb.style.height = `${thumbH}px`;
      thumb.style.transform = `translateY(${progress * maxY}px)`;
    };

    const scrollTo = (y) => {
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    };

    const onDragMove = (e) => {
      if (!dragging) return;
      const rect = track.getBoundingClientRect();
      const maxY = rect.height - thumbH;
      const y = clampNum(e.clientY - rect.top - thumbH / 2, 0, maxY);
      scrollTo((y / maxY) * scrollable());
    };
    const onDragEnd = () => {
      dragging = false;
      track.classList.remove("dragging");
      window.removeEventListener("pointermove", onDragMove);
      window.removeEventListener("pointerup", onDragEnd);
    };
    const onDragStart = (e) => {
      e.preventDefault();
      dragging = true;
      track.classList.add("dragging");
      window.addEventListener("pointermove", onDragMove);
      window.addEventListener("pointerup", onDragEnd);
    };

    thumb.addEventListener("pointerdown", onDragStart);
    window.addEventListener("resize", update);
    if (lenis) lenis.on("scroll", update);
    else window.addEventListener("scroll", update, { passive: true });

    update();

    return () => {
      thumb.removeEventListener("pointerdown", onDragStart);
      window.removeEventListener("resize", update);
      window.removeEventListener("pointermove", onDragMove);
      window.removeEventListener("pointerup", onDragEnd);
      if (lenis) lenis.off("scroll", update);
      else window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <div className="scrollbar" ref={trackRef} aria-hidden="true">
      <div className="scrollbar-thumb" ref={thumbRef}></div>
    </div>
  );
}

function clampNum(v, a, b) {
  return Math.min(b, Math.max(a, v));
}
