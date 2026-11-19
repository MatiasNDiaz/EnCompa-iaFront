import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database.types";

import { sessionCookieOptions } from "./cookies";
import { supabaseEnv } from "./env";

const LOGIN_PATH = "/admin/login";

/**
 * Refresca la sesión de Supabase (rota tokens y reescribe cookies) y hace una
 * redirección OPTIMISTA: sin sesión, /admin/* → /admin/login.
 *
 * NO es la barrera de seguridad: el layout protegido y cada Server Action vuelven a
 * verificar sesión y rol en el servidor, y la RLS lo hace en la base.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseEnv.url, supabaseEnv.publishableKey, {
    cookieOptions: sessionCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        // Respuestas que escriben cookies de sesión no deben cachearse (CDN/proxies).
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // No ejecutar código entre createServerClient y getClaims (recomendación oficial):
  // getClaims valida el JWT y dispara el refresco si hace falta.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  if (!isAuthenticated && request.nextUrl.pathname !== LOGIN_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    // Conservar cookies que el refresco haya modificado (p. ej. limpieza de sesión inválida).
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}
