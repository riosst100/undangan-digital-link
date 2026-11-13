"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTemplateImage, updateTemplate, uploadTemplateImages } from "@/lib/api/admin-templates";
import { ApiError } from "@/lib/api/client";
import type { AdminTemplate } from "@/types/admin-template";

export function EditTemplateForm({
  template,
}: {
  template: AdminTemplate;
}) {
  const router = useRouter();
  const onCancel = () => router.push("/admin/templates");
  const [current, setCurrent] = useState(template);
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description ?? "");
  const [price, setPrice] = useState(String(template.price));
  const [tier, setTier] = useState(template.tier);
  const [isActive, setIsActive] = useState(template.is_active);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<AdminTemplate>, close = false) {
    setError(null);
    setBusy(true);
    try {
      const updated = await action();
      setCurrent(updated);
      if (close) onCancel();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Tidak dapat terhubung ke server.");
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void run(
      () =>
        updateTemplate(current.id, {
          name,
          description: description || null,
          price: Number(price) || 0,
          tier,
          is_active: isActive,
        }),
      true,
    );
  }

  function handleAddImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length > 0) void run(() => uploadTemplateImages(current.id, files));
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
            {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-600">Nama</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-600">Harga (IDR)</span>
          <input type="number" min={0} required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-600">Tier</span>
          <select value={tier} onChange={(e) => setTier(e.target.value as "standard" | "exclusive")} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <option value="standard">Standard</option>
            <option value="exclusive">Exclusive</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Aktif
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block text-zinc-600">Deskripsi</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </label>

      <div>
        <span className="mb-2 block text-sm text-zinc-600">Gambar (gambar pertama jadi thumbnail)</span>
        <div className="flex flex-wrap gap-3">
          {current.images.map((image) => (
            <div key={image.path} className="relative h-24 w-24 overflow-hidden rounded-lg border border-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(() => deleteTemplateImage(current.id, image.path))}
                className="absolute right-1 top-1 rounded-full bg-black/70 px-1.5 text-xs text-white disabled:opacity-50"
                aria-label="Hapus gambar"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={busy} onChange={handleAddImages} className="mt-3 text-sm" />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={busy} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {busy ? "Menyimpan..." : "Simpan"}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-zinc-500 hover:text-zinc-700">
          Batal
        </button>
      </div>
    </form>
  );
}
