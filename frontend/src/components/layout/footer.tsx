import { site } from "@/content/site";
import { socials } from "@/content/socials";

export function Footer() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <p className="text-muted text-sm">
          &copy; {new Date().getFullYear()} {site.name}
        </p>
        <ul className="flex items-center gap-1">
          {socials.map(({ label, href, icon: Icon }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={label}
                className="text-muted hover:bg-card hover:text-foreground inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors"
              >
                <Icon className="h-5 w-5" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
