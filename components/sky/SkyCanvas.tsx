"use client";

import { useEffect, useRef } from "react";
import styles from "./SkyCanvas.module.css";

type NavigatorHints = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
  deviceMemory?: number;
};

type Palette = {
  skyHigh: string;
  sky: string;
  skyLow: string;
  skyDeep: string;
  haze: string;
  sun: string;
  sunGlow: string;
  cloud: string;
  cloudSoft: string;
  cloudShadow: string;
  mountainFar: string;
  mountainMid: string;
  hillFar: string;
  hillMid: string;
  meadowLight: string;
  meadow: string;
  meadowDeep: string;
  forest: string;
  hedge: string;
  soil: string;
  path: string;
  wood: string;
  roof: string;
  water: string;
  flowerGold: string;
  flowerLavender: string;
  flowerRose: string;
};

type Cloud = {
  band: 0 | 1 | 2;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  speed: number;
  bob: number;
  bobSpeed: number;
  phase: number;
  sprite: number;
};

type Bird = {
  x: number;
  y: number;
  scale: number;
  speed: number;
  phase: number;
  opacity: number;
};

type GrassBlade = {
  x: number;
  depth: number;
  length: number;
  width: number;
  sway: number;
  phase: number;
  opacity: number;
};

type DeviceProfile = {
  compact: boolean;
  lowPower: boolean;
  reducedMotion: boolean;
  dpr: number;
  layerDpr: number;
  fps: number;
};

type SceneLayers = {
  sky: HTMLCanvasElement;
  mountains: HTMLCanvasElement;
  land: HTMLCanvasElement;
  ground: HTMLCanvasElement;
  foreground: HTMLCanvasElement;
};

const CLOUD_PATHS = [
  "M30 78 Q10 78 10 60 Q10 44 28 42 Q30 22 54 22 Q70 8 92 20 Q112 10 128 26 Q150 20 160 40 Q186 42 186 60 Q186 78 166 78 Z",
  "M44 80 Q22 80 22 60 Q22 46 38 44 Q40 22 68 24 Q84 6 108 22 Q134 18 138 42 Q160 46 158 62 Q158 80 138 80 Z",
  "M52 76 Q34 76 34 60 Q34 48 48 46 Q52 30 74 32 Q90 22 106 34 Q126 34 126 52 Q140 56 138 66 Q136 76 120 76 Z",
  "M24 74 Q8 74 8 62 Q8 50 24 48 Q28 34 52 36 Q64 26 82 34 Q100 28 116 36 Q140 32 152 46 Q176 46 178 60 Q180 74 160 74 Z",
] as const;

const CLOUD_BANDS = [
  { drift: 0.55, parallax: 0.018 },
  { drift: 0.9, parallax: 0.04 },
  { drift: 1.25, parallax: 0.07 },
] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
};

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;

  return {
    skyHigh: token("--sky-high", "#53a3e0"),
    sky: token("--sky", "#88c6ee"),
    skyLow: token("--sky-low", "#c1e9f6"),
    skyDeep: token("--sky-deep", "#1769b1"),
    haze: token("--haze", "#edf8f4"),
    sun: token("--sun", "#f7d66d"),
    sunGlow: token("--sun-glow", "#fff0b7"),
    cloud: token("--cloud", "#fcfaf4"),
    cloudSoft: token("--cloud-soft", "#f4f4eb"),
    cloudShadow: token("--cloud-shadow", "#c8dbe8"),
    mountainFar: token("--mountain-far", "#9ebed2"),
    mountainMid: token("--mountain-mid", "#6fa7aa"),
    hillFar: token("--hill-far", "#82b89f"),
    hillMid: token("--hill-mid", "#5ba66b"),
    meadowLight: token("--meadow-light", "#9bc06a"),
    meadow: token("--meadow", "#609743"),
    meadowDeep: token("--meadow-deep", "#295d2d"),
    forest: token("--forest", "#113d1f"),
    hedge: token("--hedge", "#245f34"),
    soil: token("--soil", "#704d29"),
    path: token("--path", "#d5b584"),
    wood: token("--wood", "#684828"),
    roof: token("--roof", "#a04f2b"),
    water: token("--water", "#68b8c3"),
    flowerGold: token("--flower-gold", "#f2c450"),
    flowerLavender: token("--flower-lavender", "#9a8bd7"),
    flowerRose: token("--flower-rose", "#d76f78"),
  };
}

function getDeviceProfile(width: number): DeviceProfile {
  const hints = navigator as NavigatorHints;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const compact = width <= 720;
  const slowConnection = ["slow-2g", "2g"].includes(
    hints.connection?.effectiveType ?? "",
  );
  const lowPower =
    hints.connection?.saveData === true ||
    slowConnection ||
    (hints.deviceMemory ?? 4) < 4 ||
    (navigator.hardwareConcurrency ?? 4) < 4;
  const baseDpr = window.devicePixelRatio || 1;
  const dpr = Math.min(baseDpr, lowPower ? 1 : compact ? 1.2 : 1.4);

  return {
    compact,
    lowPower,
    reducedMotion,
    dpr,
    layerDpr: Math.min(dpr, 1),
    fps: reducedMotion ? 0 : lowPower ? 24 : compact ? 30 : 40,
  };
}

function createSurface(width: number, height: number, dpr: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D is unavailable");
  }

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.imageSmoothingEnabled = true;

  return { canvas, context };
}

function createCloudSprite(shape: number, dpr: number, palette: Palette) {
  const width = 232;
  const height = 128;
  const { canvas, context } = createSurface(width, height, dpr);
  const path = new Path2D(CLOUD_PATHS[shape % CLOUD_PATHS.length]);

  context.save();
  context.translate(18, 18);
  context.shadowColor = "rgba(30, 72, 108, 0.16)";
  context.shadowBlur = 14;
  context.shadowOffsetY = 7;
  context.fillStyle = palette.cloudShadow;
  context.globalAlpha = 0.45;
  context.fill(path);
  context.restore();

  context.save();
  context.translate(18, 13);

  const gradient = context.createLinearGradient(0, 8, 0, 98);
  gradient.addColorStop(0, palette.cloud);
  gradient.addColorStop(0.62, palette.cloudSoft);
  gradient.addColorStop(1, palette.cloudShadow);

  context.fillStyle = gradient;
  context.fill(path);
  context.restore();

  return canvas;
}

function createClouds(compact: boolean, lowPower: boolean): Cloud[] {
  const clouds: Cloud[] = [
    {
      band: 0,
      x: 0.05,
      y: 0.14,
      scale: 0.56,
      opacity: 0.35,
      speed: 0.008,
      bob: 3,
      bobSpeed: 0.2,
      phase: 0.4,
      sprite: 3,
    },
    {
      band: 0,
      x: 0.72,
      y: 0.12,
      scale: 0.5,
      opacity: 0.32,
      speed: -0.006,
      bob: 3,
      bobSpeed: 0.18,
      phase: 3.2,
      sprite: 1,
    },
    {
      band: 0,
      x: 1.06,
      y: 0.31,
      scale: 0.6,
      opacity: 0.33,
      speed: -0.005,
      bob: 4,
      bobSpeed: 0.16,
      phase: 1.6,
      sprite: 0,
    },
    {
      band: 1,
      x: -0.08,
      y: 0.38,
      scale: 0.94,
      opacity: 0.56,
      speed: 0.01,
      bob: 5,
      bobSpeed: 0.15,
      phase: 0.8,
      sprite: 0,
    },
    {
      band: 1,
      x: 0.78,
      y: 0.34,
      scale: 0.78,
      opacity: 0.5,
      speed: -0.008,
      bob: 6,
      bobSpeed: 0.14,
      phase: 3.8,
      sprite: 3,
    },
    {
      band: 2,
      x: -0.2,
      y: 0.62,
      scale: 1.45,
      opacity: 0.66,
      speed: 0.012,
      bob: 7,
      bobSpeed: 0.12,
      phase: 1.1,
      sprite: 0,
    },
    {
      band: 2,
      x: 1.18,
      y: 0.58,
      scale: 1.32,
      opacity: 0.62,
      speed: -0.011,
      bob: 7,
      bobSpeed: 0.11,
      phase: 4.5,
      sprite: 3,
    },
  ];

  if (compact) {
    return clouds.filter((_, index) => ![2, 5].includes(index));
  }

  if (lowPower) {
    return clouds.filter((_, index) => index !== 2);
  }

  return clouds;
}

function createBirds(compact: boolean): Bird[] {
  const birds: Bird[] = [
    {
      x: 0.67,
      y: 0.21,
      scale: 0.7,
      speed: 0.004,
      phase: 0.2,
      opacity: 0.28,
    },
    {
      x: 0.74,
      y: 0.18,
      scale: 0.48,
      speed: 0.0044,
      phase: 1.8,
      opacity: 0.22,
    },
  ];

  return compact ? birds.slice(0, 1) : birds;
}

function createGrassBlades(compact: boolean): GrassBlade[] {
  const random = mulberry32(5221);
  const count = compact ? 24 : 42;

  return Array.from({ length: count }, (_, index) => ({
    x: random(),
    depth: random(),
    length: 10 + random() * 20,
    width: 0.8 + random() * 1.1,
    sway: 2 + random() * 3,
    phase: index * 0.61 + random(),
    opacity: 0.18 + random() * 0.24,
  }));
}

function traceRidge(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseline: number,
  amplitude: number,
  seed: number,
) {
  const random = mulberry32(seed);
  const points = 9;
  const values: Array<{ x: number; y: number }> = [];

  for (let index = 0; index <= points; index += 1) {
    const x = (width / points) * index;
    const progress = index / points;
    const wave =
      Math.sin(progress * Math.PI * 2.1 + seed * 0.07) * 0.16 +
      Math.sin(progress * Math.PI * 5 + seed * 0.11) * 0.07;
    const center =
      Math.exp(-Math.pow((progress - 0.58) * 2.6, 2)) * 0.58;
    const jitter = (random() - 0.5) * 0.05;

    values.push({
      x,
      y: baseline - amplitude * (0.28 + center + wave + jitter),
    });
  }

  context.beginPath();
  context.moveTo(0, height);
  context.lineTo(values[0].x, values[0].y);

  for (let index = 1; index < values.length; index += 1) {
    const previous = values[index - 1];
    const current = values[index];
    context.quadraticCurveTo(
      previous.x,
      previous.y,
      (previous.x + current.x) / 2,
      (previous.y + current.y) / 2,
    );
  }

  const last = values[values.length - 1];
  context.lineTo(last.x, last.y);
  context.lineTo(width, height);
  context.closePath();
}

function drawTree(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  palette: Palette,
  opacity: number,
) {
  context.save();
  context.globalAlpha = opacity;
  context.fillStyle = palette.wood;
  context.fillRect(
    x - scale * 0.05,
    y - scale * 0.62,
    scale * 0.1,
    scale * 0.65,
  );
  context.fillStyle = palette.forest;

  const crowns = [
    [-0.2, -0.7, 0.28],
    [0.13, -0.72, 0.31],
    [-0.03, -0.98, 0.34],
    [0.26, -0.94, 0.22],
    [-0.27, -0.92, 0.22],
  ];

  for (const [dx, dy, radius] of crowns) {
    context.beginPath();
    context.arc(
      x + dx * scale,
      y + dy * scale,
      radius * scale,
      0,
      Math.PI * 2,
    );
    context.fill();
  }

  context.restore();
}

function drawPalm(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  palette: Palette,
  opacity: number,
) {
  context.save();
  context.globalAlpha = opacity;
  context.strokeStyle = palette.wood;
  context.lineWidth = Math.max(1, scale * 0.065);
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(x, y);
  context.quadraticCurveTo(
    x + scale * 0.08,
    y - scale * 0.72,
    x - scale * 0.03,
    y - scale * 1.2,
  );
  context.stroke();
  context.translate(x - scale * 0.03, y - scale * 1.2);
  context.strokeStyle = palette.forest;
  context.lineWidth = Math.max(1, scale * 0.05);

  for (let index = 0; index < 7; index += 1) {
    const angle = (Math.PI * 2 * index) / 7 - Math.PI * 0.1;
    const length = scale * (0.48 + (index % 2) * 0.08);
    context.beginPath();
    context.moveTo(0, 0);
    context.quadraticCurveTo(
      Math.cos(angle) * length * 0.55,
      Math.sin(angle) * length * 0.38,
      Math.cos(angle) * length,
      Math.sin(angle) * length,
    );
    context.stroke();
  }

  context.restore();
}

function drawHouse(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  palette: Palette,
  opacity: number,
) {
  context.save();
  context.globalAlpha = opacity;
  context.fillStyle = palette.cloudSoft;
  context.fillRect(
    x - scale * 0.44,
    y - scale * 0.4,
    scale * 0.88,
    scale * 0.48,
  );
  context.fillStyle = palette.roof;
  context.beginPath();
  context.moveTo(x - scale * 0.56, y - scale * 0.36);
  context.lineTo(x, y - scale * 0.78);
  context.lineTo(x + scale * 0.56, y - scale * 0.36);
  context.closePath();
  context.fill();
  context.fillStyle = palette.wood;
  context.fillRect(
    x - scale * 0.08,
    y - scale * 0.19,
    scale * 0.16,
    scale * 0.27,
  );
  context.restore();
}

function drawSkyLayer(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: Palette,
) {
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, palette.skyHigh);
  gradient.addColorStop(0.5, palette.sky);
  gradient.addColorStop(1, palette.skyLow);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  const sunX = width * 0.8;
  const sunY = height * 0.17;
  const sunRadius = Math.min(width, height) * 0.24;
  const glow = context.createRadialGradient(
    sunX,
    sunY,
    0,
    sunX,
    sunY,
    sunRadius,
  );
  glow.addColorStop(0, palette.sunGlow);
  glow.addColorStop(0.14, palette.sun);
  glow.addColorStop(0.46, "rgba(255, 235, 164, 0.2)");
  glow.addColorStop(1, "rgba(255, 235, 164, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  const haze = context.createLinearGradient(0, height * 0.48, 0, height);
  haze.addColorStop(0, "rgba(255, 255, 255, 0)");
  haze.addColorStop(0.7, "rgba(245, 250, 237, 0.18)");
  haze.addColorStop(1, "rgba(255, 247, 213, 0.3)");
  context.fillStyle = haze;
  context.fillRect(0, height * 0.42, width, height * 0.58);
}

function drawMountainLayer(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: Palette,
) {
  context.save();
  context.filter = `blur(${Math.max(1.5, Math.min(width, height) * 0.003)}px)`;
  context.globalAlpha = 0.34;
  context.fillStyle = palette.mountainFar;
  traceRidge(context, width, height, height * 0.74, height * 0.3, 31);
  context.fill();
  context.globalAlpha = 0.48;
  context.fillStyle = palette.mountainMid;
  traceRidge(context, width, height, height * 0.79, height * 0.22, 73);
  context.fill();
  context.restore();

  const mist = context.createLinearGradient(0, height * 0.48, 0, height * 0.84);
  mist.addColorStop(0, "rgba(255,255,255,0)");
  mist.addColorStop(0.58, "rgba(238,248,244,0.16)");
  mist.addColorStop(1, "rgba(238,248,244,0.46)");
  context.fillStyle = mist;
  context.fillRect(0, height * 0.44, width, height * 0.42);
}

function drawLandLayer(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: Palette,
) {
  context.fillStyle = palette.hillFar;
  context.globalAlpha = 0.78;
  context.beginPath();
  context.moveTo(0, height);
  context.lineTo(0, height * 0.8);
  context.bezierCurveTo(
    width * 0.2,
    height * 0.68,
    width * 0.36,
    height * 0.79,
    width * 0.54,
    height * 0.7,
  );
  context.bezierCurveTo(
    width * 0.72,
    height * 0.62,
    width * 0.86,
    height * 0.76,
    width,
    height * 0.68,
  );
  context.lineTo(width, height);
  context.closePath();
  context.fill();

  context.fillStyle = palette.hillMid;
  context.globalAlpha = 0.9;
  context.beginPath();
  context.moveTo(0, height);
  context.lineTo(0, height * 0.87);
  context.bezierCurveTo(
    width * 0.18,
    height * 0.76,
    width * 0.38,
    height * 0.86,
    width * 0.58,
    height * 0.75,
  );
  context.bezierCurveTo(
    width * 0.76,
    height * 0.66,
    width * 0.9,
    height * 0.8,
    width,
    height * 0.74,
  );
  context.lineTo(width, height);
  context.closePath();
  context.fill();

  const baseY = height * 0.8;
  const scale = clamp(width / 1200, 0.6, 1.12);

  drawTree(context, width * 0.1, baseY + 10, 44 * scale, palette, 0.72);
  drawPalm(context, width * 0.16, baseY + 10, 36 * scale, palette, 0.76);
  drawHouse(context, width * 0.22, baseY, 34 * scale, palette, 0.82);
  drawTree(context, width * 0.29, baseY + 8, 38 * scale, palette, 0.72);
  drawTree(context, width * 0.76, baseY + 8, 40 * scale, palette, 0.72);
  drawHouse(context, width * 0.83, baseY, 31 * scale, palette, 0.84);
  drawPalm(context, width * 0.9, baseY + 10, 38 * scale, palette, 0.78);

  context.globalAlpha = 0.5;
  context.strokeStyle = palette.hedge;
  context.lineWidth = Math.max(2, 3 * scale);
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(0, baseY + 12);
  context.bezierCurveTo(
    width * 0.3,
    baseY - 4,
    width * 0.58,
    baseY + 20,
    width,
    baseY + 2,
  );
  context.stroke();
  context.globalAlpha = 1;
}

function drawGroundLayer(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: Palette,
) {
  const horizon = height * 0.79;
  const meadow = context.createLinearGradient(0, horizon, 0, height);
  meadow.addColorStop(0, palette.meadowLight);
  meadow.addColorStop(0.58, palette.meadow);
  meadow.addColorStop(1, palette.meadowDeep);
  context.fillStyle = meadow;
  context.fillRect(0, horizon, width, height - horizon);

  const rows = [0.83, 0.87, 0.92, 0.97];

  rows.forEach((row, index) => {
    const y = height * row;
    context.globalAlpha = 0.18 + index * 0.05;
    context.strokeStyle = index % 2 === 0 ? palette.water : palette.hedge;
    context.lineWidth = 1 + index * 0.55;
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(
      width * 0.23,
      y - 8,
      width * 0.45,
      y + 10,
      width * 0.66,
      y - 3,
    );
    context.bezierCurveTo(
      width * 0.82,
      y - 9,
      width * 0.93,
      y + 6,
      width,
      y - 2,
    );
    context.stroke();
  });

  const path = context.createLinearGradient(
    width * 0.57,
    horizon,
    width * 0.48,
    height,
  );
  path.addColorStop(0, palette.path);
  path.addColorStop(1, palette.soil);
  context.globalAlpha = 0.86;
  context.fillStyle = path;
  context.beginPath();
  context.moveTo(width * 0.565, horizon + 4);
  context.bezierCurveTo(
    width * 0.55,
    height * 0.85,
    width * 0.47,
    height * 0.91,
    width * 0.38,
    height,
  );
  context.lineTo(width * 0.62, height);
  context.bezierCurveTo(
    width * 0.59,
    height * 0.91,
    width * 0.59,
    height * 0.85,
    width * 0.575,
    horizon + 4,
  );
  context.closePath();
  context.fill();
  context.globalAlpha = 1;
}

function drawForegroundLayer(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: Palette,
) {
  const top = height * 0.91;
  const foreground = context.createLinearGradient(0, top, 0, height);
  foreground.addColorStop(0, palette.meadow);
  foreground.addColorStop(1, palette.forest);
  context.fillStyle = foreground;
  context.beginPath();
  context.moveTo(0, height);
  context.lineTo(0, top + 12);
  context.bezierCurveTo(
    width * 0.2,
    top - 14,
    width * 0.36,
    top + 16,
    width * 0.54,
    top - 4,
  );
  context.bezierCurveTo(
    width * 0.72,
    top - 24,
    width * 0.87,
    top + 14,
    width,
    top - 10,
  );
  context.lineTo(width, height);
  context.closePath();
  context.fill();

  const random = mulberry32(9182);
  const colors = [
    palette.flowerGold,
    palette.flowerLavender,
    palette.flowerRose,
  ];
  const count = width <= 720 ? 14 : 26;

  for (let index = 0; index < count; index += 1) {
    const x = random() * width;
    const y = top + 10 + random() * Math.max(18, height - top - 14);
    const size = 1.2 + random() * 1.8;
    context.globalAlpha = 0.28 + random() * 0.34;
    context.fillStyle = colors[index % colors.length];
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
  }

  context.globalAlpha = 1;
}

function buildLayers(
  width: number,
  height: number,
  dpr: number,
  palette: Palette,
): SceneLayers {
  const sky = createSurface(width, height, dpr);
  drawSkyLayer(sky.context, width, height, palette);

  const mountains = createSurface(width, height, dpr);
  drawMountainLayer(mountains.context, width, height, palette);

  const land = createSurface(width, height, dpr);
  drawLandLayer(land.context, width, height, palette);

  const ground = createSurface(width, height, dpr);
  drawGroundLayer(ground.context, width, height, palette);

  const foreground = createSurface(width, height, dpr);
  drawForegroundLayer(foreground.context, width, height, palette);

  return {
    sky: sky.canvas,
    mountains: mountains.canvas,
    land: land.canvas,
    ground: ground.canvas,
    foreground: foreground.canvas,
  };
}

function drawLayer(
  context: CanvasRenderingContext2D,
  layer: HTMLCanvasElement,
  width: number,
  height: number,
  offsetY: number,
  opacity = 1,
) {
  if (opacity <= 0.001) {
    return;
  }

  context.save();
  context.globalAlpha = opacity;
  context.drawImage(layer, 0, offsetY, width, height);
  context.restore();
}

function drawCloudBand(
  context: CanvasRenderingContext2D,
  clouds: Cloud[],
  sprites: HTMLCanvasElement[],
  band: 0 | 1 | 2,
  width: number,
  height: number,
  time: number,
  scroll: number,
  delta: number,
  animate: boolean,
) {
  const settings = CLOUD_BANDS[band];

  for (const cloud of clouds) {
    if (cloud.band !== band) {
      continue;
    }

    if (animate) {
      cloud.x += cloud.speed * settings.drift * delta;

      if (cloud.x > 1.3) {
        cloud.x = -0.3;
      } else if (cloud.x < -0.3) {
        cloud.x = 1.3;
      }
    }

    const sprite = sprites[cloud.sprite % sprites.length];
    const spriteWidth = 232 * cloud.scale;
    const spriteHeight = 128 * cloud.scale;
    const bob = animate
      ? Math.sin(time * cloud.bobSpeed + cloud.phase) * cloud.bob
      : 0;
    const x = cloud.x * width - spriteWidth / 2;
    const y =
      cloud.y * height -
      spriteHeight / 2 +
      bob -
      scroll * settings.parallax * height;

    context.globalAlpha = cloud.opacity;
    context.drawImage(sprite, x, y, spriteWidth, spriteHeight);
  }

  context.globalAlpha = 1;
}

function drawBirds(
  context: CanvasRenderingContext2D,
  birds: Bird[],
  width: number,
  height: number,
  time: number,
  delta: number,
  palette: Palette,
  animate: boolean,
) {
  context.strokeStyle = palette.skyDeep;
  context.lineCap = "round";

  for (const bird of birds) {
    if (animate) {
      bird.x += bird.speed * delta;

      if (bird.x > 1.08) {
        bird.x = 0.56;
      }
    }

    const x = bird.x * width;
    const y = bird.y * height + Math.sin(time * 0.4 + bird.phase) * 2.5;
    const wing = animate ? Math.sin(time * 2.2 + bird.phase) * 1.8 : 0;
    const size = 8 * bird.scale;

    context.globalAlpha = bird.opacity;
    context.lineWidth = Math.max(1, 1.15 * bird.scale);
    context.beginPath();
    context.moveTo(x - size, y + wing);
    context.quadraticCurveTo(x - size * 0.45, y - size * 0.55, x, y);
    context.quadraticCurveTo(x + size * 0.45, y - size * 0.55, x + size, y + wing);
    context.stroke();
  }

  context.globalAlpha = 1;
}

function drawGrass(
  context: CanvasRenderingContext2D,
  blades: GrassBlade[],
  width: number,
  height: number,
  time: number,
  foregroundOffset: number,
  reveal: number,
  palette: Palette,
  animate: boolean,
) {
  if (reveal <= 0.01) {
    return;
  }

  const baseY = height * 0.91 + foregroundOffset;
  context.strokeStyle = palette.forest;
  context.lineCap = "round";

  for (const blade of blades) {
    const x = blade.x * width;
    const y = baseY + blade.depth * height * 0.1;

    if (y > height + blade.length || y < -blade.length) {
      continue;
    }

    const sway = animate
      ? Math.sin(time * 0.72 + blade.phase) * blade.sway
      : 0;

    context.globalAlpha = blade.opacity * reveal;
    context.lineWidth = blade.width;
    context.beginPath();
    context.moveTo(x, y);
    context.quadraticCurveTo(
      x + sway * 0.35,
      y - blade.length * 0.55,
      x + sway,
      y - blade.length,
    );
    context.stroke();
  }

  context.globalAlpha = 1;
}

export default function SkyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });

    if (!context) {
      return;
    }

    let width = 1;
    let height = 1;
    let profile = getDeviceProfile(window.innerWidth);
    let palette = readPalette();
    let layers: SceneLayers | null = null;
    let sprites: HTMLCanvasElement[] = [];
    let clouds = createClouds(profile.compact, profile.lowPower);
    let birds = createBirds(profile.compact);
    let grass = createGrassBlades(profile.compact);
    let targetScroll = 0;
    let currentScroll = 0;
    let animationFrame = 0;
    let resizeFrame = 0;
    let lastFrame = performance.now();
    let lastPaint = 0;
    let running = !document.hidden;

    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetScroll = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    };

    const rebuild = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);

      const previousCompact = profile.compact;
      const previousLowPower = profile.lowPower;
      profile = getDeviceProfile(width);

      if (
        previousCompact !== profile.compact ||
        previousLowPower !== profile.lowPower
      ) {
        clouds = createClouds(profile.compact, profile.lowPower);
        birds = createBirds(profile.compact);
        grass = createGrassBlades(profile.compact);
      }

      canvas.width = Math.max(1, Math.round(width * profile.dpr));
      canvas.height = Math.max(1, Math.round(height * profile.dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(profile.dpr, 0, 0, profile.dpr, 0, 0);
      context.imageSmoothingEnabled = true;

      palette = readPalette();
      layers = buildLayers(width, height, profile.layerDpr, palette);
      sprites = CLOUD_PATHS.map((_, index) =>
        createCloudSprite(index, profile.dpr, palette),
      );
    };

    const render = (now: number, animate: boolean) => {
      if (!layers) {
        return;
      }

      const delta = clamp((now - lastFrame) / 1000, 0, 0.08);
      lastFrame = now;

      currentScroll = profile.reducedMotion
        ? targetScroll
        : lerp(
            currentScroll,
            targetScroll,
            1 - Math.exp(-delta * 4.8),
          );

      const time = now / 1000;
      const descent = smoothstep(0.02, 1, currentScroll);
      const landReveal = smoothstep(0.08, 0.54, descent);
      const groundReveal = smoothstep(0.25, 0.8, descent);
      const foregroundReveal = smoothstep(0.5, 1, descent);
      const landOffset =
        (1 - landReveal) * height * 0.16 - descent * height * 0.055;
      const groundOffset =
        (1 - groundReveal) * height * 0.28 - descent * height * 0.11;
      const foregroundOffset =
        (1 - foregroundReveal) * height * 0.36 - descent * height * 0.16;

      context.setTransform(profile.dpr, 0, 0, profile.dpr, 0, 0);
      drawLayer(context, layers.sky, width, height, 0);

      drawCloudBand(
        context,
        clouds,
        sprites,
        0,
        width,
        height,
        time,
        currentScroll,
        delta,
        animate,
      );

      drawLayer(
        context,
        layers.mountains,
        width,
        height,
        -descent * height * 0.035,
        0.9,
      );

      drawCloudBand(
        context,
        clouds,
        sprites,
        1,
        width,
        height,
        time,
        currentScroll,
        delta,
        animate,
      );

      drawBirds(
        context,
        birds,
        width,
        height,
        time,
        delta,
        palette,
        animate,
      );

      drawLayer(
        context,
        layers.land,
        width,
        height,
        landOffset,
        landReveal,
      );

      drawCloudBand(
        context,
        clouds,
        sprites,
        2,
        width,
        height,
        time,
        currentScroll,
        delta,
        animate,
      );

      drawLayer(
        context,
        layers.ground,
        width,
        height,
        groundOffset,
        groundReveal,
      );

      drawLayer(
        context,
        layers.foreground,
        width,
        height,
        foregroundOffset,
        foregroundReveal,
      );

      drawGrass(
        context,
        grass,
        width,
        height,
        time,
        foregroundOffset,
        foregroundReveal,
        palette,
        animate,
      );
    };

    const requestStaticRender = () => {
      if (!profile.reducedMotion) {
        return;
      }

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame((now) => {
        animationFrame = 0;
        render(now, false);
      });
    };

    const loop = (now: number) => {
      animationFrame = 0;

      if (!running) {
        return;
      }

      const interval = profile.fps > 0 ? 1000 / profile.fps : 0;

      if (now - lastPaint >= interval) {
        lastPaint = now;
        render(now, true);
      }

      animationFrame = requestAnimationFrame(loop);
    };

    const handleScroll = () => {
      readScroll();
      requestStaticRender();
    };

    const handleResize = () => {
      if (resizeFrame) {
        cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        rebuild();
        readScroll();
        currentScroll = targetScroll;
        render(performance.now(), false);
      });
    };

    const handleVisibility = () => {
      running = !document.hidden;

      if (!running) {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }

        animationFrame = 0;
        return;
      }

      lastFrame = performance.now();
      lastPaint = 0;

      if (profile.reducedMotion) {
        requestStaticRender();
      } else if (!animationFrame) {
        animationFrame = requestAnimationFrame(loop);
      }
    };

    rebuild();
    readScroll();
    currentScroll = targetScroll;
    render(performance.now(), false);

    if (!profile.reducedMotion && running) {
      animationFrame = requestAnimationFrame(loop);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.visualViewport?.addEventListener("resize", handleResize, {
      passive: true,
    });
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      if (resizeFrame) {
        cancelAnimationFrame(resizeFrame);
      }

      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);

      sprites = [];
      clouds = [];
      birds = [];
      grass = [];
      layers = null;
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.sky} aria-hidden="true" />;
}