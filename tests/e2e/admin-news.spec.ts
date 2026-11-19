import { expect, test, type Page } from "@playwright/test";

import { remove, select, storageHas, storageImageInfo, storageRemove } from "../support/db";
import { openAdmin } from "../support/session";

/**
 * Novedades (Etapa 5). Crean, publican, ocultan y eliminan publicaciones, y el ítem
 * "Novedades" de la navbar depende de que haya alguna publicada: corren en los proyectos
 * *-news, uno después del otro (ver playwright.config.ts). Lo que crean lleva el prefijo
 * del proyecto en el título y se borra al terminar (filas y archivos).
 */
test.describe.configure({ mode: "serial" });

const PHOTO = "tests/fixtures/foto-prueba.jpg";
const VIDEO = "tests/fixtures/video-prueba.mp4";
const BIG_PHOTO = "tests/fixtures/foto-grande.jpg"; // 3200 × 2000
const POSTER_NEEDED = "El video necesita una portada (una foto).";

type Row = {
  slug: string;
  is_published: boolean;
  published_at: string | null;
  media_type: string;
  media_path: string;
  poster_path: string | null;
  card_layout: string;
};

let page: Page;
let prefix: string;
let titles: { image: string; video: string };
/** ¿Hay novedades publicadas que no son de este test? (entonces la navbar no se vacía). */
let othersPublished = false;

const rowsFor = (title: string) =>
  select<Row>(
    "news_posts",
    `select=slug,is_published,published_at,media_type,media_path,poster_path,card_layout&title=eq.${encodeURIComponent(title)}`,
  );

async function cleanup() {
  const like = `like.${encodeURIComponent(prefix)}*`;
  const rows = await select<Row>("news_posts", `select=media_path,poster_path&title=${like}`);
  await remove("news_posts", `title=${like}`);
  await storageRemove(rows.flatMap((r) => [r.media_path, r.poster_path].filter((p): p is string => Boolean(p))));
}

/** ¿El ítem "Novedades" está en la navegación principal (header o menú mobile)? */
async function navHasNews(isMobile: boolean) {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Abrir menú" }).click();
    const menu = page.getByRole("dialog", { name: "Menú" });
    const count = await menu.getByRole("link", { name: "Novedades", exact: true }).count();
    await page.keyboard.press("Escape");
    return count > 0;
  }
  return (await page.getByRole("banner").getByRole("link", { name: "Novedades", exact: true }).count()) > 0;
}

const dialog = () => page.getByRole("dialog", { name: /novedad$/ });
const row = (title: string) => page.getByRole("article", { name: title });

test.beforeAll(async ({ browser }, testInfo) => {
  prefix = `E2E ${testInfo.project.name}`;
  titles = { image: `${prefix} Noche de chicas`, video: `${prefix} Clase de cocktails` };
  await cleanup();
  const published = await select<{ title: string }>("news_posts", "select=title&is_published=is.true");
  othersPublished = published.some((p) => !p.title.startsWith("E2E "));
  page = await openAdmin(browser, testInfo.project.use);
});

test.afterAll(async () => {
  await cleanup();
  await page?.context().close();
});

/**
 * La web pública, recargando hasta que muestre el cambio (máx. 15 s). Después de una
 * acción del panel la revalidación del caché puede tardar un instante en verse.
 */
const eventually = (check: () => Promise<unknown>) =>
  expect.poll(check, { timeout: 15_000, intervals: [500, 1_000, 2_000] });

const publicCount = async (title: string) => {
  await page.goto("/novedades");
  return page.getByRole("article", { name: title }).count();
};

test("con imagen: vista previa, publicar y verla completa en su tarjeta; aparece en la navbar", async ({
  isMobile,
}) => {
  if (!othersPublished) expect(await navHasNews(isMobile)).toBe(false);

  await page.goto("/admin/novedades");
  await page.getByRole("button", { name: "Nueva novedad" }).click();
  const form = dialog();
  await form.locator('input[type="file"][accept*="image"]').setInputFiles(BIG_PHOTO);
  await form.getByLabel("Título").fill(titles.image);
  await form
    .getByLabel("Descripción")
    .fill("Tragos de autor y tapeo para compartir.\n\nMúsica en vivo desde las 21.");
  await form.getByLabel("Mensaje final").fill("¡Te esperamos!");
  // Diseño de la tarjeta: "Curva" (por defecto es "Dividida").
  await expect(form.getByRole("radio", { name: "Dividida" })).toBeChecked();
  await form.getByText("Curva", { exact: true }).click();
  await expect(form.getByRole("radio", { name: "Curva" })).toBeChecked();

  // Vista previa con el mismo componente que la web.
  await form.getByRole("button", { name: "Vista previa" }).click();
  // Dos tarjetas: como se ve en la computadora y en el celular.
  const previews = form.getByRole("article", { name: titles.image });
  await expect(previews).toHaveCount(2);
  await expect(previews.first().getByText("¡Te esperamos!", { exact: true })).toBeVisible();
  await form.getByRole("button", { name: "Datos" }).click();

  await form.getByRole("button", { name: "Publicar" }).click();
  await expect(form).toBeHidden();
  await expect(page.getByRole("region", { name: "Notifications" })).toContainText("Novedad publicada");
  await expect(row(titles.image)).toContainText("Publicada");

  const [saved] = await rowsFor(titles.image);
  expect(saved.is_published).toBe(true);
  expect(saved.published_at).not.toBeNull();
  expect(saved.media_type).toBe("image");
  expect(saved.card_layout).toBe("curved");
  expect(saved.media_path).toMatch(/^news\/[0-9a-f-]{36}\.webp$/);
  // La foto de 3200 × 2000 se comprimió en el navegador: WebP de 2400 px como máximo.
  const stored = await storageImageInfo(saved.media_path);
  expect(stored.format).toBe("webp");
  expect(Math.max(stored.width, stored.height)).toBe(2400);
  expect(await storageHas(saved.media_path)).toBe(true);

  await eventually(() => navHasNews(isMobile)).toBe(true);

  // La novedad se ve COMPLETA en su tarjeta: no hay página de detalle ni "Leer más".
  await page.goto("/novedades");
  const card = page.getByRole("article", { name: titles.image });
  await expect(card.locator("[data-layout]")).toHaveAttribute("data-layout", "curved");
  await expect(card.getByRole("heading", { level: 2 })).toHaveText(titles.image);
  await expect(card.getByText("Tragos de autor y tapeo para compartir.")).toBeVisible();
  await expect(card.getByText("Música en vivo desde las 21.")).toBeVisible();
  await expect(card.getByText("¡Te esperamos!", { exact: true })).toBeVisible();
  await expect(card.getByRole("link")).toHaveCount(0);
  await expect(page.getByText("Leer más")).toHaveCount(0);

  // Un link viejo al detalle lleva a la lista.
  await page.goto(`/novedades/${saved.slug}`);
  await expect(page).toHaveURL(/\/novedades$/);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
});

test("con video: pide portada, se guarda como borrador (no se ve) y se publica desde el menú", async () => {
  await page.goto("/admin/novedades");
  await page.getByRole("button", { name: "Nueva novedad" }).click();
  const form = dialog();
  await form.getByText("Video", { exact: true }).click();
  await form.locator('input[type="file"][accept*="video"]').setInputFiles(VIDEO);
  await form.getByLabel("Título").fill(titles.video);
  await form.getByLabel("Descripción").fill("Aprendé a preparar tres clásicos con nuestro bartender.");

  // Sin portada no se puede guardar.
  await form.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(form.getByRole("alert")).toHaveText(POSTER_NEEDED);

  await form.locator('input[type="file"][accept*="image"]').setInputFiles(PHOTO);
  await form.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(form).toBeHidden();
  await expect(row(titles.video)).toContainText("Borrador");

  const [draft] = await rowsFor(titles.video);
  expect(draft.is_published).toBe(false);
  expect(draft.media_path).toMatch(/^news\/[0-9a-f-]{36}\.mp4$/);
  expect(draft.poster_path).toMatch(/^news\/[0-9a-f-]{36}\.webp$/);
  expect(await storageHas(draft.media_path)).toBe(true);

  // Un borrador no se ve en la web.
  expect(await publicCount(titles.video)).toBe(0);

  await page.goto("/admin/novedades");
  await page.getByRole("button", { name: `Opciones de ${titles.video}` }).click();
  await page.getByRole("menuitem", { name: "Publicar" }).click();
  await expect(row(titles.video)).toContainText("Publicada");

  // El video se reproduce en la tarjeta (con portada, sin descarga previa ni autoplay).
  await eventually(() => publicCount(titles.video)).toBe(1);
  const video = page.getByRole("article", { name: titles.video }).locator("video");
  await expect(video).toHaveAttribute("poster", /\/news\//);
  await expect(video).toHaveAttribute("preload", "none");
  await expect(video).not.toHaveAttribute("autoplay", /.*/);
  await expect(video).toHaveAttribute("controls", "");
});

test("ocultar y eliminar (borra los archivos); sin publicadas, la navbar no muestra Novedades", async ({
  isMobile,
}) => {
  const [image] = await rowsFor(titles.image);
  const [video] = await rowsFor(titles.video);

  await page.goto("/admin/novedades");
  await page.getByRole("button", { name: `Opciones de ${titles.image}` }).click();
  await page.getByRole("menuitem", { name: "Ocultar" }).click();
  await expect(row(titles.image)).toContainText("Borrador");
  await eventually(() => publicCount(titles.image)).toBe(0);

  await page.goto("/admin/novedades");
  for (const title of [titles.image, titles.video]) {
    await page.getByRole("button", { name: `Opciones de ${title}` }).click();
    await page.getByRole("menuitem", { name: "Eliminar" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Eliminar" }).click();
    await expect(row(title)).toHaveCount(0);
  }

  expect(await rowsFor(titles.image)).toHaveLength(0);
  expect(await rowsFor(titles.video)).toHaveLength(0);
  for (const path of [image.media_path, video.media_path, video.poster_path!])
    expect(await storageHas(path)).toBe(false);

  if (!othersPublished) {
    await eventually(() => navHasNews(isMobile)).toBe(false);
    await page.goto("/novedades");
    await expect(page.getByText("Todavía no hay novedades")).toBeVisible();
  }
});
