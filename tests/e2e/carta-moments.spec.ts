import { expect, type Page, test } from "@playwright/test";

// Ver public-site.spec.ts: sin smooth-scroll en los tests.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
});

/** Secciones esperadas por momento (seed: categories.moments + herencia). */
const BY_MOMENT = {
  manana: ["cafeteria", "sandwiches", "desayunos-y-brunch", "pasteleria"],
  mediodia: ["cafeteria", "sandwiches", "almuerzos", "postres"],
  "tarde-noche": ["cafeteria", "pasteleria", "tapas-y-para-compartir", "postres", "cocteleria"],
} as const;

const CARDS = [
  { name: "Ver la carta de la mañana", param: "manana", h1: "Carta · Mañana" },
  { name: "Ver la carta del mediodía", param: "mediodia", h1: "Carta · Mediodía" },
  { name: "Ver la carta de la tarde / noche", param: "tarde-noche", h1: "Carta · Tarde / Noche" },
] as const;

const sectionLinks = (page: Page) =>
  page.getByRole("navigation", { name: "Secciones de la carta" }).getByRole("link");
const momentFilter = (page: Page) =>
  page.getByRole("navigation", { name: "Filtrar la carta por momento del día" });

async function expectSections(page: Page, param: keyof typeof BY_MOMENT) {
  await expect(sectionLinks(page)).toHaveCount(BY_MOMENT[param].length);
  for (const [i, slug] of BY_MOMENT[param].entries())
    await expect(sectionLinks(page).nth(i)).toHaveAttribute(
      "href",
      `/carta/${slug}?momento=${param}`,
    );
}

test.describe("Momentos · tarjetas de la home", () => {
  for (const { name, param, h1 } of CARDS) {
    test(`la tarjeta "${name}" lleva a /carta?momento=${param} filtrada`, async ({ page }) => {
      await page.goto("/");
      const card = page.getByRole("link", { name });
      await expect(card).toHaveAttribute("href", `/carta?momento=${param}`);
      await card.click();
      await expect(page).toHaveURL(new RegExp(`/carta\\?momento=${param}$`));
      await expect(page.locator("h1")).toHaveText(h1);
      await expect(page.getByRole("link", { name: "Ver carta completa" })).toBeVisible();
      await expectSections(page, param);
    });
  }

  test("Mañana muestra Desayunos y no Cocktails; Tarde/Noche, Cocktails y Tapas y no Desayunos", async ({
    page,
  }) => {
    await page.goto("/carta?momento=manana");
    const nav = page.getByRole("navigation", { name: "Secciones de la carta" });
    await expect(nav.getByRole("heading", { name: "Desayunos & Brunch" })).toBeVisible();
    await expect(nav.getByRole("heading", { name: "Cocktails" })).toHaveCount(0);

    await page.goto("/carta?momento=tarde-noche");
    await expect(nav.getByRole("heading", { name: "Cocktails" })).toBeVisible();
    await expect(nav.getByRole("heading", { name: "Tapas & para compartir" })).toBeVisible();
    await expect(nav.getByRole("heading", { name: "Desayunos & Brunch" })).toHaveCount(0);
  });

  test("se usan con teclado: Tab llega a la tarjeta (foco visible) y Enter navega", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "navegación con teclado: solo desktop");
    await page.goto("/");
    const target = "Ver la carta del mediodía";
    let found = false;
    for (let i = 0; i < 60 && !found; i++) {
      await page.keyboard.press("Tab");
      found = await page.evaluate(
        (label) => document.activeElement?.getAttribute("aria-label") === label,
        target,
      );
    }
    expect(found).toBe(true);
    const card = page.getByRole("link", { name: target });
    await expect(card).toBeFocused();
    const outline = await card.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/carta\?momento=mediodia$/);
    await expect(page.locator("h1")).toHaveText("Carta · Mediodía");
  });
});

test.describe("Momentos · selector de la carta", () => {
  test("cambia la URL sin recargar, marca el activo, y atrás / adelante funcionan", async ({
    page,
  }) => {
    await page.goto("/carta");
    const filter = momentFilter(page);
    await expect(filter.getByRole("link", { name: "Todo" })).toHaveAttribute("aria-current", "page");
    // Marca en window: si la página se recargara entera, desaparecería.
    await page.evaluate(() => ((window as unknown as { __sinRecarga: boolean }).__sinRecarga = true));

    await filter.getByRole("link", { name: "Mañana" }).click();
    await expect(page).toHaveURL(/\/carta\?momento=manana$/);
    await expect(filter.getByRole("link", { name: "Mañana" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expectSections(page, "manana");

    await filter.getByRole("link", { name: "Tarde / Noche" }).click();
    await expect(page).toHaveURL(/\/carta\?momento=tarde-noche$/);
    await expectSections(page, "tarde-noche");
    expect(
      await page.evaluate(() => (window as unknown as { __sinRecarga?: boolean }).__sinRecarga),
    ).toBe(true);

    await page.goBack();
    await expect(page).toHaveURL(/\/carta\?momento=manana$/);
    await expect(page.locator("h1")).toHaveText("Carta · Mañana");
    await expectSections(page, "manana");

    await page.goBack();
    await expect(page).toHaveURL(/\/carta$/);
    await expect(page.locator("h1")).toHaveText("Nuestra carta");
    await expect(sectionLinks(page)).toHaveCount(8);

    await page.goForward();
    await expect(page).toHaveURL(/\/carta\?momento=manana$/);
    await expectSections(page, "manana");

    await page.getByRole("link", { name: "Ver carta completa" }).click();
    await expect(page).toHaveURL(/\/carta$/);
    await expect(sectionLinks(page)).toHaveCount(8);
  });

  test("?momento=cualquiercosa muestra la carta completa, sin error", async ({ page }) => {
    const response = await page.goto("/carta?momento=cualquiercosa");
    expect(response?.ok()).toBe(true);
    await expect(page.locator("h1")).toHaveText("Nuestra carta");
    await expect(sectionLinks(page)).toHaveCount(8);
    await expect(momentFilter(page).getByRole("link", { name: "Todo" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("la canónica es /carta (y la de cada sección, sin el parámetro)", async ({ page }) => {
    await page.goto("/carta?momento=manana");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/carta$/);
    await page.goto("/carta/cafeteria?momento=manana");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/carta\/cafeteria$/,
    );
  });
});

test.describe("Momentos · navegación entre secciones", () => {
  test("el momento se mantiene con Anterior / Siguiente y Volver, y omite las que no corresponden", async ({
    page,
  }) => {
    await page.goto("/carta?momento=tarde-noche");
    await sectionLinks(page).filter({ hasText: "Pastelería" }).click();
    await expect(page).toHaveURL(/\/carta\/pasteleria\?momento=tarde-noche$/);
    await expect(page.getByRole("link", { name: /Quitar el filtro Tarde \/ Noche/ })).toBeVisible();

    const pager = page.getByRole("navigation", { name: "Otras secciones de la carta" });
    await expect(pager.getByRole("link", { name: /Anterior/ })).toHaveAttribute(
      "href",
      "/carta/cafeteria?momento=tarde-noche",
    );
    // Almuerzos no se sirve a la noche: Siguiente salta directo a Tapas.
    await pager.getByRole("link", { name: /Siguiente/ }).click();
    await expect(page).toHaveURL(/\/carta\/tapas-y-para-compartir\?momento=tarde-noche$/);
    await expect(page.locator("h1")).toHaveText("Tapas & para compartir");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);

    await page.getByRole("link", { name: "Volver" }).click();
    await expect(page).toHaveURL(/\/carta\?momento=tarde-noche$/);
    await expectSections(page, "tarde-noche");
  });

  test("una sección fuera del momento se ve completa, con un aviso y link a ese momento", async ({
    page,
  }) => {
    await page.goto("/carta/cocteleria?momento=manana");
    await expect(page.locator("h1")).toHaveText("Cocktails");
    const note = page.getByRole("note");
    await expect(note).toContainText("Cocktails no forma parte de la carta de la mañana");
    await expect(note.getByRole("link")).toHaveAttribute("href", "/carta?momento=manana");
    expect(await page.locator("#contenido article").count()).toBeGreaterThan(0);
  });
});

test.describe("Momentos · 390 px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("tarjetas con 'Ver carta' visible, selector usable y sin scroll horizontal", async ({
    page,
  }) => {
    await page.goto("/");
    const card = page.getByRole("link", { name: "Ver la carta de la tarde / noche" });
    await card.scrollIntoViewIfNeeded();
    await expect(card.getByText("Ver carta")).toBeVisible();
    await card.click();
    await expect(page).toHaveURL(/\/carta\?momento=tarde-noche$/);

    const noOverflow = () =>
      page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(await noOverflow()).toBe(true);

    await momentFilter(page).getByRole("link", { name: "Mediodía" }).click();
    await expect(page).toHaveURL(/\/carta\?momento=mediodia$/);
    await expectSections(page, "mediodia");
    expect(await noOverflow()).toBe(true);
  });
});
