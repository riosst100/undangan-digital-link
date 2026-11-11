import Link from "next/link";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api/server-fetch";
import { AdminTahlilEditor } from "@/components/tahlil/AdminTahlilEditor";
import { StatusBadge } from "@/components/tahlil/StatusBadge";
import type { TahlilSubmission } from "@/types/tahlil";

export const metadata = { title: "Tinjau Undangan Tahlil — Admin" };

const receivedAt = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" });

export default async function AdminTahlilSubmissionPage({ params }: PageProps<"/admin/undangan-kertas/[id]">) {
  const { id } = await params;
  const submission = await serverFetch<TahlilSubmission>(`/api/admin/tahlil-submissions/${encodeURIComponent(id)}`);
  if (!submission) notFound();

  return (
    <div>
      <Link href="/admin/undangan-kertas" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← Undangan Tahlil
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-medium text-zinc-900">
          {submission.deceased_gender === "P" ? "Almh." : "Alm."} {submission.deceased_name}
        </h1>
        <StatusBadge status={submission.status} />
      </div>
      <p className="mt-1 text-sm text-zinc-600">Masuk {receivedAt.format(new Date(submission.created_at))} WIB</p>

      <AdminTahlilEditor key={submission.updated_at} submission={submission} />
    </div>
  );
}
