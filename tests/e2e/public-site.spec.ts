import { expect, test } from "@playwright/test";

// El sitio usa scroll-behavior: smooth. En los tests se desactiva (solo acá): si no, un clic
// sobre un elemento que Playwright tiene que traer a la vista puede caer mientras la página
// todavía se desplaza.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
});

const PAGES = [
  { path: "/", h1: /Donde los encuentros saben mejor/ },
  { path: "/carta", h1: "Nuestra carta" },
  { path: "/recorrido", h1: "Recorré el espacio" },
  { path: "/nosotros", h1: "Una historia que nació alrededor de una mesa" },
  { path: "/capacitaciones", h1: "Detrás de cada experiencia, hay conocimiento" },
  { path: "/galeria", h1: "Galería" },
  { path: "/contacto", h1: "La Cumbre, Córdoba" },
];

test.describe("Web pública · páginas", () => {
  for (const { path, h1 } of PAGES) {
    test(`${path} carga con un único h1 y lang es-AR`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.ok()).toBe(true);
      await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(h1);
    });
  }

  test("404 con la identidad del sitio", async ({ page }) => {
    const response = await page.goto("/no-existe");
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Esta página no está en la carta" }),
    ).toBeVisible();
  });

  test("robots excluye /admin y el sitemap lista las 7 páginas", async ({ request }) => {
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /admin");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const { path } of PAGES)
      expect(sitemap).toContain(`<loc>http://localhost:3000${path === "/" ? "" : path}`);
  });
});

const CATEGORIES = [
  { slug: "cafeteria", name: "Cafetería" },
  { slug: "sandwiches", name: "Sandwiches" },
  { slug: "desayunos-y-brunch", name: "Desayunos & Brunch" },
  { slug: "pasteleria", name: "Pastelería" },
  { slug: "almuerzos", name: "Almuerzos" },
  { slug: "tapas-y-para-compartir", name: "Tapas & para compartir" },
  { slug: "postres", name: "Postres" },
  { slug: "cocteleria", name: "Cocktails" },
];

test.describe("Web pública · carta", () => {
  test("las 8 secciones son banners con foto que enlazan a su detalle", async ({ page }) => {
    await page.goto("/carta");
    const links = page.getByRole("navigation", { name: "Secciones de la carta" }).getByRole("link");
    await expect(links).toHaveCount(8);
    for (const [i, { slug, name }] of CATEGORIES.entries()) {
      await expect(links.nth(i)).toHaveAttribute("href", `/carta/${slug}`);
      await expect(links.nth(i).getByRole("heading")).toHaveText(name);
      await expect(links.nth(i).locator("img")).toHaveCount(1);
    }
  });

  test("la cinta muestra las secciones reales con la taza, en movimiento", async ({ page }) => {
    await page.goto("/carta");
    const marquee = page.locator(".marquee");
    await expect(marquee).toHaveAttribute("aria-hidden", "true");
    for (const { name } of CATEGORIES)
      await expect(marquee).toContainText(name.toUpperCase(), { ignoreCase: true });
    await expect(marquee.locator("svg").first()).toBeVisible();
    // Se mueve de derecha a izquierda: la posición X de la pista disminuye con el tiempo.
    const track = marquee.locator(".marquee-track");
    const x1 = (await track.boundingBox())!.x;
    await page.waitForTimeout(700);
    const x2 = (await track.boundingBox())!.x;
    expect(x2).toBeLessThan(x1);
  });

  test("con prefers-reduced-motion la cinta queda quieta", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/carta");
    expect(
      await page.locator(".marquee-track").evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
    await context.close();
  });

  test("entre los 8 detalles están las 68 tarjetas del seed, todas completas (foto, texto, ingredientes y precio)", async ({
    page,
  }) => {
    test.setTimeout(120_000); // recorre 8 páginas (en dev, la primera compilación es lenta)
    let total = 0;
    let withPrice = 0;
    let withImage = 0;
    let withDescription = 0;
    let withIngredients = 0;
    for (const { slug, name } of CATEGORIES) {
      await page.goto(`/carta/${slug}`);
      await expect(page.locator("h1")).toHaveText(name);
      const cards = page.locator("#contenido article");
      total += await cards.count();
      withPrice += await cards.filter({ hasText: /\$\d/ }).count();
      withImage += await cards.filter({ has: page.locator("img") }).count();
      withDescription += await cards.filter({ has: page.locator("h3 + p") }).count();
      withIngredients += await cards.filter({ hasText: "Ingredientes" }).count();
      await expect(page.locator("#contenido")).not.toContainText("Disponible");
    }
    expect(total).toBe(68);
    // Seed de desarrollo: precios ficticios y borradores de texto en los 68 productos;
    // ninguna tarjeta queda sin foto ni información (pedido del desarrollador).
    expect(withPrice).toBe(68);
    expect(withImage).toBe(68);
    expect(withDescription).toBe(68);
    expect(withIngredients).toBe(68);
  });

  test("clic en una sección abre su detalle y 'Volver' (siempre visible) regresa", async ({
    page,
  }) => {
    await page.goto("/carta");
    await page.getByRole("link", { name: "Sandwiches" }).click();
    await expect(page).toHaveURL(/\/carta\/sandwiches$/);
    await expect(page.locator("#contenido article h3")).toHaveText(["Jamón y queso", "Pastrami"]);

    await page.goto("/carta/cafeteria");
    await page.mouse.wheel(0, 2500);
    const back = page.getByRole("link", { name: "Volver" });
    await expect(back).toBeInViewport();
    await back.click();
    await expect(page).toHaveURL(/\/carta$/);
  });

  test("'Siguiente' al pie lleva a la nueva sección desde arriba (banner a la vista)", async ({
    page,
  }) => {
    await page.goto("/carta/sandwiches");
    const next = page.getByRole("link", { name: /Siguiente/ });
    await next.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(300);

    await next.click();
    await expect(page).toHaveURL(/\/carta\/desayunos-y-brunch$/);
    await expect(page.locator("h1")).toHaveText("Desayunos & Brunch");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
    await expect(page.locator("h1")).toBeInViewport();
  });

  test("una sección inexistente da 404", async ({ page }) => {
    const response = await page.goto("/carta/no-existe");
    expect(response?.status()).toBe(404);
  });
});

test.describe("Web pública · navegación", () => {
  test("mobile: menú accesible (aria-expanded, Esc cierra, navega)", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Solo mobile");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Abrir menú" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const menu = page.getByRole("dialog", { name: "Menú" });
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();

    await toggle.click();
    await menu.getByRole("link", { name: "Nosotros" }).click();
    await expect(page).toHaveURL(/\/nosotros$/);
    await expect(menu).toBeHidden();
  });

  test("mobile: 'Ver carta' fijo siempre visible y lleva a /carta", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Solo mobile");
    await page.goto("/nosotros");
    const cta = page.locator("main ~ div").getByRole("link", { name: "Ver carta" });
    await expect(cta).toBeVisible();
    await page.mouse.wheel(0, 3000);
    await expect(cta).toBeInViewport();
    await cta.click();
    await expect(page).toHaveURL(/\/carta$/);
  });

  test("ir a la carta desde abajo de otra página la muestra desde arriba (cinta visible)", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 1600));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(800);

    // Desde abajo, el usuario usa lo que tiene a la vista: el botón fijo (mobile) o el header.
    const toMenu = isMobile
      ? page.locator("main ~ div").getByRole("link", { name: "Ver carta" })
      : page.getByRole("banner").getByRole("link", { name: "Nuestra carta" });
    await expect(toMenu).toBeInViewport();
    await toMenu.click();
    await expect(page).toHaveURL(/\/carta$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    // La cinta queda completa por debajo del header (no tapada).
    const header = (await page.getByRole("banner").boundingBox())!;
    const marquee = (await page.locator(".marquee").boundingBox())!;
    expect(marquee.y).toBeGreaterThanOrEqual(header.y + header.height - 1);
  });

  test("desktop: navegación principal y 'Nuestra carta' en el header", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Solo desktop");
    await page.goto("/");
    const nav = page.getByRole("banner").getByRole("navigation", { name: "Principal" });
    await nav.getByRole("link", { name: "El espacio" }).click();
    await expect(page).toHaveURL(/\/recorrido$/);
    await expect(nav.getByRole("link", { name: "El espacio" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await page.getByRole("banner").getByRole("link", { name: "Nuestra carta" }).click();
    await expect(page).toHaveURL(/\/carta$/);
  });
});

test.describe("Web pública · contenido y accesibilidad", () => {
  test("/contacto no muestra datos inventados", async ({ page }) => {
    await page.goto("/contacto");
    await expect(page.getByText("Muy pronto vas a encontrar acá la dirección.")).toBeVisible();
    await expect(page.getByText("Muy pronto vas a encontrar acá los horarios.")).toBeVisible();
    await expect(page.locator('a[href^="tel:"], a[href*="wa.me"], iframe')).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Instagram|Facebook|TikTok/ })).toHaveCount(0);
  });

  test("/capacitaciones no muestra campos vacíos (instructor ni certificado de coctelería)", async ({
    page,
  }) => {
    await page.goto("/capacitaciones");
    await expect(page.locator("dd", { hasText: "Doppio Project" })).toBeVisible();
    await expect(page.getByText("Instructor/a")).toHaveCount(0);
    await expect(page.locator("dt", { hasText: "Certificación" })).toHaveCount(1); // solo café
  });

  test("con JavaScript desactivado el contenido se ve", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/nosotros");
    const quote = page.getByText(/De nuestras raíces, nuestros viajes/);
    await quote.scrollIntoViewIfNeeded();
    await expect(quote).toBeVisible();
    expect(
      await quote.evaluate((el) => getComputedStyle(el.closest("[data-reveal]")!).opacity),
    ).toBe("1");
    await context.close();
  });

  test("con prefers-reduced-motion no hay animación de aparición", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/nosotros");
    const block = page.locator("[data-reveal]").last();
    // Sin scrollear: aun fuera de pantalla, ya es visible y sin transformaciones.
    expect(await block.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    expect(await block.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    await context.close();
  });
});

test.describe("Web pública · lightbox", () => {
  test("se maneja con teclado: abrir, flechas, contador y Esc", async ({ page }) => {
    await page.goto("/recorrido");
    // "El salón" tiene 2 imágenes por defecto (foto del local + render del proyecto).
    const trigger = page.getByRole("button", {
      name: "Ampliar: Salón con mesas de madera y sillones",
    });
    await trigger.focus();
    await page.keyboard.press("Enter");

    const viewer = page.getByRole("dialog", { name: "Salón con mesas de madera y sillones" });
    await expect(viewer).toBeVisible();
    await expect(viewer.getByText("1 / 2")).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByRole("dialog", { name: /Render del salón/ }).getByText("2 / 2"),
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused(); // el foco vuelve al disparador
  });
});
