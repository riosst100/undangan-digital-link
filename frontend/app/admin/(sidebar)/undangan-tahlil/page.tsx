import Link from "next/link";
import { serverFetch } from "@/lib/api/server-fetch";
import { STATUS_LABEL, StatusBadge } from "@/components/tahlil/StatusBadge";
import { waNumber } from "@/components/tahlil/form-state";
import type { TahlilStatus, TahlilSubmission } from "@/types/tahlil";

export const metadata = { title: "Undangan Tahlil — Admin" };

const FILTERS: (TahlilStatus | null)[] = [null, "baru", "diproses", "selesai"];

const receivedAt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });
const eventDate = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "UTC" });

export default async function AdminTahlilSubmissionsPage({ searchParams }: PageProps<"/admin/undangan-tahlil">) {
  const params = await searchParams;
  const status = FILTERS.find((value) => value !== null && value === params.status) ?? null;
  const submissions =
    (await serverFetch<TahlilSubmission[]>(`/api/admin/tahlil-submissions${status ? `?status=${status}` : ""}`)) ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-zinc-900">Undangan Tahlil</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Data yang dikirim pengunjung lewat form publik. Buka untuk meninjau, mengubah, dan mengunduh PDF.
          </p>
        </div>
        <Link
          href="/admin/undangan-tahlil/baru"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Buat baru
        </Link>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Filter status">
        {FILTERS.map((value) => {
          const active = value === status;
          return (
            <Link
              key={value ?? "semua"}
              href={value ? `/admin/undangan-tahlil?status=${value}` : "/admin/undangan-tahlil"}
              className={`rounded-full px-3 py-1.5 text-sm ${
                active ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {value ? STATUS_LABEL[value] : "Semua"}
            </Link>
          );
        })}
      </nav>

      {submissions.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">
          {status ? `Tidak ada data berstatus “${STATUS_LABEL[status]}”.` : "Belum ada data undangan yang masuk."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Masuk</th>
                <th className="px-4 py-3">Almarhum/ah</th>
                <th className="px-4 py-3">Acara</th>
                <th className="px-4 py-3">Pengundang</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} className="border-b border-zinc-100 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">{receivedAt.format(new Date(submission.created_at))}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {submission.deceased_gender === "P" ? "Almh." : "Alm."} {submission.deceased_name}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {submission.event_name}
                    <span className="block text-xs text-zinc-500">{eventDate.format(new Date(submission.date))}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{submission.host}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <a
                      href={`https://wa.me/${waNumber(submission.contact_phone)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-700 underline-offset-2 hover:underline"
                    >
                      {submission.contact_phone}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={submission.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/undangan-tahlil/${submission.id}`}
                      className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 hover:bg-zinc-50"
                    >
                      Buka
                    </Link>
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
