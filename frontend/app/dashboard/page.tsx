import { getServerUser } from "@/lib/api/server-auth";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const user = await getServerUser();

  return (
    <div className="min-h-dvh bg-[#FBF7F0] p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-medium text-[#302C27]">
            Undangan Saya
          </h1>
          {user ? <p className="mt-1 text-sm text-[#81786E]">Masuk sebagai {user.name}</p> : null}
        </div>
        <LogoutButton />
      </div>

      <p className="mt-6 text-sm text-[#81786E]">
        Wizard pembuatan undangan akan tampil di sini (Mempelai, Acara, Foto, Cerita,
        Gallery, RSVP, Gift, Musik, Preview, Publish).
      </p>
    </div>
  );
}
