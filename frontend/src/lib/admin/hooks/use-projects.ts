"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../endpoints";
import { queryKeys } from "../query-keys";
import type { ProjectCreate, ProjectUpdate } from "../types";

export function useProjects() {
  return useQuery({ queryKey: queryKeys.projects, queryFn: projectsApi.list });
}

export function useProject(slug: string | null) {
  return useQuery({
    queryKey: slug ? queryKeys.project(slug) : queryKeys.projects,
    queryFn: () => projectsApi.get(slug as string),
    enabled: !!slug,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectCreate) => projectsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

export function useUpdateProject(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectUpdate) => projectsApi.update(slug, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects });
      qc.invalidateQueries({ queryKey: queryKeys.project(slug) });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => projectsApi.remove(slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}
