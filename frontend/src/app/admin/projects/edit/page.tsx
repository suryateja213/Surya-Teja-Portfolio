"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/common/page-header";
import { ProjectForm } from "@/components/admin/projects/project-form";
import { ErrorState, LoadingRows } from "@/components/admin/common/data-state";
import { useProject, useUpdateProject } from "@/lib/admin/hooks/use-projects";
import type { ProjectInput } from "@/lib/admin/schemas/project-schema";
import type { ProjectUpdate } from "@/lib/admin/types";

function toPayload(values: ProjectInput): ProjectUpdate {
  return {
    title: values.title,
    summary: values.summary,
    stack: values.stack ?? [],
    featured: values.featured,
    order: values.order,
    links: {
      repo: values.links?.repo ? values.links.repo : null,
      demo: values.links?.demo ? values.links.demo : null,
    },
  };
}

function EditProject() {
  const router = useRouter();
  const slug = useSearchParams().get("slug");
  const { data, isLoading, isError } = useProject(slug);
  const update = useUpdateProject(slug ?? "");

  async function onSubmit(values: ProjectInput) {
    try {
      await update.mutateAsync(toPayload(values));
      toast.success("Project updated");
      router.push("/admin/projects");
    } catch {
      toast.error("Could not update the project.");
    }
  }

  if (!slug) return <ErrorState message="No project specified." />;
  if (isLoading) return <LoadingRows />;
  if (isError || !data) return <ErrorState message="Project not found." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Edit project" description={data.slug} />
      <ProjectForm initial={data} onSubmit={onSubmit} submitting={update.isPending} />
    </div>
  );
}

export default function EditProjectPage() {
  return (
    <React.Suspense fallback={<LoadingRows />}>
      <EditProject />
    </React.Suspense>
  );
}
