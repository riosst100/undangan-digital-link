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
      className="group block w-[min(58vw,240px)] shrink-0 snap-start sm:w-[220px] lg:w-auto"
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-sand shadow-sm ring-1 ring-black/5 transition-shadow duration-300 group-hover:shadow-lg">
        {template.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.thumbnail_url}
            loading="lazy"
            decoding="async"
            alt={template.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-cream via-sand to-beige px-5 text-center">
            <div aria-hidden className="absolute inset-3 rounded-[1.25rem] border border-gold/40" />
            <div aria-hidden className="absolute inset-x-6 top-6 h-1/2 rounded-t-full border border-b-0 border-gold/30" />
            <span className="relative text-[10px] uppercase tracking-[0.35em] text-gold-deep">The Wedding Of</span>
            <span className="relative font-[family-name:var(--font-heading)] text-2xl leading-tight text-ink [text-wrap:balance]">
              {template.name}
            </span>
            <span aria-hidden className="relative h-px w-12 bg-gold" />
          </div>
        )}

        {template.thumbnail_url ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100" />
        ) : null}

        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium tracking-wide text-ink shadow-sm">
            {BADGE_LABEL[badge]}
          </span>
        ) : null}

        <span className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-sm transition-all duration-300 sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
          Lihat Demo
        </span>
      </div>

      <div className="space-y-0.5 pt-3">
        <p className="truncate font-[family-name:var(--font-heading)] text-base font-medium text-ink">
          {template.name}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gold-deep">{formatIdr(template.price)}</p>
          {template.invitations_count !== null && template.invitations_count > 0 ? (
            <p className="text-xs text-pebble">
              {new Intl.NumberFormat("id-ID").format(template.invitations_count)}x dipesan
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
