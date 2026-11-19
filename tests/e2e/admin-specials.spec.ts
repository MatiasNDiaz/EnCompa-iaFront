import { expect, test, type Page } from "@playwright/test";

import { momentLabel } from "../../src/features/specials/moments";
import { login, select, storageHas, storageRemove, update } from "../support/db";
import { acquireLock } from "../support/lock";
import { e2eUsers } from "../support/users";

/**
 * Plato del día (Etapa 4). Escriben las 3 filas fijas de daily_specials, así que corren
 * en los proyectos *-specials, uno después del otro (ver playwright.config.ts).
 * Guardan el estado previo de la tabla y lo restauran al terminar.
 */
test.describe.configure({ mode: "serial" });

type Moment = "morning" | "midday" | "evening";
type Row = {
  moment: Moment;
  image_path: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  price: number | null;
  ingredients: string | null;
  is_published: boolean;
};

const COLUMNS = "moment,image_path,title,subtitle,body,price,ingredients,is_published";
const EMPTY = {
  image_path: null,
  title: null,
  subtitle: null,
  body: null,
  price: null,
  ingredients: null,
  is_published: false,
};
const PHOTO = "tests/fixtures/foto-prueba.jpg";
const PUBLISH_NEEDS = "Para publicarlo necesita una foto y un título.";

let page: Page;
let snapshot: Row[] = [];
let releaseLock: (() => void) | undefined;
let dishes: Record<Moment, { title: string; subtitle: string; price: string; ingredients: string }>;

test.beforeAll(async ({ browser }, testInfo) => {
  const prefix = `E2E ${testInfo.project.name}`;
  dishes = {
    morning: {
      title: `${prefix} Tostado de campo`,
      subtitle: "Pan de masa madre y huevos de granja",
      price: "6.900",
      ingredients: "Pan de masa madre, huevos de granja y palta.",
    },
    midday: {
      title: `${prefix} Risotto de hongos`,
      subtitle: "Cremoso, con hongos de la zona",
      price: "12.500",
      ingredients: "Arroz carnaroli, hongos de la zona y parmesano.",
    },
    evening: {
      title: `${prefix} Tabla de quesos`,
      subtitle: "Para compartir con un cocktail",
      price: "15.800",
      ingredients: "Quesos de la zona, frutos secos y miel.",
    },
  };

  releaseLock = acquireLock("daily_specials");
  snapshot = await select<Row>("daily_specials", `select=${COLUMNS}`);
  // Datos de prueba en la tabla = otra corrida en curso o una que se cortó: no se pisa.
  const leftover = snapshot.find((row) => row.title?.startsWith("E2E "));
  if (leftover) {
    snapshot = [];
    throw new Error(`daily_specials tiene datos de prueba («${leftover.title}»): revisar antes de correr.`);
  }
  await update("daily_specials", "moment=not.is.null", EMPTY);

  const context = await browser.newContext(testInfo.project.use);
  await context.addInitScript(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  page = await context.newPage();
  const { admin } = e2eUsers();
  await login(page, admin.email, admin.password);
});

test.afterAll(async () => {
  await page?.context().close();
  if (snapshot.length === 0) return releaseLock?.(); // no llegó a guardar el estado previo
  // Fotos que subieron los tests (no estaban antes) → se borran. Después, estado previo.
  const now = await select<Row>("daily_specials", `select=${COLUMNS}`);
  const before = new Set(snapshot.map((row) => row.image_path));
  const uploaded = now
    .map((row) => row.image_path)
    .filter((p): p is string => Boolean(p) && !before.has(p));
  for (const { moment, ...fields } of snapshot) {
    await update("daily_specials", `moment=eq.${moment}`, fields);
  }
  await storageRemove(uploaded);
  releaseLock?.();
});

const toast = (text: string | RegExp) =>
  page.getByRole("region", { name: "Notifications" }).getByText(text).first();

const card = (moment: Moment) => page.getByRole("article", { name: momentLabel(moment) });

const MOMENTS: Moment[] = ["morning", "midday", "evening"];

/** Link "Plato del día" del menú principal (desktop: barra; mobile: menú desplegable). */
async function navSpecialsLink(isMobile: boolean) {
  if (!isMobile) {
    return page
      .getByRole("navigation", { name: "Principal" })
      .first()
      .getByRole("link", { name: "Plato del día" });
  }
  await page.getByRole("button", { name: "Abrir menú" }).click();
  return page.getByRole("dialog", { name: "Menú" }).getByRole("link", { name: "Plato del día" });
}

test("panel: cargar y publicar los platos de mañana, mediodía y tarde/noche", async () => {
  test.setTimeout(120_000);
  await page.goto("/admin/plato-del-dia");
  await expect(page.getByRole("heading", { level: 1, name: "Plato del día" })).toBeVisible();

  for (const [index, moment] of MOMENTS.entries()) {
    const dish = dishes[moment];
    const label = momentLabel(moment);
    await expect(card(moment).getByText("Sin publicar")).toBeVisible();
    await card(moment).getByRole("button", { name: "Cargar plato" }).click();
    const form = page.getByRole("dialog", { name: `Plato del día · ${label}` });
    await expect(form).toBeVisible();

    if (index === 0) {
      // No se publica un espacio sin foto ni título.
      await form.getByRole("button", { name: "Publicar", exact: true }).click();
      await expect(form.getByRole("alert")).toHaveText(PUBLISH_NEEDS);
    }

    await form.getByLabel("Foto del plato").setInputFiles(PHOTO);
    await expect(form.getByText("Foto nueva: se sube al guardar")).toBeVisible();
    await form.getByLabel("Título", { exact: true }).fill(dish.title);
    await form.getByLabel("Subtítulo").fill(dish.subtitle);
    await form
      .getByLabel("Texto", { exact: true })
      .fill("Plato de prueba de los tests automáticos.");
    await form.getByLabel("Precio").fill(dish.price);
    // Ingredientes: un solo texto (no de a uno).
    await form.getByLabel("Ingredientes").fill(dish.ingredients);

    // Vista previa con el componente de la web.
    await form.getByRole("button", { name: "Vista previa" }).click();
    const preview = form.getByRole("article");
    await expect(preview.getByRole("heading", { name: dish.title })).toBeVisible();
    await expect(preview.getByText(`Plato del día · ${label}`)).toBeVisible();
    await expect(preview.getByText(dish.ingredients, { exact: true })).toBeVisible();
    await form.getByRole("button", { name: "Datos" }).click();

    await form.getByRole("button", { name: "Publicar", exact: true }).click();
    await expect(toast("Plato publicado")).toBeVisible();
    await expect(form).toBeHidden();
    await expect(card(moment).getByText("Publicado", { exact: true })).toBeVisible();
    await expect(card(moment).getByText(dish.title)).toBeVisible();
  }

  const rows = await select<Row>("daily_specials", `select=${COLUMNS}`);
  for (const moment of MOMENTS) {
    const row = rows.find((r) => r.moment === moment)!;
    expect(row.is_published).toBe(true);
    expect(row.title).toBe(dishes[moment].title);
    expect(row.ingredients).toEqual(dishes[moment].ingredients);
    expect(row.image_path).toMatch(/^specials\/[0-9a-f-]{36}\.webp$/); // comprimida a WebP
    expect(await storageHas(row.image_path!)).toBe(true);
  }
});

test("menú: «Plato del día» lleva directo a los platos de la carta, con su animación", async ({
  isMobile,
}) => {
  await page.goto("/");
  // La home ya no tiene la sección del plato del día.
  await expect(page.locator("#plato-del-dia")).toHaveCount(0);

  const link = await navSpecialsLink(isMobile);
  await expect(link).toHaveAttribute("href", "/carta?ver=platos-del-dia#platos-del-dia");
  await link.click();
  await expect(page).toHaveURL(/\/carta\?ver=platos-del-dia#platos-del-dia$/);

  // Llega con la lista a la vista (título del primer plato justo debajo de la barra).
  const list = page.locator("#platos-del-dia");
  await expect(
    list.getByRole("heading", { level: 2, name: "Plato de la mañana" }),
  ).toBeInViewport();

  // Cada plato: título con su horario y el contenedor que se descubre (paños decorativos).
  for (const moment of MOMENTS) {
    const label = {
      morning: "Plato de la mañana",
      midday: "Plato del mediodía",
      evening: "Plato de la tarde / noche",
    }[moment];
    const section = list.getByRole("region", { name: label });
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator('[data-reveal="wipe"]')).toHaveAttribute("data-revealed", "");
    await expect(section.locator(".wipe-layer").first()).toHaveAttribute("aria-hidden", "true");
    await expect(section.getByRole("heading", { name: dishes[moment].title })).toBeVisible();
    await expect(section.getByText(`$${dishes[moment].price}`)).toBeVisible();
    await expect(section.getByText(dishes[moment].ingredients, { exact: true })).toBeVisible();
  }

  if (isMobile) {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false);
  }
});

test("carta: filtro «Platos del día» (a la derecha de «Todo») muestra los platos publicados", async () => {
  await page.goto("/carta");
  // Sin destacado arriba de los filtros: la carta empieza directo.
  await expect(page.getByRole("complementary", { name: "Hoy recomendamos" })).toHaveCount(0);

  const filter = page.getByRole("navigation", { name: "Filtrar la carta por momento del día" });
  const options = filter.getByRole("link");
  await expect(options.nth(0)).toHaveText("Todo");
  await expect(options.nth(1)).toHaveText("Platos del día");

  await options.nth(1).click();
  await expect(page).toHaveURL(/\/carta\?ver=platos-del-dia$/);
  await expect(options.nth(1)).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 1, name: "Platos del día" })).toBeVisible();
  const list = page.getByRole("region", { name: "Platos del día" });
  for (const moment of MOMENTS) {
    await expect(list.getByRole("heading", { name: dishes[moment].title })).toBeVisible();
  }
  // No muestra las secciones de la carta.
  await expect(page.getByRole("navigation", { name: "Secciones de la carta" })).toHaveCount(0);

  await filter.getByRole("link", { name: "Todo" }).click();
  await expect(page.getByRole("navigation", { name: "Secciones de la carta" })).toBeVisible();
});

test("quitar de la web: desaparecen la sección, el link del menú y el filtro de la carta; vaciar borra la foto", async ({
  isMobile,
}) => {
  test.setTimeout(90_000);
  await page.goto("/admin/plato-del-dia");
  for (const moment of MOMENTS) {
    await card(moment).getByRole("button", { name: "Quitar de la web" }).click();
    await expect(toast("Plato quitado de la web")).toBeVisible();
    await expect(card(moment).getByText("Sin publicar")).toBeVisible();
  }

  await page.goto("/");
  await expect(page.locator("#plato-del-dia")).toHaveCount(0);
  if (isMobile) await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.getByRole("link", { name: "Plato del día" })).toHaveCount(0);

  await page.goto("/carta");
  await expect(page.getByRole("link", { name: "Platos del día" })).toHaveCount(0);
  // La URL del filtro sin platos publicados muestra la carta completa.
  await page.goto("/carta?ver=platos-del-dia");
  await expect(page.getByRole("navigation", { name: "Secciones de la carta" })).toBeVisible();

  // Vaciar: confirma, borra datos y foto; la fila queda lista para cargar otro.
  const [morning] = await select<Row>("daily_specials", `select=${COLUMNS}&moment=eq.morning`);
  await page.goto("/admin/plato-del-dia");
  await card("morning").getByRole("button", { name: "Vaciar" }).click();
  const confirm = page.getByRole("alertdialog", { name: "¿Vaciar el plato de mañana?" });
  await confirm.getByRole("button", { name: "Vaciar" }).click();
  await expect(toast("Espacio vacío")).toBeVisible();
  await expect(card("morning").getByRole("button", { name: "Cargar plato" })).toBeVisible();
  expect(await storageHas(morning.image_path!)).toBe(false);
});
