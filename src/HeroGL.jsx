import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

/* Flowing purple aurora behind the hero (domain-warped fbm noise).
   Rendered at a fraction of native resolution — it's all soft gradients —
   and only while the hero is on screen. The CSS gradient underneath is the
   fallback when WebGL is unavailable. */

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
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

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 uv = vUv;
    vec2 p = vec2(uv.x * aspect, uv.y);
    float t = uTime * 0.045;

    vec2 q = vec2(fbm(p * 1.3 + t), fbm(p * 1.3 - t + 3.1));
    vec2 r = vec2(fbm(p * 1.7 + 2.0 * q + vec2(1.7, 9.2) + t * 1.3),
                  fbm(p * 1.7 + 2.0 * q + vec2(8.3, 2.8) - t));
    float f = fbm(p * 1.5 + 2.4 * r);

    vec3 base    = vec3(0.050, 0.022, 0.100);
    vec3 violet  = vec3(0.230, 0.070, 0.400);
    vec3 magenta = vec3(0.840, 0.240, 0.770);
    vec3 lilac   = vec3(0.490, 0.360, 0.840);

    vec3 col = mix(base, violet, smoothstep(0.25, 0.95, f));
    col = mix(col, lilac, smoothstep(0.6, 1.1, length(q)) * 0.35);

    vec2 g = vec2(uGlow.x * aspect, uGlow.y);
    float d = length(p - g);
    col += magenta * 0.5 * exp(-d * d * 3.2) * (0.55 + 0.45 * f);

    vec2 m = vec2(uMouse.x * aspect, uMouse.y);
    col += lilac * 0.22 * exp(-pow(length(p - m), 2.0) * 9.0);

    col *= 1.0 - 0.5 * pow(length(uv - vec2(0.5, 0.5)) * 1.15, 2.2);
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

export function HeroGL({ glowRef }) {
  const holderRef = useRef(null);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder || !supportsWebGL()) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dpr = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
    const renderer = new Renderer({ dpr, alpha: false, antialias: false, powerPreference: "low-power" });
    const gl = renderer.gl;
    holder.appendChild(gl.canvas);

    const program = new Program(gl, {
      vertex,
      fragment,
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
      if (reduced) {
        requestAnimationFrame(draw);
        return;
      }
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
  }, [glowRef]);

  return <div className="hero-gl" ref={holderRef} aria-hidden="true" />;
}
