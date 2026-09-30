import Lenis from "lenis";

let instance = null;

/* One shared smooth-scroll engine for the whole page.
   Every scroll-driven effect reads velocity/scroll from this single instance,
   so there's never more than one scroll hijacker. */
export function getLenis() {
  if (instance) return instance;
  if (typeof window === "undefined") return null;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  instance = new Lenis({
    lerp: reduced ? 1 : 0.095,
    smoothWheel: !reduced,
    wheelMultiplier: 1,
  });

  const raf = (time) => {
    if (!instance) return;
    instance.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  return instance;
}

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/* Smoothly scroll to a selector, element, or y position. `force` lets it run
   even while Lenis is paused (e.g. the moment a menu overlay closes). */
export function scrollToTarget(target, options = {}) {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (el == null) return false;
  const lenis = getLenis();
  if (lenis) {
    lenis.start();
    lenis.scrollTo(el, { offset: 0, duration: 1.6, easing: easeOutExpo, force: true, ...options });
  } else if (typeof el === "number") {
    window.scrollTo({ top: el, behavior: "smooth" });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
  return true;
}

/* Click handler factory for in-page anchor links. */
export function anchorClick(target, before) {
  return (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    before?.();
    scrollToTarget(target);
  };
}
