const steps = [
  { n: "01", title: "Brief & Footage", desc: "You share the raw footage, references, and what success looks like." },
  { n: "02", title: "First Cut", desc: "I craft the story, pacing, sound, and a rough color grade." },
  { n: "03", title: "Revisions", desc: "We refine together until every frame feels exactly right." },
  { n: "04", title: "Delivery", desc: "Final export in every format and aspect ratio you need—on time." },
];

export function Approach() {
  return (
    <section className="approach" id="approach" aria-label="My approach">
      <div className="approach-inner">
        <div className="approach-head">
          <p className="section-eyebrow">Process</p>
          <h2 className="approach-heading">My Approach</h2>
          <p className="approach-sub">
            A simple, transparent process that keeps you in the loop and turns
            footage into results.
          </p>
        </div>
        <div className="approach-grid">
          {steps.map((s) => (
            <div className="step" key={s.n}>
              <span className="step-n">{s.n}</span>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
