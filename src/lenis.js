import Lenis from "lenis";

let instance = null;

/* One shared smooth-scroll engine for the whole page.
   Both the showcase orchestration and the WebGL reel read velocity/scroll
   from this single instance, so there's never more than one scroll hijacker. */
export function getLenis() {
  if (instance) return instance;

  instance = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });

  const raf = (time) => {
    if (!instance) return;
    instance.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  return instance;
}
