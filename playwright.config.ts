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
const WRITES_MENU = /admin-carta.*\.spec\.ts/;
const WRITES_SPECIALS = /admin-specials\.spec\.ts/;
const WRITES_HOURS = /admin-hours\.spec\.ts/;

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
  // Los tests que ESCRIBEN la carta (admin-carta*) corren después de los de lectura:
  // así no cambian los conteos que verifican los tests de la web pública.
  // Los del plato del día (3 filas fijas compartidas) y los de horarios (fila única de
  // site_settings) corren desktop → mobile, en serie.
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [WRITES_MENU, WRITES_SPECIALS, WRITES_HOURS],
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testIgnore: [WRITES_MENU, WRITES_SPECIALS, WRITES_HOURS],
    },
    {
      name: "desktop-hours",
      use: { ...devices["Desktop Chrome"] },
      testMatch: WRITES_HOURS,
      dependencies: ["desktop", "mobile"],
    },
    {
      name: "mobile-hours",
      use: { ...devices["Pixel 7"] },
      testMatch: WRITES_HOURS,
      dependencies: ["desktop-hours"],
    },
    {
      name: "desktop-specials",
      use: { ...devices["Desktop Chrome"] },
      testMatch: WRITES_SPECIALS,
      dependencies: ["desktop", "mobile"],
    },
    {
      name: "mobile-specials",
      use: { ...devices["Pixel 7"] },
      testMatch: WRITES_SPECIALS,
      dependencies: ["desktop-specials"],
    },
    {
      name: "desktop-admin",
      use: { ...devices["Desktop Chrome"] },
      testMatch: WRITES_MENU,
      dependencies: ["desktop", "mobile"],
    },
    {
      name: "mobile-admin",
      use: { ...devices["Pixel 7"] },
      testMatch: WRITES_MENU,
      dependencies: ["desktop", "mobile"],
    },
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
