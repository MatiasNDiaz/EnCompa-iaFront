import { expect, test, type Browser, type Page } from "@playwright/test";

import { cleanupByPrefix, login, select, storageHas } from "../support/db";
import { e2eUsers } from "../support/users";

/**
 * Panel · carta (Etapa 2). ESCRIBEN la carta: corren en los proyectos *-admin, después
 * de los tests de lectura (ver playwright.config.ts). Cada proyecto usa su propio
 * prefijo de nombres y limpia lo que creó.
 * En serie y con una sola sesión por proyecto (menos logins: Auth limita por IP).
 */
test.describe.configure({ mode: "serial" });

const PHOTO = "tests/fixtures/foto-prueba.jpg";
const NOT_AN_IMAGE = "tests/fixtures/no-es-imagen.txt";

let page: Page;
let prefix: string;

async function openSession(browser: Browser, projectUse: object) {
  const context = await browser.newContext(projectUse);
  // Sin scroll suave: los clics no esperan animaciones de scroll.
  await context.addInitScript(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  return context.newPage();
}

test.beforeAll(async ({ browser }, testInfo) => {
  prefix = `E2E ${testInfo.project.name}`;
  await cleanupByPrefix(prefix);
  page = await openSession(browser, testInfo.project.use);
  const { admin } = e2eUsers();
  await login(page, admin.email, admin.password);
});

test.afterAll(async () => {
  await page?.context().close();
  await cleanupByPrefix(prefix);
});

const toast = (text: string | RegExp) =>
  page.getByRole("region", { name: "Notifications" }).getByText(text).first();

/** Abre el menú ⋯ de un producto y elige una opción. */
async function productAction(name: string, option: string | RegExp) {
  await page.getByRole("button", { name: `Opciones de ${name}` }).click();
  await page.getByRole("menuitem", { name: option }).click();
}

async function searchInPanel(text: string) {
  await page.goto("/admin/carta");
  await page.getByRole("searchbox", { name: "Buscar en la carta" }).fill(text);
}

test("crear la sección «Tragos suizos» con banner y texto, y verla en la carta pública", async ({
  isMobile,
}) => {
  test.setTimeout(90_000);
  const sectionName = `${prefix} Tragos suizos`;
  const productName = `${prefix} Kirsch sour`;

  await page.goto("/admin/carta");
  await page.getByRole("button", { name: "Nueva sección" }).click();
  const form = page.getByRole("dialog", { name: "Nueva sección" });
  await expect(form).toBeVisible();

  await form.getByLabel("Foto del banner").setInputFiles(PHOTO);
  await expect(form.getByText("Foto nueva: se sube al guardar")).toBeVisible();
  await form.getByLabel("Título", { exact: true }).fill(sectionName);
  await form.getByLabel("Texto breve").fill("Clásicos de los Alpes, servidos acá");
  await form.getByText("Tarde / Noche", { exact: true }).click();
  // Vista previa en vivo con el mismo banner de la web.
  await expect(form.getByRole("heading", { name: sectionName })).toBeVisible();
  await form.getByRole("button", { name: "Crear sección" }).click();

  await expect(toast("Sección creada")).toBeVisible();
  await expect(form).toBeHidden();

  const [section] = await select<{
    id: string;
    slug: string;
    image_path: string;
    moments: string[];
  }>("categories", `select=id,slug,image_path,moments&name=eq.${encodeURIComponent(sectionName)}`);
  expect(section.image_path).toMatch(/^categories\/[0-9a-f-]{36}\.jpg$/);
  expect(section.moments).toEqual(["evening"]);
  expect(await storageHas(section.image_path)).toBe(true);

  // Una sección vacía no se muestra al público: se le agrega un producto.
  await page.getByRole("link", { name: new RegExp(sectionName) }).click();
  await expect(page.getByRole("heading", { level: 1, name: sectionName })).toBeVisible();
  await page
    .getByRole("button", { name: /Agregar (producto|el primero)/ })
    .first()
    .click();
  const productForm = page.getByRole("dialog", { name: "Nuevo producto" });
  await productForm.getByLabel("Foto del producto").setInputFiles(PHOTO);
  await productForm.getByLabel("Nombre").fill(productName);
  await productForm.getByLabel("Precio").fill("9.800");
  await productForm.getByLabel("Descripción").fill("Kirsch, limón y almíbar.");
  await productForm.getByRole("button", { name: "Crear producto" }).click();
  await expect(toast("Producto creado")).toBeVisible();

  // Carta pública: banner con la foto subida y el texto; detalle con el producto.
  await page.goto("/carta");
  const banner = page.getByRole("link", { name: new RegExp(sectionName) });
  await expect(banner).toBeVisible();
  await expect(banner.getByText("Clásicos de los Alpes, servidos acá")).toBeVisible();
  await expect(banner.locator("img")).toHaveAttribute("src", /categories/);

  await page.goto(`/carta/${section.slug}`);
  await expect(page.getByRole("heading", { level: 1, name: sectionName })).toBeVisible();
  const card = page.locator("article", { has: page.getByRole("heading", { name: productName }) });
  await expect(card).toBeVisible();
  await expect(card.getByText("$9.800")).toBeVisible();

  if (isMobile) {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false);
  }
});

test("producto: crear, editar, precio rápido, mover, sin stock hoy y eliminar (con su foto)", async ({
  isMobile,
}) => {
  test.setTimeout(120_000); // recorrido largo: panel + web pública varias veces
  const name = `${prefix} Flan casero`;
  const renamed = `${name} doble`;

  // Crear en Postres.
  await page.goto("/admin/carta");
  await page.getByRole("link", { name: /^Postres/ }).click();
  await page.getByRole("button", { name: "Agregar producto" }).first().click();
  const form = page.getByRole("dialog", { name: "Nuevo producto" });
  await form.getByLabel("Foto del producto").setInputFiles(PHOTO);
  await form.getByLabel("Nombre").fill(name);
  await form.getByLabel("Precio").fill("5000");
  await form.getByRole("button", { name: "Crear producto" }).click();
  await expect(toast("Producto creado")).toBeVisible();

  const [created] = await select<{ id: string; image_path: string }>(
    "products",
    `select=id,image_path&name=eq.${encodeURIComponent(name)}`,
  );
  expect(await storageHas(created.image_path)).toBe(true);

  // Editar (nombre y precio) desde el formulario.
  await productAction(name, "Editar");
  const edit = page.getByRole("dialog", { name: "Editar producto" });
  await edit.getByLabel("Nombre").fill(renamed);
  await edit.getByLabel("Precio").fill("6200");
  await edit.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(toast("Producto guardado")).toBeVisible();
  await expect(page.getByText(renamed, { exact: true })).toBeVisible();

  // Precio rápido desde la lista.
  const price = page.getByLabel(`Precio de ${renamed}`);
  await price.fill("6500");
  await price.press("Enter");
  await expect(toast("Precio actualizado")).toBeVisible();

  // Mover a Pastelería (submenú en desktop, panel desde abajo en mobile).
  await page.getByRole("button", { name: `Opciones de ${renamed}` }).click();
  if (isMobile) {
    await page.getByRole("menuitem", { name: "Cambiar de sección" }).click();
    await page
      .getByRole("dialog", { name: "Cambiar de sección" })
      .getByRole("button", { name: "Pastelería" })
      .click();
  } else {
    await page.getByRole("menuitem", { name: "Cambiar de sección" }).hover();
    await page.getByRole("menuitem", { name: "Pastelería" }).click();
  }
  await expect(toast("Producto movido")).toBeVisible();
  const [pasteleria] = await select<{ id: string }>("categories", "select=id&slug=eq.pasteleria");
  const [moved] = await select<{ category_id: string; price: number }>(
    "products",
    `select=category_id,price&id=eq.${created.id}`,
  );
  expect(moved.category_id).toBe(pasteleria.id);
  expect(moved.price).toBe(6500);

  // Sin stock por hoy: en la web se ve atenuado y con la etiqueta.
  await searchInPanel(renamed);
  await productAction(renamed, "Sin stock por hoy");
  await expect(toast("Sin stock por hoy")).toBeVisible();

  await page.goto("/carta/pasteleria");
  const card = page.locator("article", { has: page.getByRole("heading", { name: renamed }) });
  await expect(card).toHaveAttribute("data-out-of-stock", "true");
  await expect(card.getByText("Sin stock hoy")).toBeVisible();
  await expect(card.getByText("$6.500")).toBeVisible();

  // Eliminar: pide confirmación y borra también la foto de Storage.
  await searchInPanel(renamed);
  await productAction(renamed, "Eliminar");
  const confirm = page.getByRole("alertdialog", { name: `¿Eliminar «${renamed}»?` });
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "Eliminar" }).click();
  await expect(toast("Producto eliminado")).toBeVisible();

  expect(await select("products", `select=id&id=eq.${created.id}`)).toHaveLength(0);
  expect(await storageHas(created.image_path)).toBe(false);

  await page.goto("/carta/pasteleria");
  await expect(page.getByRole("heading", { name: renamed })).toHaveCount(0);
});

test("subsección: sin foto, con vista previa del encabezado, y se ve dentro de su sección", async () => {
  test.setTimeout(90_000);
  const subName = `${prefix} Tartas`;
  const productName = `${prefix} Tarta de manzana`;

  await page.goto("/admin/carta");
  await page.getByRole("link", { name: /^Pastelería/ }).click();
  await page.getByRole("button", { name: "Nueva subsección" }).click();
  const form = page.getByRole("dialog", { name: "Nueva subsección" });
  await expect(form).toBeVisible();

  // Una subsección no lleva foto (en la web no tiene banner).
  await expect(form.getByLabel("Foto del banner")).toHaveCount(0);
  await expect(form.getByText("Así se ve dentro de «Pastelería»")).toBeVisible();

  await form.getByLabel("Nombre de la subsección").fill(subName);
  await form.getByLabel("Texto breve").fill("Dulces y saladas, de la casa");
  await expect(form.getByRole("heading", { name: subName })).toBeVisible();
  await expect(form.getByText("Dulces y saladas, de la casa")).toBeVisible();
  await form.getByRole("button", { name: "Crear subsección" }).click();
  await expect(toast("Subsección creada")).toBeVisible();

  const [sub] = await select<{ image_path: string | null; parent_id: string | null }>(
    "categories",
    `select=image_path,parent_id&name=eq.${encodeURIComponent(subName)}`,
  );
  expect(sub.parent_id).not.toBeNull();
  expect(sub.image_path).toBeNull();

  // Con un producto, aparece en la carta pública como título dentro de Pastelería.
  await page.getByRole("button", { name: `Agregar producto en ${subName}` }).click();
  const productForm = page.getByRole("dialog", { name: "Nuevo producto" });
  await productForm.getByLabel("Nombre").fill(productName);
  await productForm.getByRole("button", { name: "Crear producto" }).click();
  await expect(toast("Producto creado")).toBeVisible();

  await page.goto("/carta/pasteleria");
  const heading = page.getByRole("heading", { level: 2, name: subName });
  await expect(heading).toBeVisible();
  const subsection = page.locator("section", { has: heading });
  await expect(subsection.getByText("Dulces y saladas, de la casa")).toBeVisible();
  await expect(subsection.getByRole("heading", { name: productName })).toBeVisible();
  await expect(subsection.locator("img")).toHaveCount(0); // sin banner (el producto no tiene foto)
});

test("eliminar una sección con productos se bloquea con un mensaje claro", async () => {
  await page.goto("/admin/carta");
  await page.getByRole("button", { name: "Opciones de la sección Cafetería" }).click();
  await page.getByRole("menuitem", { name: "Eliminar sección" }).click();
  await expect(toast(/Movelos o eliminalos primero/)).toBeVisible();
  expect(await select("categories", "select=id&slug=eq.cafeteria")).toHaveLength(1);
});

test("acceso rápido «Nuevo producto», validación de la foto y aviso de cambios sin guardar", async () => {
  await page.goto("/admin/dashboard");
  await page
    .getByRole("main")
    .getByRole("link", { name: /Nuevo producto/ })
    .click();
  const form = page.getByRole("dialog", { name: "Nuevo producto" });
  await expect(form).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/carta$/);

  // Un archivo que no es imagen se rechaza antes de subir.
  await form.getByLabel("Foto del producto").setInputFiles(NOT_AN_IMAGE);
  await expect(form.getByRole("alert")).toContainText("Esa imagen no sirve");

  // Validación del formulario.
  await form.getByRole("button", { name: "Crear producto" }).click();
  await expect(form.getByText("Poné el nombre del producto.")).toBeVisible();
  await expect(form.getByText("Elegí una sección.")).toBeVisible();

  // Cerrar con cambios pide confirmación.
  await form.getByLabel("Nombre").fill("Algo a medio cargar");
  await page.keyboard.press("Escape");
  const discard = page.getByRole("alertdialog", { name: "¿Descartar los cambios?" });
  await expect(discard).toBeVisible();
  await discard.getByRole("button", { name: "Seguir editando" }).click();
  await expect(form).toBeVisible();
  await expect(form.getByLabel("Nombre")).toHaveValue("Algo a medio cargar");

  await form.getByRole("button", { name: "Cerrar" }).click();
  await discard.getByRole("button", { name: "Descartar" }).click();
  await expect(form).toBeHidden();
});

test("buscador y filtros de la carta", async () => {
  await page.goto("/admin/carta");
  // Sin tildes ni mayúsculas, y también por sección.
  await page.getByRole("searchbox", { name: "Buscar en la carta" }).fill("CORTADO cafeteria");
  await expect(page.getByText(/^\d+ productos?$/)).toBeVisible();
  await expect(page.getByText("Cortado", { exact: true })).toBeVisible();

  await page.getByRole("searchbox", { name: "Buscar en la carta" }).fill("");
  await page.getByRole("button", { name: "Sin foto propia" }).click();
  await expect(page).toHaveURL(/filtro=sin-foto/);
  await expect(page.getByRole("button", { name: "Sin foto propia" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByText(/^\d+ productos$/)).toBeVisible();
});
