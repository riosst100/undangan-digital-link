import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicInvitation } from "@/lib/api/invitations";
import { ApiError } from "@/lib/api/client";
import { ThemeProvider } from "@/lib/template-engine/theme-provider";
import { RenderSections } from "@/lib/template-engine/render-sections";
import { InvitationGate } from "@/components/invitation/InvitationGate";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
};

async function loadInvitation(slug: string, to?: string) {
  try {
    return await getPublicInvitation(slug, to);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await loadInvitation(slug);
  if (!invitation) return {};

  return {
    title: invitation.seo.title,
    description: invitation.seo.description,
    openGraph: {
      title: invitation.seo.title,
      description: invitation.seo.description,
      images: invitation.seo.ogImageUrl ? [invitation.seo.ogImageUrl] : undefined,
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://catalog.undangan-digital.link"}/${invitation.slug}`,
    },
  };
}

export default async function InvitationPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { to } = await searchParams;
  const invitation = await loadInvitation(slug, to);

  if (!invitation || invitation.status !== "published") notFound();

  return (
    <ThemeProvider theme={invitation.theme}>
      <InvitationGate content={invitation.content.cover}>
        <RenderSections
          sections={invitation.sections}
          getContent={(section) => invitation.content[section.type] ?? invitation.content.cover}
        />
      </InvitationGate>
    </ThemeProvider>
  );
}
