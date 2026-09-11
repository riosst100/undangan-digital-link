import { getTemplateCatalog } from "@/lib/api/catalog";
import { CatalogSection } from "@/components/catalog/CatalogSection";
import type { TemplateCatalog } from "@/types/catalog";

async function loadCatalog(): Promise<TemplateCatalog | null> {
  try {
    return await getTemplateCatalog();
  } catch {
    return null;
  }
}

export default async function Home() {
  const catalog = await loadCatalog();

  return (
    <div className="min-h-dvh bg-[#FBF7F0] text-[#302C27]">
      <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <h1 className="text-3xl font-medium tracking-tight">undangan-digital.link</h1>
        <p className="max-w-md text-sm text-[#81786E]">
          Undangan pernikahan digital yang elegan dan cepat. Isi data pernikahan Anda,
          biarkan kami yang mengurus desainnya.
        </p>
      </div>

      {catalog ? (
        <div className="pb-12">
          <CatalogSection title="Terbaru" templates={catalog.newest} badge="newest" />
          <CatalogSection title="Terlaris" templates={catalog.best_sellers} badge="best_seller" />
          <CatalogSection title="Eksklusif" templates={catalog.exclusive} badge="exclusive" />
        </div>
      ) : null}
    </div>
  );
}
