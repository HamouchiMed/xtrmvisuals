import { useEffect, useRef } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";

const COUNT = 2000;

const vertex = /* glsl */ `
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uSize;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float a = smoothstep(0.5, 0.0, length(c));
    gl_FragColor = vec4(vec3(1.0), a * 0.9);
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

export function Starfield() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !supportsWebGL()) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const renderer = new Renderer({ alpha: true, dpr });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const camera = new Camera(gl, { fov: 45 });
    camera.position.z = 5;

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.perspective({ aspect: window.innerWidth / window.innerHeight });
    };
    resize();
    window.addEventListener("resize", resize);

    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }

    const geometry = new Geometry(gl, { position: { size: 3, data: positions } });
    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      uniforms: { uSize: { value: 42 * dpr } },
    });
    program.setBlendFunc(gl.SRC_ALPHA, gl.ONE); // additive glow
    const stars = new Mesh(gl, { mode: gl.POINTS, geometry, program });
    stars.rotation.z = Math.PI / 4;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let raf = 0;
    let disposed = false;

    const onMove = (e) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);

    const loop = (t) => {
      if (disposed) return;
      stars.rotation.z += 0.0004; // slow constant drift
      if (!reduced) {
        rx += (my * 0.3 - rx) * 0.05; // ease toward mouse
        ry += (mx * 0.3 - ry) * 0.05;
        stars.rotation.x = rx;
        stars.rotation.y = ry + t * 0.00002;
      }
      renderer.render({ scene: stars, camera });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    };
  }, []);

  return <div className="starfield" ref={containerRef} aria-hidden="true" />;
}
