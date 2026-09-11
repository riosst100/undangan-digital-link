import { apiFetch } from "./client";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
};

export async function login(email: string, password: string): Promise<User> {
  return apiFetch<User>("/api/login", { method: "POST", body: { email, password } });
}

export async function register(name: string, email: string, password: string): Promise<User> {
  return apiFetch<User>("/api/register", {
    method: "POST",
    body: { name, email, password, password_confirmation: password },
  });
}

export async function logout(): Promise<void> {
  await apiFetch<null>("/api/logout", { method: "POST" });
}

export async function getCurrentUser(): Promise<User> {
  return apiFetch<User>("/api/user");
}
