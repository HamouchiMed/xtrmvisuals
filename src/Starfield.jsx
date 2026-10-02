import { useEffect, useRef } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";
import { getLenis } from "./lenis.js";

/* Page-wide WebGL starfield. Stars drift slowly, lean toward the pointer, and
   rush toward the camera ("warp") in proportion to scroll speed. */

const DEPTH = 16.0;

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec3 color;
  attribute float size;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uSize;
  uniform float uTravel;
  uniform float uWarp;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    // endless tunnel: wrap stars back to the far plane once they pass the camera
    p.z = mod(p.z + uTravel + ${(DEPTH / 2).toFixed(1)}, ${DEPTH.toFixed(1)}) - ${(DEPTH / 2 + 3).toFixed(1)};
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;
    gl_PointSize = min(uSize * size * (1.0 + uWarp * 0.8) / dist, 14.0);
    vAlpha = smoothstep(0.4, 2.5, dist) * smoothstep(${DEPTH.toFixed(1)}, ${(DEPTH - 5).toFixed(1)}, dist);
    vColor = color;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float a = smoothstep(0.5, 0.0, length(c));
    gl_FragColor = vec4(vColor, a * a * vAlpha * 0.95);
  }
`;

const palette = [
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
  [0.8, 0.72, 1.0],
  [0.96, 0.72, 0.93],
];

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export function Starfield() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !supportsWebGL()) return undefined;

    const small = window.innerWidth < 760;
    const COUNT = small ? 900 : 1800;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const renderer = new Renderer({ alpha: true, dpr, antialias: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 45 });
    camera.position.z = 5;

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.perspective({ aspect: window.innerWidth / window.innerHeight });
    };
    resize();
    window.addEventListener("resize", resize);

    const position = new Float32Array(COUNT * 3);
    const color = new Float32Array(COUNT * 3);
    const size = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      position[i * 3] = (Math.random() - 0.5) * 16;
      position[i * 3 + 1] = (Math.random() - 0.5) * 16;
      position[i * 3 + 2] = Math.random() * DEPTH;
      const c = palette[Math.floor(Math.random() * palette.length)];
      color.set(c, i * 3);
      size[i] = 0.6 + Math.random() * Math.random() * 1.6;
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: position },
      color: { size: 3, data: color },
      size: { size: 1, data: size },
    });
    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      uniforms: { uSize: { value: 26 * dpr }, uTravel: { value: 0 }, uWarp: { value: 0 } },
    });
    program.setBlendFunc(gl.SRC_ALPHA, gl.ONE); // additive glow
    const stars = new Mesh(gl, { mode: gl.POINTS, geometry, program });
    stars.rotation.z = Math.PI / 4;

    const lenis = getLenis();
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let warp = 0;
    let travel = 0;
    let raf = 0;
    let last = 0;

    const onMove = (e) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const loop = (t) => {
      const dt = Math.min(64, last ? t - last : 16) / 16.67;
      last = t;
      const v = Math.min(1, Math.abs(lenis?.velocity || 0) / 60);
      warp += (v - warp) * 0.08;
      travel += (0.0025 + warp * 0.16) * dt;
      stars.rotation.z += 0.00025 * dt;
      rx += (my * 0.18 - rx) * 0.04;
      ry += (mx * 0.18 - ry) * 0.04;
      stars.rotation.x = rx;
      stars.rotation.y = ry;
      program.uniforms.uTravel.value = travel;
      program.uniforms.uWarp.value = warp;
      renderer.render({ scene: stars, camera });
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div className="starfield" ref={containerRef} aria-hidden="true" />;
}
