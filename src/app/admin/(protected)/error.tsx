"use client";

import { AdminError } from "@/components/admin/admin-error";

/** Error de una pantalla del panel: se muestra dentro del panel (con su navegación). */
export default function ProtectedAdminError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AdminError {...props} />;
}
