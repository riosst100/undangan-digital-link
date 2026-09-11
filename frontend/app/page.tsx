import { getTemplateCatalog } from "@/lib/api/catalog";
import { CatalogSection } from "@/components/catalog/CatalogSection";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Hero } from "@/components/marketing/Hero";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import type { TemplateCatalog } from "@/types/catalog";

async function loadCatalog(): Promise<TemplateCatalog | null> {
  try {
    const catalog = await getTemplateCatalog();
    if (!Array.isArray(catalog?.all) || !Array.isArray(catalog?.exclusive)) return null;
    return catalog;
  } catch {
    return null;
  }
}

export default async function Home() {
  const catalog = await loadCatalog();
  const hasCatalog = catalog !== null && (catalog.all.length > 0 || catalog.exclusive.length > 0);

  return (
    <div className="flex min-h-dvh flex-col bg-[#FBF7F0] text-[#302C27]">
      <SiteHeader />

      <main className="flex-1">
        <Hero />

        {hasCatalog ? (
          <div id="katalog" className="scroll-mt-20 pb-16 pt-4">
            <CatalogSection
              title="Pilihan Desain"
              subtitle="Semua desain undangan yang tersedia untuk Anda"
              templates={catalog.all}
            />
            <CatalogSection
              title="Eksklusif"
              subtitle="Koleksi paling langka — semakin jarang dipakai, semakin eksklusif"
              templates={catalog.exclusive}
              badge="exclusive"
            />
          </div>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  );
}
