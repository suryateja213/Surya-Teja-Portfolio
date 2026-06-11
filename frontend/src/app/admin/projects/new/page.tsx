"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/common/page-header";
import { ProjectForm } from "@/components/admin/projects/project-form";
import { ApiError } from "@/lib/admin/api";
import { useCreateProject } from "@/lib/admin/hooks/use-projects";
import type { ProjectInput } from "@/lib/admin/schemas/project-schema";
import type { ProjectCreate } from "@/lib/admin/types";

function toPayload(values: ProjectInput): ProjectCreate {
  return {
    slug: values.slug,
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

export default function NewProjectPage() {
  const router = useRouter();
  const create = useCreateProject();

  async function onSubmit(values: ProjectInput) {
    try {
      await create.mutateAsync(toPayload(values));
      toast.success("Project created");
      router.push("/admin/projects");
    } catch (err) {
      toast.error(
        err instanceof ApiError && err.status === 409
          ? "A project with that slug already exists."
          : "Could not create the project.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New project" description="Add an admin-managed project." />
      <ProjectForm onSubmit={onSubmit} submitting={create.isPending} />
    </div>
  );
}
