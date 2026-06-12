import { site } from "@/content/site";
import { SocialLinks } from "@/components/layout/social-links";

export function Footer() {
  return (
    <footer className="border-border/50 border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <p className="text-muted text-sm">
          &copy; {new Date().getFullYear()} {site.name}
        </p>
        <SocialLinks />
      </div>
    </footer>
  );
}
