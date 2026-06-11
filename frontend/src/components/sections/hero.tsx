"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { site } from "@/content/site";
import { socials } from "@/content/socials";
import { useIntroState } from "@/lib/use-intro-state";

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

export function Hero() {
  const intro = useIntroState();

  // pending: render invisible to avoid a flash of the final state before the
  // client decides. play: run the cascade. skip: jump straight to final state.
  const animate = intro === "play" ? "show" : intro === "skip" ? "show" : "hidden";
  // On skip we want no motion, so collapse transitions to instant.
  const instant = intro === "skip";

  return (
    <motion.section
      className="mx-auto w-full max-w-5xl px-6 py-24 sm:py-32"
      variants={container}
      initial="hidden"
      animate={animate}
      transition={instant ? { duration: 0 } : undefined}
    >
      <motion.p
        className="text-accent font-mono text-sm"
        variants={item}
        transition={instant ? { duration: 0 } : undefined}
      >
        {site.role}
      </motion.p>

      <motion.h1
        className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl"
        variants={instant ? item : nameContainer}
        transition={instant ? { duration: 0 } : undefined}
      >
        {instant
          ? site.name
          : site.name.split(" ").map((w, i) => (
              <motion.span key={`${w}-${i}`} variants={word} className="inline-block">
                {w}
                {i < site.name.split(" ").length - 1 ? " " : ""}
              </motion.span>
            ))}
      </motion.h1>

      <motion.p
        className="text-muted mt-6 max-w-2xl text-lg"
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
        <a
          href="#projects"
          className="bg-accent text-accent-foreground focus-visible:ring-accent focus-visible:ring-offset-background inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          View work
          <ArrowDown className="h-4 w-4" aria-hidden />
        </a>
        <a
          href="#contact"
          className="border-border hover:bg-card focus-visible:ring-accent focus-visible:ring-offset-background inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Get in touch
        </a>

        <div className="ml-auto flex items-center gap-1">
          {socials.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              aria-label={label}
              className="text-muted hover:bg-card hover:text-foreground inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors"
            >
              <Icon className="h-5 w-5" aria-hidden />
            </a>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}
