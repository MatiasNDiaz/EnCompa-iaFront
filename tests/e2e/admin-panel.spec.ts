import { randomBytes } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

import { createUser, deleteUser, e2eUsers } from "../support/users";

async function login(page: Page, email: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
}

const SECTIONS = ["Inicio", "Carta", "Plato del día", "Horarios", "Novedades", "Mi cuenta"] as const;
/** En mobile la barra lleva las de todos los días; el resto está en "Más". */
const BAR_SECTIONS = ["Inicio", "Carta", "Plato del día", "Horarios"] as const;

const field = (page: Page, label: string) => page.getByLabel(label, { exact: true });

test.describe("Panel · estructura e inicio", () => {
  test.beforeEach(async ({ page }) => {
    const { admin } = e2eUsers();
    await login(page, admin.email, admin.password);
  });

  test("navegación: sidebar en desktop, barra inferior en mobile", async ({ page, isMobile }) => {
    const nav = page.getByRole("navigation", { name: "Panel" });
    await expect(nav).toHaveCount(1); // solo una de las dos es visible

    for (const label of isMobile ? BAR_SECTIONS : SECTIONS) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
    }
    await expect(nav.getByRole("link", { name: "Inicio" })).toHaveAttribute("aria-current", "page");

    if (isMobile) {
      // Barra inferior fija y áreas táctiles de al menos 44 px.
      const box = await nav.boundingBox();
      const viewport = page.viewportSize()!;
      expect(Math.round(box!.y + box!.height)).toBe(viewport.height);
      const targets = [
        ...BAR_SECTIONS.map((label) => nav.getByRole("link", { name: label })),
        nav.getByRole("button", { name: "Más" }),
      ];
      for (const target of targets) {
        const link = await target.boundingBox();
        expect(link!.height).toBeGreaterThanOrEqual(44);
        expect(link!.width).toBeGreaterThanOrEqual(44);
      }
    } else {
      await expect(
        page.getByRole("complementary").getByRole("button", { name: "Cerrar sesión" }),
      ).toBeVisible();
    }

    await expect(page.getByRole("link", { name: /Ver la web/ }).first()).toHaveAttribute(
      "target",
      "_blank",
    );

    if (isMobile) {
      await nav.getByRole("button", { name: "Más" }).click();
      const more = page.getByRole("dialog", { name: "Más" });
      await expect(more.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
      await more.getByRole("link", { name: "Mi cuenta" }).click();
      await expect(page).toHaveURL(/\/admin\/cuenta$/);
      await expect(more).toBeHidden();
    } else {
      await nav.getByRole("link", { name: "Mi cuenta" }).click();
      await expect(page).toHaveURL(/\/admin\/cuenta$/);
      await expect(nav.getByRole("link", { name: "Mi cuenta" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
    await expect(page.getByRole("heading", { level: 1, name: "Tu acceso al panel" })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false);
  });

  test("inicio: saludo, accesos rápidos y resumen de la carta", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /^(Buen día|Buenas tardes|Buenas noches), Admin$/,
    );

    const main = page.getByRole("main");
    await expect(main.getByRole("link", { name: /Nuevo producto/ })).toHaveAttribute(
      "href",
      "/admin/carta?nuevo=producto",
    );
    await expect(main.getByRole("link", { name: /Nueva sección/ })).toHaveAttribute(
      "href",
      "/admin/carta?nueva=seccion",
    );
    await expect(main.getByRole("link", { name: /Plato del día/ })).toHaveAttribute(
      "href",
      "/admin/plato-del-dia",
    );

    await expect(main.getByRole("heading", { name: "Para revisar" })).toBeVisible();
    // Seed: ningún producto tiene foto propia (todos usan la ilustrativa).
    await expect(main.getByText(/\d+ productos? en la carta/)).toBeVisible();
    await expect(main.getByRole("link", { name: /productos? sin foto propia/ })).toBeVisible();
  });
});

test.describe("Panel · Mi cuenta", () => {
  // Usuario propio por test: cambiar la contraseña no afecta al admin compartido.
  let email: string;
  let password: string;

  test.beforeEach(async ({ page }, testInfo) => {
    email = `e2e-cuenta-${testInfo.project.name}-${Date.now()}@test.local`;
    password = `Aa1${randomBytes(10).toString("hex")}`;
    await createUser(email, password, "admin");
    await login(page, email, password);
    await page.goto("/admin/cuenta");
  });

  test.afterEach(async () => {
    await deleteUser(email);
  });

  test("validaciones del formulario y contraseña actual incorrecta", async ({ page }) => {
    const main = page.getByRole("main");
    const submit = main.getByRole("button", { name: "Cambiar contraseña" });

    await submit.click();
    await expect(main.getByText("Ingresá tu contraseña actual.")).toBeVisible();
    await expect(main.getByText("Tiene que tener al menos 12 caracteres.")).toBeVisible();

    await field(page, "Contraseña actual").fill("otra-cosa-Incorrecta1");
    await field(page, "Nueva contraseña").fill("NuevaClave2026x");
    await field(page, "Repetí la nueva contraseña").fill("NuevaClave2026y");
    await submit.click();
    await expect(main.getByText("Las contraseñas no coinciden.")).toBeVisible();

    await field(page, "Repetí la nueva contraseña").fill("NuevaClave2026x");
    await submit.click();
    await expect(
      page.getByRole("alert").filter({ hasText: "La contraseña actual no es correcta." }),
    ).toBeVisible();
  });

  test("cambia la contraseña: la nueva sirve y la anterior ya no", async ({ page }) => {
    const next = `Bb2${randomBytes(10).toString("hex")}`;
    const main = page.getByRole("main");
    await field(page, "Contraseña actual").fill(password);
    await field(page, "Nueva contraseña").fill(next);
    await field(page, "Repetí la nueva contraseña").fill(next);
    await main.getByRole("button", { name: "Cambiar contraseña" }).click();
    await expect(page.getByText("Contraseña actualizada")).toBeVisible();
    await expect(field(page, "Contraseña actual")).toHaveValue("");

    await main.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Contraseña", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Email o contraseña incorrectos." }),
    ).toBeVisible();

    await login(page, email, next);
  });

  test("avisa si hay cambios sin guardar antes de salir", async ({ page }) => {
    await field(page, "Contraseña actual").fill("algo");
    const nav = page.getByRole("navigation", { name: "Panel" });

    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain("cambios sin guardar");
      void dialog.dismiss();
    });
    await nav.getByRole("link", { name: "Inicio" }).click();
    await expect(page).toHaveURL(/\/admin\/cuenta$/);

    page.once("dialog", (dialog) => void dialog.accept());
    await nav.getByRole("link", { name: "Inicio" }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
  });
});
