"use client";

import { useState } from "react";
import { deleteTemplate } from "@/lib/api/admin-templates";
import { ApiError } from "@/lib/api/client";
import { formatIdr } from "@/lib/format";
import type { AdminTemplate } from "@/types/admin-template";
import { CreateTemplateForm } from "./CreateTemplateForm";

export function TemplateManager({ initialTemplates }: { initialTemplates: AdminTemplate[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(template: AdminTemplate) {
    const confirmed = window.confirm(`Hapus template "${template.name}"? Tindakan ini bisa dipulihkan oleh admin lain nantinya.`);
    if (!confirmed) return;

    setError(null);
    setDeletingId(template.id);
    try {
      await deleteTemplate(template.id);
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Tidak dapat terhubung ke server.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-zinc-900">Katalog Template</h2>
        <CreateTemplateForm onCreated={(created) => setTemplates((prev) => [created, ...prev])} />
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {templates.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">Belum ada template. Buat template pertama Anda.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Dipakai</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{template.name}</p>
                    <p className="text-xs text-zinc-500">{template.slug}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-zinc-700">{template.tier}</td>
                  <td className="px-4 py-3 text-zinc-700">{formatIdr(template.price)}</td>
                  <td className="px-4 py-3 text-zinc-700">{template.invitations_count ?? 0}x</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        template.is_active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {template.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(template)}
                      disabled={deletingId === template.id}
                      className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {deletingId === template.id ? "Menghapus..." : "Hapus"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
