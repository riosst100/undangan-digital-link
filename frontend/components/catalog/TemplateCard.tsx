import Link from "next/link";
import type { CatalogTemplate } from "@/types/catalog";
import { formatIdr } from "@/lib/format";

const BADGE_LABEL: Record<string, string> = {
  newest: "Terbaru",
  best_seller: "Terlaris",
  exclusive: "Eksklusif",
};

export function TemplateCard({
  template,
  badge,
}: {
  template: CatalogTemplate;
  badge?: keyof typeof BADGE_LABEL;
}) {
  return (
    <Link
      href={`/templates/${template.slug}`}
      className="group block shrink-0 basis-[220px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F3EEE4]">
        {template.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.thumbnail_url}
            alt={template.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#81786E]">
            {template.name}
          </div>
        )}
        {badge ? (
          <span className="absolute left-2 top-2 rounded-full bg-[#302C27]/90 px-2.5 py-1 text-[11px] font-medium text-white">
            {BADGE_LABEL[badge]}
          </span>
        ) : null}
      </div>
      <div className="space-y-0.5 p-3">
        <p className="truncate text-sm font-medium text-[#302C27]">{template.name}</p>
        <p className="text-xs text-[#81786E]">{formatIdr(template.price)}</p>
      </div>
    </Link>
  );
}
