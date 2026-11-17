import { assertLocalSupabase, requireEnv } from "./env";

/**
 * Gestión de usuarios E2E vía la API de administración de Supabase LOCAL.
 * Usa la secret key de DEMO local (de .env.test.local); nunca corre contra remoto.
 */
function adminApi() {
  const url = assertLocalSupabase();
  const headers = { apikey: requireEnv("SUPABASE_SECRET_KEY"), "Content-Type": "application/json" };
  return { url, headers };
}

export const e2eUsers = () => ({
  admin: { email: requireEnv("E2E_ADMIN_EMAIL"), password: requireEnv("E2E_ADMIN_PASSWORD") },
  user: { email: requireEnv("E2E_USER_EMAIL"), password: requireEnv("E2E_USER_PASSWORD") },
});

async function findUserId(email: string): Promise<string | null> {
  const { url, headers } = adminApi();
  const res = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, { headers });
  if (!res.ok) throw new Error(`No se pudo listar usuarios: ${res.status}`);
  const { users } = (await res.json()) as { users: { id: string; email?: string }[] };
  return users.find((u) => u.email === email)?.id ?? null;
}

export async function deleteUser(email: string) {
  const { url, headers } = adminApi();
  const id = await findUserId(email);
  if (id) await fetch(`${url}/auth/v1/admin/users/${id}`, { method: "DELETE", headers });
}

export async function createUser(email: string, password: string, role: "admin" | null) {
  const { url, headers } = adminApi();
  await deleteUser(email);

  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!res.ok) throw new Error(`No se pudo crear ${email}: ${res.status} ${await res.text()}`);
  const { id } = (await res.json()) as { id: string };

  if (role) {
    const profile = await fetch(`${url}/rest/v1/profiles`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ id, full_name: "Admin E2E", role }),
    });
    if (!profile.ok) throw new Error(`No se pudo crear el perfil: ${profile.status}`);
  }
}
