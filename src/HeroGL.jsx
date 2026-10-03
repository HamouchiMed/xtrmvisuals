import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

/* Hero background: faint editor-timeline clips sliding along NLE-style
   tracks with a playhead line, plus a glow behind the portrait. Rendered
   only while the hero is on screen; the CSS gradient underneath is the
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
  float vignette(vec2 uv, float k) {
    return 1.0 - k * pow(length(uv - vec2(0.5, 0.5)) * 1.15, 2.2);
  }
  // NLE-style clip label colours, picked per clip
  vec3 clipColor(float h) {
    if (h < 0.111) return vec3(0.24, 0.52, 0.98); // blue
    if (h < 0.222) return vec3(0.95, 0.27, 0.27); // red
    if (h < 0.333) return vec3(0.98, 0.82, 0.22); // yellow
    if (h < 0.444) return vec3(0.24, 0.80, 0.42); // green
    if (h < 0.555) return vec3(0.98, 0.55, 0.18); // orange
    if (h < 0.666) return vec3(0.16, 0.78, 0.82); // cyan
    if (h < 0.777) return vec3(0.96, 0.38, 0.70); // pink
    if (h < 0.888) return vec3(0.62, 0.40, 0.98); // purple
    return vec3(0.62, 0.88, 0.25); // lime
  }

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
      vec3 cc = clipColor(hc);
      float wave = 0.5 + 0.5 * sin(fx * seg * 140.0 + r) * noise(vec2(x * 30.0, r));
      float audio = step(0.5, fract(r * 0.5)) * smoothstep(0.5 - wave * 0.32, 0.5 - wave * 0.32 + 0.04, 1.0 - abs(fy - 0.5) * 2.0 * 0.5 - 0.25);
      float region = 0.08 + 0.92 * smoothstep(0.32, 0.75, uv.x);
      // paint clips in their own colour (mix, not add) so hues stay true over
      // the purple base, plus a brighter label strip along each clip's top
      float clip = on * bx * by * region;
      col = mix(col, cc * 0.85, clip * (0.42 + 0.1 * audio));
      float label = smoothstep(0.67, 0.69, fy) * (1.0 - smoothstep(0.79, 0.81, fy)); // uv.y runs bottom-up
      col = mix(col, cc, clip * label * 0.45);
      float head = exp(-pow((uv.x - 0.585) * uRes.x * 0.5, 2.0));
      col += vec3(1.0, 0.45, 0.85) * head * 0.45 * region;
      return col * vignette(uv, 0.45);
    }
  
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

export function HeroGL({ glowRef }) {
  const holderRef = useRef(null);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder || !supportsWebGL()) return undefined;

    let dpr = Math.min(window.devicePixelRatio || 1, 2) * 1;
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
