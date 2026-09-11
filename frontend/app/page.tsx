import { getTemplateCatalog } from "@/lib/api/catalog";
import { CatalogSection } from "@/components/catalog/CatalogSection";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Hero } from "@/components/marketing/Hero";
import { SiteFooter } from "@/components/marketing/SiteFooter";
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
  const hasCatalog = catalog && (catalog.newest.length > 0 || catalog.exclusive.length > 0);

  return (
    <div className="flex min-h-dvh flex-col bg-[#FBF7F0] text-[#302C27]">
      <SiteHeader />

      <main className="flex-1">
        <Hero />

        {hasCatalog ? (
          <div id="katalog" className="scroll-mt-20 pb-16 pt-4">
            <CatalogSection
              title="Terbaru"
              subtitle="Desain terbaru yang baru saja kami tambahkan"
              templates={catalog.newest}
              badge="newest"
            />
            <CatalogSection
              title="Eksklusif"
              subtitle="Koleksi premium dengan detail lebih istimewa"
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
