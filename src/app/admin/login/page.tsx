import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/shared/brand-logo";
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
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background px-5 py-12">
      <BrandLogo variant="dark" className="w-40" priority />
      <div className="w-full max-w-sm rounded-3xl border border-caramel/25 bg-card p-8 shadow-[0_12px_32px_-24px_rgb(72_54_41/0.45)]">
        <h1 className="mb-1 font-serif text-[2rem] leading-tight">Panel de En Compañía</h1>
        <p className="mb-8 text-sm text-muted-foreground">Ingresá con tu cuenta de administrador.</p>
        <LoginForm />
      </div>
    </main>
  );
}
