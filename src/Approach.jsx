import { Words } from "./reveal.jsx";

const steps = [
  { n: "01", title: "Brief & Footage", desc: "You share the raw footage, references, and what success looks like.", tag: "Day 0" },
  { n: "02", title: "First Cut", desc: "I craft the story, pacing, sound, and a rough color grade.", tag: "Draft" },
  { n: "03", title: "Revisions", desc: "We refine together until every frame feels exactly right.", tag: "Refine" },
  { n: "04", title: "Delivery", desc: "Final export in every format and aspect ratio you need—on time.", tag: "Ship" },
];

/* Cards stick and stack on top of each other as you scroll (desktop). */
export function Approach() {
  return (
    <section className="approach" id="approach" aria-label="My approach">
      <div className="approach-inner">
        <div className="approach-head">
          <p className="mono section-tag">( 05 — Process )</p>
          <h2 className="section-heading" data-reveal>
            <Words text="My" /> <em className="serif-accent"><Words text="Approach" /></em>
          </h2>
          <p className="approach-sub" data-reveal="fade">
            A simple, transparent process that keeps you in the loop and turns footage into results.
          </p>
        </div>

        <ol className="approach-stack">
          {steps.map((s, i) => (
            <li className="step" key={s.n} style={{ "--i": i }}>
              <div className="step-card">
                <div className="step-top">
                  <span className="mono step-tag">{s.tag}</span>
                  <span className="mono step-count">
                    {s.n} / 0{steps.length}
                  </span>
                </div>
                <span className="step-n" aria-hidden="true">
                  {s.n}
                </span>
                <div className="step-body">
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
