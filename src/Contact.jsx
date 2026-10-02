import { useState } from "react";
import { Words } from "./reveal.jsx";
import { anchorClick } from "./lenis.js";
import { navLinks, socials, socialIcons, Arrow } from "./site.jsx";

/* --- SETUP: where contact-form messages get delivered ---
   Messages are emailed to whatever address the Web3Forms access key belongs to.
   To forward submissions to abderrahmaneaboulayoun4@gmail.com:
     1. Go to https://web3forms.com and enter abderrahmaneaboulayoun4@gmail.com
        (free, instant, no account needed).
     2. Check that inbox for the Access Key and paste it below.
   Until a key is set, the form opens the visitor's email app with the message
   pre-filled and addressed to CONTACT_EMAIL, so no inquiry is ever lost. */
const WEB3FORMS_KEY = "YOUR_ACCESS_KEY_HERE";
const CONTACT_EMAIL = "abderrahmaneaboulayoun4@gmail.com";

const hasKey = () => WEB3FORMS_KEY && !WEB3FORMS_KEY.startsWith("YOUR_");

function mailtoFor(data) {
  const body = [
    data.message,
    "",
    "—",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : "",
    data.budget ? `Project: ${data.budget}` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");
  const subject = `New inquiry: ${data.subject || "Project"}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const projectTypes = ["Short-form", "Commercial", "YouTube", "Podcast", "Brand film", "Other"];

export function Contact() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | mailto | error
  const [type, setType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = { ...Object.fromEntries(new FormData(form)), budget: type };

    if (!hasKey()) {
      window.location.href = mailtoFor(data);
      setStatus("mailto");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New inquiry: ${data.subject || "Contact form"}`,
          from_name: data.name,
          replyto: data.email,
          ...data,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus("sent");
        setType("");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="contact" id="contact" aria-label="Contact">
      <div className="contact-inner">
        <div className="contact-intro">
          <p className="mono section-tag">( 09 — Get in touch )</p>
          <h2 className="contact-heading" data-reveal>
            <Words text="Let's create" /> <br />
            <Words text="something" />{" "}
            <em className="serif-accent">
              <Words text="unforgettable" />
            </em>
          </h2>
          <p className="contact-text" data-reveal="fade">
            Have a project in mind? Tell me about it and I'll get back to you—usually within a day.
          </p>
          <div className="contact-socials" data-reveal="fade">
            {socials.map((s) => (
              <a key={s.label} className="contact-social" href={s.href} target="_blank" rel="noopener noreferrer" data-magnetic>
                <span className="contact-social-icon">{socialIcons[s.label]}</span>
                <span>{s.handle}</span>
                <Arrow className="contact-social-arrow" />
              </a>
            ))}
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit} data-reveal="fade">
          <fieldset className="chip-field">
            <legend className="mono">What are we making?</legend>
            <div className="chip-options">
              {projectTypes.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`chip-option${type === t ? " is-on" : ""}`}
                  aria-pressed={type === t}
                  onClick={() => setType(type === t ? "" : t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="field-row">
            <label className="field">
              <input name="name" type="text" autoComplete="name" placeholder=" " required />
              <span>Full name</span>
            </label>
            <label className="field">
              <input name="email" type="email" autoComplete="email" placeholder=" " required />
              <span>Email</span>
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <input name="phone" type="tel" autoComplete="tel" placeholder=" " />
              <span>Phone (optional)</span>
            </label>
            <label className="field">
              <input name="subject" type="text" placeholder=" " required />
              <span>Subject</span>
            </label>
          </div>

          <label className="field">
            <textarea name="message" rows="4" placeholder=" " required></textarea>
            <span>Tell me about your project</span>
          </label>

          <div className="form-actions">
            <button className="btn btn-primary btn-lg" type="submit" disabled={status === "sending"} data-magnetic>
              <span>{status === "sending" ? "Sending…" : "Send message"}</span>
              <span className="btn-icon" aria-hidden="true">
                <Arrow />
              </span>
            </button>
            <p className="form-status" role="status">
              {status === "sent" && "Thanks—your message is on its way. I'll be in touch soon."}
              {status === "mailto" && "Your email app should open with the message ready to send."}
              {status === "error" && "Something went wrong. Please reach out on Instagram or X instead."}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-cta">
          <p className="mono">( Have an idea? )</p>
          <a className="footer-talk" href="#contact" onClick={anchorClick("#contact")} data-magnetic>
            <span>Let's talk</span>
            <span className="footer-talk-icon" aria-hidden="true">
              <Arrow />
            </span>
          </a>
        </div>
        <nav className="footer-col" aria-label="Footer">
          <p className="mono">Sitemap</p>
          {navLinks.map((l) => (
            <a key={l.label} href={l.target} onClick={anchorClick(l.target)}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="footer-col">
          <p className="mono">Socials</p>
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
              {s.label === "X" ? "X (Twitter)" : s.label}
            </a>
          ))}
        </div>
      </div>

      {/* SVG so the wordmark always spans the full width, whatever font loads */}
      <svg className="footer-mark" viewBox="0 0 1000 124" aria-hidden="true">
        <defs>
          <linearGradient id="footer-mark-grad" gradientUnits="userSpaceOnUse" x1="440" y1="0" x2="1000" y2="0">
            <stop offset="0" stopColor="#f6b7ec" />
            <stop offset="0.5" stopColor="#c77dff" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <text x="0" y="116" textLength="1000" lengthAdjust="spacingAndGlyphs">
          <tspan fill="#f4f0ff">XTRM</tspan>
          <tspan fill="url(#footer-mark-grad)" dx="34">
            VISUALS
          </tspan>
        </text>
      </svg>

      <div className="footer-bottom mono">
        <span>© 2026 XTRM Visuals</span>
        <span>Spairo — Video Editor</span>
      </div>
    </footer>
  );
}
