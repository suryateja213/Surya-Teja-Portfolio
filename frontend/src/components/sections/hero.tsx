"use client";

import { useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/components/layout/social-links";
import { HeroNameParticles } from "@/components/sections/hero-name-particles";
import { useHeroNameFx, useIntroState } from "@/lib/use-intro-state";

// Parent controls the cascade. Children animate in sequence on first visit.
const container: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

// Standard rise-and-fade for most blocks.
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

// Name reveals word by word with a subtle blur-to-sharp.
const nameContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const word: Variants = {
  hidden: { opacity: 0, y: "0.4em", filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: "0em",
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Terminal-style identity card. Fills the right column of the hero. */
const terminalLines: { cmd: string; out: string }[] = [
  { cmd: "whoami", out: "software engineer · backend-leaning full-stack" },
  { cmd: "company", out: "GE HealthCare — platform engineering" },
  { cmd: "location", out: `${site.location} · open to remote` },
  { cmd: "stack --top", out: "python · typescript · kafka · aws" },
];

const nameClass =
  "font-display text-5xl leading-[1.02] font-medium tracking-[-0.03em] sm:text-6xl lg:text-7xl";

export function Hero() {
  const intro = useIntroState();

  // pending: render invisible to avoid a flash of the final state before the
  // client decides. play: run the cascade. skip: jump straight to final state.
  const animate = intro === "play" ? "show" : intro === "skip" ? "show" : "hidden";
  // On skip we want no motion, so collapse transitions to instant.
  const instant = intro === "skip";

  // Name entrance: on first desktop visit, particles assemble into the name
  // and cross-fade to the crisp h1 (decision shares the intro store so it's
  // settled before first paint — no flash of the word-reveal beforehand).
  const fx = useHeroNameFx();
  const [nameSettled, setNameSettled] = useState(false);
  const [fxDone, setFxDone] = useState(false);
  const nameRef = useRef<HTMLHeadingElement>(null);

  return (
    <motion.section
      className="mx-auto w-full max-w-5xl px-6 pt-32 pb-24 sm:pt-40 sm:pb-32"
      variants={container}
      initial="hidden"
      animate={animate}
      transition={instant ? { duration: 0 } : undefined}
    >
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_21rem]">
        <div>
          <motion.p
            className="text-muted flex items-center gap-2.5 font-mono text-sm tracking-tight"
            variants={item}
            transition={instant ? { duration: 0 } : undefined}
          >
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:hidden" />
              <span className="bg-success relative inline-flex h-2 w-2 rounded-full" />
            </span>
            {site.availability}
          </motion.p>

          {fx === "plain" ? (
            <motion.h1
              className={`mt-6 ${nameClass}`}
              variants={instant ? item : nameContainer}
              initial="hidden"
              animate="show"
              transition={instant ? { duration: 0 } : undefined}
            >
              {instant
                ? site.name
                : site.name.split(" ").map((w, i) => (
                    /* whitespace-pre keeps the trailing space from collapsing
                       at the end of the inline-block — without it the words
                       render joined ("SuryaTeja"). */
                    <motion.span
                      key={`${w}-${i}`}
                      variants={word}
                      className="inline-block whitespace-pre"
                    >
                      {w}
                      {i < site.name.split(" ").length - 1 ? " " : ""}
                    </motion.span>
                  ))}
            </motion.h1>
          ) : (
            <div className="relative mt-6">
              <motion.h1
                ref={nameRef}
                className={nameClass}
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={
                  nameSettled
                    ? { opacity: 1, filter: "blur(0px)" }
                    : { opacity: 0, filter: "blur(10px)" }
                }
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {site.name.split(" ").map((w, i) => (
                  <span key={`${w}-${i}`} data-name-word className="inline-block whitespace-pre">
                    {w}
                    {i < site.name.split(" ").length - 1 ? " " : ""}
                  </span>
                ))}
              </motion.h1>
              {fx === "particles" && !fxDone && (
                <HeroNameParticles
                  targetRef={nameRef}
                  onSettled={() => setNameSettled(true)}
                  onDone={() => setFxDone(true)}
                />
              )}
            </div>
          )}

          <motion.div
            className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2"
            variants={item}
            transition={instant ? { duration: 0 } : undefined}
          >
            {site.disciplines.map((d, i) => (
              <div key={d} className="flex items-center gap-x-4">
                {i > 0 && <span className="bg-border h-4 w-px" aria-hidden />}
                <span className="text-foreground/80 text-lg font-medium tracking-tight sm:text-xl">
                  {d}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.p
            className="text-muted mt-6 max-w-2xl text-lg leading-relaxed text-pretty"
            variants={item}
            transition={instant ? { duration: 0 } : undefined}
          >
            {site.tagline}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-3"
            variants={item}
            transition={instant ? { duration: 0 } : undefined}
          >
            <Button asChild>
              <a href="#projects">
                View work
                <ArrowDown className="h-4 w-4" aria-hidden />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="#contact">Get in touch</a>
            </Button>

            <SocialLinks className="ml-auto" />
          </motion.div>
        </div>

        {/* Right column: glass terminal card. Identity at a glance, in the
            medium developers actually live in. Hidden below lg to keep the
            mobile hero focused. */}
        <motion.div
          className="hidden lg:block"
          variants={item}
          transition={instant ? { duration: 0 } : undefined}
        >
          <div className="glass overflow-hidden rounded-2xl">
            <div className="border-border/50 flex items-center gap-2 border-b px-4 py-3">
              <span className="flex gap-1.5" aria-hidden>
                <span className="bg-border h-2.5 w-2.5 rounded-full" />
                <span className="bg-border h-2.5 w-2.5 rounded-full" />
                <span className="bg-success/60 h-2.5 w-2.5 rounded-full" />
              </span>
              <p className="text-muted ml-2 font-mono text-xs">~/surya</p>
            </div>
            <div className="space-y-3 p-5 font-mono text-[13px] leading-relaxed">
              {terminalLines.map(({ cmd, out }) => (
                <div key={cmd}>
                  <p>
                    <span className="text-accent">$</span>{" "}
                    <span className="text-foreground/90">{cmd}</span>
                  </p>
                  <p className="text-muted">{out}</p>
                </div>
              ))}
              <p aria-hidden>
                <span className="text-accent">$</span>{" "}
                <span className="bg-accent/70 inline-block h-[1em] w-[7px] translate-y-[0.15em] animate-pulse motion-reduce:animate-none" />
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
