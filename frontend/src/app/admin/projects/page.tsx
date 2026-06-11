"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/common/page-header";
import { EmptyState, ErrorState, LoadingRows } from "@/components/admin/common/data-state";
import { ProjectsTable } from "@/components/admin/projects/projects-table";
import { useProjects } from "@/lib/admin/hooks/use-projects";

export default function ProjectsPage() {
  const { data, isLoading, isError } = useProjects();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Managed in DynamoDB — independent of the public site, which renders from MDX."
        actions={
          <Link href="/admin/projects/new" className={buttonVariants()}>
            <Plus className="h-4 w-4" />
            New project
          </Link>
        }
      />

      {isLoading && <LoadingRows />}
      {isError && <ErrorState message="Couldn't load projects." />}
      {data && data.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Create your first admin-managed project."
          action={
            <Link href="/admin/projects/new" className={buttonVariants()}>
              <Plus className="h-4 w-4" />
              New project
            </Link>
          }
        />
      )}
      {data && data.length > 0 && <ProjectsTable projects={data} />}
    </div>
  );
}
