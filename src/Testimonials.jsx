const testimonials = [
  { quote: "Bestest edit in 48 hours. Absolute magic.", name: "Tomas", role: "Creator" },
  { quote: "This edit boosted my retention rate by 35%.", name: "Mark", role: "YouTuber" },
  { quote: "Fast, clean, and always on brief. A true partner.", name: "Lina", role: "Brand Manager" },
  { quote: "Turned raw clips into something cinematic.", name: "Yassine", role: "Founder" },
  { quote: "My views doubled after switching to Spairo.", name: "Dana", role: "Podcaster" },
  { quote: "Reliable, creative, and lightning fast.", name: "Omar", role: "Agency Lead" },
];

const brands = [
  "SODA",
  "NOVA",
  "PULSE",
  "ORYZO",
  "VERTEX",
  "LUMEN",
  "APEX",
  "DRIFT",
];

export function Testimonials() {
  const row = [...testimonials, ...testimonials];
  const logos = [...brands, ...brands];

  return (
    <section className="testimonials" aria-label="Testimonials">
      <div className="testi-head">
        <p className="section-eyebrow">Testimonials</p>
        <h2 className="testi-heading">Trusted by creators & brands</h2>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {row.map((t, i) => (
            <figure className="testi-card" key={i}>
              <blockquote>"{t.quote}"</blockquote>
              <figcaption>
                <span className="testi-name">{t.name}</span>
                <span className="testi-role">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="logo-marquee" aria-hidden="true">
        <div className="logo-track">
          {logos.map((b, i) => (
            <span className="logo-item" key={i}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
