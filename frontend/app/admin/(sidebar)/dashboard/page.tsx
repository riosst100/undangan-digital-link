import { serverFetch } from "@/lib/api/server-fetch";
import type { AdminTemplate } from "@/types/admin-template";

export default async function AdminDashboardPage() {
  const templates = (await serverFetch<AdminTemplate[]>("/api/admin/templates")) ?? [];
  const activeCount = templates.filter((t) => t.is_active).length;
  const totalInvitations = templates.reduce((sum, t) => sum + (t.invitations_count ?? 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-medium text-zinc-900">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-600">Ringkasan singkat platform Anda.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Total Template</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{templates.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Template Aktif</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Total Undangan Dibuat</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{totalInvitations}</p>
        </div>
      </div>
    </div>
  );
}
