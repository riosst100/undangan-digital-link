export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-medium text-zinc-900">{title}</h1>
      <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <p className="text-sm font-medium text-zinc-700">Segera hadir</p>
        <p className="mt-1 text-sm text-zinc-500">
          {description ?? `Halaman ${title} sedang dalam pengembangan.`}
        </p>
      </div>
    </div>
  );
}
