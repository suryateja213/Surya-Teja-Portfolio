"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTheme } from "next-themes";

/*
 * Subtle ambient depth field — the WebGL successor to the CSS blooms.
 * Sparse monochrome particles drifting on minutes-long cycles with a heavily
 * damped pointer parallax. Felt more than seen: this is the layer the glass
 * surfaces refract, not a spectacle of its own.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aPhase;
  attribute float aScale;
  varying float vDepth;

  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.05 + aPhase) * 0.7;
    p.y += cos(uTime * 0.04 + aPhase * 1.7) * 0.5;
    p.z += sin(uTime * 0.03 + aPhase * 2.3) * 0.4;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uPixelRatio * aScale * (38.0 / -mv.z);
    vDepth = smoothstep(16.0, 5.0, -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vDepth;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.08, d);
    gl_FragColor = vec4(uColor, disc * uOpacity * (0.35 + 0.65 * vDepth));
  }
`;

// Deterministic PRNG so attribute generation is pure (render-safe) — and the
// field lays out identically on every visit, which reads as intentional.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Field({ count, isDark }: { count: number; isDark: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef({ x: 0, y: 0 });

  // The wrapper is pointer-events:none, so r3f never sees the cursor —
  // track it at the window level instead.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const { positions, phases, scales } = useMemo(() => {
    const rand = mulberry32(20260612);
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() * 2 - 1) * 9;
      positions[i * 3 + 1] = (rand() * 2 - 1) * 5.5;
      positions[i * 3 + 2] = (rand() * 2 - 1) * 4;
      phases[i] = rand() * Math.PI * 2;
      scales[i] = 0.4 + rand() * 1.8;
    }
    return { positions, phases, scales };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uColor: { value: new THREE.Color("#3f3f46") },
      uOpacity: { value: 0.2 },
    }),
    [],
  );

  // Theme grading: graphite dust over the light backdrop, additive silver in
  // the dark one. Mutate through the material ref — no shader recompile.
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    (mat.uniforms.uColor.value as THREE.Color).set(isDark ? "#e9e9ef" : "#3f3f46");
    mat.uniforms.uOpacity.value = isDark ? 0.3 : 0.16;
    mat.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    mat.needsUpdate = true;
  }, [isDark]);

  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (mat) {
      // Clamp so a tab resume doesn't jump the field.
      mat.uniforms.uTime.value += Math.min(delta, 0.1);
      mat.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    }
    const cam = state.camera;
    cam.position.x += (pointer.current.x * 0.45 - cam.position.x) * 0.02;
    cam.position.y += (-pointer.current.y * 0.3 - cam.position.y) * 0.02;
    cam.lookAt(0, 0, 0);
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

/** Stop rendering entirely while the tab is hidden. */
function VisibilityPause() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    const onVisibility = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [setFrameloop]);
  return null;
}

export default function AmbientParticlesScene({
  count,
  onReady,
}: {
  count: number;
  onReady?: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        onCreated={() => onReady?.()}
      >
        <Field count={count} isDark={isDark} />
        <VisibilityPause />
      </Canvas>
    </div>
  );
}
