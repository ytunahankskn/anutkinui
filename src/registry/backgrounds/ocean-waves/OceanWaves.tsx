"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

export interface OceanWavesProps {
  palette?: keyof typeof PALETTES;
  /** Dalga yüksekliği çarpanı */
  amplitude?: number;
  speed?: number;
  /** Güneş açısı (derece, 0-360) */
  sunAngle?: number;
  /** Dalga sivriliği / yatay kırılma miktarı */
  choppiness?: number;
  className?: string;
}

export const PALETTES = {
  tropical: {
    deep: "#014a52",
    shallow: "#3fd8c9",
    foam: "#eafffb",
    skyTop: "#1f7fd1",
    skyHorizon: "#bdeeff",
    sun: "#fff6d0",
    fog: "#bfe9ee",
    elevation: 42,
    ink: "#ffffff",
  },
  northSea: {
    deep: "#0f201e",
    shallow: "#3c5c56",
    foam: "#d8e4e0",
    skyTop: "#57676a",
    skyHorizon: "#9fb0ae",
    sun: "#e9e4d8",
    fog: "#8b9b98",
    elevation: 20,
    ink: "#ffffff",
  },
  sunset: {
    deep: "#2c1046",
    shallow: "#7a3fae",
    foam: "#ffe3c2",
    skyTop: "#2c1236",
    skyHorizon: "#ff8a4c",
    sun: "#ffd37a",
    fog: "#e0774c",
    elevation: 8,
    ink: "#fff3e6",
  },
  night: {
    deep: "#010710",
    shallow: "#0c2a4a",
    foam: "#dfe8ff",
    skyTop: "#020411",
    skyHorizon: "#0c2340",
    sun: "#cfe3ff",
    fog: "#0a1830",
    elevation: 34,
    ink: "#e7f0ff",
  },
} as const;

/** Ufuk gradyanı + güneş diski; okyanus yansımasında ve gökyüzü küresinde ortak kullanılır. */
const skyFunctionGLSL = /* glsl */ `
  vec3 skyColor(vec3 dir, vec3 sunDir, vec3 top, vec3 horizon, vec3 sunColor) {
    float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = mix(horizon, top, pow(h, 0.55));
    float sun = pow(max(dot(dir, sunDir), 0.0), 700.0);
    float sunGlow = pow(max(dot(dir, sunDir), 0.0), 10.0) * 0.5;
    col += sunColor * sun * 4.0;
    col += sunColor * sunGlow;
    return col;
  }
`;

const oceanVertexShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uChoppiness;
  uniform float uSpeed;
  varying vec3 vWorldPos;
  varying vec3 vNormalW;
  varying float vHeight;

  // Tek bir Gerstner dalgası: yatayda sivrilme (steepness) + düşeyde yükseklik (amp) üretir.
  vec3 gerstnerOffset(vec2 dir, float wavelength, float steepness, float amp, vec2 pos, float time, out vec3 nAcc) {
    float k = 6.28318530718 / wavelength;
    float c = sqrt(9.8 / k) * 0.5;
    vec2 d = normalize(dir);
    float f = k * dot(d, pos) - time * c;
    float cosF = cos(f);
    float sinF = sin(f);
    vec3 off;
    off.x = steepness * amp * d.x * cosF;
    off.y = steepness * amp * d.y * cosF;
    off.z = amp * sinF;
    nAcc = vec3(d.x * k * amp * cosF, d.y * k * amp * cosF, steepness * k * amp * sinF);
    return off;
  }

  void main() {
    vec2 p = position.xy;
    float t = uTime * uSpeed;

    vec3 offset = vec3(0.0);
    vec3 nAcc = vec3(0.0);
    vec3 tmp;

    offset += gerstnerOffset(vec2(1.0, 0.2), 9.0, 0.55 * uChoppiness, 0.55 * uAmplitude, p, t, tmp); nAcc += tmp;
    offset += gerstnerOffset(vec2(0.5, 0.85), 5.5, 0.4 * uChoppiness, 0.32 * uAmplitude, p, t * 1.25, tmp); nAcc += tmp;
    offset += gerstnerOffset(vec2(-0.7, 0.6), 3.2, 0.3 * uChoppiness, 0.2 * uAmplitude, p, t * 1.6, tmp); nAcc += tmp;
    offset += gerstnerOffset(vec2(0.25, -0.95), 1.7, 0.22 * uChoppiness, 0.12 * uAmplitude, p, t * 2.0, tmp); nAcc += tmp;
    offset += gerstnerOffset(vec2(-0.9, -0.3), 0.9, 0.15 * uChoppiness, 0.06 * uAmplitude, p, t * 2.6, tmp); nAcc += tmp;

    vec3 newPos = position + offset;
    vec3 localNormal = normalize(vec3(-nAcc.x, -nAcc.y, 1.0 - nAcc.z));

    vHeight = newPos.z;
    vNormalW = normalize(normalMatrix * localNormal);
    vec4 worldPos = modelMatrix * vec4(newPos, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

const oceanFragmentShader =
  /* glsl */ `
  precision highp float;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uFoam;
  uniform vec3 uSkyTop;
  uniform vec3 uSkyHorizon;
  uniform vec3 uSunColor;
  uniform vec3 uSunDir;
  uniform vec3 uFog;
  uniform float uAmplitude;
  varying vec3 vWorldPos;
  varying vec3 vNormalW;
  varying float vHeight;
` +
  skyFunctionGLSL +
  /* glsl */ `
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 n = normalize(vNormalW);

    // Beer-Lambert benzeri derinlik emilimi: sığ (tepe) su daha açık, derin (çukur) daha koyu.
    float h = clamp(vHeight * 0.6 + 0.5, 0.0, 1.0);
    float absorb = 1.0 - exp(-h * 2.2);
    vec3 waterColor = mix(uDeep, uShallow, absorb);

    // Fresnel (Schlick yaklaşımı) ile gökyüzü yansıması
    float ndv = clamp(dot(n, viewDir), 0.0, 1.0);
    float fresnel = 0.02 + 0.98 * pow(1.0 - ndv, 5.0);
    vec3 reflectDir = reflect(-viewDir, n);
    vec3 sky = skyColor(reflectDir, uSunDir, uSkyTop, uSkyHorizon, uSunColor);
    vec3 color = mix(waterColor, sky, fresnel);

    // Blinn-Phong güneş parıltısı
    vec3 halfV = normalize(uSunDir + viewDir);
    float spec = pow(clamp(dot(n, halfV), 0.0, 1.0), 400.0);
    color += uSunColor * spec * 2.5;

    // Güneşe bakan dalga tepelerinden sızan subsurface glow
    float sss = pow(clamp(dot(viewDir, -uSunDir), 0.0, 1.0), 2.0) * clamp(vHeight * 1.6, 0.0, 1.0);
    color += uSunColor * sss * 0.4;

    // Tepelerde köpük: yükseklik + kaba hash noise
    float crest = smoothstep(0.5, 1.0, vHeight / max(uAmplitude, 0.05));
    float noise = fract(sin(dot(floor(vWorldPos.xz * 3.0), vec2(12.9898, 78.233))) * 43758.5453);
    float foamMask = smoothstep(0.55, 0.9, crest + noise * 0.18 - 0.09);
    color = mix(color, uFoam, foamMask * 0.85);

    // Ufka doğru sis
    float dist = length(cameraPosition - vWorldPos);
    float fog = smoothstep(10.0, 34.0, dist);
    color = mix(color, uFog, fog);

    // Tonemap + gamma + dither
    color = color / (color + 1.0);
    color = pow(color, vec3(1.0 / 2.2));
    float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
    gl_FragColor = vec4(color + dither, 1.0);
  }
`;

const skyVertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragmentShader =
  /* glsl */ `
  precision highp float;
  uniform vec3 uSkyTop;
  uniform vec3 uSkyHorizon;
  uniform vec3 uSunColor;
  uniform vec3 uSunDir;
  varying vec3 vDir;
` +
  skyFunctionGLSL +
  /* glsl */ `
  void main() {
    vec3 col = skyColor(normalize(vDir), uSunDir, uSkyTop, uSkyHorizon, uSunColor);
    col = col / (col + 1.0);
    col = pow(col, vec3(1.0 / 2.2));
    gl_FragColor = vec4(col, 1.0);
  }
`;

function sunDirection(angleDeg: number, elevationDeg: number) {
  const az = THREE.MathUtils.degToRad(angleDeg);
  const el = THREE.MathUtils.degToRad(elevationDeg);
  return new THREE.Vector3(Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el)).normalize();
}

interface SceneProps {
  amplitude: number;
  speed: number;
  choppiness: number;
  sunAngle: number;
  palette: keyof typeof PALETTES;
}

function OceanSurface({ amplitude, speed, choppiness, sunAngle, palette }: SceneProps) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: 1 },
      uChoppiness: { value: 1 },
      uSpeed: { value: 1 },
      uDeep: { value: new THREE.Color("#014a52") },
      uShallow: { value: new THREE.Color("#3fd8c9") },
      uFoam: { value: new THREE.Color("#eafffb") },
      uSkyTop: { value: new THREE.Color("#1f7fd1") },
      uSkyHorizon: { value: new THREE.Color("#bdeeff") },
      uSunColor: { value: new THREE.Color("#fff6d0") },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uFog: { value: new THREE.Color("#bfe9ee") },
    }),
    [],
  );

  useFrame((_state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const p = PALETTES[palette] ?? PALETTES.tropical;
    u.uTime.value += delta * speed;
    u.uAmplitude.value = amplitude;
    u.uChoppiness.value = choppiness;
    u.uSpeed.value = speed;
    (u.uDeep.value as THREE.Color).set(p.deep);
    (u.uShallow.value as THREE.Color).set(p.shallow);
    (u.uFoam.value as THREE.Color).set(p.foam);
    (u.uSkyTop.value as THREE.Color).set(p.skyTop);
    (u.uSkyHorizon.value as THREE.Color).set(p.skyHorizon);
    (u.uSunColor.value as THREE.Color).set(p.sun);
    (u.uFog.value as THREE.Color).set(p.fog);
    (u.uSunDir.value as THREE.Vector3).copy(sunDirection(sunAngle, p.elevation));
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
      <planeGeometry args={[60, 60, 256, 256]} />
      <shaderMaterial ref={material} vertexShader={oceanVertexShader} fragmentShader={oceanFragmentShader} uniforms={uniforms} />
    </mesh>
  );
}

function SkyDome({ sunAngle, palette }: Pick<SceneProps, "sunAngle" | "palette">) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uSkyTop: { value: new THREE.Color("#1f7fd1") },
      uSkyHorizon: { value: new THREE.Color("#bdeeff") },
      uSunColor: { value: new THREE.Color("#fff6d0") },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    }),
    [],
  );

  useFrame(() => {
    const u = material.current?.uniforms;
    if (!u) return;
    const p = PALETTES[palette] ?? PALETTES.tropical;
    (u.uSkyTop.value as THREE.Color).set(p.skyTop);
    (u.uSkyHorizon.value as THREE.Color).set(p.skyHorizon);
    (u.uSunColor.value as THREE.Color).set(p.sun);
    (u.uSunDir.value as THREE.Vector3).copy(sunDirection(sunAngle, p.elevation));
  });

  return (
    <mesh frustumCulled={false}>
      <sphereGeometry args={[400, 32, 24]} />
      <shaderMaterial
        ref={material}
        vertexShader={skyVertexShader}
        fragmentShader={skyFragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function OceanWaves({
  palette = "tropical",
  amplitude = 1,
  speed = 1,
  sunAngle = 35,
  choppiness = 0.8,
  className,
}: OceanWavesProps) {
  return (
    <div className={className} style={{ position: "absolute", inset: 0 }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <PerspectiveCamera makeDefault position={[0, 2.2, 9]} fov={55} rotation={[-0.12, 0, 0]} />
        <SkyDome sunAngle={sunAngle} palette={palette} />
        <OceanSurface amplitude={amplitude} speed={speed} choppiness={choppiness} sunAngle={sunAngle} palette={palette} />
      </Canvas>
    </div>
  );
}
