import { useState } from "react";

const socials = [
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "X", href: "#" },
];

/* --- SETUP ---
   1. Go to https://web3forms.com, enter your email, get a free Access Key (instant, no account).
   2. Paste it below. Submissions will be emailed to you. */
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
            <a key={s.label} className="contact-social" href={s.href}>
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
