import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Opciones de la cookie de sesión de Supabase (las usan el proxy y el cliente de servidor).
 *
 * - httpOnly: el JavaScript del navegador NO puede leer la sesión (si hubiera un XSS, no
 *   se podría robar). Ningún componente del navegador la necesita: el login, el cierre de
 *   sesión y todas las escrituras son Server Actions, y las subidas usan URL firmada.
 * - secure: solo viaja por https. Se activa cuando el sitio es https (producción); en
 *   local y en los tests el sitio es http y la cookie no se guardaría.
 * - sameSite lax: no se envía en pedidos que inicia otro sitio (CSRF).
 */
const isHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");

export const sessionCookieOptions: CookieOptionsWithName = {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: isHttps,
};
