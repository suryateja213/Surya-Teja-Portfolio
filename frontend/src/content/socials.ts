import { Github, Linkedin, Mail, type LucideIcon } from "lucide-react";
import { site } from "@/content/site";

export type Social = {
  label: string;
  href: string;
  icon: LucideIcon;
};

/** External links surfaced in the nav, hero, and footer. Replace hrefs with your real profiles. */
export const socials: Social[] = [
  {
    label: "GitHub",
    href: "https://github.com/your-handle",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/your-handle",
    icon: Linkedin,
  },
  {
    label: "Email",
    href: `mailto:${site.email}`,
    icon: Mail,
  },
];
