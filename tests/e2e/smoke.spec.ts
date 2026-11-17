import { expect, test } from "@playwright/test";

test.describe("Smoke", () => {
  test("la página de inicio responde y declara el idioma español", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.ok()).toBe(true);
    await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
    await expect(page).toHaveTitle(/En Compañía/);
  });
});
