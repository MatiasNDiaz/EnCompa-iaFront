import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Solo el área administrativa usa sesión. La web pública no pasa por el proxy:
  // así no paga la latencia del refresco y puede servirse prerenderizada.
  // (Este matcher excluye por diseño _next/static, imágenes y demás assets.)
  matcher: ["/admin/:path*"],
};
