"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/common/page-header";
import { ContactDetail } from "@/components/admin/contacts/contact-detail";
import { LoadingRows } from "@/components/admin/common/data-state";

function DetailInner() {
  const id = useSearchParams().get("id");
  return (
    <div className="space-y-6">
      <PageHeader title="Submission" />
      <ContactDetail id={id} />
    </div>
  );
}

export default function ContactDetailPage() {
  return (
    <React.Suspense fallback={<LoadingRows />}>
      <DetailInner />
    </React.Suspense>
  );
}
