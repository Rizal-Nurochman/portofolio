"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uReveal;
  uniform float uProgress;
  uniform float uAspect;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);

    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    f = f * f * (3.0 - 2.0 * f);

    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));

    return mix(
      mix(a, b, f.x),
      mix(c, d, f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    mat2 rotation = mat2(
      0.80,
      -0.60,
      0.60,
      0.80
    );

    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = rotation * p * 2.03 + 7.17;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;

    p.x *= uAspect;

    float reveal = smoothstep(0.0, 1.0, uReveal);
    float radius = length(p * vec2(0.82, 1.0));
    float time = uTime * 0.055;

    vec2 direction = normalize(p + vec2(0.0001));
    vec2 flow = p * (1.08 + reveal * 0.24);

    flow += direction * reveal * 0.16;

    vec3 skyTop = vec3(0.16, 0.34, 0.62);
    vec3 skyMiddle = vec3(0.34, 0.61, 0.88);
    vec3 skyBottom = vec3(0.75, 0.88, 0.98);

    float vertical = clamp(vUv.y, 0.0, 1.0);

    vec3 color = mix(
      skyBottom,
      skyMiddle,
      smoothstep(0.0, 0.56, vertical)
    );

    color = mix(
      color,
      skyTop,
      smoothstep(0.56, 1.0, vertical)
    );

    float cloud = 0.0;

    for (int i = 0; i < 5; i++) {
      float layer = float(i);

      vec2 q = flow * (1.0 + layer * 0.27);

      q += vec2(
        time * (0.62 + layer * 0.11),
        -time * (0.24 + layer * 0.055)
      );

      q += vec2(
        layer * 4.13,
        -layer * 3.71
      );

      float field = fbm(q * 1.15);
      float density = smoothstep(0.49, 0.79, field);
      float edge = smoothstep(
        0.18,
        1.14,
        radius + layer * 0.035
      );

      cloud +=
        density *
        edge *
        (0.235 - layer * 0.027);
    }

    cloud = clamp(cloud, 0.0, 1.0);
    cloud *= 1.0 - reveal * 0.9;

    vec3 cloudShadow = vec3(0.63, 0.76, 0.91);
    vec3 cloudLight = vec3(0.97, 0.99, 1.0);

    vec3 cloudColor = mix(
      cloudShadow,
      cloudLight,
      smoothstep(-0.65, 0.8, p.y)
    );

    color = mix(
      color,
      cloudColor,
      cloud * 0.9
    );

    float centerGlow = exp(
      -3.8 * length(p - vec2(-0.14, 0.04))
    );

    float horizonGlow = exp(
      -18.0 * abs(p.y + 0.28)
    );

    float signalRing = exp(
      -72.0 *
      abs(radius - (0.36 + uProgress * 0.055))
    );

    float vignette = smoothstep(
      1.45,
      0.22,
      radius
    );

    color +=
      vec3(0.20, 0.47, 0.92) *
      centerGlow *
      (0.16 + uProgress * 0.08);

    color +=
      vec3(0.48, 0.76, 1.0) *
      horizonGlow *
      0.055;

    color +=
      vec3(0.38, 0.74, 1.0) *
      signalRing *
      0.055 *
      (1.0 - reveal);

    color = mix(
      color * 0.78,
      color,
      vignette
    );

    color = mix(
      color,
      vec3(0.78, 0.90, 1.0),
      reveal * 0.22
    );

    float grain =
      (
        hash21(
          gl_FragCoord.xy +
          floor(uTime * 12.0) * 17.0
        ) -
        0.5
      ) *
      0.016;

    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;

type CloudPlaneProps = {
  progress: number;
  revealing: boolean;
};

function CloudPlane({
  progress,
  revealing,
}: CloudPlaneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uProgress: { value: 0 },
      uAspect: { value: 1 },
    }),
    []
  );

  useFrame((state, delta) => {
    const material = materialRef.current;

    if (!material) return;

    const step = Math.min(delta, 0.05);
    const revealTarget = revealing ? 1 : 0;
    const revealBlend = 1 - Math.exp(-step * 4.6);
    const progressBlend = 1 - Math.exp(-step * 6.5);

    material.uniforms.uTime.value += step;

    material.uniforms.uReveal.value +=
      (
        revealTarget -
        material.uniforms.uReveal.value
      ) *
      revealBlend;

    material.uniforms.uProgress.value +=
      (
        progress -
        material.uniforms.uProgress.value
      ) *
      progressBlend;

    material.uniforms.uAspect.value =
      state.size.width / state.size.height;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />

      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

type CloudSceneProps = {
  progress: number;
  revealing: boolean;
};

export default function CloudScene({
  progress,
  revealing,
}: CloudSceneProps) {
  return (
    <Canvas
      dpr={[0.75, 1.2]}
      flat
      frameloop="always"
      gl={{
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      }}
      style={{
        position: "absolute",
        inset: 0,
      }}
    >
      <CloudPlane
        progress={progress}
        revealing={revealing}
      />
    </Canvas>
  );
}