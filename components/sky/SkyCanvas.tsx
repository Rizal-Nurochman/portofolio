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
  bobAmplitude: number;
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

type SceneLayers = {
  sky: HTMLCanvasElement;
  mountains: HTMLCanvasElement;
  hills: HTMLCanvasElement;
  village: HTMLCanvasElement;
  fields: HTMLCanvasElement;
  foreground: HTMLCanvasElement;
};

const CLOUD_PATHS = [
  "M30 78 Q10 78 10 60 Q10 44 28 42 Q30 22 54 22 Q70 8 92 20 Q112 10 128 26 Q150 20 160 40 Q186 42 186 60 Q186 78 166 78 Z",
  "M44 80 Q22 80 22 60 Q22 46 38 44 Q40 22 68 24 Q84 6 108 22 Q134 18 138 42 Q160 46 158 62 Q158 80 138 80 Z",
  "M52 76 Q34 76 34 60 Q34 48 48 46 Q52 30 74 32 Q90 22 106 34 Q126 34 126 52 Q140 56 138 66 Q136 76 120 76 Z",
  "M24 74 Q8 74 8 62 Q8 50 24 48 Q28 34 52 36 Q64 26 82 34 Q100 28 116 36 Q140 32 152 46 Q176 46 178 60 Q180 74 160 74 Z",
];

const CLOUD_BANDS = [
  { drift: 0.55, parallax: 0.025 },
  { drift: 1, parallax: 0.055 },
  { drift: 1.45, parallax: 0.09 },
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

  return {
    canvas,
    context,
  };
}

function makeCloudSprite(
  shape: number,
  dpr: number,
  palette: Palette,
) {
  const width = 248;
  const height = 136;

  const surface = createSurface(width, height, dpr);
  const { canvas, context } = surface;

  const path = new Path2D(
    CLOUD_PATHS[shape % CLOUD_PATHS.length],
  );

  context.save();
  context.translate(24, 18);
  context.shadowColor = "rgba(38, 86, 126, 0.18)";
  context.shadowBlur = 18;
  context.shadowOffsetY = 10;
  context.fillStyle = palette.cloudShadow;
  context.globalAlpha = 0.52;
  context.fill(path);
  context.restore();

  context.save();
  context.translate(24, 14);

  const gradient = context.createLinearGradient(
    0,
    8,
    0,
    96,
  );

  gradient.addColorStop(0, palette.cloud);
  gradient.addColorStop(0.58, palette.cloudSoft);
  gradient.addColorStop(1, palette.cloudShadow);

  context.fillStyle = gradient;
  context.fill(path);
  context.restore();

  return canvas;
}

function createClouds(
  compact: boolean,
  lowPower: boolean,
): Cloud[] {
  const base: Cloud[] = [
    {
      band: 0,
      x: 0.08,
      y: 0.13,
      scale: 0.62,
      opacity: 0.42,
      speed: 0.007,
      bobAmplitude: 3,
      bobSpeed: 0.22,
      phase: 0.4,
      sprite: 3,
    },
    {
      band: 0,
      x: 0.39,
      y: 0.28,
      scale: 0.48,
      opacity: 0.34,
      speed: -0.005,
      bobAmplitude: 4,
      bobSpeed: 0.18,
      phase: 2.4,
      sprite: 2,
    },
    {
      band: 0,
      x: 0.78,
      y: 0.11,
      scale: 0.54,
      opacity: 0.38,
      speed: 0.006,
      bobAmplitude: 3,
      bobSpeed: 0.2,
      phase: 4.3,
      sprite: 1,
    },
    {
      band: 0,
      x: 1.04,
      y: 0.34,
      scale: 0.68,
      opacity: 0.38,
      speed: -0.005,
      bobAmplitude: 4,
      bobSpeed: 0.17,
      phase: 1.7,
      sprite: 0,
    },
    {
      band: 1,
      x: -0.08,
      y: 0.35,
      scale: 1.05,
      opacity: 0.66,
      speed: 0.009,
      bobAmplitude: 6,
      bobSpeed: 0.16,
      phase: 0.9,
      sprite: 0,
    },
    {
      band: 1,
      x: 0.68,
      y: 0.39,
      scale: 0.82,
      opacity: 0.6,
      speed: -0.008,
      bobAmplitude: 7,
      bobSpeed: 0.15,
      phase: 3.2,
      sprite: 3,
    },
    {
      band: 1,
      x: 1.03,
      y: 0.19,
      scale: 0.95,
      opacity: 0.58,
      speed: -0.009,
      bobAmplitude: 6,
      bobSpeed: 0.19,
      phase: 5.2,
      sprite: 1,
    },
    {
      band: 2,
      x: -0.18,
      y: 0.58,
      scale: 1.62,
      opacity: 0.78,
      speed: 0.012,
      bobAmplitude: 8,
      bobSpeed: 0.13,
      phase: 1.2,
      sprite: 0,
    },
    {
      band: 2,
      x: 1.12,
      y: 0.62,
      scale: 1.5,
      opacity: 0.74,
      speed: -0.011,
      bobAmplitude: 9,
      bobSpeed: 0.12,
      phase: 4.8,
      sprite: 3,
    },
  ];

  if (compact) {
    return base.filter(
      (_, index) => ![1, 5, 8].includes(index),
    );
  }

  if (lowPower) {
    return base.filter((_, index) => index !== 1);
  }

  return base;
}

function createBirds(compact: boolean): Bird[] {
  const birds: Bird[] = [
    {
      x: 0.63,
      y: 0.22,
      scale: 0.78,
      speed: 0.004,
      phase: 0.2,
      opacity: 0.38,
    },
    {
      x: 0.69,
      y: 0.19,
      scale: 0.56,
      speed: 0.0045,
      phase: 1.3,
      opacity: 0.32,
    },
    {
      x: 0.74,
      y: 0.25,
      scale: 0.44,
      speed: 0.0035,
      phase: 2.6,
      opacity: 0.28,
    },
    {
      x: 0.82,
      y: 0.17,
      scale: 0.36,
      speed: 0.003,
      phase: 4.1,
      opacity: 0.24,
    },
  ];

  return compact ? birds.slice(0, 2) : birds;
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
  const values: { x: number; y: number }[] = [];

  for (let index = 0; index <= points; index += 1) {
    const x = (width / points) * index;
    const normalized = index / points;

    const wave =
      Math.sin(
        normalized * Math.PI * 2.2 + seed * 0.07,
      ) *
        0.16 +
      Math.sin(
        normalized * Math.PI * 5.1 + seed * 0.11,
      ) *
        0.07;

    const centerLift =
      Math.exp(
        -Math.pow((normalized - 0.58) * 2.6, 2),
      ) * 0.58;

    const jitter = (random() - 0.5) * 0.06;

    values.push({
      x,
      y:
        baseline -
        amplitude *
          (0.28 + centerLift + wave + jitter),
    });
  }

  context.beginPath();
  context.moveTo(0, height);
  context.lineTo(values[0].x, values[0].y);

  for (
    let index = 1;
    index < values.length;
    index += 1
  ) {
    const previous = values[index - 1];
    const current = values[index];

    const midX = (previous.x + current.x) / 2;
    const midY = (previous.y + current.y) / 2;

    context.quadraticCurveTo(
      previous.x,
      previous.y,
      midX,
      midY,
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
  opacity = 1,
) {
  context.save();
  context.globalAlpha = opacity;

  context.fillStyle = palette.wood;
  context.fillRect(
    x - scale * 0.055,
    y - scale * 0.64,
    scale * 0.11,
    scale * 0.68,
  );

  context.fillStyle = palette.forest;

  const crowns = [
    [-0.22, -0.68, 0.29],
    [0.14, -0.72, 0.33],
    [-0.02, -0.98, 0.35],
    [0.28, -0.95, 0.24],
    [-0.28, -0.93, 0.24],
  ];

  crowns.forEach(([dx, dy, radius]) => {
    context.beginPath();

    context.arc(
      x + dx * scale,
      y + dy * scale,
      radius * scale,
      0,
      Math.PI * 2,
    );

    context.fill();
  });

  context.restore();
}

function drawPalm(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  palette: Palette,
  opacity = 1,
) {
  context.save();
  context.globalAlpha = opacity;
  context.strokeStyle = palette.wood;
  context.lineWidth = Math.max(1, scale * 0.07);
  context.lineCap = "round";

  context.beginPath();
  context.moveTo(x, y);

  context.quadraticCurveTo(
    x + scale * 0.08,
    y - scale * 0.72,
    x - scale * 0.03,
    y - scale * 1.25,
  );

  context.stroke();

  context.translate(
    x - scale * 0.03,
    y - scale * 1.25,
  );

  context.strokeStyle = palette.forest;
  context.lineWidth = Math.max(1, scale * 0.055);

  for (let index = 0; index < 7; index += 1) {
    const angle =
      (Math.PI * 2 * index) / 7 - Math.PI * 0.1;

    const length =
      scale * (0.52 + (index % 2) * 0.08);

    context.beginPath();
    context.moveTo(0, 0);

    context.quadraticCurveTo(
      Math.cos(angle) * length * 0.55,
      Math.sin(angle) * length * 0.4,
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
  opacity = 1,
) {
  context.save();
  context.globalAlpha = opacity;

  context.fillStyle = palette.cloudSoft;

  context.fillRect(
    x - scale * 0.46,
    y - scale * 0.42,
    scale * 0.92,
    scale * 0.5,
  );

  context.fillStyle = palette.roof;
  context.beginPath();

  context.moveTo(
    x - scale * 0.58,
    y - scale * 0.38,
  );

  context.lineTo(x, y - scale * 0.82);

  context.lineTo(
    x + scale * 0.58,
    y - scale * 0.38,
  );

  context.closePath();
  context.fill();

  context.fillStyle = palette.wood;

  context.fillRect(
    x - scale * 0.09,
    y - scale * 0.2,
    scale * 0.18,
    scale * 0.28,
  );

  context.fillRect(
    x - scale * 0.34,
    y - scale * 0.23,
    scale * 0.15,
    scale * 0.14,
  );

  context.restore();
}

function drawSkyLayer(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: Palette,
) {
  const sky = context.createLinearGradient(
    0,
    0,
    0,
    height,
  );

  sky.addColorStop(0, palette.skyHigh);
  sky.addColorStop(0.52, palette.sky);
  sky.addColorStop(1, palette.skyLow);

  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);

  const sunX = width * 0.79;
  const sunY = height * 0.18;
  const sunRadius =
    Math.min(width, height) * 0.22;

  const glow = context.createRadialGradient(
    sunX,
    sunY,
    0,
    sunX,
    sunY,
    sunRadius,
  );

  glow.addColorStop(0, palette.sunGlow);
  glow.addColorStop(0.16, palette.sun);
  glow.addColorStop(
    0.46,
    "rgba(255, 235, 164, 0.22)",
  );
  glow.addColorStop(
    1,
    "rgba(255, 235, 164, 0)",
  );

  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  const horizon = context.createLinearGradient(
    0,
    height * 0.48,
    0,
    height,
  );

  horizon.addColorStop(
    0,
    "rgba(255, 255, 255, 0)",
  );

  horizon.addColorStop(
    0.72,
    "rgba(245, 250, 237, 0.22)",
  );

  horizon.addColorStop(
    1,
    "rgba(255, 247, 213, 0.32)",
  );

  context.fillStyle = horizon;

  context.fillRect(
    0,
    height * 0.42,
    width,
    height * 0.58,
  );
}

function drawMountainLayer(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: Palette,
) {
  context.save();

  context.filter = `blur(${Math.max(
    2,
    Math.min(width, height) * 0.004,
  )}px)`;

  context.globalAlpha = 0.38;
  context.fillStyle = palette.mountainFar;

  traceRidge(
    context,
    width,
    height,
    height * 0.73,
    height * 0.31,
    31,
  );

  context.fill();

  context.globalAlpha = 0.54;
  context.fillStyle = palette.mountainMid;

  traceRidge(
    context,
    width,
    height,
    height * 0.78,
    height * 0.23,
    73,
  );

  context.fill();
  context.restore();

  const mist = context.createLinearGradient(
    0,
    height * 0.48,
    0,
    height * 0.84,
  );

  mist.addColorStop(
    0,
    "rgba(255, 255, 255, 0)",
  );

  mist.addColorStop(
    0.58,
    "rgba(238, 248, 244, 0.18)",
  );

  mist.addColorStop(
    1,
    "rgba(238, 248, 244, 0.5)",
  );

  context.fillStyle = mist;

  context.fillRect(
    0,
    height * 0.43,
    width,
    height * 0.45,
  );
}

function drawHillLayer(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: Palette,
) {
  context.fillStyle = palette.hillFar;
  context.globalAlpha = 0.82;
  context.beginPath();
  context.moveTo(0, height);
  context.lineTo(0, height * 0.78);

  context.bezierCurveTo(
    width * 0.16,
    height * 0.68,
    width * 0.31,
    height * 0.75,
    width * 0.46,
    height * 0.7,
  );

  context.bezierCurveTo(
    width * 0.63,
    height * 0.63,
    width * 0.77,
    height * 0.74,
    width,
    height * 0.66,
  );

  context.lineTo(width, height);
  context.closePath();
  context.fill();

  context.fillStyle = palette.hillMid;
  context.globalAlpha = 0.9;
  context.beginPath();
  context.moveTo(0, height);
  context.lineTo(0, height * 0.85);

  context.bezierCurveTo(
    width * 0.18,
    height * 0.73,
    width * 0.34,
    height * 0.84,
    width * 0.55,
    height * 0.74,
  );

  context.bezierCurveTo(
    width * 0.76,
    height * 0.64,
    width * 0.89,
    height * 0.78,
    width,
    height * 0.73,
  );

  context.lineTo(width, height);
  context.closePath();
  context.fill();

  context.globalAlpha = 0.42;
  context.strokeStyle = palette.forest;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, height * 0.82);

  context.bezierCurveTo(
    width * 0.25,
    height * 0.73,
    width * 0.48,
    height * 0.82,
    width,
    height * 0.7,
  );

  context.stroke();
  context.globalAlpha = 1;
}

function drawVillageLayer(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: Palette,
) {
  const baseY = height * 0.78;
  const scale = clamp(width / 1200, 0.62, 1.18);

  context.globalAlpha = 0.88;

  drawTree(
    context,
    width * 0.08,
    baseY + 8,
    48 * scale,
    palette,
    0.82,
  );

  drawPalm(
    context,
    width * 0.14,
    baseY + 10,
    38 * scale,
    palette,
    0.84,
  );

  drawHouse(
    context,
    width * 0.2,
    baseY,
    38 * scale,
    palette,
    0.9,
  );

  drawTree(
    context,
    width * 0.27,
    baseY + 8,
    42 * scale,
    palette,
    0.82,
  );

  drawTree(
    context,
    width * 0.72,
    baseY + 8,
    44 * scale,
    palette,
    0.82,
  );

  drawHouse(
    context,
    width * 0.79,
    baseY,
    34 * scale,
    palette,
    0.92,
  );

  drawPalm(
    context,
    width * 0.86,
    baseY + 10,
    42 * scale,
    palette,
    0.86,
  );

  drawHouse(
    context,
    width * 0.92,
    baseY + 4,
    28 * scale,
    palette,
    0.82,
  );

  context.strokeStyle = palette.hedge;
  context.lineWidth = Math.max(2, 4 * scale);
  context.lineCap = "round";
  context.globalAlpha = 0.68;
  context.beginPath();
  context.moveTo(0, baseY + 12);

  context.bezierCurveTo(
    width * 0.28,
    baseY - 4,
    width * 0.54,
    baseY + 22,
    width,
    baseY + 2,
  );

  context.stroke();
  context.globalAlpha = 1;
}

function drawFieldsLayer(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: Palette,
) {
  const horizon = height * 0.78;

  const meadow = context.createLinearGradient(
    0,
    horizon,
    0,
    height,
  );

  meadow.addColorStop(
    0,
    palette.meadowLight,
  );

  meadow.addColorStop(
    0.56,
    palette.meadow,
  );

  meadow.addColorStop(
    1,
    palette.meadowDeep,
  );

  context.fillStyle = meadow;

  context.fillRect(
    0,
    horizon,
    width,
    height - horizon,
  );

  const rows = [0.81, 0.85, 0.9, 0.96];

  rows.forEach((row, index) => {
    const y = height * row;

    context.globalAlpha =
      0.24 + index * 0.06;

    context.strokeStyle =
      index % 2 === 0
        ? palette.water
        : palette.hedge;

    context.lineWidth = 1 + index * 0.7;
    context.beginPath();
    context.moveTo(0, y);

    context.bezierCurveTo(
      width * 0.22,
      y - 10,
      width * 0.44,
      y + 14,
      width * 0.66,
      y - 4,
    );

    context.bezierCurveTo(
      width * 0.82,
      y - 12,
      width * 0.92,
      y + 8,
      width,
      y - 2,
    );

    context.stroke();
  });

  context.globalAlpha = 0.18;
  context.strokeStyle = palette.path;
  context.lineWidth = 1.4;

  for (let index = 1; index < 8; index += 1) {
    const x = (width / 8) * index;

    context.beginPath();
    context.moveTo(x, height);

    context.lineTo(
      lerp(width * 0.58, x, 0.1),
      horizon + 10,
    );

    context.stroke();
  }

  const path = context.createLinearGradient(
    width * 0.58,
    horizon,
    width * 0.48,
    height,
  );

  path.addColorStop(0, palette.path);
  path.addColorStop(1, palette.soil);

  context.globalAlpha = 0.92;
  context.fillStyle = path;
  context.beginPath();

  context.moveTo(
    width * 0.565,
    horizon + 4,
  );

  context.bezierCurveTo(
    width * 0.55,
    height * 0.84,
    width * 0.47,
    height * 0.9,
    width * 0.36,
    height,
  );

  context.lineTo(width * 0.63, height);

  context.bezierCurveTo(
    width * 0.59,
    height * 0.9,
    width * 0.59,
    height * 0.84,
    width * 0.575,
    horizon + 4,
  );

  context.closePath();
  context.fill();

  context.globalAlpha = 0.38;
  context.strokeStyle = palette.hedge;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(0, height * 0.885);

  context.bezierCurveTo(
    width * 0.24,
    height * 0.84,
    width * 0.42,
    height * 0.9,
    width * 0.55,
    height * 0.86,
  );

  context.stroke();
  context.beginPath();

  context.moveTo(
    width * 0.61,
    height * 0.87,
  );

  context.bezierCurveTo(
    width * 0.76,
    height * 0.82,
    width * 0.9,
    height * 0.9,
    width,
    height * 0.84,
  );

  context.stroke();
  context.globalAlpha = 1;
}

function drawForegroundLayer(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: Palette,
) {
  const top = height * 0.91;

  const foreground =
    context.createLinearGradient(
      0,
      top,
      0,
      height,
    );

  foreground.addColorStop(
    0,
    palette.meadow,
  );

  foreground.addColorStop(
    1,
    palette.forest,
  );

  context.fillStyle = foreground;
  context.beginPath();
  context.moveTo(0, height);
  context.lineTo(0, top + 12);

  context.bezierCurveTo(
    width * 0.2,
    top - 16,
    width * 0.34,
    top + 18,
    width * 0.52,
    top - 5,
  );

  context.bezierCurveTo(
    width * 0.72,
    top - 28,
    width * 0.86,
    top + 16,
    width,
    top - 12,
  );

  context.lineTo(width, height);
  context.closePath();
  context.fill();

  const random = mulberry32(9182);

  const flowers = [
    palette.flowerGold,
    palette.flowerLavender,
    palette.flowerRose,
  ];

  const amount = width < 720 ? 26 : 48;

  for (
    let index = 0;
    index < amount;
    index += 1
  ) {
    const x = random() * width;

    const y =
      top +
      12 +
      random() *
        Math.max(20, height - top - 18);

    const size = 1.3 + random() * 2.4;

    context.globalAlpha =
      0.34 + random() * 0.4;

    context.fillStyle =
      flowers[index % flowers.length];

    context.beginPath();

    context.arc(
      x,
      y,
      size,
      0,
      Math.PI * 2,
    );

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
  const sky = createSurface(
    width,
    height,
    dpr,
  );

  drawSkyLayer(
    sky.context,
    width,
    height,
    palette,
  );

  const mountains = createSurface(
    width,
    height,
    dpr,
  );

  drawMountainLayer(
    mountains.context,
    width,
    height,
    palette,
  );

  const hills = createSurface(
    width,
    height,
    dpr,
  );

  drawHillLayer(
    hills.context,
    width,
    height,
    palette,
  );

  const village = createSurface(
    width,
    height,
    dpr,
  );

  drawVillageLayer(
    village.context,
    width,
    height,
    palette,
  );

  const fields = createSurface(
    width,
    height,
    dpr,
  );

  drawFieldsLayer(
    fields.context,
    width,
    height,
    palette,
  );

  const foreground = createSurface(
    width,
    height,
    dpr,
  );

  drawForegroundLayer(
    foreground.context,
    width,
    height,
    palette,
  );

  return {
    sky: sky.canvas,
    mountains: mountains.canvas,
    hills: hills.canvas,
    village: village.canvas,
    fields: fields.canvas,
    foreground: foreground.canvas,
  };
}

function drawLayer(
  context: CanvasRenderingContext2D,
  layer: HTMLCanvasElement,
  width: number,
  height: number,
  offsetY: number,
) {
  context.drawImage(
    layer,
    0,
    offsetY,
    width,
    height,
  );
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

  clouds.forEach((cloud) => {
    if (cloud.band !== band) {
      return;
    }

    if (animate) {
      cloud.x +=
        cloud.speed *
        settings.drift *
        delta;

      if (cloud.x > 1.28) {
        cloud.x = -0.28;
      }

      if (cloud.x < -0.28) {
        cloud.x = 1.28;
      }
    }

    const sprite =
      sprites[
        cloud.sprite % sprites.length
      ];

    const baseWidth =
      248 * cloud.scale;

    const baseHeight =
      136 * cloud.scale;

    const bob = animate
      ? Math.sin(
          time * cloud.bobSpeed +
            cloud.phase,
        ) * cloud.bobAmplitude
      : 0;

    const x =
      cloud.x * width -
      baseWidth / 2;

    const y =
      cloud.y * height -
      baseHeight / 2 +
      bob -
      scroll *
        settings.parallax *
        height;

    context.globalAlpha =
      cloud.opacity;

    context.drawImage(
      sprite,
      x,
      y,
      baseWidth,
      baseHeight,
    );
  });

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
  context.strokeStyle =
    palette.skyDeep;

  context.lineCap = "round";

  birds.forEach((bird) => {
    if (animate) {
      bird.x += bird.speed * delta;

      if (bird.x > 1.08) {
        bird.x = 0.52;
      }
    }

    const x = bird.x * width;

    const y =
      bird.y * height +
      Math.sin(
        time * 0.4 + bird.phase,
      ) *
        3;

    const wing = animate
      ? Math.sin(
          time * 2.2 + bird.phase,
        ) * 2.2
      : 0;

    const size = 9 * bird.scale;

    context.globalAlpha =
      bird.opacity;

    context.lineWidth = Math.max(
      1,
      1.25 * bird.scale,
    );

    context.beginPath();

    context.moveTo(
      x - size,
      y + wing,
    );

    context.quadraticCurveTo(
      x - size * 0.45,
      y - size * 0.55,
      x,
      y,
    );

    context.quadraticCurveTo(
      x + size * 0.45,
      y - size * 0.55,
      x + size,
      y + wing,
    );

    context.stroke();
  });

  context.globalAlpha = 1;
}

function drawMovingGrass(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  descent: number,
  palette: Palette,
  animate: boolean,
) {
  if (descent < 0.34) {
    return;
  }

  const reveal = smoothstep(
    0.34,
    0.78,
    descent,
  );

  const baseY =
    height *
    lerp(1.09, 0.9, reveal);

  const count =
    width < 720 ? 26 : 46;

  const random = mulberry32(5221);

  context.strokeStyle =
    palette.forest;

  context.lineCap = "round";

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const x = random() * width;

    const length =
      10 + random() * 22;

    const sway = animate
      ? Math.sin(
          time * 0.7 +
            index * 0.62,
        ) *
        (2 + random() * 3)
      : 0;

    const y =
      baseY +
      random() *
        Math.max(
          12,
          height - baseY + 24,
        );

    context.globalAlpha =
      (0.18 + random() * 0.28) *
      reveal;

    context.lineWidth =
      0.8 + random() * 1.2;

    context.beginPath();

    context.moveTo(x, y);

    context.quadraticCurveTo(
      x + sway * 0.35,
      y - length * 0.55,
      x + sway,
      y - length,
    );

    context.stroke();
  }

  context.globalAlpha = 1;
}

export default function SkyCanvas() {
  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const context =
      canvas.getContext("2d", {
        alpha: false,
        desynchronized: true,
      });

    if (!context) {
      return;
    }

    const navigatorHints =
      navigator as NavigatorHints;

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    const compact =
      window.matchMedia(
        "(max-width: 720px)",
      ).matches;

    const lowPower =
      navigatorHints.connection
        ?.saveData === true ||
      navigatorHints.connection
        ?.effectiveType === "slow-2g" ||
      navigatorHints.connection
        ?.effectiveType === "2g" ||
      (navigatorHints.deviceMemory ??
        4) < 4 ||
      (navigator.hardwareConcurrency ??
        4) < 4;

    let width = 1;
    let height = 1;
    let dpr = 1;

    let palette =
      readPalette();

    let layers:
      | SceneLayers
      | null = null;

    let sprites:
      HTMLCanvasElement[] = [];

    let clouds = createClouds(
      compact,
      lowPower,
    );

    let birds =
      createBirds(compact);

    let targetScroll = 0;
    let currentScroll = 0;
    let frameId = 0;
    let resizeFrame = 0;

    let lastFrame =
      performance.now();

    let lastPaint = 0;

    let running =
      !document.hidden;

    const targetFps = reducedMotion
      ? 0
      : lowPower
        ? 24
        : compact
          ? 30
          : 40;

    const frameInterval =
      targetFps > 0
        ? 1000 / targetFps
        : 0;

    const readScroll = () => {
      const max =
        document.documentElement
          .scrollHeight -
        window.innerHeight;

      targetScroll =
        max > 0
          ? clamp(
              window.scrollY / max,
              0,
              1,
            )
          : 0;
    };

    const resize = () => {
      width = Math.max(
        1,
        window.innerWidth,
      );

      height = Math.max(
        1,
        window.innerHeight,
      );

      const baseDpr =
        window.devicePixelRatio || 1;

      dpr = Math.min(
        baseDpr,
        lowPower
          ? 1
          : compact
            ? 1.25
            : 1.5,
      );

      canvas.width = Math.max(
        1,
        Math.round(width * dpr),
      );

      canvas.height = Math.max(
        1,
        Math.round(height * dpr),
      );

      canvas.style.width =
        `${width}px`;

      canvas.style.height =
        `${height}px`;

      context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0,
      );

      context.imageSmoothingEnabled =
        true;

      palette = readPalette();

      layers = buildLayers(
        width,
        height,
        dpr,
        palette,
      );

      sprites =
        CLOUD_PATHS.map(
          (_, index) =>
            makeCloudSprite(
              index,
              dpr,
              palette,
            ),
        );
    };

    const render = (
      now: number,
      updateMotion: boolean,
    ) => {
      if (!layers) {
        return;
      }

      const delta = clamp(
        (now - lastFrame) / 1000,
        0,
        0.08,
      );

      lastFrame = now;

      if (reducedMotion) {
        currentScroll =
          targetScroll;
      } else {
        currentScroll = lerp(
          currentScroll,
          targetScroll,
          1 -
            Math.exp(
              -delta * 4.6,
            ),
        );
      }

      const descent =
        smoothstep(
          0.02,
          1,
          currentScroll,
        );

      const time = now / 1000;

      context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0,
      );

      context.clearRect(
        0,
        0,
        width,
        height,
      );

      drawLayer(
        context,
        layers.sky,
        width,
        height,
        0,
      );

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
        updateMotion,
      );

      drawLayer(
        context,
        layers.mountains,
        width,
        height,
        -descent *
          height *
          0.045,
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
        updateMotion,
      );

      drawBirds(
        context,
        birds,
        width,
        height,
        time,
        delta,
        palette,
        updateMotion,
      );

      drawLayer(
        context,
        layers.hills,
        width,
        height,
        -descent *
          height *
          0.105,
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
        updateMotion,
      );

      drawLayer(
        context,
        layers.village,
        width,
        height,
        -descent *
          height *
          0.16,
      );

      drawLayer(
        context,
        layers.fields,
        width,
        height,
        -descent *
          height *
          0.245,
      );

      drawLayer(
        context,
        layers.foreground,
        width,
        height,
        -descent *
          height *
          0.39,
      );

      drawMovingGrass(
        context,
        width,
        height,
        time,
        descent,
        palette,
        updateMotion,
      );
    };

    const loop = (now: number) => {
      frameId = 0;

      if (!running) {
        return;
      }

      if (
        now - lastPaint >=
        frameInterval
      ) {
        lastPaint = now;

        render(now, true);
      }

      frameId =
        requestAnimationFrame(loop);
    };

    const requestStaticRender =
      () => {
        if (!reducedMotion) {
          return;
        }

        if (frameId) {
          cancelAnimationFrame(
            frameId,
          );
        }

        frameId =
          requestAnimationFrame(
            (now) => {
              frameId = 0;

              render(now, false);
            },
          );
      };

    const handleScroll = () => {
      readScroll();
      requestStaticRender();
    };

    const handleResize = () => {
      if (resizeFrame) {
        cancelAnimationFrame(
          resizeFrame,
        );
      }

      resizeFrame =
        requestAnimationFrame(
          () => {
            resizeFrame = 0;

            resize();
            readScroll();

            render(
              performance.now(),
              false,
            );
          },
        );
    };

    const handleVisibility = () => {
      running =
        !document.hidden;

      if (!running) {
        if (frameId) {
          cancelAnimationFrame(
            frameId,
          );
        }

        frameId = 0;
        return;
      }

      lastFrame =
        performance.now();

      lastPaint = 0;

      if (reducedMotion) {
        requestStaticRender();
      } else if (!frameId) {
        frameId =
          requestAnimationFrame(
            loop,
          );
      }
    };

    resize();
    readScroll();

    currentScroll =
      targetScroll;

    render(
      performance.now(),
      false,
    );

    if (
      !reducedMotion &&
      running
    ) {
      frameId =
        requestAnimationFrame(loop);
    }

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true },
    );

    window.addEventListener(
      "resize",
      handleResize,
      { passive: true },
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility,
    );

    return () => {
      if (frameId) {
        cancelAnimationFrame(
          frameId,
        );
      }

      if (resizeFrame) {
        cancelAnimationFrame(
          resizeFrame,
        );
      }

      window.removeEventListener(
        "scroll",
        handleScroll,
      );

      window.removeEventListener(
        "resize",
        handleResize,
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility,
      );

      clouds = [];
      birds = [];
      sprites = [];
      layers = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={styles.sky}
      aria-hidden="true"
    />
  );
}