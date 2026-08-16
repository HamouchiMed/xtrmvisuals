import { useState } from "react";

const icons = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  X: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.53 3H20.5l-6.48 7.4L21.75 21h-5.9l-4.62-6.04L5.9 21H2.93l6.93-7.92L2.25 3h6.05l4.18 5.52L17.53 3zm-1.04 16.2h1.64L7.6 4.72H5.84L16.49 19.2z" />
    </svg>
  ),
};

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/spairo777" },
  { label: "X", href: "https://x.com/Spairo7777" },
];

/* --- SETUP: where contact-form messages get delivered ---
   Messages are emailed to whatever address the Web3Forms access key belongs to.
   To forward submissions to abderrahmaneaboulayoun4@gmail.com:
     1. Go to https://web3forms.com and enter abderrahmaneaboulayoun4@gmail.com
        (free, instant, no account needed).
     2. Check that inbox for the Access Key and paste it below. */
const WEB3FORMS_KEY = "YOUR_ACCESS_KEY_HERE";

export function Contact() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));
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
        <p className="contact-eyebrow">Get in touch</p>

        <h2 className="contact-heading">
          Let's create something <span>unforgettable</span>
        </h2>

        <p className="contact-text">
          Have a project in mind? Fill in the details below and I'll get back to
          you—usually within a day.
        </p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <label className="field">
              <span>Full name</span>
              <input name="name" type="text" autoComplete="name" required />
            </label>
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Phone</span>
              <input name="phone" type="tel" autoComplete="tel" />
            </label>
            <label className="field">
              <span>Subject</span>
              <input name="subject" type="text" required />
            </label>
          </div>

          <label className="field">
            <span>Message</span>
            <textarea name="message" rows="5" required></textarea>
          </label>

          <button className="contact-submit" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send message"}
          </button>

          {status === "sent" && (
            <p className="form-status form-status-ok">
              Thanks—your message is on its way. I'll be in touch soon.
            </p>
          )}
          {status === "error" && (
            <p className="form-status form-status-err">
              Something went wrong. Please email me directly instead.
            </p>
          )}
        </form>

        <div className="contact-socials">
          {socials.map((s) => (
            <a
              key={s.label}
              className="contact-social"
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="contact-social-icon">{icons[s.label]}</span>
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <footer className="contact-foot">
        <span>© 2026 XTRM Visuals</span>
        <span>Spairo — Video Editor</span>
      </footer>
    </section>
  );
}
