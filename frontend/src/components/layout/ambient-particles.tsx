"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";

// three.js only loads after the probe passes — it never enters the initial
// bundle, and static export never tries to render it on the server.
const Scene = dynamic(() => import("./ambient-particles-scene"), { ssr: false });

// Probe once per page load, cached so the snapshot is pure and stable
// (same pattern as use-intro-state).
const subscribe = () => () => {};
type FieldConfig = { count: number } | false;
let probed: FieldConfig | null = null;

function getFieldConfig(): FieldConfig {
  if (probed !== null) return probed;

  probed = (() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      if (!gl) return false;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      return false;
    }
    // Sparse on purpose; halve it again on small viewports.
    return { count: window.innerWidth < 768 ? 300 : 700 } as const;
  })();
  return probed;
}

/**
 * Gate for the WebGL ambient particle field.
 *
 * Mounts the scene only when motion is allowed and WebGL actually works;
 * otherwise renders nothing and the CSS blooms in globals.css remain the
 * backdrop. Once the canvas has produced a context, `particles-active` on
 * <html> cross-fades the blooms out (see globals.css).
 */
export function AmbientParticles() {
  const field = useSyncExternalStore(
    subscribe,
    getFieldConfig,
    () => false as const, // server snapshot — blooms only
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.add("particles-active");
    return () => document.documentElement.classList.remove("particles-active");
  }, [ready]);

  if (!field) return null;
  return <Scene count={field.count} onReady={() => setReady(true)} />;
}
