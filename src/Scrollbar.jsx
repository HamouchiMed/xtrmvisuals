import { useEffect, useRef } from "react";
import { getLenis } from "./lenis.js";

/* Floating custom scrollbar (desktop) — draggable thumb synced with Lenis. */
export function Scrollbar() {
  const trackRef = useRef(null);
  const thumbRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return undefined;

    const lenis = getLenis();
    let thumbH = 30;
    let dragging = false;
    let idle = 0;

    const scrollable = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const update = () => {
      const max = scrollable();
      if (max <= 0) {
        track.style.opacity = "0";
        return;
      }
      track.classList.add("is-active");
      clearTimeout(idle);
      idle = setTimeout(() => !dragging && track.classList.remove("is-active"), 1200);
      const trackH = track.clientHeight;
      const docH = document.documentElement.scrollHeight;
      thumbH = Math.max(30, (window.innerHeight / docH) * trackH);
      const progress = window.scrollY / max;
      thumb.style.height = `${thumbH}px`;
      thumb.style.transform = `translateY(${progress * (trackH - thumbH)}px)`;
    };

    const scrollTo = (y) => {
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    };

    const onDragMove = (e) => {
      if (!dragging) return;
      const rect = track.getBoundingClientRect();
      const maxY = rect.height - thumbH;
      const y = Math.min(maxY, Math.max(0, e.clientY - rect.top - thumbH / 2));
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
      clearTimeout(idle);
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
