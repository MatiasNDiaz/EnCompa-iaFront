import { defineConfig, devices } from "@playwright/test";

import { loadTestEnv } from "./tests/support/env";

loadTestEnv();

/**
 * Por defecto los tests corren contra el BUILD DE PRODUCCIÓN (`next build` + `next start`)
 * en un puerto propio: es lo que ve el usuario y no tiene la compilación bajo demanda del
 * dev server, que bajo carga corta respuestas de navegación y vuelve los tests inestables.
 * `E2E_DEV=1` usa el dev server (más rápido para iterar).
 *
 * Siempre contra Supabase LOCAL. Nunca apuntar PLAYWRIGHT_BASE_URL a producción.
 */
const useDevServer = process.env.E2E_DEV === "1";
const PORT = Number(process.env.E2E_PORT ?? (useDevServer ? 3000 : 3100));
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  // Crea los usuarios E2E (admin y no-admin) en Supabase LOCAL y los borra al terminar.
  globalSetup: "./tests/support/global-setup.ts",
  globalTeardown: "./tests/support/global-teardown.ts",
  fullyParallel: true,
  expect: { timeout: useDevServer ? 20_000 : 10_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    locale: "es-AR",
    timezoneId: "America/Argentina/Cordoba",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: useDevServer
          ? `npm run dev -- -p ${PORT}`
          : `npm run build && npx next start -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
      },
});
