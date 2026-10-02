import { useEffect, useRef, useState } from "react";
import { Header } from "./Header.jsx";
import { Hero } from "./Hero.jsx";
import { ShowcaseReel } from "./ShowcaseReel.jsx";
import { StatsBand } from "./StatsBand.jsx";
import { Manifesto } from "./Manifesto.jsx";
import { FeaturedWork } from "./FeaturedWork.jsx";
import { Services } from "./Services.jsx";
import { Approach } from "./Approach.jsx";
import { WhyMe } from "./WhyMe.jsx";
import { Skills } from "./Skills.jsx";
import { Testimonials } from "./Testimonials.jsx";
import { Contact, Footer } from "./Contact.jsx";
import { Scrollbar } from "./Scrollbar.jsx";
import { Starfield } from "./Starfield.jsx";
import { Preloader } from "./Preloader.jsx";
import { Cursor } from "./Cursor.jsx";
import { LightboxHost } from "./Lightbox.jsx";
import { useRevealRoot } from "./reveal.jsx";
import { getLenis, scrollToTarget } from "./lenis.js";
import { reel } from "./site.jsx";

/* Round "back to top" button whose ring fills with page progress. */
function BackToTop() {
  const [show, setShow] = useState(false);
  const ringRef = useRef(null);

  useEffect(() => {
    let shown = false;
    const update = (y) => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (ringRef.current) ringRef.current.style.strokeDashoffset = String(100 - (y / max) * 100);
      const next = y > window.innerHeight * 0.8;
      if (next !== shown) setShow((shown = next));
    };
    const onScroll = () => update(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const lenis = getLenis();
    const onLenis = ({ scroll }) => update(scroll);
    if (lenis) lenis.on("scroll", onLenis);
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (lenis) lenis.off("scroll", onLenis);
    };
  }, []);

  return (
    <button
      type="button"
      className={`back-to-top${show ? " show" : ""}`}
      onClick={() => scrollToTarget(0)}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      data-magnetic
    >
      <svg className="btt-ring" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="18" pathLength="100" />
        <circle ref={ringRef} className="btt-progress" cx="20" cy="20" r="18" pathLength="100" />
      </svg>
      <span aria-hidden="true">↑</span>
    </button>
  );
}

export function App() {
  // Start the shared scroll engine at the app boundary so scroll-driven
  // sections never depend on mount order.
  useEffect(() => {
    getLenis();
  }, []);

  useRevealRoot();

  return (
    <>
      <Preloader />
      <Starfield />
      <Cursor />
      <Header />
      <Scrollbar />
      <main className="site-shell" id="main">
        <Hero />
        <ShowcaseReel src={reel.src} preview={reel.preview} poster={reel.poster} />
        <StatsBand />
        <Manifesto />
        <FeaturedWork />
        <Services />
        <Approach />
        <WhyMe />
        <Skills />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
      <LightboxHost />
    </>
  );
}
