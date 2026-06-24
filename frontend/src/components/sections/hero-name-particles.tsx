"use client";

import { useEffect, useRef } from "react";

/*
 * Entrance-only effect: particles scatter in from around the hero name and
 * assemble into the glyphs, then the canvas cross-fades out while the real
 * <h1> fades in. The h1 is always in the DOM (SEO / screen readers); this is
 * pure decoration and unmounts after the fade, so it costs nothing post-intro.
 *
 * 2D canvas on purpose: ~2k two-pixel dots don't need WebGL, and sampling the
 * h1's actual rendered word boxes keeps the assembled name aligned with the
 * real text it hands off to.
 */

type Props = {
  /** The rendered <h1>; its [data-name-word] spans are sampled per word. */
  targetRef: React.RefObject<HTMLElement | null>;
  /** Particles have formed the name — start fading the real h1 in. */
  onSettled: () => void;
  /** Canvas fade-out finished — safe to unmount. */
  onDone: () => void;
};

/** Canvas bleed around the h1 box so scattered particles aren't clipped. */
const PAD = 140;
const SETTLE_HOLD_MS = 150;
const FADE_MS = 600;
const MAX_PARTICLES = 2600;
const SAMPLE_STEP = 3;

type Particle = {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  delay: number;
  dur: number;
  size: number;
};

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export function HeroNameParticles({ targetRef, onSettled, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep latest callbacks without retriggering the main effect.
  const callbacks = useRef({ onSettled, onDone });
  useEffect(() => {
    callbacks.current = { onSettled, onDone };
  });

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let settled = false;
    let finished = false;

    // Always hand control back to the real text, whatever goes wrong.
    const settle = () => {
      if (settled || cancelled) return;
      settled = true;
      callbacks.current.onSettled();
    };
    const finish = () => {
      if (finished || cancelled) return;
      finished = true;
      settle();
      callbacks.current.onDone();
    };

    // A resize mid-effect would desync sampled positions from the real text;
    // it lasts ~2s, so just fast-forward to the crisp h1.
    let forceEnd = false;
    const onResize = () => {
      forceEnd = true;
    };
    window.addEventListener("resize", onResize);

    const run = async () => {
      const el = targetRef.current;
      const canvas = canvasRef.current;
      if (!el || !canvas) return finish();

      // The display face must be loaded before sampling or we sample the
      // fallback font's glyphs. Don't wait forever on a slow connection.
      await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
      if (cancelled || forceEnd) return finish();

      const hostRect = el.getBoundingClientRect();
      const width = Math.ceil(hostRect.width) + PAD * 2;
      const height = Math.ceil(hostRect.height) + PAD * 2;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const style = getComputedStyle(el);
      const color = style.color;
      const fontSize = parseFloat(style.fontSize);

      // Sample glyph ink per word span — word boxes come from the live
      // layout, so line wrapping is handled for free.
      const sample = document.createElement("canvas");
      sample.width = width;
      sample.height = height;
      const sctx = sample.getContext("2d", { willReadFrequently: true });
      if (!sctx) return finish();

      sctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      if (style.letterSpacing !== "normal" && "letterSpacing" in sctx) {
        sctx.letterSpacing = style.letterSpacing;
      }
      sctx.textBaseline = "alphabetic";
      sctx.fillStyle = "#fff";
      const ascent = sctx.measureText("Hg").fontBoundingBoxAscent || fontSize * 0.8;

      const words = el.querySelectorAll<HTMLElement>("[data-name-word]");
      if (words.length === 0) return finish();
      for (const span of words) {
        const r = span.getBoundingClientRect();
        sctx.fillText(
          (span.textContent ?? "").trim(),
          r.left - hostRect.left + PAD,
          r.top - hostRect.top + PAD + ascent,
        );
      }

      const ink = sctx.getImageData(0, 0, width, height).data;
      const targets: [number, number][] = [];
      for (let y = 0; y < height; y += SAMPLE_STEP) {
        for (let x = 0; x < width; x += SAMPLE_STEP) {
          if (ink[(y * width + x) * 4 + 3] > 128) targets.push([x, y]);
        }
      }
      if (targets.length === 0) return finish();

      // Thin to budget so huge viewports don't mean more work per frame.
      const keep = Math.min(1, MAX_PARTICLES / targets.length);
      const particles: Particle[] = [];
      for (const [tx, ty] of targets) {
        if (Math.random() > keep) continue;
        const angle = Math.random() * Math.PI * 2;
        const radius = 40 + Math.random() * (PAD - 20);
        particles.push({
          tx,
          ty,
          sx: tx + Math.cos(angle) * radius,
          sy: ty + Math.sin(angle) * radius,
          delay: Math.random() * 350,
          dur: 800 + Math.random() * 500,
          size: 1 + Math.random() * 1.4,
        });
      }

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return finish();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = color;

      const assembleEnd = Math.max(...particles.map((p) => p.delay + p.dur));
      const start = performance.now();
      let fadeStart = 0;

      const frame = (now: number) => {
        if (cancelled) return;
        const elapsed = now - start;

        if (forceEnd) return finish();

        // Phase bookkeeping: assemble → hold → settle (h1 fades in) →
        // canvas fade-out → done.
        if (!settled && elapsed >= assembleEnd + SETTLE_HOLD_MS) {
          settle();
          fadeStart = now;
        }
        const fade = fadeStart === 0 ? 1 : Math.max(0, 1 - (now - fadeStart) / FADE_MS);
        if (fade <= 0) return finish();

        ctx.clearRect(0, 0, width, height);
        for (const p of particles) {
          const t = Math.min(1, Math.max(0, (elapsed - p.delay) / p.dur));
          if (t <= 0) continue;
          const e = easeOutCubic(t);
          ctx.globalAlpha = Math.min(1, 0.25 + e) * 0.9 * fade;
          const x = p.sx + (p.tx - p.sx) * e;
          const y = p.sy + (p.ty - p.sy) * e;
          ctx.fillRect(x, y, p.size, p.size);
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    run().catch(() => finish());

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [targetRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute"
      style={{ left: -PAD, top: -PAD }}
    />
  );
}
