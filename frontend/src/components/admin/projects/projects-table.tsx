"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { useDeleteProject } from "@/lib/admin/hooks/use-projects";
import type { ProjectRead } from "@/lib/admin/types";

export function ProjectsTable({ projects }: { projects: ProjectRead[] }) {
  const router = useRouter();
  const del = useDeleteProject();
  const [toDelete, setToDelete] = React.useState<ProjectRead | null>(null);

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await del.mutateAsync(toDelete.slug);
      toast.success(`Deleted "${toDelete.title}"`);
      setToDelete(null);
    } catch {
      toast.error("Could not delete the project.");
    }
  }

  return (
    <>
      <div className="border-border overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden sm:table-cell">Stack</TableHead>
              <TableHead className="w-16">Order</TableHead>
              <TableHead className="w-20">Featured</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.slug}>
                <TableCell>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-muted text-xs">{p.slug}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {p.stack.slice(0, 4).map((s) => (
                      <Badge key={s} className="text-[11px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{p.order}</TableCell>
                <TableCell>{p.featured ? "Yes" : "—"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/projects/edit?slug=${p.slug}`)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem destructive onClick={() => setToDelete(p)}>
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

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete project?"
        description={toDelete ? `"${toDelete.title}" will be permanently removed.` : undefined}
        onConfirm={confirmDelete}
        pending={del.isPending}
      />
    </>
  );
}
