import { expect, test, type Page } from "@playwright/test";

import { login, remove, select, storageHas, storageRemove } from "../support/db";
import { e2eUsers } from "../support/users";

/**
 * Novedades (Etapa 5). Crean, publican, ocultan y eliminan publicaciones, y el ítem
 * "Novedades" de la navbar depende de que haya alguna publicada: corren en los proyectos
 * *-news, uno después del otro (ver playwright.config.ts). Lo que crean lleva el prefijo
 * del proyecto en el título y se borra al terminar (filas y archivos).
 */
test.describe.configure({ mode: "serial" });

const PHOTO = "tests/fixtures/foto-prueba.jpg";
const VIDEO = "tests/fixtures/video-prueba.mp4";
const POSTER_NEEDED = "El video necesita una portada (una foto).";

type Row = {
  slug: string;
  is_published: boolean;
  published_at: string | null;
  media_type: string;
  media_path: string;
  poster_path: string | null;
};

let page: Page;
let prefix: string;
let titles: { image: string; video: string };
/** ¿Hay novedades publicadas que no son de este test? (entonces la navbar no se vacía). */
let othersPublished = false;

const rowsFor = (title: string) =>
  select<Row>(
    "news_posts",
    `select=slug,is_published,published_at,media_type,media_path,poster_path&title=eq.${encodeURIComponent(title)}`,
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
  page = await browser.newPage(testInfo.project.use);
  await cleanup();
  const published = await select<{ title: string }>("news_posts", "select=title&is_published=is.true");
  othersPublished = published.some((p) => !p.title.startsWith("E2E "));
  const { admin } = e2eUsers();
  await login(page, admin.email, admin.password);
});

test.afterAll(async () => {
  await cleanup();
  await page.close();
});

test("con imagen: vista previa, publicar y verla en la lista y en el detalle; aparece en la navbar", async ({
  isMobile,
}) => {
  if (!othersPublished) expect(await navHasNews(isMobile)).toBe(false);

  await page.goto("/admin/novedades");
  await page.getByRole("button", { name: "Nueva novedad" }).click();
  const form = dialog();
  await form.locator('input[type="file"][accept*="image"]').setInputFiles(PHOTO);
  await form.getByLabel("Título").fill(titles.image);
  await form
    .getByLabel("Descripción")
    .fill("Tragos de autor y tapeo para compartir.\n\nMúsica en vivo desde las 21.");
  await form.getByLabel("Mensaje final").fill("¡Te esperamos!");

  // Vista previa con el mismo componente que la web.
  await form.getByRole("button", { name: "Vista previa" }).click();
  await expect(form.getByRole("heading", { level: 3, name: titles.image })).toBeVisible();
  await expect(form.getByText("¡Te esperamos!", { exact: true })).toBeVisible();
  await form.getByRole("button", { name: "Datos" }).click();

  await form.getByRole("button", { name: "Publicar" }).click();
  await expect(form).toBeHidden();
  await expect(page.getByRole("region", { name: "Notifications" })).toContainText("Novedad publicada");
  await expect(row(titles.image)).toContainText("Publicada");

  const [saved] = await rowsFor(titles.image);
  expect(saved.is_published).toBe(true);
  expect(saved.published_at).not.toBeNull();
  expect(saved.media_type).toBe("image");
  expect(saved.media_path).toMatch(/^news\/[0-9a-f-]{36}\.jpg$/);
  expect(await storageHas(saved.media_path)).toBe(true);

  expect(await navHasNews(isMobile)).toBe(true);

  await page.goto("/novedades");
  await page.getByRole("link", { name: new RegExp(titles.image) }).click();
  await expect(page).toHaveURL(new RegExp(`/novedades/${saved.slug}$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(titles.image);
  await expect(page.getByText("Música en vivo desde las 21.")).toBeVisible();
  await expect(page.getByText("¡Te esperamos!", { exact: true })).toBeVisible();
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/news\//);

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
  expect(draft.poster_path).toMatch(/^news\/[0-9a-f-]{36}\.jpg$/);
  expect(await storageHas(draft.media_path)).toBe(true);

  // Un borrador no se ve en la web.
  const hidden = await page.goto(`/novedades/${draft.slug}`);
  expect(hidden?.status()).toBe(404);

  await page.goto("/admin/novedades");
  await page.getByRole("button", { name: `Opciones de ${titles.video}` }).click();
  await page.getByRole("menuitem", { name: "Publicar" }).click();
  await expect(row(titles.video)).toContainText("Publicada");

  await page.goto(`/novedades/${draft.slug}`);
  const video = page.locator("article video");
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
  expect((await page.goto(`/novedades/${image.slug}`))?.status()).toBe(404);

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
    expect(await navHasNews(isMobile)).toBe(false);
    await page.goto("/novedades");
    await expect(page.getByText("Todavía no hay novedades")).toBeVisible();
  }
});
