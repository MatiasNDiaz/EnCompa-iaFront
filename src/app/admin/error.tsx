"use client";

import { AdminError } from "@/components/admin/admin-error";

/**
 * Error fuera de las pantallas (el login, o la verificación de la sesión en el layout
 * del panel): página propia, sin la navegación del panel.
 */
export default function AdminRootError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center bg-background px-4">
      <AdminError {...props} />
    </main>
  );
}
