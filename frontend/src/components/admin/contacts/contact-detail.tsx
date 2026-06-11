"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/common/confirm-dialog";
import { ErrorState, LoadingRows } from "@/components/admin/common/data-state";
import { useContact, useDeleteContact } from "@/lib/admin/hooks/use-contacts";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="col-span-2 break-words">{value || "—"}</dd>
    </div>
  );
}

export function ContactDetail({ id }: { id: string | null }) {
  const router = useRouter();
  const { data, isLoading, isError } = useContact(id);
  const del = useDeleteContact();
  const [confirm, setConfirm] = React.useState(false);

  async function handleDelete() {
    if (!id) return;
    try {
      await del.mutateAsync(id);
      toast.success("Submission deleted");
      router.push("/admin/contacts");
    } catch {
      toast.error("Could not delete the submission.");
    }
  }

  if (!id) return <ErrorState message="No submission specified." />;
  if (isLoading) return <LoadingRows />;
  if (isError || !data) return <ErrorState message="Submission not found." />;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/contacts")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-red-500"
          onClick={() => setConfirm(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{data.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-border divide-y">
            <Row label="Email" value={data.email} />
            <Row label="Received" value={new Date(data.created_at).toLocaleString()} />
            <Row label="IP" value={data.ip} />
            <Row label="User agent" value={data.user_agent} />
          </dl>
          <div className="border-border mt-4 border-t pt-4">
            <p className="text-muted mb-1 text-sm">Message</p>
            <p className="text-sm whitespace-pre-wrap">{data.message}</p>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Delete submission?"
        description={`Message from ${data.name} will be permanently removed.`}
        onConfirm={handleDelete}
        pending={del.isPending}
      />
    </div>
  );
}
