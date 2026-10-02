import { useCallback, useEffect, useRef, useState } from "react";
import { anchorClick, getLenis } from "./lenis.js";
import { navLinks, socials, socialIcons, Arrow } from "./site.jsx";

function MenuOverlay({ open, onClose }) {
  const firstLinkRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const lenis = getLenis();
    lenis?.stop();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => firstLinkRef.current?.focus({ preventScroll: true }), 350);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [open, onClose]);

  return (
    <div id="site-menu" className={`menu${open ? " is-open" : ""}`} inert={!open} aria-label="Site menu">
      <div className="menu-glow" aria-hidden="true"></div>
      <div className="menu-inner">
        <p className="mono menu-label">( Navigation )</p>
        <nav className="menu-links" aria-label="Menu">
          <a ref={firstLinkRef} href="#top" style={{ "--i": 0 }} onClick={anchorClick(0, onClose)}>
            <span className="menu-n mono">00</span>
            <span className="menu-t">
              <span>Home</span>
            </span>
          </a>
          {navLinks.map((l, i) => (
            <a key={l.label} href={l.target} style={{ "--i": i + 1 }} onClick={anchorClick(l.target, onClose)}>
              <span className="menu-n mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="menu-t">
                <span>{l.label}</span>
              </span>
            </a>
          ))}
        </nav>
        <div className="menu-foot">
          <span className="avail-pill">
            <span className="avail-dot" aria-hidden="true"></span>
            Available for new projects
          </span>
          <div className="menu-socials">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                {socialIcons[s.label]}
                <span>{s.handle}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    let lastY = window.scrollY;
    let hide = false;
    let past = false;

    const update = (y) => {
      const down = y > lastY + 2;
      const up = y < lastY - 2;
      if (down || up) lastY = y;
      const nextPast = y > 40;
      let nextHide = hide;
      if (down && y > window.innerHeight * 0.7) nextHide = true;
      if (up || y < 80) nextHide = false;
      if (openRef.current) nextHide = false;
      if (nextHide !== hide) setHidden((hide = nextHide));
      if (nextPast !== past) setScrolled((past = nextPast));
    };

    const lenis = getLenis();
    const onLenis = ({ scroll }) => update(scroll);
    const onNative = () => update(window.scrollY);
    if (lenis) lenis.on("scroll", onLenis);
    window.addEventListener("scroll", onNative, { passive: true });
    return () => {
      if (lenis) lenis.off("scroll", onLenis);
      window.removeEventListener("scroll", onNative);
    };
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header
        className={`site-header${hidden ? " is-hidden" : ""}${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}
      >
        <a className="brand" href="#top" onClick={anchorClick(0, close)} aria-label="XTRM Visuals — back to top">
          <img src="/assets/logo1.webp" alt="" width="96" height="36" />
        </a>

        <nav className="header-nav" aria-label="Main">
          {navLinks.map((l) => (
            <a key={l.label} href={l.target} onClick={anchorClick(l.target)}>
              <span className="roll">
                <span data-text={l.label}>{l.label}</span>
              </span>
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a className="talk-btn" href="#contact" onClick={anchorClick("#contact", close)} data-magnetic>
            <span className="talk-dot" aria-hidden="true"></span>
            <span>Let's talk</span>
            <Arrow className="talk-arrow" />
          </a>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
            data-magnetic
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <i aria-hidden="true"></i>
            <i aria-hidden="true"></i>
          </button>
        </div>
      </header>
      <MenuOverlay open={open} onClose={close} />
    </>
  );
}
