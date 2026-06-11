"use client";

import { PageHeader } from "@/components/admin/common/page-header";

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description="At-a-glance state of the portfolio." />
      <p className="text-muted text-sm">Dashboard cards coming up.</p>
    </div>
  );
}
