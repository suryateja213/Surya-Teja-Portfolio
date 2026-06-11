import { Construction } from "lucide-react";
import { PageHeader } from "./page-header";

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="border-border text-muted flex flex-col items-center gap-3 rounded-lg border border-dashed p-12 text-center">
        <Construction className="h-8 w-8" />
        <p className="text-sm">This section is planned. Check back soon.</p>
      </div>
    </div>
  );
}
