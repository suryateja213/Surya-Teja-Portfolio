"use client";

import Link from "next/link";
import { FolderKanban, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/admin/common/page-header";
import { useProjects } from "@/lib/admin/hooks/use-projects";
import { useContacts } from "@/lib/admin/hooks/use-contacts";

function StatCard({
  label,
  value,
  loading,
  href,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  loading: boolean;
  href: string;
  icon: typeof Mail;
}) {
  return (
    <Link href={href}>
      <Card className="hover:border-accent/50 transition-colors">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-muted text-sm font-medium">{label}</CardTitle>
          <Icon className="text-muted h-4 w-4" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="text-3xl font-semibold">{value}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AdminOverviewPage() {
  const projects = useProjects();
  const contacts = useContacts();

  const contactCount = contacts.data?.pages.flatMap((p) => p.items).length ?? 0;
  const hasMoreContacts = !!contacts.hasNextPage;

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description="At-a-glance state of the portfolio." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Projects"
          value={projects.data?.length ?? 0}
          loading={projects.isLoading}
          href="/admin/projects"
          icon={FolderKanban}
        />
        <StatCard
          label="Contact submissions"
          value={hasMoreContacts ? `${contactCount}+` : contactCount}
          loading={contacts.isLoading}
          href="/admin/contacts"
          icon={Mail}
        />
        <Card className="opacity-60">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-muted text-sm font-medium">Visitors (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">Analytics coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
