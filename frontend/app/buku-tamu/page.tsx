import Link from "next/link";
import { getServerUser } from "@/lib/api/server-auth";
import { serverFetch } from "@/lib/api/server-fetch";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { GuestbookManager } from "@/components/guestbook/GuestbookManager";
import type { CustomerInvitation } from "@/types/guestbook";

export const metadata = { title: "Buku Tamu — undangan-digital.link" };

export default async function GuestbookPage({ searchParams }: PageProps<"/buku-tamu">) {
  const [user, invitations, params] = await Promise.all([
    getServerUser(),
    serverFetch<CustomerInvitation[]>("/api/customer/invitations"),
    searchParams,
  ]);

  const requested = typeof params.undangan === "string" ? params.undangan : undefined;

  return (
    <div className="min-h-dvh bg-[#FBF7F0] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-sm text-[#81786E] hover:text-[#302C27]">
              ← Undangan Saya
            </Link>
            <h1 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-medium text-[#302C27]">
              Buku Tamu
            </h1>
            {user ? <p className="mt-1 text-sm text-[#81786E]">Masuk sebagai {user.name}</p> : null}
          </div>
          <LogoutButton redirectTo="/login?redirect=/buku-tamu" />
        </div>

        <GuestbookManager invitations={invitations ?? []} initialInvitationId={requested} />
      </div>
    </div>
  );
}
