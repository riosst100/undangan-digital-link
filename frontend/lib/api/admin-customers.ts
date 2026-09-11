import { apiFetch } from "./client";
import type { AdminCustomer } from "@/types/admin-customer";

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  return apiFetch<AdminCustomer[]>("/api/admin/customers", { cache: "no-store" });
}
