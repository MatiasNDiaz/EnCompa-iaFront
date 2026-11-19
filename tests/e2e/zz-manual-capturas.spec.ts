import { mkdirSync } from "node:fs";

import { expect, test, type Page } from "@playwright/test";

import { login } from "../support/db";
import { e2eUsers } from "../support/users";

/**
 * Capturas del manual del panel (docs/MANUAL-PANEL.md), en el celular.
 * NO es un test: solo corre a pedido y no guarda nada (abre pantallas y formularios,
 * saca la captura y los cierra sin guardar). Entra con el usuario admin de los tests.
 *
 *   CAPTURE_MANUAL=1 npx playwright test zz-manual-capturas --project=mobile --no-deps
 *
 * Deja PNG en docs/manual/originales/ (ignorado por git); `npm run manual:imagenes` los
 * pasa a WebP livianos en docs/manual/.
 */
test.skip(!process.env.CAPTURE_MANUAL, "Solo a pedido (CAPTURE_MANUAL=1).");
test.describe.configure({ mode: "serial" });
// Como en un celular de Argentina: horas de 24 h y fechas dd/mm/aaaa.
// Los campos de hora y fecha de Chrome siguen el idioma con que arranca el navegador.
test.use({
  locale: "es-AR",
  timezoneId: "America/Argentina/Cordoba",
  launchOptions: { args: ["--lang=es-AR"] },
});

const OUT = "docs/manual/originales";

async function shot(page: Page, name: string) {
  // Que terminen de cargar las fotos A LA VISTA (las de más abajo cargan al acercarse)
  // y las animaciones de los paneles.
  await page.waitForFunction(() =>
    [...document.images]
      .filter((img) => {
        const r = img.getBoundingClientRect();
        return r.width > 0 && r.bottom > 0 && r.top < innerHeight;
      })
      .every((img) => img.complete && img.naturalWidth > 0),
  );
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

/** Cierra el panel lateral abierto sin guardar (descarta si pregunta). */
async function closeSheet(page: Page) {
  await page.keyboard.press("Escape");
  const discard = page.getByRole("alertdialog").getByRole("button", { name: "Descartar" });
  if (await discard.isVisible().catch(() => false)) await discard.click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

test("capturas del manual (celular)", async ({ page }) => {
  test.setTimeout(180_000);
  mkdirSync(OUT, { recursive: true });
  await page.emulateMedia({ reducedMotion: "reduce" });

  // 1. Entrar y salir
  await page.goto("/admin/login");
  await shot(page, "01-ingresar");
  const { admin } = e2eUsers();
  await login(page, admin.email, admin.password);
  await shot(page, "02-inicio");
  await page
    .getByRole("navigation", { name: "Panel" })
    .getByRole("button", { name: "Más" })
    .click();
  await shot(page, "03-mas");
  await closeSheet(page);

  // 2. Carta: sección, precio rápido, menú del producto y edición
  await page.goto("/admin/carta");
  await shot(page, "04-carta");
  await page.getByRole("link", { name: /^Cafetería/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Cafetería" })).toBeVisible();
  await page.getByLabel("Precio de Espresso").scrollIntoViewIfNeeded();
  await shot(page, "05-seccion");
  await page.getByRole("button", { name: "Opciones de Espresso" }).click();
  await shot(page, "06-menu-producto");
  await page.getByRole("menuitem", { name: "Editar" }).click();
  await expect(page.getByRole("dialog", { name: "Editar producto" })).toBeVisible();
  await shot(page, "07-editar-producto");
  await closeSheet(page);

  // 3. Nueva sección
  await page.goto("/admin/carta");
  await page.getByRole("button", { name: "Nueva sección" }).click();
  await expect(page.getByRole("dialog", { name: "Nueva sección" })).toBeVisible();
  await shot(page, "08-nueva-seccion");
  await closeSheet(page);

  // 4. Plato del día
  await page.goto("/admin/plato-del-dia");
  await shot(page, "09-plato-del-dia");
  await page
    .getByRole("button", { name: /^(Editar|Cargar plato)$/ })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await shot(page, "10-plato-formulario");
  await closeSheet(page);

  // 5. Horarios y día especial
  await page.goto("/admin/horarios");
  await shot(page, "11-horarios");
  await page.getByRole("button", { name: "Agregar día especial" }).click();
  await expect(page.getByRole("dialog", { name: "Nuevo día especial" })).toBeVisible();
  await shot(page, "12-dia-especial");
  await closeSheet(page);

  // 6. Novedades
  await page.goto("/admin/novedades");
  await shot(page, "13-novedades");
  await page.getByRole("button", { name: "Nueva novedad" }).click();
  await expect(page.getByRole("dialog", { name: "Nueva novedad" })).toBeVisible();
  await shot(page, "14-novedad-formulario");
  await closeSheet(page);
});
