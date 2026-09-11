import { serverFetch } from "@/lib/api/server-fetch";
import { formatDate } from "@/lib/format";
import type { AdminCustomer } from "@/types/admin-customer";

export default async function AdminCustomersPage() {
  const customers = (await serverFetch<AdminCustomer[]>("/api/admin/customers")) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-medium text-zinc-900">Customers</h1>
      <p className="mt-1 text-sm text-zinc-600">
        {customers.length} customer telah mendaftar di undangan-digital.link.
      </p>

      {customers.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Belum ada customer yang mendaftar.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Undangan Dibuat</th>
                <th className="px-4 py-3">Bergabung</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-900">{customer.name}</td>
                  <td className="px-4 py-3 text-zinc-700">{customer.email}</td>
                  <td className="px-4 py-3 text-zinc-700">{customer.invitations_count ?? 0}</td>
                  <td className="px-4 py-3 text-zinc-700">{formatDate(customer.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
