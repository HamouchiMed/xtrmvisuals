import { useEffect, useRef, useState } from "react";
import { getLenis } from "./lenis.js";

/* A single video viewer for the whole page. Anything can open it with
   openLightbox({ src, poster, title, tags }). */
const EVENT = "xtrm:lightbox";

export function openLightbox(item) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: item }));
}

function Viewer({ item, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const lenis = getLenis();
    const prevFocus = document.activeElement;
    lenis?.stop();
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={item.title}>
      <button ref={closeRef} className="lightbox-close" onClick={onClose} aria-label="Close video" data-magnetic>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <video src={item.src} poster={item.poster} controls autoPlay playsInline />
        <div className="lightbox-meta">
          {item.tags && <p className="mono lightbox-tags">{item.tags}</p>}
          <h3 className="lightbox-title">{item.title}</h3>
        </div>
      </div>
    </div>
  );
}

export function LightboxHost() {
  const [item, setItem] = useState(null);

  useEffect(() => {
    const onOpen = (e) => setItem(e.detail);
    window.addEventListener(EVENT, onOpen);
    return () => window.removeEventListener(EVENT, onOpen);
  }, []);

  const close = useRef(() => setItem(null)).current;
  return item ? <Viewer item={item} onClose={close} /> : null;
}
