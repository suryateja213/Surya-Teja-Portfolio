import {
  Geist,
  Geist_Mono,
  Space_Grotesk,
  Bricolage_Grotesque,
  Sora,
  Instrument_Serif,
  Fraunces,
  Newsreader,
} from "next/font/google";

/*
 * Single home for every typeface on the site.
 *
 * System: Geist Sans for body, Geist Mono for terminal/eyebrow details,
 * Space Grotesk as the default display face (hero name, contact heading).
 * Each remaining section heading gets its own curated display voice — the
 * heading only; body copy never changes family. The @theme mapping from
 * these variables to `font-display-*` utilities lives in globals.css.
 */

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Default display face — hero name and section headings without an override.
export const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

// Projects — characterful grotesk.
export const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// Skills — precise, systematic.
export const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

// Experience — editorial serif. Single 400 weight; render headings at
// font-normal, never synthetic-bold.
export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

// Education — bookish warmth.
export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

// About — human, essayistic (italic axis available).
export const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

/** All font CSS variables, ready to spread onto <html>. */
export const fontVariables = [
  geistSans.variable,
  geistMono.variable,
  spaceGrotesk.variable,
  bricolage.variable,
  sora.variable,
  instrumentSerif.variable,
  fraunces.variable,
  newsreader.variable,
].join(" ");
