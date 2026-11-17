import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { getAdminStatus } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Ingreso al panel",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const auth = await getAdminStatus();
  if (auth.status === "admin") redirect("/admin/dashboard");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold">Panel de En Compañía</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Ingresá con tu cuenta de administrador.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
