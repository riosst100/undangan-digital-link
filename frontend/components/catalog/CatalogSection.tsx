import type { CatalogTemplate } from "@/types/catalog";
import { TemplateCard } from "./TemplateCard";

export function CatalogSection({
  title,
  subtitle,
  templates,
  badge,
}: {
  title: string;
  subtitle?: string;
  templates: CatalogTemplate[];
  badge?: "exclusive";
}) {
  if (templates.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#302C27] sm:text-2xl">
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-sm text-[#81786E]">{subtitle}</p> : null}
        </div>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} badge={badge} />
        ))}
      </div>
    </section>
  );
}
