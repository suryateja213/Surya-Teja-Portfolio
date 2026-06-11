"use client";

import { PageHeader } from "@/components/admin/common/page-header";
import { ContactsTable } from "@/components/admin/contacts/contacts-table";

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Contacts" description="Messages submitted through the contact form." />
      <ContactsTable />
    </div>
  );
}
