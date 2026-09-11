type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TemplateDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-dvh bg-[#FBF7F0] p-8 text-[#302C27]">
      <h1 className="text-2xl font-medium">Detail template: {slug}</h1>
      <p className="mt-2 text-sm text-[#81786E]">
        Halaman preview dan pemilihan template ini akan dilengkapi pada tahap wizard
        pembuatan undangan (Phase 3).
      </p>
    </div>
  );
}
