/**
 * Variables públicas de Supabase. Se leen con acceso estático a `process.env.NEXT_PUBLIC_*`
 * para que Next.js las incruste en el bundle del navegador.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copiá .env.example como .env.local.",
  );
}

export const supabaseEnv = { url, publishableKey } as const;
