import { Hero } from "@/components/sections/hero";
import { AskSurya } from "@/components/sections/ask/ask-surya";
import { Skills } from "@/components/sections/skills";
import { Projects } from "@/components/sections/projects";
import { SystemDesign } from "@/components/sections/system-design/system-design";
import { Experience } from "@/components/sections/experience";
import { Education } from "@/components/sections/education";
import { About } from "@/components/sections/about";
import { Observability } from "@/components/sections/observability/observability";
import { ActivityStream } from "@/components/sections/activity/activity-stream";
import { Contact } from "@/components/sections/contact";
import { JsonLd } from "@/components/seo/json-ld";

export default function Home() {
  return (
    <>
      <JsonLd />
      <Hero />
      <AskSurya />
      <Skills />
      <Projects />
      {/* The portfolio as its own case study — real architectures behind the site. */}
      <SystemDesign />
      <Experience />
      <Education />
      <About />
      {/* "Look under the hood" — both self-hide until there's real activity. */}
      <Observability />
      <ActivityStream />
      <Contact />
    </>
  );
}
