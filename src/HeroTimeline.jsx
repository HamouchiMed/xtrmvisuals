import { useEffect, useMemo, useRef } from "react";
import { getLenis } from "./lenis.js";
import { useVisibleFrame } from "./reveal.jsx";

/* Hero background: a realistic NLE timeline (Premiere / Resolve style) that
   plays behind the portrait — time ruler, video tracks with filmstrips of
   real frames from the work, titles/grade clips, audio with waveforms, and a
   playhead with running timecode. Scrolling the page scrubs it faster. */

const PX = 40; // pixels per second of footage
const LOOP = 72; // seconds before the edit repeats (LOOP * PX must exceed wide screens)
const LOOP_PX = PX * LOOP;
const FPS = 25;
const START = 3600; // timelines start at 01:00:00:00 in pro edits

const footage = [
  { strip: "/assets/filmstrips/work1.webp", name: "DidYouKnow_A001.mp4" },
  { strip: "/assets/filmstrips/work4.webp", name: "Playback_EP12_cam1.mov" },
  { strip: "/assets/filmstrips/work3.webp", name: "XTRM_II_scene03.mp4" },
  { strip: "/assets/filmstrips/work6.webp", name: "Spot_30s_final.mov" },
  { strip: "/assets/filmstrips/reel.webp", name: "Showreel_2026.mp4" },
  { strip: "/assets/filmstrips/work7.webp", name: "Edit_session_B.mov" },
  { strip: "/assets/filmstrips/work2.webp", name: "Reels_batch_04.mp4" },
  { strip: "/assets/filmstrips/work5.webp", name: "Project05_rough.mp4" },
  { strip: "/assets/filmstrips/work8.webp", name: "Brand_Film_master.mov" },
];

const gfx = [
  { name: "Lower Third — Name", type: "text" },
  { name: "Title — Hook", type: "text" },
  { name: "Adjustment Layer", type: "adjust" },
  { name: "Subtitles", type: "text" },
  { name: "Grade — Film LUT", type: "grade" },
];

const sfx = ["SFX_whoosh_01.wav", "SFX_riser.wav", "SFX_hit_low.wav", "SFX_swoosh_02.wav", "SFX_click.wav"];
const markers = [
  { t: 6.4, c: "#e8c547" },
  { t: 21.2, c: "#4fc3f7" },
  { t: 37.6, c: "#ef5350" },
  { t: 52.8, c: "#66bb6a" },
  { t: 64.4, c: "#e8c547" },
];

/* tiny seeded RNG so the edit looks the same on every visit */
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Lays clips along one track, ending exactly on the loop seam. */
function layout(seed, { min, max, gap = 0, gapMin = 0, gapMax = 0, pad = 0 }) {
  const r = rng(seed);
  const out = [];
  let t = pad;
  while (t < LOOP - min * 0.6) {
    if (r() < gap) t += gapMin + r() * (gapMax - gapMin);
    let dur = min + r() * (max - min);
    if (t + dur > LOOP - 0.4) dur = LOOP - t;
    if (dur < min * 0.6) break;
    out.push({ start: t, dur, r: r(), i: out.length });
    t += dur;
  }
  return out;
}

function wavePath(width, seed, loud) {
  const r = rng(seed);
  let env = 0.55;
  let d = "";
  for (let x = 1.5; x < width - 1; x += 3) {
    env = Math.min(0.95, Math.max(0.12, env + (r() - 0.5) * 0.28));
    const a = (env * (0.35 + 0.65 * r()) * 44 * loud).toFixed(1);
    d += `M${x} ${50 - a}V${50 + +a}`;
  }
  return d;
}

const pad2 = (n) => String(n).padStart(2, "0");
function timecode(sec) {
  const total = Math.floor(sec * FPS);
  const f = total % FPS;
  const s = Math.floor(total / FPS);
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}:${pad2(f)}`;
}

function buildEdit() {
  const v1 = layout(11, { min: 3, max: 7.5 }).map((c, i) => ({
    ...c,
    kind: "video",
    media: footage[(i * 4 + 1) % footage.length],
    trans: i > 0 && c.r < 0.4,
    selected: i === 3,
  }));
  const v2 = layout(23, { min: 2, max: 4.5, gap: 0.7, gapMin: 2, gapMax: 7, pad: 1.5 }).map((c, i) => ({
    ...c,
    kind: "video",
    media: footage[(i * 3 + 5) % footage.length],
  }));
  const v3 = layout(37, { min: 2.5, max: 5.5, gap: 0.85, gapMin: 3, gapMax: 9, pad: 0.8 }).map((c, i) => ({
    ...c,
    kind: "gfx",
    gfx: gfx[i % gfx.length],
  }));
  const a1 = layout(41, { min: 4, max: 9, gap: 0.35, gapMin: 0.4, gapMax: 1.6 }).map((c, i) => ({
    ...c,
    kind: "audio",
    name: i % 3 === 2 ? "Interview_lav.wav" : `VO_take_0${(i % 7) + 1}.wav`,
    loud: 0.95,
  }));
  const a2 = layout(53, { min: 30, max: 40 }).map((c, i) => ({
    ...c,
    kind: "music",
    name: i % 2 ? "Music_drop_v2.wav" : "Music_bed_120bpm.wav",
    loud: 0.7,
  }));
  const a3 = layout(67, { min: 0.6, max: 1.8, gap: 0.9, gapMin: 2, gapMax: 6, pad: 2 }).map((c, i) => ({
    ...c,
    kind: "sfx",
    name: sfx[i % sfx.length],
    loud: 1,
  }));
  return [
    { id: "V3", clips: v3 },
    { id: "V2", clips: v2 },
    { id: "V1", clips: v1 },
    { id: "A1", clips: a1 },
    { id: "A2", clips: a2 },
    { id: "A3", clips: a3 },
  ];
}

function Clip({ c, offset }) {
  const left = (c.start + offset) * PX;
  const width = c.dur * PX - 2;
  const style = { left, width };

  if (c.kind === "video") {
    return (
      <div className={`tl-clip tl-video${c.selected ? " is-selected" : ""}`} style={style}>
        <span className="tl-name">
          {c.r > 0.45 && <i className="tl-fx" />}
          {c.media.name}
        </span>
        <span
          className="tl-film"
          style={{ backgroundImage: `url(${c.media.strip})`, backgroundPositionX: `${-Math.round(c.r * 900)}px` }}
        />
        {c.trans && <span className="tl-trans" />}
      </div>
    );
  }

  if (c.kind === "gfx") {
    return (
      <div className={`tl-clip tl-gfx tl-gfx-${c.gfx.type}`} style={style}>
        <span className="tl-name">{c.gfx.name}</span>
      </div>
    );
  }

  return (
    <div className={`tl-clip tl-audio tl-${c.kind}`} style={style}>
      <span className="tl-name">{c.name}</span>
      <svg className="tl-wave" viewBox={`0 0 ${Math.max(4, Math.round(width))} 100`} preserveAspectRatio="none" aria-hidden="true">
        <path d={wavePath(width, 1000 + c.i * 17 + Math.round(c.start * 10), c.loud)} />
      </svg>
      <span className="tl-fade-in" />
      <span className="tl-fade-out" />
    </div>
  );
}

export function HeroTimeline() {
  const rootRef = useRef(null);
  const moveRef = useRef(null);
  const tcRef = useRef(null);
  const headRef = useRef(null);
  const state = useRef({ x: 8 * PX, last: 0, ph: 0, frame: -1, speed: PX });
  const tracks = useMemo(buildEdit, []);

  // Fade in once the filmstrips have decoded (never wait more than ~2.5s).
  useEffect(() => {
    const root = rootRef.current;
    const loads = footage.map(
      (f) =>
        new Promise((res) => {
          const img = new Image();
          img.onload = img.onerror = res;
          img.src = f.strip;
        }),
    );
    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      root?.classList.add("is-on");
    };
    Promise.all(loads).then(show);
    const t = setTimeout(show, 2500);

    const measure = () => {
      if (headRef.current) state.current.ph = headRef.current.offsetLeft;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useVisibleFrame(rootRef, (now) => {
    const s = state.current;
    const dt = s.last ? Math.min(0.05, (now - s.last) / 1000) : 0;
    s.last = now;

    // real-time playback, scrubbed forward/back by page scroll speed
    const v = getLenis()?.velocity || 0;
    const target = PX * (1 + Math.max(-6, Math.min(8, v * 0.3)));
    s.speed += (target - s.speed) * 0.08;
    s.x = (((s.x + s.speed * dt) % LOOP_PX) + LOOP_PX) % LOOP_PX;
    if (moveRef.current) moveRef.current.style.transform = `translate3d(${-s.x}px, 0, 0)`;

    const sec = (((s.x + s.ph) / PX) % LOOP + LOOP) % LOOP;
    const frame = Math.floor(sec * FPS);
    if (frame !== s.frame && tcRef.current) {
      s.frame = frame;
      tcRef.current.textContent = timecode(START + sec);
    }
  });

  const rulerLabels = Array.from({ length: (LOOP / 5) * 2 }, (_, i) => i * 5);

  return (
    <div className="hero-tl" ref={rootRef} aria-hidden="true" style={{ "--loop-px": `${LOOP_PX}px` }}>
      <div className="tl-grid">
        <div className="tl-ruler-bg" />
        {tracks.map((t) => (
          <div key={t.id} className={`tl-lane tl-lane-${t.id[0].toLowerCase()}`} />
        ))}
      </div>

      <div className="tl-move" ref={moveRef}>
        <div className="tl-ruler">
          {rulerLabels.map((s) => (
            <span key={s} style={{ left: s * PX }}>
              {timecode(START + (s % LOOP))}
            </span>
          ))}
          {[0, LOOP].flatMap((o) =>
            markers.map((m) => <i key={`${o}-${m.t}`} className="tl-marker" style={{ left: (m.t + o) * PX, background: m.c }} />),
          )}
        </div>
        {tracks.map((t) => (
          <div key={t.id} className="tl-row">
            {[0, LOOP].flatMap((o) => t.clips.map((c) => <Clip key={`${o}-${c.i}`} c={c} offset={o} />))}
          </div>
        ))}
      </div>

      <div className="tl-heads">
        {tracks.map((t) => (
          <span key={t.id}>{t.id}</span>
        ))}
      </div>

      <div className="tl-playhead" ref={headRef}>
        <span className="tl-ph-head" />
        <span className="tl-ph-tc mono" ref={tcRef}>
          01:00:00:00
        </span>
      </div>
    </div>
  );
}
