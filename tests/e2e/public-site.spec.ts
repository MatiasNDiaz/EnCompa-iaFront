import { expect, test } from "@playwright/test";

import { select } from "../support/db";

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
  { slug: "tapeo-y-para-compartir", name: "Tapeo & para compartir" },
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

  test("entre los 8 detalles están todas las tarjetas visibles, con su foto, texto, ingredientes y precio", async ({
    page,
  }) => {
    test.setTimeout(120_000); // recorre 8 páginas (en dev, la primera compilación es lenta)
    // Lo esperado sale de la base LOCAL (no del seed fijo): el admin puede haber cargado
    // productos desde el panel. Productos disponibles de las 8 secciones visibles.
    type Row = {
      is_available: boolean;
      price: number | null;
      description: string | null;
      ingredients: string | null;
      image_path: string | null;
      categories: { is_active: boolean; parent: { is_active: boolean } | null };
    };
    const rows = await select<Row>(
      "products",
      "select=is_available,price,description,ingredients,image_path,categories!inner(is_active,parent:parent_id(is_active))",
    );
    const visible = rows.filter(
      (p) => p.is_available && p.categories.is_active && (p.categories.parent?.is_active ?? true),
    );
    const expected = {
      total: visible.length,
      price: visible.filter((p) => p.price !== null).length,
      description: visible.filter((p) => p.description).length,
      ingredients: visible.filter((p) => p.ingredients).length,
      ownPhoto: visible.filter((p) => p.image_path).length,
    };
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
    expect(total).toBe(expected.total);
    // Seed de desarrollo: precios ficticios y borradores de texto en todos los productos.
    // Cada dato que existe en la base se ve en su tarjeta.
    expect(withPrice).toBe(expected.price);
    expect(withDescription).toBe(expected.description);
    expect(withIngredients).toBe(expected.ingredients);
    // Foto propia o, en los del seed, la de respaldo: como mínimo, todas las propias.
    expect(withImage).toBeGreaterThanOrEqual(expected.ownPhoto);
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

test.describe("Web pública · seguridad", () => {
  test("encabezados de seguridad en la web y en el login del panel", async ({ request }) => {
    for (const path of ["/", "/admin/login"]) {
      const res = await request.get(path);
      const headers = res.headers();
      expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
      expect(headers["content-security-policy"]).toContain("object-src 'none'");
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["strict-transport-security"]).toContain("max-age=");
      expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(headers["x-powered-by"]).toBeUndefined();
    }
  });

  test("la CSP no bloquea nada en las páginas principales", async ({ page }) => {
    const blocked: string[] = [];
    page.on("console", (message) => {
      if (/Content Security Policy|Refused to/i.test(message.text())) blocked.push(message.text());
    });
    for (const path of ["/", "/carta", "/carta/cafeteria", "/galeria", "/novedades", "/contacto"]) {
      await page.goto(path, { waitUntil: "networkidle" });
    }
    // El mapa de Google (iframe permitido por frame-src), si está cargado.
    const showMap = page.getByRole("button", { name: /Ver mapa/ });
    if (await showMap.count()) {
      await showMap.click();
      await expect(page.locator("iframe")).toHaveCount(1);
    }
    expect(blocked).toEqual([]);
  });
});

test.describe("Web pública · volver arriba", () => {
  test("aparece al bajar, lleva al principio y no tapa 'Ver carta' en mobile", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/nosotros");
    // Oculto queda fuera del árbol accesible (aria-hidden): se busca por su etiqueta.
    const button = page.locator('button[aria-label="Volver arriba"]');
    // Arriba de todo está oculto (ni visible ni enfocable).
    await expect(button).toHaveCSS("opacity", "0");
    await expect(button).toHaveAttribute("tabindex", "-1");

    await page.evaluate(() => window.scrollTo({ top: 1600, behavior: "instant" }));
    await expect(button).toHaveCSS("opacity", "1");
    await expect(button).toHaveAttribute("tabindex", "0");
    await expect(page.getByRole("button", { name: "Volver arriba" })).toBeVisible();

    const box = (await button.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(Math.round(box.width)).toBe(Math.round(box.height)); // círculo
    expect(box.x + box.width).toBeGreaterThan(viewport.width - 48); // abajo a la derecha
    expect(box.y + box.height).toBeGreaterThan(viewport.height - 64);

    if (isMobile) {
      const cta = (await page.getByRole("link", { name: "Ver carta" }).last().boundingBox())!;
      expect(box.x).toBeGreaterThan(cta.x + cta.width); // no se superponen
    }

    await button.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
    await expect(button).toHaveCSS("opacity", "0");
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
    await expect(nav.getByRole("link", { name: "El espacio" })).toHaveCount(0);
    await nav.getByRole("link", { name: "Galería" }).click();
    await expect(page).toHaveURL(/\/galeria$/);
    await expect(nav.getByRole("link", { name: "Galería" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await page.getByRole("banner").getByRole("link", { name: "Nuestra carta" }).click();
    await expect(page).toHaveURL(/\/carta$/);
  });
});

test.describe("Web pública · contenido y accesibilidad", () => {
  test("/contacto y el footer muestran solo los datos cargados en site_settings", async ({
    page,
  }) => {
    type Settings = {
      address: string | null;
      whatsapp: string | null;
      email: string | null;
      instagram_url: string | null;
      facebook_url: string | null;
      tiktok_url: string | null;
      opening_hours: unknown;
      google_maps_embed_url: string | null;
    };
    const [settings] = await select<Settings>("site_settings", "select=*");

    await page.goto("/contacto");
    const main = page.locator("#contenido");
    if (settings.address) await expect(main.locator("address")).toHaveText(settings.address);
    else await expect(page.getByText("Muy pronto vas a encontrar acá la dirección.")).toBeVisible();
    // Horarios: la tabla de la semana (7 días, hoy resaltado) si están cargados.
    const hours = main.getByRole("region", { name: "Horarios" });
    if (settings.opening_hours) {
      await expect(hours.locator("dt")).toHaveCount(7);
      await expect(hours.locator('[aria-current="date"]')).toHaveCount(1);
    } else {
      await expect(hours).toHaveCount(0);
    }
    // El mapa de Google se carga recién al tocarlo (no en cada visita).
    await expect(page.locator("iframe")).toHaveCount(0);
    if (settings.google_maps_embed_url) {
      await main.getByRole("button", { name: /Ver mapa/ }).click();
      await expect(main.locator("iframe")).toHaveAttribute("src", settings.google_maps_embed_url);
    }

    const footer = page.locator("footer");
    const networks = [
      ["Instagram", settings.instagram_url],
      ["Facebook", settings.facebook_url],
      ["TikTok", settings.tiktok_url],
    ] as const;
    for (const [name, url] of networks) {
      const link = footer.getByRole("link", { name: new RegExp(`^${name} de En Compañía`) });
      if (url) {
        await expect(link).toHaveAttribute("href", url);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link.locator("svg")).toHaveCount(1); // ícono de la marca
      } else {
        await expect(link).toHaveCount(0);
      }
    }
    await expect(footer.locator('a[href*="wa.me"]')).toHaveCount(settings.whatsapp ? 1 : 0);
    await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(settings.email ? 1 : 0);
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

test.describe("Web pública · galería", () => {
  test("una sola galería: /recorrido (El espacio) redirige a /galeria y el filtro Espacio reúne sus fotos", async ({
    page,
  }) => {
    await page.goto("/recorrido");
    await expect(page).toHaveURL(/\/galeria$/);
    await expect(page.locator("h1")).toHaveText("Galería");

    const filters = page.getByRole("group", { name: "Filtrar por categoría" });
    const all = page.getByRole("list", { name: "Galería" }).getByRole("listitem");
    const total = await all.count();
    await filters.getByRole("button", { name: "Espacio" }).click();
    await expect(filters.getByRole("button", { name: "Espacio" })).toHaveAttribute("aria-pressed", "true");
    const espacio = await all.count();
    expect(espacio).toBeGreaterThan(0);
    expect(espacio).toBeLessThanOrEqual(total);
  });

  test("el visor se maneja con teclado: abrir, flechas, contador y Esc", async ({ page }) => {
    await page.goto("/galeria");
    const trigger = page.getByRole("button", { name: /^Ampliar:/ }).first();
    await trigger.focus();
    await page.keyboard.press("Enter");

    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await expect(viewer.getByText(/^1 \/ \d+$/)).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("dialog").getByText(/^2 \/ \d+$/)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused(); // el foco vuelve al disparador
  });
});
