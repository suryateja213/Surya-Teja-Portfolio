import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "./fonts";
import { site } from "@/content/site";
import { ThemeProvider } from "@/components/layout/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: ["backend engineer", "distributed systems", "software engineer", site.name],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    url: site.url,
    title: `${site.name} — ${site.role}`,
    description: site.description,
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  alternates: { canonical: site.url },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fontVariables} h-full antialiased`}>
      <head>
        {/* If JS is disabled, the hero's motion never resolves — force it visible. */}
        <noscript>
          <style>{`#main [style*="opacity"]{opacity:1!important;filter:none!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Each route group renders its own chrome — public site gets the
              Navbar/Footer in (public)/layout.tsx; /admin gets its own shell. */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
