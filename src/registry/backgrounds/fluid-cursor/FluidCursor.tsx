"use client";

import { useEffect, useRef } from "react";

export interface FluidCursorProps {
  palette?: keyof typeof PALETTES;
  /** Splat (dokunuş) yarıçapı */
  splatRadius?: number;
  /** Vorticity confinement (girdap) gücü */
  curl?: number;
  /** Boya (dye) sönümlenme oranı, 1'e yakın = daha uzun kalıcı */
  dissipation?: number;
  /** Etkileşim yokken rastgele splat üretir */
  autoSplats?: boolean;
  className?: string;
}

export const PALETTES = {
  aurora: { colors: ["#2dd4bf", "#8b5cf6", "#f472b6"], bg: "#050912", ink: "#eafffb" },
  candy: { colors: ["#ff6ec7", "#ff9f43", "#ffe66d"], bg: "#1a0f1f", ink: "#fff0f8" },
  ember: { colors: ["#ff3b3b", "#ff8c1a", "#ffcf4d"], bg: "#150605", ink: "#fff2e0" },
  ocean: { colors: ["#2563eb", "#22d3ee", "#e0f2fe"], bg: "#020a14", ink: "#eaf6ff" },
} as const;

interface Config {
  palette: keyof typeof PALETTES;
  splatRadius: number;
  curl: number;
  dissipation: number;
  autoSplats: boolean;
}

function hexToFloatRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// GLSL (WebGL2 / ES300) — tam ekran quad üzerinde koşan sim pass'leri:
// curl -> vorticity -> divergence -> pressure(jacobi) -> gradient subtract -> advect vel -> advect dye -> display
const baseVert = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPosition;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 texelSize;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;
const splatFrag = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
out vec4 fragColor;
void main() {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  float r = max(radius, 0.0001) * 0.003;
  float falloff = exp(-dot(p, p) / r);
  vec3 base = texture(uTarget, vUv).xyz;
  fragColor = vec4(base + color * falloff, 1.0);
}
`;
const curlFrag = /* glsl */ `#version 300 es
precision highp float;
in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
uniform sampler2D uVelocity;
out vec4 fragColor;
void main() {
  float l = texture(uVelocity, vL).y;
  float r = texture(uVelocity, vR).y;
  float t = texture(uVelocity, vT).x;
  float b = texture(uVelocity, vB).x;
  float vorticity = (r - l) - (t - b);
  fragColor = vec4(vorticity, 0.0, 0.0, 1.0);
}
`;
const vorticityFrag = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curlStrength;
uniform float dt;
out vec4 fragColor;
void main() {
  float l = texture(uCurl, vL).x;
  float r = texture(uCurl, vR).x;
  float t = texture(uCurl, vT).x;
  float b = texture(uCurl, vB).x;
  float c = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(t) - abs(b), abs(r) - abs(l));
  force /= length(force) + 0.0001;
  force *= curlStrength * c;
  force.y *= -1.0;
  vec2 vel = texture(uVelocity, vUv).xy;
  fragColor = vec4(vel + force * dt, 0.0, 1.0);
}
`;
const divergenceFrag = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
uniform sampler2D uVelocity;
out vec4 fragColor;
void main() {
  float l = texture(uVelocity, vL).x;
  float r = texture(uVelocity, vR).x;
  float t = texture(uVelocity, vT).y;
  float b = texture(uVelocity, vB).y;
  float div = 0.5 * ((r - l) + (t - b));
  fragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;
const pressureFrag = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
out vec4 fragColor;
void main() {
  float l = texture(uPressure, vL).x;
  float r = texture(uPressure, vR).x;
  float t = texture(uPressure, vT).x;
  float b = texture(uPressure, vB).x;
  float div = texture(uDivergence, vUv).x;
  float p = (l + r + t + b - div) * 0.25;
  fragColor = vec4(p, 0.0, 0.0, 1.0);
}
`;
const gradientSubtractFrag = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
out vec4 fragColor;
void main() {
  float l = texture(uPressure, vL).x;
  float r = texture(uPressure, vR).x;
  float t = texture(uPressure, vT).x;
  float b = texture(uPressure, vB).x;
  vec2 vel = texture(uVelocity, vUv).xy;
  vel -= vec2(r - l, t - b) * 0.5;
  fragColor = vec4(vel, 0.0, 1.0);
}
`;
const advectionFrag = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
out vec4 fragColor;
void main() {
  vec2 vel = texture(uVelocity, vUv).xy;
  vec2 coord = vUv - dt * vel * texelSize * 128.0;
  coord = clamp(coord, vec2(0.0), vec2(1.0));
  vec4 result = texture(uSource, coord);
  fragColor = dissipation * result;
}
`;
const clearFrag = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
out vec4 fragColor;
void main() {
  fragColor = value * texture(uTexture, vUv);
}
`;
const displayFrag = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTexture;
uniform vec3 uBg;
out vec4 fragColor;
void main() {
  vec3 dye = texture(uTexture, vUv).rgb;
  vec3 col = uBg + dye;
  col = col / (col + 1.0);
  col = pow(col, vec3(1.0 / 2.2));
  fragColor = vec4(col, 1.0);
}
`;

// WebGL2 yardımcıları: program/FBO oluşturma ve temizleme
function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader));
  return shader;
}

interface Program {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
}

function createProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): Program {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(program));
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }
  return { program, uniforms };
}

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
}

function createFBO(gl: WebGL2RenderingContext, w: number, h: number, internalFormat: number, format: number, type: number): FBO {
  const texture = gl.createTexture()!;
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach((p) => gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR));
  [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((p) => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return { texture, fbo, width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h };
}

function deleteFBO(gl: WebGL2RenderingContext, fbo: FBO) {
  gl.deleteTexture(fbo.texture);
  gl.deleteFramebuffer(fbo.fbo);
}

interface DoubleFBO {
  read: FBO;
  write: FBO;
  swap(): void;
}

function createDoubleFBO(gl: WebGL2RenderingContext, w: number, h: number, internalFormat: number, format: number, type: number): DoubleFBO {
  let a = createFBO(gl, w, h, internalFormat, format, type);
  let b = createFBO(gl, w, h, internalFormat, format, type);
  return {
    get read() {
      return a;
    },
    get write() {
      return b;
    },
    swap() {
      const tmp = a;
      a = b;
      b = tmp;
    },
  };
}

function getResolution(base: number, w: number, h: number) {
  let aspect = w / h;
  if (aspect < 1) aspect = 1 / aspect;
  const min = Math.round(base);
  const max = Math.round(base * aspect);
  return w > h ? { width: max, height: min } : { width: min, height: max };
}

const PRESSURE_ITERATIONS = 20;
const SIM_RES = 128;
const DYE_RES = 512;

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function FluidCursor({
  palette = "aurora",
  splatRadius = 0.35,
  curl = 25,
  dissipation = 0.985,
  autoSplats = true,
  className,
}: FluidCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configRef = useRef<Config>({ palette, splatRadius, curl, dissipation, autoSplats });

  useEffect(() => {
    configRef.current = { palette, splatRadius, curl, dissipation, autoSplats };
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false }) as WebGL2RenderingContext | null;
    if (!gl) return;

    // Yarı-float renderable hedef desteği; yoksa RGBA8/UNSIGNED_BYTE'a düş.
    const floatExt = gl.getExtension("EXT_color_buffer_float");
    const supportsFloat = !!floatExt;
    const texType = supportsFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;
    const rgba = { internalFormat: supportsFloat ? gl.RGBA16F : gl.RGBA, format: gl.RGBA };
    const rg = { internalFormat: supportsFloat ? gl.RG16F : gl.RGBA, format: supportsFloat ? gl.RG : gl.RGBA };

    const programs = {
      splat: createProgram(gl, baseVert, splatFrag),
      curl: createProgram(gl, baseVert, curlFrag),
      vorticity: createProgram(gl, baseVert, vorticityFrag),
      divergence: createProgram(gl, baseVert, divergenceFrag),
      pressure: createProgram(gl, baseVert, pressureFrag),
      gradient: createProgram(gl, baseVert, gradientSubtractFrag),
      advection: createProgram(gl, baseVert, advectionFrag),
      clear: createProgram(gl, baseVert, clearFrag),
      display: createProgram(gl, baseVert, displayFrag),
    };

    const quadBuffer = gl.createBuffer()!;
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    function blit(target: FBO | null) {
      gl!.bindVertexArray(vao);
      if (target) {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
        gl!.viewport(0, 0, target.width, target.height);
      } else {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
        gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
      }
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }
    // Doku birimini bağla + örnekleyici uniform'unu set et (pass'lerdeki tekrarı azaltır)
    function bindTex(unit: number, tex: WebGLTexture, loc: WebGLUniformLocation | null) {
      gl!.activeTexture(gl!.TEXTURE0 + unit);
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      if (loc) gl!.uniform1i(loc, unit);
    }

    let velocity: DoubleFBO;
    let dye: DoubleFBO;
    let divergence: FBO;
    let curlFBO: FBO;
    let pressure: DoubleFBO;

    // Tüm sim FBO'larını temizler (resize'da yeniden oluşturmadan önce ve unmount'ta)
    let ready = false;
    let failed = false;

    function disposeFBOs() {
      if (!ready) return;
      [velocity.read, velocity.write, dye.read, dye.write, divergence, curlFBO, pressure.read, pressure.write].forEach((f) =>
        deleteFBO(gl!, f),
      );
      ready = false;
    }

    function initFBOs() {
      const simSize = getResolution(SIM_RES, canvas!.width, canvas!.height);
      const dyeSize = getResolution(DYE_RES, canvas!.width, canvas!.height);
      disposeFBOs();
      try {
        velocity = createDoubleFBO(gl!, simSize.width, simSize.height, rg.internalFormat, rg.format, texType);
        dye = createDoubleFBO(gl!, dyeSize.width, dyeSize.height, rgba.internalFormat, rgba.format, texType);
        divergence = createFBO(gl!, simSize.width, simSize.height, rg.internalFormat, rg.format, texType);
        curlFBO = createFBO(gl!, simSize.width, simSize.height, rg.internalFormat, rg.format, texType);
        pressure = createDoubleFBO(gl!, simSize.width, simSize.height, rg.internalFormat, rg.format, texType);
        ready = true;
      } catch (err) {
        failed = true;
        console.error("[FluidCursor] FBO init failed:", err);
      }
    }

    function resize() {
      const rect = container!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
        canvas!.style.width = `${rect.width}px`;
        canvas!.style.height = `${rect.height}px`;
        initFBOs();
      }
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let colorPhase = 0;
    function nextColor(): [number, number, number] {
      const cfg = configRef.current;
      const colors = PALETTES[cfg.palette]?.colors ?? PALETTES.aurora.colors;
      colorPhase += 0.35;
      const idx = colorPhase % colors.length;
      const i0 = Math.floor(idx);
      const i1 = (i0 + 1) % colors.length;
      const t = idx - i0;
      const c0 = hexToFloatRgb(colors[i0]);
      const c1 = hexToFloatRgb(colors[i1]);
      return [c0[0] + (c1[0] - c0[0]) * t, c0[1] + (c1[1] - c0[1]) * t, c0[2] + (c1[2] - c0[2]) * t];
    }

    function splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
      if (!ready) return;
      const cfg = configRef.current;
      const s = programs.splat;
      gl!.useProgram(s.program);
      gl!.uniform1f(s.uniforms.aspectRatio, canvas!.width / canvas!.height);
      gl!.uniform2f(s.uniforms.point, x, y);
      gl!.uniform1f(s.uniforms.radius, cfg.splatRadius);

      bindTex(0, velocity.read.texture, s.uniforms.uTarget);
      gl!.uniform3f(s.uniforms.color, dx, dy, 0.0);
      blit(velocity.write);
      velocity.swap();

      bindTex(0, dye.read.texture, s.uniforms.uTarget);
      gl!.uniform3f(s.uniforms.color, color[0], color[1], color[2]);
      blit(dye.write);
      dye.swap();
    }

    const pointer = { x: 0.5, y: 0.5, has: false };
    function handlePointerMove(e: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      const prevHas = pointer.has;
      const dx = prevHas ? (x - pointer.x) * 6.0 : 0;
      const dy = prevHas ? (y - pointer.y) * 6.0 : 0;
      pointer.x = x;
      pointer.y = y;
      pointer.has = true;
      if (prevHas && (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001)) {
        splat(x, y, dx, dy, nextColor());
      }
    }
    function handlePointerLeave() {
      pointer.has = false;
    }
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    let raf = 0;
    let last = performance.now();
    let idleTimer = 0;
    let nextIdleDelay = 1.2;

    // Pass pipeline: curl -> vorticity confinement -> divergence -> pressure (jacobi) -> gradient
    // subtract -> advect velocity -> advect dye. Her adım kendi read/write FBO'sunu swap eder.
    function simulate(dt: number, cfg: Config) {
      gl!.disable(gl!.BLEND);
      const tx = velocity.read.texelSizeX;
      const ty = velocity.read.texelSizeY;

      const c = programs.curl;
      gl!.useProgram(c.program);
      gl!.uniform2f(c.uniforms.texelSize, tx, ty);
      bindTex(0, velocity.read.texture, c.uniforms.uVelocity);
      blit(curlFBO);
      const v = programs.vorticity;
      gl!.useProgram(v.program);
      gl!.uniform2f(v.uniforms.texelSize, tx, ty);
      gl!.uniform1f(v.uniforms.curlStrength, cfg.curl);
      gl!.uniform1f(v.uniforms.dt, dt);
      bindTex(0, velocity.read.texture, v.uniforms.uVelocity);
      bindTex(1, curlFBO.texture, v.uniforms.uCurl);
      blit(velocity.write);
      velocity.swap();
      const d = programs.divergence;
      gl!.useProgram(d.program);
      gl!.uniform2f(d.uniforms.texelSize, tx, ty);
      bindTex(0, velocity.read.texture, d.uniforms.uVelocity);
      blit(divergence);
      const cl = programs.clear;
      gl!.useProgram(cl.program);
      gl!.uniform1f(cl.uniforms.value, 0.8);
      bindTex(0, pressure.read.texture, cl.uniforms.uTexture);
      blit(pressure.write);
      pressure.swap();
      const pr = programs.pressure;
      gl!.useProgram(pr.program);
      gl!.uniform2f(pr.uniforms.texelSize, pressure.read.texelSizeX, pressure.read.texelSizeY);
      bindTex(1, divergence.texture, pr.uniforms.uDivergence);
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        bindTex(0, pressure.read.texture, pr.uniforms.uPressure);
        blit(pressure.write);
        pressure.swap();
      }
      const g = programs.gradient;
      gl!.useProgram(g.program);
      gl!.uniform2f(g.uniforms.texelSize, pressure.read.texelSizeX, pressure.read.texelSizeY);
      bindTex(0, pressure.read.texture, g.uniforms.uPressure);
      bindTex(1, velocity.read.texture, g.uniforms.uVelocity);
      blit(velocity.write);
      velocity.swap();
      const a = programs.advection;
      gl!.useProgram(a.program);
      gl!.uniform2f(a.uniforms.texelSize, tx, ty);
      gl!.uniform1f(a.uniforms.dt, dt);
      gl!.uniform1f(a.uniforms.dissipation, 0.98);
      bindTex(0, velocity.read.texture, a.uniforms.uVelocity);
      gl!.uniform1i(a.uniforms.uSource, 0);
      blit(velocity.write);
      velocity.swap();
      gl!.uniform2f(a.uniforms.texelSize, dye.read.texelSizeX, dye.read.texelSizeY);
      gl!.uniform1f(a.uniforms.dissipation, cfg.dissipation);
      bindTex(0, velocity.read.texture, a.uniforms.uVelocity);
      bindTex(1, dye.read.texture, a.uniforms.uSource);
      blit(dye.write);
      dye.swap();
    }

    function renderToScreen(cfg: Config) {
      const p = PALETTES[cfg.palette] ?? PALETTES.aurora;
      const bg = hexToFloatRgb(p.bg);
      const disp = programs.display;
      gl!.useProgram(disp.program);
      bindTex(0, dye.read.texture, disp.uniforms.uTexture);
      gl!.uniform3f(disp.uniforms.uBg, bg[0] * 0.6, bg[1] * 0.6, bg[2] * 0.6);
      blit(null);
    }

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.0166);
      last = now;
      const cfg = configRef.current;
      if (failed) return; // FBO'lar oluşturulamadı; döngüyü durdur
      if (!ready) {
        raf = requestAnimationFrame(frame);
        return;
      }

      idleTimer += dt;
      if (cfg.autoSplats && idleTimer > nextIdleDelay) {
        idleTimer = 0;
        nextIdleDelay = 1.0 + Math.random() * 0.4;
        const angle = Math.random() * Math.PI * 2;
        const mag = 0.5 + Math.random() * 0.6;
        splat(Math.random(), Math.random(), Math.cos(angle) * mag, Math.sin(angle) * mag, nextColor());
      }

      simulate(dt, cfg);
      renderToScreen(cfg);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      Object.values(programs).forEach((p) => gl!.deleteProgram(p.program));
      disposeFBOs();
      gl!.deleteBuffer(quadBuffer);
      gl!.deleteVertexArray(vao);
    };
  }, []);

  const bg = PALETTES[palette]?.bg ?? PALETTES.aurora.bg;

  return (
    <div ref={containerRef} className={className} style={{ position: "absolute", inset: 0, overflow: "hidden", background: bg }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
