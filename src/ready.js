/* Tiny "the launch screen is gone" signal. Intro animations (hero headline,
   section reveals) wait for it so they play in view instead of under the
   preloader. */
let ready = false;
const subscribers = new Set();

export function markReady() {
  if (ready) return;
  ready = true;
  const root = document.documentElement;
  root.classList.remove("is-loading");
  root.classList.add("is-ready");
  subscribers.forEach((fn) => fn());
  subscribers.clear();
}

export function onReady(fn) {
  if (ready) {
    fn();
    return () => {};
  }
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
