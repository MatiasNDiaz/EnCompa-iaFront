import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { getAdminStatus } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

/**
 * Barrera del panel en el SERVIDOR (el proxy solo redirige de forma optimista):
 * - Sin sesión → /admin/login.
 * - Con sesión pero sin rol admin → "acceso denegado"; el panel no se renderiza.
 */
export default async function ProtectedAdminLayout({ children }: LayoutProps<"/admin">) {
  const auth = await getAdminStatus();

  if (auth.status === "anonymous") redirect("/admin/login");

  if (auth.status === "forbidden") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="mb-3 text-2xl font-semibold">Acceso denegado</h1>
          <p className="mb-8 text-muted-foreground">
            Tu cuenta no tiene permisos para administrar este sitio.
          </p>
          <div className="flex justify-center">
            <LogoutButton />
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <p className="font-semibold">En Compañía · Panel</p>
        <LogoutButton />
      </header>
      {children}
    </div>
  );
}
