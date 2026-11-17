import { getAdminStatus } from "@/lib/auth/admin";

/** Dashboard mínimo de la Fase 3: solo comprueba el flujo. El CMS completo es la Fase 5. */
export default async function AdminDashboardPage() {
  const auth = await getAdminStatus();
  const name = auth.status === "admin" ? auth.fullName : null;

  return (
    <main className="px-6 py-10">
      <h1 className="text-3xl font-semibold">Hola{name ? `, ${name}` : ""}</h1>
      <p className="mt-2 text-muted-foreground">
        Sesión de administrador verificada. Las secciones del CMS llegan en la Fase 5.
      </p>
    </main>
  );
}
