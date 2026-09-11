"use client";

import { useState } from "react";
import { createTemplate } from "@/lib/api/admin-templates";
import { ApiError } from "@/lib/api/client";
import { SECTION_TYPES, SECTION_VARIANTS, type SectionType } from "@/types/template";
import type { AdminTemplate } from "@/types/admin-template";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const DEFAULT_SECTIONS: SectionType[] = ["cover", "couple", "event", "gallery", "rsvp", "closing"];

export function CreateTemplateForm({ onCreated }: { onCreated: (template: AdminTemplate) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [tier, setTier] = useState<"standard" | "exclusive">("standard");
  const [selectedSections, setSelectedSections] = useState<Set<SectionType>>(new Set(DEFAULT_SECTIONS));
  const [variantBySection, setVariantBySection] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleSection(type: SectionType) {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedSections.size === 0) {
      setError("Pilih minimal satu bagian (section) untuk template.");
      return;
    }

    setLoading(true);
    try {
      const sections = SECTION_TYPES.filter((type) => selectedSections.has(type)).map((type) => ({
        type,
        variant: variantBySection[type] ?? SECTION_VARIANTS[type][0],
        enabled: true,
      }));

      const created = await createTemplate({
        name,
        slug,
        description: description || undefined,
        price: Number(price) || 0,
        tier,
        sections,
      });

      onCreated(created);
      setOpen(false);
      setName("");
      setSlug("");
      setSlugTouched(false);
      setDescription("");
      setPrice("0");
      setTier("standard");
      setSelectedSections(new Set(DEFAULT_SECTIONS));
      setVariantBySection({});
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
      >
        + Buat Template
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">Template Baru</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-zinc-500 hover:text-zinc-700"
        >
          Batal
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-600">Nama</span>
          <input
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-zinc-600">Slug</span>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-zinc-600">Harga (IDR)</span>
          <input
            type="number"
            min={0}
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-zinc-600">Tier</span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as "standard" | "exclusive")}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="standard">Standard</option>
            <option value="exclusive">Exclusive</option>
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block text-zinc-600">Deskripsi</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>

      <div>
        <span className="mb-2 block text-sm text-zinc-600">Bagian undangan</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SECTION_TYPES.map((type) => (
            <div key={type} className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2">
              <input
                type="checkbox"
                id={`section-${type}`}
                checked={selectedSections.has(type)}
                onChange={() => toggleSection(type)}
              />
              <label htmlFor={`section-${type}`} className="flex-1 text-sm capitalize text-zinc-800">
                {type.replace("_", " ")}
              </label>
              <select
                disabled={!selectedSections.has(type)}
                value={variantBySection[type] ?? SECTION_VARIANTS[type][0]}
                onChange={(e) => setVariantBySection((prev) => ({ ...prev, [type]: e.target.value }))}
                className="rounded border border-zinc-300 px-2 py-1 text-xs disabled:opacity-40"
              >
                {SECTION_VARIANTS[type].map((variant) => (
                  <option key={variant} value={variant}>
                    {variant}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Simpan Template"}
      </button>
    </form>
  );
}
