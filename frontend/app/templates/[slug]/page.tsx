import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTemplatePreview } from "@/lib/api/template-preview";
import { ApiError } from "@/lib/api/client";
import { ThemeProvider } from "@/lib/template-engine/theme-provider";
import { RenderSections } from "@/lib/template-engine/render-sections";
import { DUMMY_INVITATION_CONTENT } from "@/lib/template-engine/dummy-content";
import { InvitationGate } from "@/components/invitation/InvitationGate";
import type { CoverContent } from "@/lib/template-engine/registry";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function loadPreview(slug: string) {
  try {
    return await getTemplatePreview(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const preview = await loadPreview(slug);
  if (!preview) return {};

  return { title: `Demo — ${preview.name}` };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const preview = await loadPreview(slug);

  if (!preview) notFound();

  return (
    <div className="relative">
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-ink px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] text-xs text-white">
        <span className="min-w-0 truncate">Mode Demo — {preview.name} (data mempelai contoh)</span>
        <Link href="/#katalog" className="shrink-0 py-2 underline underline-offset-2">
          ← Katalog
        </Link>
      </div>

      <ThemeProvider theme={preview.theme}>
        <InvitationGate content={DUMMY_INVITATION_CONTENT.cover as CoverContent}>
          <RenderSections sections={preview.sections} getContent={(section) => DUMMY_INVITATION_CONTENT[section.type]} />
        </InvitationGate>
      </ThemeProvider>
    </div>
  );
}
