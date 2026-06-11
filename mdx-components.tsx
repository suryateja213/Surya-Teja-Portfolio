import type { MDXComponents } from "mdx/types";

/**
 * Required by @next/mdx. Maps MDX elements to styled components so case-study
 * prose matches the site's design system. Kept minimal — extend as content needs.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => (
      <h2 className="mt-10 text-xl font-semibold tracking-tight first:mt-0" {...props} />
    ),
    h3: (props) => <h3 className="mt-8 text-lg font-semibold tracking-tight" {...props} />,
    p: (props) => <p className="mt-4 leading-7 text-muted" {...props} />,
    ul: (props) => <ul className="mt-4 space-y-2 text-muted" {...props} />,
    li: (props) => (
      <li className="ml-5 list-disc marker:text-accent [&>strong]:text-foreground" {...props} />
    ),
    a: (props) => (
      <a className="text-accent underline underline-offset-4 hover:opacity-80" {...props} />
    ),
    strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
    code: (props) => (
      <code
        className="rounded bg-card px-1.5 py-0.5 font-mono text-sm text-foreground"
        {...props}
      />
    ),
    ...components,
  };
}
