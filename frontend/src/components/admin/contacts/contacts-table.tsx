"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/admin/common/confirm-dialog";
import { useContacts, useDeleteContact } from "@/lib/admin/hooks/use-contacts";
import { EmptyState, ErrorState, LoadingRows } from "@/components/admin/common/data-state";
import type { ContactRead } from "@/lib/admin/types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export function ContactsTable() {
  const router = useRouter();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useContacts();
  const del = useDeleteContact();
  const [toDelete, setToDelete] = React.useState<ContactRead | null>(null);

  if (isLoading) return <LoadingRows />;
  if (isError) return <ErrorState message="Couldn't load submissions." />;

  const items = data?.pages.flatMap((p) => p.items) ?? [];
  if (items.length === 0) {
    return <EmptyState title="No submissions yet" description="Messages will appear here." />;
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await del.mutateAsync(toDelete.id);
      toast.success("Submission deleted");
      setToDelete(null);
    } catch {
      toast.error("Could not delete the submission.");
    }
  }

  return (
    <>
      <div className="border-border overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead className="hidden md:table-cell">Message</TableHead>
              <TableHead className="w-44">Received</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((c) => (
              <TableRow
                key={c.id}
                className="cursor-pointer"
                onClick={() => router.push(`/admin/contacts/detail?id=${c.id}`)}
              >
                <TableCell>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-muted text-xs">{c.email}</div>
                </TableCell>
                <TableCell className="text-muted hidden max-w-md truncate md:table-cell">
                  {c.message}
                </TableCell>
                <TableCell className="text-muted text-xs">{formatDate(c.created_at)}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/contacts/detail?id=${c.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem destructive onClick={() => setToDelete(c)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete submission?"
        description={toDelete ? `Message from ${toDelete.name} will be removed.` : undefined}
        onConfirm={confirmDelete}
        pending={del.isPending}
      />
    </>
  );
}
