"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface AuroraShaderProps {
  /** Animasyon hızı çarpanı */
  speed?: number;
  /** Ana renk tonu (0–360) */
  hue?: number;
  /** Işık yoğunluğu */
  intensity?: number;
  mode?: "dark" | "light";
  className?: string;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uHue;
  uniform float uIntensity;
  uniform vec3 uBg;
  uniform vec2 uRes;
  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += a * snoise(p);
      p = r * p * 2.0 + 10.0;
      a *= 0.5;
    }
    return v;
  }

  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2(uv.x * aspect, uv.y);
    float t = uTime;

    // Perdeler: yatay noise dikey yer değiştirmeyi sürer
    float n = fbm(vec2(p.x * 1.4 + t * 0.12, t * 0.08));
    float n2 = fbm(vec2(p.x * 2.6 - t * 0.07, uv.y * 1.5 + t * 0.05));
    float y = uv.y + n * 0.25 + n2 * 0.12;

    float band = smoothstep(0.12, 0.55, y) * smoothstep(1.08, 0.55, y);
    float streak = 0.55 + 0.45 * fbm(vec2(p.x * 6.0 + t * 0.2, y));
    float glow = band * streak;

    float h = uHue / 360.0;
    vec3 c1 = hsl2rgb(vec3(fract(h), 0.85, 0.55));
    vec3 c2 = hsl2rgb(vec3(fract(h + 0.16), 0.9, 0.5));
    vec3 c3 = hsl2rgb(vec3(fract(h - 0.1), 0.8, 0.6));
    vec3 col = mix(c1, c2, smoothstep(-0.4, 0.6, n));
    col = mix(col, c3, smoothstep(0.3, 1.0, y) * 0.6);

    vec3 outc = mix(uBg, col, clamp(glow * uIntensity, 0.0, 1.0));
    outc += col * 0.06 * smoothstep(0.6, 0.0, uv.y) * uIntensity;

    // dither (banding'i kırar)
    float d = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 255.0;
    gl_FragColor = vec4(outc + d, 1.0);
  }
`;

function AuroraPlane({ speed, hue, intensity, mode }: Required<Omit<AuroraShaderProps, "className">>) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHue: { value: 0 },
      uIntensity: { value: 1 },
      uBg: { value: new THREE.Color("#050508") },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta * speed;
    u.uHue.value = hue;
    u.uIntensity.value = intensity;
    (u.uBg.value as THREE.Color).set(mode === "dark" ? "#050508" : "#f4f4f6");
    (u.uRes.value as THREE.Vector2).set(state.size.width, state.size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function AuroraShader({ speed = 1, hue = 190, intensity = 1, mode = "dark", className }: AuroraShaderProps) {
  return (
    <div className={className} style={{ position: "absolute", inset: 0 }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <AuroraPlane speed={speed} hue={hue} intensity={intensity} mode={mode} />
      </Canvas>
    </div>
  );
}
