"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface VolumetricCloudsProps {
  palette?: keyof typeof PALETTES;
  /** Bulut örtüsü yoğunluğu (0-1'e yakın eşik) */
  coverage?: number;
  speed?: number;
  /** Güneş açısı (derece, 0-360) */
  sunAngle?: number;
  /** Işık soğurma / yoğunluk çarpanı */
  density?: number;
  className?: string;
}

export const PALETTES = {
  day: { skyTop: "#1c78d1", skyHorizon: "#bfe4ff", sun: "#fff8e0", elevation: 55, ink: "#ffffff" },
  sunset: { skyTop: "#2b1145", skyHorizon: "#ff7a4d", sun: "#ffd27a", elevation: 12, ink: "#fff3e6" },
  storm: { skyTop: "#20242a", skyHorizon: "#565c62", sun: "#cdd3d8", elevation: 30, ink: "#ffffff" },
  dusk: { skyTop: "#0d1a3a", skyHorizon: "#5a3a66", sun: "#ffb37a", elevation: 8, ink: "#ffe9d9" },
} as const;

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
  uniform float uCoverage;
  uniform float uDensity;
  uniform vec3 uSkyTop;
  uniform vec3 uSkyHorizon;
  uniform vec3 uSunColor;
  uniform vec3 uSunDir;
  uniform vec2 uRes;
  varying vec2 vUv;

  // --- 3D value noise + fbm (bulut yoğunluk alanı için) ---
  float hash3(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise3(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash3(i + vec3(0.0, 0.0, 0.0)), hash3(i + vec3(1.0, 0.0, 0.0)), f.x),
          mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
      mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x),
          mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
      f.z
    );
  }

  float fbm3(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise3(p);
      p = p * 2.02 + vec3(0.0, 0.0, 8.0);
      a *= 0.5;
    }
    return v;
  }

  const float SLAB_MIN = 1.5;
  const float SLAB_MAX = 4.0;

  float cloudDensity(vec3 p, float coverage, float time) {
    vec3 q = p * 0.35 + vec3(time * 0.06, 0.0, time * 0.09);
    float n = fbm3(q);
    float heightFrac = clamp((p.y - SLAB_MIN) / (SLAB_MAX - SLAB_MIN), 0.0, 1.0);
    float heightGrad = smoothstep(0.0, 0.25, heightFrac) * smoothstep(1.0, 0.55, heightFrac);
    float d = n - (1.0 - coverage);
    return max(d, 0.0) * heightGrad;
  }

  // Güneşe doğru 3 ucuz ışık adımı: Beer-Lambert soğurumu için birikimli yoğunluk
  float lightMarch(vec3 p, vec3 sunDir, float coverage, float time) {
    float dens = 0.0;
    float stepLen = 0.55;
    vec3 pos = p;
    for (int i = 0; i < 3; i++) {
      pos += sunDir * stepLen;
      dens += cloudDensity(pos, coverage, time);
    }
    return dens * stepLen;
  }

  float henyeyGreenstein(float cosAngle, float g) {
    float g2 = g * g;
    return (1.0 - g2) / (4.0 * 3.14159265 * pow(max(1.0 + g2 - 2.0 * g * cosAngle, 0.001), 1.5));
  }

  vec3 skyColor(vec3 dir, vec3 sunDir, vec3 top, vec3 horizon, vec3 sunColor) {
    float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = mix(horizon, top, pow(h, 0.5));
    float sun = pow(max(dot(dir, sunDir), 0.0), 600.0);
    float glow = pow(max(dot(dir, sunDir), 0.0), 8.0) * 0.6;
    col += sunColor * sun * 4.0;
    col += sunColor * glow;
    return col;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float aspect = uRes.x / uRes.y;
    uv.x *= aspect;

    // Sabit kamera, orijinde, hafifçe yukarı bakıyor (pitch offsetli ray yönü)
    vec3 rayDir = normalize(vec3(uv.x, uv.y * 0.8 + 0.35, -1.4));
    vec3 ro = vec3(0.0, 0.0, 0.0);
    vec3 sunDir = normalize(uSunDir);

    vec3 sky = skyColor(rayDir, sunDir, uSkyTop, uSkyHorizon, uSunColor);
    vec3 cloudColor = vec3(0.0);
    float transmittance = 1.0;

    if (rayDir.y > 0.001) {
      float tNear = max((SLAB_MIN - ro.y) / rayDir.y, 0.0);
      float tFar = (SLAB_MAX - ro.y) / rayDir.y;
      float stepSize = max((tFar - tNear) / 24.0, 0.001);
      float t = tNear;
      float cosAngle = dot(rayDir, sunDir);
      float hg = henyeyGreenstein(cosAngle, 0.5);
      vec3 ambient = mix(uSkyHorizon, uSkyTop, 0.5) * 0.55;

      // 24 adıma kadar raymarch, transmittance düştüğünde erken çıkış
      for (int i = 0; i < 24; i++) {
        if (transmittance < 0.01) break;
        vec3 pos = ro + rayDir * t;
        float dens = cloudDensity(pos, uCoverage, uTime);
        if (dens > 0.001) {
          float lightDens = lightMarch(pos, sunDir, uCoverage, uTime);
          float beer = exp(-lightDens * uDensity * 1.1);
          vec3 lit = uSunColor * beer * hg * 3.0 + ambient;
          float stepAbsorb = clamp(dens * uDensity * stepSize, 0.0, 1.0);
          cloudColor += lit * stepAbsorb * transmittance;
          transmittance *= exp(-dens * uDensity * stepSize * 1.5);
        }
        t += stepSize;
      }
    }

    vec3 col = sky * transmittance + cloudColor;

    float haze = smoothstep(0.35, -0.05, rayDir.y);
    col = mix(col, uSkyHorizon, haze * 0.35);

    col = col / (col + 1.0);
    col = pow(col, vec3(1.0 / 2.2));
    float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
    gl_FragColor = vec4(col + dither, 1.0);
  }
`;

function sunDirection(angleDeg: number, elevationDeg: number, nudgeX: number, nudgeY: number) {
  const az = THREE.MathUtils.degToRad(angleDeg);
  const el = THREE.MathUtils.degToRad(elevationDeg);
  const dir = new THREE.Vector3(Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el));
  dir.x += nudgeX * 0.15;
  dir.y += nudgeY * 0.08;
  return dir.normalize();
}

function CloudsPlane({
  coverage,
  speed,
  sunAngle,
  density,
  palette,
}: Required<Omit<VolumetricCloudsProps, "className">>) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCoverage: { value: 0.55 },
      uDensity: { value: 1.4 },
      uSkyTop: { value: new THREE.Color("#1c78d1") },
      uSkyHorizon: { value: new THREE.Color("#bfe4ff") },
      uSunColor: { value: new THREE.Color("#fff8e0") },
      uSunDir: { value: new THREE.Vector3(0.3, 0.7, 0.4) },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const p = PALETTES[palette] ?? PALETTES.day;
    u.uTime.value += delta * speed;
    u.uCoverage.value = coverage;
    u.uDensity.value = density;
    (u.uSkyTop.value as THREE.Color).set(p.skyTop);
    (u.uSkyHorizon.value as THREE.Color).set(p.skyHorizon);
    (u.uSunColor.value as THREE.Color).set(p.sun);
    (u.uRes.value as THREE.Vector2).set(state.size.width, state.size.height);
    // İmleç güneşi hafifçe iter
    (u.uSunDir.value as THREE.Vector3).copy(sunDirection(sunAngle, p.elevation, state.pointer.x, state.pointer.y));
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
export function VolumetricClouds({
  palette = "day",
  coverage = 0.55,
  speed = 1,
  sunAngle = 60,
  density = 1.4,
  className,
}: VolumetricCloudsProps) {
  return (
    <div className={className} style={{ position: "absolute", inset: 0 }}>
      <Canvas dpr={[1, 1]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <CloudsPlane coverage={coverage} speed={speed} sunAngle={sunAngle} density={density} palette={palette} />
      </Canvas>
    </div>
  );
}
