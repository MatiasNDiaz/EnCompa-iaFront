import { expect, type Browser, type BrowserContextOptions } from "@playwright/test";

/**
 * Sesión del admin E2E guardada UNA vez por corrida (global-setup.ts). Los tests del
 * panel la reutilizan en vez de loguearse cada uno: Supabase Auth limita los logins por
 * IP (30 cada 5 min en local) y pasarse hacía fallar tests al azar.
 * Solo tiene tokens del usuario temporal de Supabase LOCAL; está en .gitignore.
 */
export const ADMIN_STATE = "playwright/.auth/admin.json";

/** Contexto ya logueado como admin, en el dashboard (sin scroll suave: clics sin esperas). */
export async function openAdmin(browser: Browser, use: BrowserContextOptions) {
  const context = await browser.newContext({ ...use, storageState: ADMIN_STATE });
  await context.addInitScript(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  const page = await context.newPage();
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  return page;
}
