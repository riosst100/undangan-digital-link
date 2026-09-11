import type { CatalogTemplate } from "@/types/catalog";
import { TemplateCard } from "./TemplateCard";

export function CatalogSection({
  title,
  templates,
  badge,
}: {
  title: string;
  templates: CatalogTemplate[];
  badge: "newest" | "best_seller" | "exclusive";
}) {
  if (templates.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-4 text-lg font-medium text-[#302C27]">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} badge={badge} />
        ))}
      </div>
    </section>
  );
}
