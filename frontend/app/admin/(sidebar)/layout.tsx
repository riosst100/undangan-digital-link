import { getServerUser } from "@/lib/api/server-auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminSidebarLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();

  return (
    <div className="flex min-h-dvh bg-zinc-50">
      <AdminSidebar />

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-8 py-4">
          {user ? <p className="text-sm text-zinc-600">Masuk sebagai {user.name}</p> : <span />}
          <LogoutButton redirectTo="/admin/login" />
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
