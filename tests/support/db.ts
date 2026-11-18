import { expect, type Page } from "@playwright/test";

import { assertLocalSupabase, requireEnv } from "./env";

/**
 * Acceso directo a Supabase LOCAL para preparar y verificar los tests del panel
 * (la secret key de DEMO local, de .env.test.local). Nunca corre contra remoto.
 */
function api() {
  const url = assertLocalSupabase();
  const key = requireEnv("SUPABASE_SECRET_KEY");
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}` } };
}

export async function select<T>(table: string, query: string): Promise<T[]> {
  const { url, headers } = api();
  const res = await fetch(`${url}/rest/v1/${table}?${query}`, { headers });
  if (!res.ok) throw new Error(`select ${table}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T[];
}

export async function update(table: string, query: string, body: object) {
  const { url, headers } = api();
  const res = await fetch(`${url}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`update ${table}: ${res.status} ${await res.text()}`);
}

export async function remove(table: string, query: string) {
  const { url, headers } = api();
  await fetch(`${url}/rest/v1/${table}?${query}`, { method: "DELETE", headers });
}

/** ¿Existe el archivo en el bucket site-media? */
export async function storageHas(path: string): Promise<boolean> {
  const { url, headers } = api();
  const res = await fetch(`${url}/storage/v1/object/info/site-media/${path}`, { headers });
  return res.ok;
}

export async function storageRemove(paths: string[]) {
  if (paths.length === 0) return;
  const { url, headers } = api();
  await fetch(`${url}/storage/v1/object/site-media`, {
    method: "DELETE",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: paths }),
  });
}

/**
 * Borra lo que crearon los tests (productos y secciones cuyo nombre empieza con el
 * prefijo) y sus fotos. Primero productos, después subsecciones y secciones.
 */
export async function cleanupByPrefix(prefix: string) {
  const like = `like.${encodeURIComponent(prefix)}*`;
  const products = await select<{ image_path: string | null }>(
    "products",
    `select=image_path&name=${like}`,
  );
  const sections = await select<{ image_path: string | null }>(
    "categories",
    `select=image_path&name=${like}`,
  );
  await remove("products", `name=${like}`);
  await remove("categories", `name=${like}&parent_id=not.is.null`);
  await remove("categories", `name=${like}`);
  await storageRemove(
    [...products, ...sections].map((row) => row.image_path).filter((p): p is string => Boolean(p)),
  );
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
}
