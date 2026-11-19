import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { chromium, type FullConfig } from "@playwright/test";

import { loadTestEnv } from "./env";
import { ADMIN_STATE } from "./session";
import { createUser, e2eUsers } from "./users";

export default async function globalSetup(config: FullConfig) {
  loadTestEnv();
  const { admin, user } = e2eUsers();
  await createUser(admin.email, admin.password, "admin");
  await createUser(user.email, user.password, null); // autenticado SIN rol admin

  // Un solo login del admin para toda la corrida (el servidor ya está levantado).
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) throw new Error("Falta baseURL en playwright.config.ts");
  mkdirSync(dirname(ADMIN_STATE), { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ baseURL });
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Contraseña", { exact: true }).fill(admin.password);
    await page.getByRole("button", { name: "Ingresar" }).click();
    await page.waitForURL(/\/admin\/dashboard$/);
    await page.context().storageState({ path: ADMIN_STATE });
  } finally {
    await browser.close();
  }
}
