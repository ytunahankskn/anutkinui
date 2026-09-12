"use client";

import { Component, Suspense, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Environment, Float, Html, OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

/** Kitap geometrisi sabitleri (kemik zinciriyle kıvrılan sayfa tekniği). */
const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const INSIDE_CURVE_STRENGTH = 0.18;
const OUTSIDE_CURVE_STRENGTH = 0.05;
const TURNING_CURVE_STRENGTH = 0.09;
const EASING_ROTATION = 2;
const EASING_FOLD = 4;

const EDGE_COLOR = "#f4efe2";
const INK_ON_PAPER = "#2b2013";
const SERIF = "Georgia, 'Times New Roman', serif";
const HDRI = "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr";

const PHOTO_IDS = [
  "1506905925346-21bda4d32df4", "1519681393784-d120267933ba", "1469474968028-56623f02e42e",
  "1500530855697-b586d89ba3ee", "1507525428034-b723cf961d3e", "1470071459604-3b5ec3a7fe05",
] as const;

const PHOTO_CAPTIONS = ["Mountain Lake", "Night Peaks", "The Valley", "Misty Summits", "Low Tide", "Foggy Pines"];
const CHAPTER_TITLES = ["The Weight of Motion", "Field Notes", "Quiet Mechanics", "Grain and Light"];

const PROSE_PARAGRAPHS = [
  "Every fold begins as a suggestion, a crease so faint it could be mistaken for a shadow. Only after the hand returns to it again and again does the paper agree to remember, and the memory becomes a hinge.",
  "There is a kind of engineering in a book that nobody credits: the spine that trusts a hundred thin sheets to swing without splitting, the corner that survives a thousand careless closings.",
  "Light moves across the page the way weather moves across a valley, indifferent, unhurried, revealing texture that was always there but never announced.",
  "We tend to think of stillness as the absence of motion, but a closed book is not still. It is motion held in reserve, a spring wound tight and waiting for a thumb.",
  "The curl of a turning page traces a curve no engineer would choose on purpose, and yet it is exactly the curve that lets the sheet fall without a sound.",
];

const CAPTION_LINES = [
  "Recorded on a quiet morning, before the wind had a chance to disagree with the light.",
  "The kind of place that looks staged until you remember nobody built it.",
  "A pause worth keeping, filed here between two chapters that needed the rest.",
];

export interface PageFlipBookProps {
  palette?: keyof typeof PALETTES;
  /** Kapaklar arasındaki sayfa (yaprak) sayısı */
  pages?: number;
  /** Otomatik sayfa çevirme */
  autoFlip?: boolean;
  /** Kıvrılma / eğilme şiddeti */
  curl?: number;
  title?: string;
  className?: string;
}

export const PALETTES = {
  leather: { cover: "#3b2a1f", paper: "#f3ecdc", backdrop: "#101012", ink: "#f3ecdc" },
  linen: { cover: "#2f4858", paper: "#f6f1e7", backdrop: "#0e1418", ink: "#f6f1e7" },
  noir: { cover: "#151515", paper: "#e8e4d8", backdrop: "#050505", ink: "#e8e4d8" },
  rose: { cover: "#7a2d4a", paper: "#fbf5ee", backdrop: "#1a0a10", ink: "#fbf5ee" },
} as const;

type Palette = (typeof PALETTES)[keyof typeof PALETTES];

/** Deterministik PRNG (mulberry32): aynı seed her zaman aynı dizilimi verir. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function photoUrl(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=1024&h=1368&fit=crop&q=70`;
}

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext("2d") };
}

/** Paylaşılan sayfa geometrisi — modül düzeyinde bir kez oluşturulur, skinning attribute'ları eklenir. */
function createPageGeometry() {
  const geometry = new THREE.BoxGeometry(PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH, PAGE_SEGMENTS, 2);
  geometry.translate(PAGE_WIDTH / 2, 0, 0);

  const position = geometry.attributes.position;
  const skinIndices: number[] = [];
  const skinWeights: number[] = [];
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
    const skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;
    skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }
  geometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeights, 4));
  return geometry;
}

const pageGeometry = createPageGeometry();

/* ------------------------------ canvas dokular ------------------------------ */

function wrapWords(ctx: CanvasRenderingContext2D, words: string[], maxWidth: number): string[][] {
  const lines: string[][] = [];
  let current: string[] = [];
  for (const word of words) {
    const test = [...current, word].join(" ");
    if (current.length > 0 && ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = [word];
    } else {
      current.push(word);
    }
  }
  if (current.length) lines.push(current);
  return lines;
}

function drawPaperBase(ctx: CanvasRenderingContext2D, w: number, h: number, paper: string, seed: number) {
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, w, h);
  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.75);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.06)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  const rand = seeded(seed);
  ctx.fillStyle = "rgba(0,0,0,0.035)";
  for (let i = 0; i < 900; i++) ctx.fillRect(rand() * w, rand() * h, 1, 1);
}

/** Kağıt lifi/pürüzlülük haritası — tüm sayfalar arasında paylaşılır. */
function createPaperRoughnessTexture() {
  const size = 256;
  const { canvas, ctx } = makeCanvas(size, size);
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const imageData = ctx.createImageData(size, size);
  const rand = seeded(1337);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const v = 150 + Math.floor(rand() * 80);
    imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = v;
    imageData.data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

interface TextCanvasOptions {
  header: string; title: string; paragraphs: string[];
  pageNumber: number; paper: string; dropCap: boolean; seed: number;
}

/** Bir metin sayfası çizer: koşu başlığı, bölüm başlığı, düşük harf (drop cap) ve gövde. */
function renderTextCanvas(opts: TextCanvasOptions) {
  const w = 1024;
  const h = 1368;
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;
  drawPaperBase(ctx, w, h, opts.paper, opts.seed);

  const marginX = 96;
  const contentWidth = w - marginX * 2;
  ctx.fillStyle = "rgba(43,32,19,0.55)";
  ctx.font = `italic 20px ${SERIF}`;
  ctx.fillText(opts.header.toUpperCase(), marginX, 74);
  ctx.strokeStyle = "rgba(43,32,19,0.25)";
  ctx.beginPath();
  ctx.moveTo(marginX, 92);
  ctx.lineTo(w - marginX, 92);
  ctx.stroke();

  ctx.fillStyle = INK_ON_PAPER;
  ctx.font = `600 46px ${SERIF}`;
  ctx.fillText(opts.title, marginX, 168);

  const lineHeight = 34;
  ctx.font = `24px ${SERIF}`;
  let y = 236;
  const flow = (words: string[], indent = 0) =>
    wrapWords(ctx, words, contentWidth - indent).forEach((line) => {
      y += lineHeight;
      ctx.fillText(line.join(" "), marginX + indent, y - lineHeight * 0.2);
    });

  const paras = opts.paragraphs;
  if (opts.dropCap && paras.length > 0) {
    const capSize = 96;
    const capLines = 3;
    const capIndent = 66;
    ctx.font = `700 ${capSize}px ${SERIF}`;
    ctx.fillText(paras[0][0] ?? "", marginX, y + capSize * 0.78);
    ctx.font = `24px ${SERIF}`;

    const words = paras[0].slice(1).trim().split(/\s+/);
    const narrow = wrapWords(ctx, words, contentWidth - capIndent).slice(0, capLines);
    narrow.forEach((line, i) => ctx.fillText(line.join(" "), marginX + capIndent, y + i * lineHeight + lineHeight * 0.8));
    y += capLines * lineHeight;
    flow(words.slice(narrow.reduce((n, l) => n + l.length, 0)));
    y += lineHeight * 0.6;
    paras.slice(1).forEach((para) => {
      y += lineHeight * 0.4;
      flow(para.split(/\s+/));
    });
  } else {
    paras.forEach((para) => {
      flow(para.split(/\s+/));
      y += lineHeight * 0.6;
    });
  }

  ctx.fillStyle = "rgba(43,32,19,0.5)";
  ctx.font = `18px ${SERIF}`;
  ctx.textAlign = "center";
  ctx.fillText(String(opts.pageNumber), w / 2, h - 56);
  return canvas;
}

interface CoverCanvasOptions { cover: string; title: string; isBack: boolean; seed: number }

/** Kapak dokusu: koyu deri tonu üstünde kabartma hissi veren başlık. */
function renderCoverCanvas(opts: CoverCanvasOptions) {
  const w = 1024;
  const h = 1368;
  const { canvas, ctx } = makeCanvas(w, h);
  if (!ctx) return canvas;

  ctx.fillStyle = opts.cover;
  ctx.fillRect(0, 0, w, h);
  const sheen = ctx.createRadialGradient(w * 0.35, h * 0.3, 40, w * 0.5, h * 0.5, h * 0.9);
  sheen.addColorStop(0, "rgba(255,255,255,0.08)");
  sheen.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);

  const rand = seeded(opts.seed);
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  for (let i = 0; i < 4000; i++) ctx.fillRect(rand() * w, rand() * h, 1, 1);

  const inset = 56;
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 3;
  ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1;
  ctx.strokeRect(inset + 6, inset + 6, w - (inset + 6) * 2, h - (inset + 6) * 2);

  if (!opts.isBack) {
    ctx.textAlign = "center";
    ctx.font = `italic 26px ${SERIF}`;
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillText("— a field journal —", w / 2, h / 2 - 70);

    ctx.font = `600 58px ${SERIF}`;
    const lines = wrapWords(ctx, opts.title.split(/\s+/), w - inset * 3);
    const lh = 66;
    const startY = h / 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((line, i) => {
      const text = line.join(" ");
      const ly = startY + i * lh;
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillText(text, w / 2 + 3, ly + 3);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillText(text, w / 2, ly);
    });
  }
  return canvas;
}

interface Leaf { front: THREE.Texture; back: THREE.Texture; isCover: boolean }

function buildLeaves(pages: number, palette: Palette, title: string, photos: THREE.Texture[]) {
  const owned: THREE.Texture[] = [];
  const own = (canvas: HTMLCanvasElement) => {
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    owned.push(texture);
    return texture;
  };
  const text = (t: string, paragraphs: string[], pageNumber: number, dropCap: boolean, seed: number) =>
    own(renderTextCanvas({ header: title, title: t, paragraphs, pageNumber, paper: palette.paper, dropCap, seed }));
  const cover = (isBack: boolean, seed: number) => own(renderCoverCanvas({ cover: palette.cover, title, isBack, seed }));

  const leaves: Leaf[] = [
    { front: cover(false, 1), back: text("Preface", [PROSE_PARAGRAPHS[0]], 1, true, 2), isCover: true },
  ];

  for (let i = 0; i < pages; i++) {
    const photo = photos[i % photos.length];
    const chapter = text(
      CHAPTER_TITLES[i % CHAPTER_TITLES.length],
      [PROSE_PARAGRAPHS[i % PROSE_PARAGRAPHS.length], PROSE_PARAGRAPHS[(i + 1) % PROSE_PARAGRAPHS.length], PROSE_PARAGRAPHS[(i + 2) % PROSE_PARAGRAPHS.length]],
      i * 2 + 2,
      true,
      100 + i * 7,
    );
    const caption = text(PHOTO_CAPTIONS[i % PHOTO_CAPTIONS.length], [CAPTION_LINES[i % CAPTION_LINES.length]], i * 2 + 3, false, 200 + i * 11);
    leaves.push(i % 2 === 0 ? { front: photo, back: caption, isCover: false } : { front: chapter, back: photo, isCover: false });
  }

  leaves.push({
    front: text("Colophon", [PROSE_PARAGRAPHS[PROSE_PARAGRAPHS.length - 1]], pages * 2 + 2, true, 3),
    back: cover(true, 4),
    isCover: true,
  });

  return { leaves, owned };
}

/* --------------------------------- sayfa --------------------------------- */

interface PageProps {
  number: number; page: number; totalLeaves: number; curl: number;
  frontMap: THREE.Texture; backMap: THREE.Texture; paperRoughness: THREE.Texture;
  isCover: boolean; onFlip: (next: number) => void;
}

function Page({ number, page, totalLeaves, curl, frontMap, backMap, paperRoughness, isCover, onFlip }: PageProps) {
  const opened = page > number;
  const bookClosed = page === 0 || page === totalLeaves;

  const meshData = useMemo(() => {
    const boneList: THREE.Bone[] = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new THREE.Bone();
      bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH;
      boneList.push(bone);
      if (i > 0) boneList[i - 1].add(bone);
    }
    const skeleton = new THREE.Skeleton(boneList);

    const edge = new THREE.MeshStandardMaterial({ color: EDGE_COLOR, roughness: 0.85 });
    const roughness = isCover ? 0.6 : 0.9;
    const paperMaterial = (map: THREE.Texture) =>
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        map,
        roughnessMap: isCover ? null : paperRoughness,
        roughness,
        emissive: new THREE.Color("#ffffff"),
        emissiveIntensity: 0,
      });
    const front = paperMaterial(frontMap);
    const back = paperMaterial(backMap);
    const skinnedMesh = new THREE.SkinnedMesh(pageGeometry, [edge, edge, edge, edge, front, back]);
    skinnedMesh.add(boneList[0]);
    skinnedMesh.bind(skeleton);
    skinnedMesh.castShadow = true;
    skinnedMesh.receiveShadow = true;
    skinnedMesh.frustumCulled = false;
    return { mesh: skinnedMesh, bones: boneList };
  }, [frontMap, backMap, paperRoughness, isCover]);

  // Bone/mesh nesnelerine sadece ref üzerinden, render dışında (effect/useFrame) dokunuyoruz.
  const dataRef = useRef<typeof meshData | null>(null);
  useEffect(() => {
    dataRef.current = meshData;
    return () => {
      const materials = Array.isArray(meshData.mesh.material) ? meshData.mesh.material : [meshData.mesh.material];
      materials.forEach((m) => m.dispose());
    };
  }, [meshData]);

  const turnedAt = useRef(0);
  const wasOpened = useRef(opened);
  const hovered = useRef(false);

  useFrame((state, delta) => {
    const data = dataRef.current;
    if (!data) return;
    const { mesh, bones } = data;

    const nowMs = state.clock.elapsedTime * 1000;
    if (opened !== wasOpened.current) {
      wasOpened.current = opened;
      turnedAt.current = nowMs;
    }
    const turningTime = Math.sin((Math.min(400, nowMs - turnedAt.current) / 400) * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) targetRotation += THREE.MathUtils.degToRad(number * 0.8);
    const foldRotationAngle = THREE.MathUtils.degToRad(Math.sign(targetRotation) * 2);

    bones.forEach((bone, i) => {
      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity = Math.sin((i * Math.PI) / bones.length) * turningTime;

      let rotationAngle =
        curl *
        (INSIDE_CURVE_STRENGTH * insideCurveIntensity * targetRotation -
          OUTSIDE_CURVE_STRENGTH * outsideCurveIntensity * targetRotation +
          TURNING_CURVE_STRENGTH * turningIntensity * targetRotation);
      if (bookClosed) rotationAngle = i === 0 ? targetRotation : 0;
      const foldIntensity = i > 8 ? Math.sin((i * Math.PI) / bones.length - 0.5) * turningTime : 0;

      bone.rotation.y = THREE.MathUtils.damp(bone.rotation.y, rotationAngle, EASING_ROTATION, delta);
      bone.rotation.x = THREE.MathUtils.damp(bone.rotation.x, foldRotationAngle * foldIntensity, EASING_FOLD, delta);
    });

    const materials = mesh.material as THREE.MeshStandardMaterial[];
    const targetEmissive = hovered.current ? 0.22 : 0;
    materials[4].emissiveIntensity = THREE.MathUtils.damp(materials[4].emissiveIntensity, targetEmissive, 6, delta);
    materials[5].emissiveIntensity = THREE.MathUtils.damp(materials[5].emissiveIntensity, targetEmissive, 6, delta);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onFlip(opened ? number : number + 1);
  };
  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hovered.current = true;
    document.body.style.cursor = "pointer";
  };
  const handleOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hovered.current = false;
    document.body.style.cursor = "auto";
  };

  return (
    <primitive
      object={meshData.mesh}
      position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      onClick={handleClick}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    />
  );
}

/* -------------------------------- sahne -------------------------------- */

function BookLoading() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 1.5;
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[PAGE_WIDTH * 0.6, PAGE_HEIGHT * 0.6, PAGE_DEPTH * 4]} />
      <meshBasicMaterial color="#ffffff" wireframe />
    </mesh>
  );
}

class BookErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

interface BookSceneProps {
  pages: number; palette: Palette; title: string; curl: number;
  page: number; setPage: Dispatch<SetStateAction<number>>; autoFlip: boolean;
}

function BookScene({ pages, palette, title, curl, page, setPage, autoFlip }: BookSceneProps) {
  const totalLeaves = pages + 2;
  const photoUrls = useMemo(() => Array.from({ length: pages }, (_, i) => photoUrl(PHOTO_IDS[i % PHOTO_IDS.length])), [pages]);
  const loadedPhotos = useTexture(photoUrls);

  useEffect(() => {
    loadedPhotos.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
    });
  }, [loadedPhotos]);

  const paperRoughness = useMemo(() => createPaperRoughnessTexture(), []);
  useEffect(() => () => paperRoughness.dispose(), [paperRoughness]);

  const { leaves, owned } = useMemo(() => buildLeaves(pages, palette, title, loadedPhotos), [pages, palette, title, loadedPhotos]);
  useEffect(() => () => owned.forEach((t) => t.dispose()), [owned]);

  const groupRef = useRef<THREE.Group>(null);
  const autoFlipAcc = useRef(0);
  const bookClosed = page === 0 || page === totalLeaves;

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (g) {
      g.position.x = THREE.MathUtils.damp(g.position.x, bookClosed ? -PAGE_WIDTH / 2 : 0, 3, delta);
      // Kapalıyken kapak kameraya baksın: ön kapak için -90°, arka kapak için +90° döndür.
      const targetY = page === 0 ? -Math.PI / 2 : page === totalLeaves ? Math.PI / 2 : 0;
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 3, delta);
    }
    if (!autoFlip) {
      autoFlipAcc.current = 0;
      return;
    }
    autoFlipAcc.current += delta;
    if (autoFlipAcc.current >= 2.4) {
      autoFlipAcc.current = 0;
      setPage((p) => (p >= totalLeaves ? 0 : p + 1));
    }
  });

  const handleFlip = (next: number) => setPage(Math.max(0, Math.min(totalLeaves, next)));

  return (
    <Float speed={0.6} rotationIntensity={0.06} floatIntensity={0.2} floatingRange={[-0.03, 0.03]}>
      <group ref={groupRef} position={[-PAGE_WIDTH / 2, 0, 0]}>
        {leaves.map((leaf, i) => (
          <Page
            key={i}
            number={i}
            page={page}
            totalLeaves={totalLeaves}
            curl={curl}
            frontMap={leaf.front}
            backMap={leaf.back}
            paperRoughness={paperRoughness}
            isCover={leaf.isCover}
            onFlip={handleFlip}
          />
        ))}
      </group>
    </Float>
  );
}

/* ------------------------------- ana bileşen ------------------------------- */

const errorStyle: React.CSSProperties = { padding: "8px 14px", borderRadius: 8, background: "rgba(0,0,0,.7)", color: "#fff", fontSize: 13, whiteSpace: "nowrap" };

/** Ebeveyn `position: relative` olmalı; bileşen tüm alanı kaplar. */
export function PageFlipBook({
  palette = "leather",
  pages = 8,
  autoFlip = false,
  curl = 1,
  title = "Anutkinui — Field Notes",
  className,
}: PageFlipBookProps) {
  const p = PALETTES[palette] ?? PALETTES.leather;
  const sheetCount = Math.max(4, Math.min(12, Math.round(pages / 2) * 2));
  const totalLeaves = sheetCount + 2;
  const [page, setPage] = useState(0);

  const goPrev = () => setPage((v) => Math.max(0, v - 1));
  const goNext = () => setPage((v) => Math.min(totalLeaves, v + 1));
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  };

  const buttonStyle: React.CSSProperties = { width: 36, height: 36, borderRadius: 999, border: `1px solid ${p.ink}55`, background: "transparent", color: p.ink, fontSize: 16, cursor: "pointer" };
  const navStyle: React.CSSProperties = { position: "absolute", left: 0, right: 0, bottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, pointerEvents: "none" };
  const indicatorStyle: React.CSSProperties = { fontFamily: "var(--font-mono, monospace)", fontSize: 11, letterSpacing: "0.08em", color: p.ink, opacity: 0.75, minWidth: 54, textAlign: "center" };

  return (
    <section
      className={className}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: p.backdrop, outline: "none" }}
    >
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 0.2, 3.6], fov: 38 }} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <Environment files={HDRI} environmentIntensity={0.6} />
        </Suspense>
        <directionalLight position={[2, 5, 2]} intensity={2.5} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
        <ambientLight intensity={0.6} />
        <BookErrorBoundary fallback={<Html center><div style={errorStyle}>Görseller yüklenemedi</div></Html>}>
          <Suspense fallback={<BookLoading />}>
            <BookScene key={sheetCount} pages={sheetCount} palette={p} title={title} curl={curl} page={page} setPage={setPage} autoFlip={autoFlip} />
          </Suspense>
        </BookErrorBoundary>
        <mesh receiveShadow rotation-x={-Math.PI / 2} position-y={-1.2}>
          <planeGeometry args={[100, 100]} />
          <shadowMaterial transparent opacity={0.25} />
        </mesh>
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={1.0} maxPolarAngle={1.6} />
      </Canvas>

      <div style={navStyle}>
        <button style={{ ...buttonStyle, pointerEvents: "auto" }} onClick={goPrev} aria-label="Previous page">‹</button>
        <span style={indicatorStyle}>{Math.min(page, totalLeaves)} / {totalLeaves}</span>
        <button style={{ ...buttonStyle, pointerEvents: "auto" }} onClick={goNext} aria-label="Next page">›</button>
      </div>
    </section>
  );
}
