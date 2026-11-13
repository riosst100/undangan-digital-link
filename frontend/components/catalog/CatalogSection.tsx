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
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-ink sm:text-3xl">
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-[15px] text-stone sm:text-base">{subtitle}</p> : null}
        </div>
        {templates.length > 1 ? (
          <p aria-hidden className="shrink-0 text-xs text-pebble lg:hidden">Geser →</p>
        ) : null}
      </div>

      <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-3 sm:-mx-6 sm:scroll-px-6 sm:gap-4 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0 xl:grid-cols-5">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} badge={badge} />
        ))}
      </div>
    </section>
  );
}
