"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Raymarched volumetric-cloud intro. A single full-screen quad runs a fragment
 * shader that marches fbm noise: a virtual camera flies FORWARD through a cloud
 * bank the whole time (driven by uTime, so it never looks static). When `parting`
 * flips true, uParting eases 0→1 - the fly speed jumps and the cloud coverage
 * clears, so you punch through into open sky. That + the overlay fade is the
 * reveal.
 *
 * One fullscreen shader (not dozens of billboards) and a capped dpr keep it cheap;
 * loaded via next/dynamic (ssr:false) so three.js stays out of the base bundle and
 * away from reduced-motion / no-WebGL visitors.
 */

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // planeGeometry(2,2) already spans clip space; ignore the camera entirely
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uParting;
  uniform float uAspect;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = (vUv - 0.5);
    uv.x *= uAspect;

    // sky it clears into (sRGB approx of --sky tokens)
    vec3 skyTop = vec3(0.42, 0.66, 0.90);
    vec3 skyBot = vec3(0.76, 0.87, 0.96);
    vec3 sky = mix(skyBot, skyTop, clamp(uv.y * 0.6 + 0.5, 0.0, 1.0));

    // virtual camera: constant forward creep + a big burst on parting
    float fly = uTime * 1.1 + uParting * uParting * 16.0;
    vec3 ro = vec3(sin(uTime * 0.15) * 0.3, cos(uTime * 0.12) * 0.2, -fly);
    vec3 rd = normalize(vec3(uv, -1.0));

    // clouds thin out as we break through
    float coverage = mix(0.52, 0.02, uParting);

    vec3 col = sky;
    float alpha = 0.0;
    float t = 0.6;
    for (int i = 0; i < 34; i++) {
      vec3 p = ro + rd * t;
      float d = fbm(p * 0.45) - (1.0 - coverage);
      if (d > 0.0) {
        float dens = clamp(d * 1.6, 0.0, 1.0);
        vec3 c = mix(vec3(1.0), vec3(0.80, 0.88, 0.98), dens * 0.6);
        float a = dens * 0.42 * (1.0 - alpha);
        col = mix(col, c, a);
        alpha += a;
      }
      t += 0.32;
      if (alpha > 0.97) break;
    }
    gl_FragColor = vec4(col, 1.0);
  }
`;

function CloudPlane({ parting }: { parting: boolean }) {
  const { size, viewport } = useThree();
  const mat = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uParting: { value: 0 },
      uAspect: { value: size.width / size.height },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    const u = mat.current.uniforms;
    u.uTime.value += delta;
    u.uAspect.value = viewport.aspect;
    // ease uParting toward the target so the burst ramps, not snaps
    const target = parting ? 1 : 0;
    u.uParting.value += (target - u.uParting.value) * Math.min(delta * 1.6, 1);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function CloudScene({ parting }: { parting: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false }}
      style={{ position: "absolute", inset: 0 }}
    >
      <CloudPlane parting={parting} />
    </Canvas>
  );
}
