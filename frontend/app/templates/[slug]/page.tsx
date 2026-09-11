import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTemplatePreview } from "@/lib/api/template-preview";
import { ApiError } from "@/lib/api/client";
import { ThemeProvider } from "@/lib/template-engine/theme-provider";
import { RenderSection } from "@/lib/template-engine/render-section";
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
      <div className="sticky top-0 z-30 flex items-center justify-between bg-[#302C27] px-4 py-2 text-xs text-white">
        <span>Mode Demo — {preview.name} (data mempelai contoh)</span>
        <Link href="/admin/templates" className="underline underline-offset-2">
          Kembali ke Admin
        </Link>
      </div>

      <ThemeProvider theme={preview.theme}>
        <InvitationGate content={DUMMY_INVITATION_CONTENT.cover as CoverContent}>
          {preview.sections.map((section, index) => (
            <RenderSection
              key={`${section.type}-${index}`}
              section={section}
              content={DUMMY_INVITATION_CONTENT[section.type]}
            />
          ))}
        </InvitationGate>
      </ThemeProvider>
    </div>
  );
}
