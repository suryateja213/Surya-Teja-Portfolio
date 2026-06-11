"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { StackInput } from "./stack-input";
import { projectSchema, type ProjectInput } from "@/lib/admin/schemas/project-schema";
import type { ProjectRead } from "@/lib/admin/types";

type Props = {
  /** Provided in edit mode; slug becomes read-only. */
  initial?: ProjectRead;
  submitting?: boolean;
  onSubmit: (values: ProjectInput) => void;
};

export function ProjectForm({ initial, submitting, onSubmit }: Props) {
  const isEdit = !!initial;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      slug: initial?.slug ?? "",
      title: initial?.title ?? "",
      summary: initial?.summary ?? "",
      stack: initial?.stack ?? [],
      links: { repo: initial?.links?.repo ?? "", demo: initial?.links?.demo ?? "" },
      featured: initial?.featured ?? false,
      order: initial?.order ?? 999,
    },
  });

  const fieldError = (msg?: string) =>
    msg ? <p className="mt-1 text-xs text-red-500">{msg}</p> : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5" noValidate>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" readOnly={isEdit} {...register("slug")} />
        {isEdit && <p className="text-muted mt-1 text-xs">Slug can't be changed after creation.</p>}
        {fieldError(errors.slug?.message)}
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} />
        {fieldError(errors.title?.message)}
      </div>

      <div>
        <Label htmlFor="summary">Summary</Label>
        <Textarea id="summary" rows={3} {...register("summary")} />
        {fieldError(errors.summary?.message)}
      </div>

      <div>
        <Label>Stack</Label>
        <Controller
          control={control}
          name="stack"
          render={({ field }) => <StackInput value={field.value ?? []} onChange={field.onChange} />}
        />
        {fieldError(errors.stack?.message)}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="repo">Repo URL</Label>
          <Input id="repo" placeholder="https://github.com/…" {...register("links.repo")} />
          {fieldError(errors.links?.repo?.message)}
        </div>
        <div>
          <Label htmlFor="demo">Demo URL</Label>
          <Input id="demo" placeholder="https://…" {...register("links.demo")} />
          {fieldError(errors.links?.demo?.message)}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="order">Order</Label>
          <Input id="order" type="number" {...register("order", { valueAsNumber: true })} />
          <p className="text-muted mt-1 text-xs">Lower numbers sort first.</p>
          {fieldError(errors.order?.message)}
        </div>
        <div>
          <Label htmlFor="featured">Featured</Label>
          <div className="flex h-10 items-center">
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <Switch id="featured" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
