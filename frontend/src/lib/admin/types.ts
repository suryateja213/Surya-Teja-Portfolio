// TypeScript mirrors of the backend pydantic schemas. Keep in sync with
// backend/app/schemas/*.py.

export type ProjectLinks = {
  repo?: string | null;
  demo?: string | null;
};

export type ProjectRead = {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  links?: ProjectLinks | null;
  featured: boolean;
  order: number;
};

export type ProjectCreate = {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  links?: ProjectLinks | null;
  featured: boolean;
  order: number;
};

export type ProjectUpdate = Partial<Omit<ProjectCreate, "slug">>;

export type ContactRead = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export type ContactDetail = ContactRead & {
  ip?: string | null;
  user_agent?: string | null;
};

export type Page<T> = {
  items: T[];
  next_cursor: string | null;
};

export type MeResponse = {
  email: string;
};
