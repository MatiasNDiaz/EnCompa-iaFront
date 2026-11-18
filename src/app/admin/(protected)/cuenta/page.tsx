import type { Metadata } from "next";

import { AdminCard, AdminPageHeader } from "@/components/admin/admin-page-header";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { PasswordForm } from "@/features/auth/components/password-form";
import { getAdminStatus } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function AccountPage() {
  const auth = await getAdminStatus();
  const email = auth.status === "admin" ? auth.email : null;

  return (
    <>
      <AdminPageHeader
        eyebrow="Mi cuenta"
        title="Tu acceso al panel"
        description={
          email ? (
            <>
              Ingresás con <strong className="font-semibold break-all text-foreground">{email}</strong>.
            </>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-6">
        <AdminCard>
          <h2 className="mb-1 font-serif text-[1.9rem] leading-tight">Cambiar la contraseña</h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Por seguridad te pedimos la actual. Al cambiarla se cierra la sesión en tus otros
            dispositivos.
          </p>
          <PasswordForm />
        </AdminCard>

        <AdminCard className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-[1.9rem] leading-tight">Cerrar sesión</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hacelo siempre si usaste una compu o un celular que no es tuyo.
            </p>
          </div>
          <LogoutButton className="h-12 w-full sm:w-auto" />
        </AdminCard>
      </div>
    </>
  );
}
