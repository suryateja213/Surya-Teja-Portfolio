import { apiFetch } from "./api";
import type {
  ContactDetail,
  ContactRead,
  MeResponse,
  Page,
  ProjectCreate,
  ProjectRead,
  ProjectUpdate,
} from "./types";

// ---- Auth ----
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ status: string }>("/v1/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  logout: () => apiFetch<{ status: string }>("/v1/auth/logout", { method: "POST" }),
  me: () => apiFetch<MeResponse>("/v1/auth/me", { allowUnauthorized: true }),
};

// ---- Projects ----
export const projectsApi = {
  list: () => apiFetch<ProjectRead[]>("/v1/projects"),
  get: (slug: string) => apiFetch<ProjectRead>(`/v1/projects/${slug}`),
  create: (data: ProjectCreate) =>
    apiFetch<ProjectRead>("/v1/projects", { method: "POST", body: data }),
  update: (slug: string, data: ProjectUpdate) =>
    apiFetch<ProjectRead>(`/v1/projects/${slug}`, { method: "PUT", body: data }),
  remove: (slug: string) => apiFetch<void>(`/v1/projects/${slug}`, { method: "DELETE" }),
};

// ---- Contacts ----
export const contactsApi = {
  list: (cursor?: string, limit = 25) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    return apiFetch<Page<ContactRead>>(`/v1/contacts?${params.toString()}`);
  },
  get: (id: string) => apiFetch<ContactDetail>(`/v1/contacts/${id}`),
  remove: (id: string) => apiFetch<void>(`/v1/contacts/${id}`, { method: "DELETE" }),
};
