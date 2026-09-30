import { useEffect, useRef, useState } from "react";
import { Renderer, Camera, Plane, Program, Mesh, Texture } from "ogl";
import { getLenis } from "./lenis.js";

/* -------- tuning knobs (safe to tweak) -------- */
const SEGMENTS = 44;         // mesh resolution — higher = smoother bend, heavier
const BEND_STRENGTH = 3.4;   // how hard the sheet curls on scroll
const WAVE_STRENGTH = 0.55;  // subtle vertical ripple
const VELOCITY_DIVISOR = 34; // maps Lenis velocity -> ~[-1,1]
const VELOCITY_SMOOTH = 0.09; // 0..1, lower = more lag/inertia

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uVelocity;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float nx = uv.x - 0.5;
    float ny = uv.y - 0.5;
    p.z -= (nx * nx) * uVelocity * ${BEND_STRENGTH.toFixed(2)};
    p.z += sin(ny * 3.14159) * uVelocity * ${WAVE_STRENGTH.toFixed(2)};
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexture;
  uniform float uVelocity;
  varying vec2 vUv;
  void main() {
    // slight RGB split while the sheet is moving
    vec2 shift = vec2(uVelocity * 0.006, 0.0);
    vec3 col = vec3(
      texture2D(uTexture, vUv + shift).r,
      texture2D(uTexture, vUv).g,
      texture2D(uTexture, vUv - shift).b
    );
    float d = distance(vUv, vec2(0.5));
    col *= smoothstep(0.95, 0.35, d) * 0.25 + 0.75;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export function WebGLReel({ src, preview, poster }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !supportsWebGL()) {
      setUseFallback(true);
      const v = videoRef.current;
      if (v) {
        v.muted = true;
        v.play().catch(() => {});
      }
      return undefined;
    }

    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return undefined;

    let raf = 0;
    let smoothVel = 0;
    let disposed = false;
    let onScreen = false;
    let hasVideoFrame = false;
    const lenis = getLenis();

    const renderer = new Renderer({ alpha: true, dpr: Math.min(2, window.devicePixelRatio || 1) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const camera = new Camera(gl, { fov: 45 });
    camera.position.z = 2.5;

    const texture = new Texture(gl, { generateMipmaps: false, width: 1280, height: 720 });

    // Show the poster until the first video frame is decoded (no black box).
    if (poster) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (!disposed && !hasVideoFrame) texture.image = img;
      };
      img.src = poster;
    }

    const geometry = new Plane(gl, {
      width: 1,
      height: 1,
      widthSegments: SEGMENTS,
      heightSegments: SEGMENTS,
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      uniforms: { uTexture: { value: texture }, uVelocity: { value: 0 } },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.perspective({ aspect: w / h });
      const viewH = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z;
      const viewW = viewH * (w / h);
      mesh.scale.set(viewW, viewH, 1); // mesh always fills the canvas
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    const onData = () => {
      hasVideoFrame = true;
      texture.image = video;
    };
    video.addEventListener("loadeddata", onData);

    const loop = () => {
      if (disposed || !onScreen) return;
      const rawV = clamp((lenis?.velocity || 0) / VELOCITY_DIVISOR, -1, 1);
      smoothVel += (rawV - smoothVel) * VELOCITY_SMOOTH;
      program.uniforms.uVelocity.value = smoothVel;
      if (hasVideoFrame && video.readyState >= 2) texture.needsUpdate = true;
      renderer.render({ scene: mesh, camera });
      raf = requestAnimationFrame(loop);
    };

    // Only decode + draw while the reel is actually on screen.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !onScreen) {
        onScreen = true;
        video.play().catch(() => {});
        raf = requestAnimationFrame(loop);
      } else if (!e.isIntersecting && onScreen) {
        onScreen = false;
        cancelAnimationFrame(raf);
        video.pause();
      }
    });
    io.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      video.removeEventListener("loadeddata", onData);
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [poster]);

  return (
    <div className="reel-gl" ref={containerRef} aria-hidden="true">
      <video
        ref={videoRef}
        className={useFallback ? "reel-fallback-video" : "reel-hidden-video"}
        src={preview || src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
      />
    </div>
  );
}
