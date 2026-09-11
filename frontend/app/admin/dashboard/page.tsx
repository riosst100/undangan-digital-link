import { getServerUser } from "@/lib/api/server-auth";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function AdminDashboardPage() {
  const user = await getServerUser();

  return (
    <div className="min-h-dvh bg-zinc-50 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-zinc-900">Admin Dashboard</h1>
          {user ? <p className="mt-1 text-sm text-zinc-600">Masuk sebagai {user.name}</p> : null}
        </div>
        <LogoutButton redirectTo="/admin/login" />
      </div>

      <p className="mt-6 text-sm text-zinc-600">
        Customers, Invitations, Templates, Themes, Orders, Subscriptions, AI Generator,
        Analytics, Settings.
      </p>
    </div>
  );
}
