import { Hero } from "@/components/sections/hero";
import { AskSurya } from "@/components/sections/ask/ask-surya";
import { Skills } from "@/components/sections/skills";
import { Projects } from "@/components/sections/projects";
import { Experience } from "@/components/sections/experience";
import { Education } from "@/components/sections/education";
import { About } from "@/components/sections/about";
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
      <Experience />
      <Education />
      <About />
      <Contact />
    </>
  );
}
