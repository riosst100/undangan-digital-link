import Link from "next/link";
import type { CatalogTemplate } from "@/types/catalog";
import { formatIdr } from "@/lib/format";

const BADGE_LABEL: Record<string, string> = {
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
      className="group block w-[200px] shrink-0 snap-start sm:w-[240px]"
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-[#F3EEE4] shadow-sm ring-1 ring-black/5 transition-shadow duration-300 group-hover:shadow-lg">
        {template.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.thumbnail_url}
            alt={template.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center font-[family-name:var(--font-heading)] text-lg text-[#B8AFA0]">
            {template.name}
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium tracking-wide text-[#302C27] shadow-sm">
            {BADGE_LABEL[badge]}
          </span>
        ) : null}

        <span className="absolute bottom-3 right-3 translate-y-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#302C27] opacity-0 shadow-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Lihat Demo
        </span>
      </div>

      <div className="space-y-0.5 pt-3">
        <p className="truncate font-[family-name:var(--font-heading)] text-base font-medium text-[#302C27]">
          {template.name}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#81786E]">{formatIdr(template.price)}</p>
          {template.invitations_count !== null && template.invitations_count > 0 ? (
            <p className="text-[11px] text-[#A8A29A]">
              {new Intl.NumberFormat("id-ID").format(template.invitations_count)}x dipesan
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
