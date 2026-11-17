import { expect, test, type Page } from "@playwright/test";

import { e2eUsers } from "../support/users";

const GENERIC_ERROR = "Email o contraseña incorrectos.";

// Next.js agrega su propio role="alert" (anunciador de rutas): se filtra por texto.
const errorAlert = (page: Page) => page.getByRole("alert").filter({ hasText: GENERIC_ERROR });

async function login(page: Page, email: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
}

test.describe("Admin · autenticación y protección", () => {
  test("sin sesión, /admin/dashboard redirige al login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole("heading", { name: "Panel de En Compañía" })).toBeVisible();
  });

  test("login correcto del admin entra al dashboard", async ({ page }) => {
    const { admin } = e2eUsers();
    await login(page, admin.email, admin.password);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await expect(page.getByRole("heading", { name: /Hola/ })).toBeVisible();
  });

  test("contraseña incorrecta muestra un error genérico", async ({ page }) => {
    const { admin } = e2eUsers();
    await login(page, admin.email, "contraseña-incorrecta");
    await expect(errorAlert(page)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("un email inexistente muestra el MISMO error (no revela si existe)", async ({ page }) => {
    await login(page, "no-existe@test.local", "cualquier-cosa");
    await expect(errorAlert(page)).toBeVisible();
  });

  test("validación del formulario en el cliente", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page.getByText("Ingresá un email válido.")).toBeVisible();
    await expect(page.getByText("Ingresá tu contraseña.")).toBeVisible();
  });

  test("un usuario autenticado SIN rol admin ve 'acceso denegado'", async ({ page }) => {
    const { user } = e2eUsers();
    await login(page, user.email, user.password);
    await expect(page.getByRole("heading", { name: "Acceso denegado" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Hola/ })).toHaveCount(0);
  });

  test("con sesión de admin, /admin/login redirige al dashboard", async ({ page }) => {
    const { admin } = e2eUsers();
    await login(page, admin.email, admin.password);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
  });

  test("logout cierra la sesión", async ({ page }) => {
    const { admin } = e2eUsers();
    await login(page, admin.email, admin.password);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);

    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);

    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
