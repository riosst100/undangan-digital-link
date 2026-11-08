import Link from "next/link";
import { AdminTahlilEditor } from "@/components/tahlil/AdminTahlilEditor";

export const metadata = { title: "Buat Undangan Tahlil — Admin" };

export default function AdminNewTahlilInvitationPage() {
  return (
    <div>
      <Link href="/admin/undangan-tahlil" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← Undangan Tahlil
      </Link>
      <h1 className="mt-2 text-2xl font-medium text-zinc-900">Buat undangan baru</h1>
      <p className="mt-1 text-sm text-zinc-600">Isi data lalu unduh PDF. Data ini tidak disimpan.</p>

      <AdminTahlilEditor />
    </div>
  );
}
