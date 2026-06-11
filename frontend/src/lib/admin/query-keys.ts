export const queryKeys = {
  me: ["admin", "me"] as const,
  projects: ["admin", "projects"] as const,
  project: (slug: string) => ["admin", "projects", slug] as const,
  contacts: ["admin", "contacts"] as const,
  contact: (id: string) => ["admin", "contacts", id] as const,
};
