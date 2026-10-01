import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

/* WebGL background behind the hero. Several looks share one renderer; each
   is a `scene()` function. Rendered only while the hero is on screen; the
   CSS gradient underneath is the fallback when WebGL is unavailable.
   Pick a look with ?bg=<name> in the URL while comparing options. */

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const prelude = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform vec2 uGlow;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
    return v;
  }
  float blob(vec2 p, vec2 c, float r) {
    float d = length(p - c) / r;
    return exp(-d * d * 2.0);
  }
  float vignette(vec2 uv, float k) {
    return 1.0 - k * pow(length(uv - vec2(0.5, 0.5)) * 1.15, 2.2);
  }
`;

/* Each scene receives uv (0..1), p (aspect-corrected) and the aspect ratio. */
const scenes = {
  // 1. Flowing purple aurora (domain-warped noise) — the current look
  aurora: /* glsl */ `
    vec3 scene(vec2 uv, vec2 p, float aspect) {
      float t = uTime * 0.045;
      vec2 q = vec2(fbm(p * 1.3 + t), fbm(p * 1.3 - t + 3.1));
      vec2 r = vec2(fbm(p * 1.7 + 2.0 * q + vec2(1.7, 9.2) + t * 1.3),
                    fbm(p * 1.7 + 2.0 * q + vec2(8.3, 2.8) - t));
      float f = fbm(p * 1.5 + 2.4 * r);
      vec3 col = mix(vec3(0.050, 0.022, 0.100), vec3(0.230, 0.070, 0.400), smoothstep(0.25, 0.95, f));
      col = mix(col, vec3(0.490, 0.360, 0.840), smoothstep(0.6, 1.1, length(q)) * 0.35);
      vec2 g = vec2(uGlow.x * aspect, uGlow.y);
      float d = length(p - g);
      col += vec3(0.840, 0.240, 0.770) * 0.5 * exp(-d * d * 3.2) * (0.55 + 0.45 * f);
      vec2 m = vec2(uMouse.x * aspect, uMouse.y);
      col += vec3(0.490, 0.360, 0.840) * 0.22 * exp(-pow(length(p - m), 2.0) * 9.0);
      return col * vignette(uv, 0.5);
    }
  `,

  // 2. Liquid mesh gradient — big vivid colour blobs drifting and blending
  mesh: /* glsl */ `
    vec3 scene(vec2 uv, vec2 p, float aspect) {
      float t = uTime * 0.11;
      vec2 q = p + 0.12 * vec2(fbm(p * 1.1 + t), fbm(p * 1.1 - t + 4.0));
      vec2 g = vec2(uGlow.x * aspect, uGlow.y);
      vec3 col = vec3(0.035, 0.018, 0.08);
      col += vec3(0.86, 0.22, 0.78) * blob(q, g + 0.16 * vec2(sin(t * 1.3), cos(t * 1.1)), 0.62) * 0.95;
      col += vec3(0.38, 0.18, 0.98) * blob(q, vec2(0.42 * aspect + 0.22 * sin(t * 0.9), 0.82 + 0.12 * cos(t * 1.2)), 0.62) * 0.75;
      col += vec3(0.10, 0.22, 0.85) * blob(q, vec2(0.55 * aspect + 0.3 * cos(t * 0.7), 0.08 + 0.1 * sin(t)), 0.55) * 0.75;
      col += vec3(1.00, 0.48, 0.72) * blob(q, vec2(0.92 * aspect + 0.08 * sin(t * 1.7), 0.92 + 0.06 * cos(t * 1.5)), 0.38) * 0.6;
      vec2 m = vec2(uMouse.x * aspect, uMouse.y);
      col += vec3(0.62, 0.48, 1.0) * blob(q, m, 0.3) * 0.3;
      col = col / (1.0 + col * 0.55);
      return col * vignette(uv, 0.35);
    }
  `,

  // 3. Studio spotlight — near-black stage, light beams onto the portrait
  spotlight: /* glsl */ `
    vec3 scene(vec2 uv, vec2 p, float aspect) {
      vec3 col = vec3(0.022, 0.016, 0.04);
      vec2 g = vec2(uGlow.x * aspect, uGlow.y);
      float d = length((p - g) * vec2(1.0, 0.85));
      col += vec3(0.52, 0.30, 0.95) * exp(-d * d * 4.5) * 0.55;
      col += vec3(0.95, 0.86, 1.0) * exp(-d * d * 16.0) * 0.1;
      vec2 src = vec2(g.x + 0.18, 1.3);
      vec2 dir = p - src;
      float ang = atan(dir.x, -dir.y);
      float rays = 0.55 + 0.45 * sin(ang * 23.0 + uTime * 0.35) * (0.5 + 0.5 * sin(ang * 9.0 - uTime * 0.22));
      float cone = smoothstep(0.42, 0.0, abs(ang + 0.13));
      float fall = smoothstep(1.7, 0.25, length(dir));
      col += vec3(0.78, 0.6, 1.0) * rays * cone * fall * 0.17;
      float floorGlow = exp(-pow((p.y - 0.03) * 6.0, 2.0)) * exp(-pow((p.x - g.x) * 1.5, 2.0));
      col += vec3(0.84, 0.24, 0.77) * floorGlow * 0.4;
      vec2 m = vec2(uMouse.x * aspect, uMouse.y);
      col += vec3(0.5, 0.4, 0.9) * exp(-pow(length(p - m), 2.0) * 12.0) * 0.07;
      return col * vignette(uv, 0.5);
    }
  `,

  // 4. Neon grid floor — the portrait stands on a glowing perspective grid
  grid: /* glsl */ `
    vec3 scene(vec2 uv, vec2 p, float aspect) {
      vec3 col = mix(vec3(0.03, 0.014, 0.07), vec3(0.13, 0.04, 0.24), smoothstep(0.1, 0.9, uv.y));
      float horizon = 0.27;
      float side = 0.15 + 0.85 * smoothstep(0.3, 0.62, uv.x);
      vec2 g = vec2(uGlow.x * aspect, uGlow.y);
      col += vec3(0.86, 0.24, 0.78) * exp(-pow((uv.y - horizon) * 10.0, 2.0)) * 0.4 * side;
      col += vec3(0.9, 0.3, 0.8) * exp(-pow(length((p - vec2(g.x, horizon + 0.06)) * vec2(0.75, 1.5)), 2.0) * 4.0) * 0.4;
      if (uv.y < horizon) {
        float y = horizon - uv.y;
        float z = 0.3 / y;
        float vx = mix(0.5, uMouse.x, 0.2);
        vec2 gp = vec2((uv.x - vx) * aspect * z * 2.2, z + uTime * 0.35);
        float px = aspect * z * 2.2 / uRes.x;
        float pz = 0.3 / (y * y) / uRes.y;
        float dx = abs(fract(gp.x + 0.5) - 0.5);
        float dz = abs(fract(gp.y + 0.5) - 0.5);
        float lx = 1.0 - smoothstep(0.0, px * 1.6 + 0.008, dx);
        float lz = 1.0 - smoothstep(0.0, pz * 1.6 + 0.008, dz);
        float fade = smoothstep(0.0, 0.12, y) * (1.0 - smoothstep(0.5, 1.4, px * 40.0));
        col = mix(col, vec3(0.025, 0.01, 0.055), smoothstep(0.0, 0.03, y));
        col += vec3(0.9, 0.32, 0.9) * max(lx, lz) * fade * 0.6 * side;
      }
      return col * vignette(uv, 0.45);
    }
  `,

  // 5. Editor timeline — faint clips sliding along NLE-style tracks
  timeline: /* glsl */ `
    vec3 scene(vec2 uv, vec2 p, float aspect) {
      vec3 col = vec3(0.035, 0.022, 0.07);
      vec2 g = vec2(uGlow.x * aspect, uGlow.y);
      col += vec3(0.6, 0.2, 0.75) * exp(-pow(length((p - g) * vec2(1.0, 0.8)), 2.0) * 3.0) * 0.45;
      float rows = 13.0;
      float r = floor(uv.y * rows);
      float fy = fract(uv.y * rows);
      float speed = 0.025 + 0.05 * hash(vec2(r, 1.0));
      float seg = 0.3 + 0.45 * hash(vec2(r, 3.0));
      float x = p.x + uTime * speed + hash(vec2(r, 5.0)) * 10.0;
      float cell = floor(x / seg);
      float fx = fract(x / seg);
      float on = step(0.32, hash(vec2(cell, r)));
      float gap = 0.035 / seg;
      float edge = 0.006 / seg;
      float bx = smoothstep(gap, gap + edge, fx) * smoothstep(1.0 - gap, 1.0 - gap - edge, fx);
      float by = smoothstep(0.14, 0.2, fy) * smoothstep(0.86, 0.8, fy);
      float hc = hash(vec2(cell, r + 7.0));
      vec3 cc = hc < 0.4 ? vec3(0.55, 0.36, 0.98) : hc < 0.65 ? vec3(0.86, 0.3, 0.82) : hc < 0.82 ? vec3(0.24, 0.55, 0.98) : vec3(0.16, 0.78, 0.58);
      float wave = 0.5 + 0.5 * sin(fx * seg * 140.0 + r) * noise(vec2(x * 30.0, r));
      float audio = step(0.5, fract(r * 0.5)) * smoothstep(0.5 - wave * 0.32, 0.5 - wave * 0.32 + 0.04, 1.0 - abs(fy - 0.5) * 2.0 * 0.5 - 0.25);
      float region = 0.08 + 0.92 * smoothstep(0.32, 0.75, uv.x);
      col += cc * on * bx * by * (0.13 + 0.08 * audio) * region;
      float head = exp(-pow((uv.x - 0.585) * uRes.x * 0.5, 2.0));
      col += vec3(1.0, 0.45, 0.85) * head * 0.45 * region;
      return col * vignette(uv, 0.45);
    }
  `,

  // 6. Interactive dots — a dot matrix that ripples and swells around the cursor
  dots: /* glsl */ `
    vec3 scene(vec2 uv, vec2 p, float aspect) {
      vec3 col = vec3(0.035, 0.02, 0.07);
      vec2 g = vec2(uGlow.x * aspect, uGlow.y);
      col += vec3(0.5, 0.2, 0.7) * exp(-pow(length((p - g) * vec2(1.0, 0.8)), 2.0) * 2.5) * 0.45;
      float n = 44.0;
      vec2 gp = p * n;
      vec2 cell = floor(gp) + 0.5;
      vec2 cp = cell / n;
      vec2 m = vec2(uMouse.x * aspect, uMouse.y);
      float md = length(cp - m);
      float infl = exp(-md * md * 26.0);
      float wave = 0.5 + 0.5 * sin(length(cp - g) * 13.0 - uTime * 1.5);
      float rad = 0.06 + 0.07 * wave + 0.24 * infl;
      vec2 off = normalize(cp - m + 0.0001) * infl * 0.22;
      float d = length(gp - cell - off);
      float dotm = 1.0 - smoothstep(rad - 0.05, rad + 0.05, d);
      vec3 dc = mix(vec3(0.45, 0.36, 0.88), vec3(1.0, 0.5, 0.9), clamp(infl + wave * 0.25, 0.0, 1.0));
      float region = 0.35 + 0.65 * smoothstep(0.2, 0.7, uv.x);
      col += dc * dotm * (0.2 + 0.55 * infl) * region;
      return col * vignette(uv, 0.45);
    }
  `,
};

/* Crisp patterns (grid lines, dots, clips) need full resolution; soft
   gradients look identical at half resolution and cost far less. */
const sharpScenes = new Set(["grid", "timeline", "dots"]);

export const heroBackgrounds = Object.keys(scenes);

const fragmentFor = (name) => /* glsl */ `
  ${prelude}
  ${scenes[name] || scenes.aurora}
  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 uv = vUv;
    vec3 col = scene(uv, vec2(uv.x * aspect, uv.y), aspect);
    col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 180.0; // dither: no banding
    gl_FragColor = vec4(col, 1.0);
  }
`;

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export function HeroGL({ glowRef, variant = "aurora" }) {
  const holderRef = useRef(null);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder || !supportsWebGL()) return undefined;

    let dpr = Math.min(window.devicePixelRatio || 1, 2) * (sharpScenes.has(variant) ? 1 : 0.5);
    const renderer = new Renderer({ dpr, alpha: false, antialias: false, powerPreference: "low-power" });
    const gl = renderer.gl;
    holder.appendChild(gl.canvas);

    const program = new Program(gl, {
      vertex,
      fragment: fragmentFor(variant),
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uMouse: { value: [0.7, 0.5] },
        uGlow: { value: [0.72, 0.5] },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    let w = 0;
    let h = 0;
    const resize = () => {
      w = holder.clientWidth;
      h = holder.clientHeight;
      if (!w || !h) return;
      renderer.dpr = dpr;
      renderer.setSize(w, h);
      program.uniforms.uRes.value = [w, h];
      const glow = glowRef?.current;
      if (glow) {
        const hr = holder.getBoundingClientRect();
        const gr = glow.getBoundingClientRect();
        program.uniforms.uGlow.value = [
          (gr.left + gr.width / 2 - hr.left) / hr.width,
          1 - (gr.top + gr.height * 0.4 - hr.top) / hr.height,
        ];
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(holder);

    let tx = 0.7;
    let ty = 0.5;
    let mx = tx;
    let my = ty;
    const onMove = (e) => {
      const r = holder.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let running = false;
    let last = 0;
    let slow = 0;
    const draw = (t) => {
      const dt = last ? t - last : 16;
      last = t;
      // adaptive quality: drop resolution on GPUs that can't keep up
      if (dt > 34) slow += 1;
      else slow = Math.max(0, slow - 1);
      if (slow > 45 && dpr > 0.3) {
        dpr *= 0.7;
        slow = 0;
        resize();
      }
      mx += (tx - mx) * 0.05;
      my += (ty - my) * 0.05;
      program.uniforms.uTime.value = t / 1000;
      program.uniforms.uMouse.value = [mx, my];
      renderer.render({ scene: mesh });
      holder.classList.add("is-on");
      if (running) raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true;
        last = 0;
        raf = requestAnimationFrame(draw);
      } else if (!e.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(holder);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [glowRef, variant]);

  return <div className="hero-gl" ref={holderRef} aria-hidden="true" />;
}
