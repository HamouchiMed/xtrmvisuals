import { Words } from "./reveal.jsx";

const testimonials = [
  { quote: "Bestest edit in 48 hours. Absolute magic.", name: "Tomas", role: "Creator" },
  { quote: "This edit boosted my retention rate by 35%.", name: "Mark", role: "YouTuber" },
  { quote: "Fast, clean, and always on brief. A true partner.", name: "Lina", role: "Brand Manager" },
  { quote: "Turned raw clips into something cinematic.", name: "Yassine", role: "Founder" },
  { quote: "My views doubled after switching to Spairo.", name: "Dana", role: "Podcaster" },
  { quote: "Reliable, creative, and lightning fast.", name: "Omar", role: "Agency Lead" },
];

const brands = ["SODA", "NOVA", "PULSE", "ORYZO", "VERTEX", "LUMEN", "APEX", "DRIFT"];

function Card({ t }) {
  return (
    <figure className="testi-card">
      <span className="testi-mark" aria-hidden="true">
        “
      </span>
      <blockquote>{t.quote}</blockquote>
      <figcaption>
        <span className="testi-avatar" aria-hidden="true">
          {t.name[0]}
        </span>
        <span>
          <span className="testi-name">{t.name}</span>
          <span className="mono testi-role">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  return (
    <section className="testimonials" aria-label="Testimonials">
      <div className="testi-head">
        <p className="mono section-tag">( 08 — Kind words )</p>
        <h2 className="section-heading" data-reveal>
          <Words text="Trusted by creators" /> <em className="serif-accent"><Words text="& brands" /></em>
        </h2>
      </div>

      {/* Screen readers get the list once; the looping copy is decorative. */}
      <ul className="sr-only">
        {testimonials.map((t) => (
          <li key={t.name}>
            “{t.quote}” — {t.name}, {t.role}
          </li>
        ))}
      </ul>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...testimonials, ...testimonials].map((t, i) => (
            <Card t={t} key={i} />
          ))}
        </div>
      </div>

      <div className="logo-marquee" aria-hidden="true">
        <div className="logo-track">
          {[...brands, ...brands].map((b, i) => (
            <span className="logo-item" key={i}>
              {b}
              <span className="logo-star">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
