import { existsSync } from "node:fs";

/** Carga .env.local (Supabase) y .env.test.local (usuarios E2E) sin dependencias extra. */
export function loadTestEnv() {
  for (const file of [".env.local", ".env.test.local"]) {
    if (existsSync(file)) process.loadEnvFile(file);
  }
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta ${name} (ver .env.test.example).`);
  return value;
}

/** Los tests escriben datos: abortar si Supabase no es local. */
export function assertLocalSupabase(): string {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const { hostname } = new URL(url);
  if (!["127.0.0.1", "localhost"].includes(hostname)) {
    throw new Error(`Tests E2E abortados: ${url} no es Supabase local.`);
  }
  return url;
}
