import { expect, test, type Page } from "@playwright/test";

import { login, remove, select, update } from "../support/db";
import { acquireLock } from "../support/lock";
import { e2eUsers } from "../support/users";

/**
 * Horarios (Etapa 4). Escriben site_settings.opening_hours (fila única) y
 * opening_exceptions, así que corren en los proyectos *-hours, uno después del otro
 * (ver playwright.config.ts). Guardan el horario previo y lo restauran al terminar; los
 * días especiales que crean llevan el prefijo del proyecto en la nota y se borran.
 */
test.describe.configure({ mode: "serial" });

const TZ = "America/Argentina/Cordoba";
const LABELS: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

/** Fecha del local (YYYY-MM-DD) dentro de `days` días. */
function barDate(days = 0) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
  const date = new Date(`${today}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
const weekdayOf = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long" })
    .format(new Date(`${iso}T12:00:00Z`))
    .toLowerCase();
const dayAndNumber = (iso: string) => {
  const text = new Intl.DateTimeFormat("es-AR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
  }).format(new Date(`${iso}T12:00:00Z`));
  return text.charAt(0).toUpperCase() + text.slice(1);
};

let page: Page;
let snapshot: unknown;
let prefix: string;
let releaseLock: (() => void) | undefined;

test.beforeAll(async ({ browser }, testInfo) => {
  prefix = `E2E ${testInfo.project.name}`;
  releaseLock = acquireLock("opening_hours");
  const [settings] = await select<{ opening_hours: unknown }>("site_settings", "select=opening_hours");
  snapshot = settings.opening_hours;
  await remove("opening_exceptions", `note=like.${encodeURIComponent("E2E")}*`);

  page = await browser.newPage(testInfo.project.use);
  const { admin } = e2eUsers();
  await login(page, admin.email, admin.password);
});

test.afterAll(async () => {
  if (!releaseLock) return; // otra corrida tiene el candado: no se toca nada
  if (snapshot !== undefined) {
    await update("site_settings", "singleton=is.true", { opening_hours: snapshot });
  }
  await remove("opening_exceptions", `note=like.${encodeURIComponent(prefix)}*`);
  await page?.close();
  releaseLock();
});

const day = (name: string) => page.getByRole("region", { name, exact: true });

test("horario semanal: cerrar un día, turno cortado con cierre de madrugada y verlo en Ubicación", async () => {
  // Punto de partida conocido: todos los días de 9 a 23.
  await update("site_settings", "singleton=is.true", {
    opening_hours: Object.keys(LABELS).map((d) => ({
      day: d,
      ranges: [{ open: "09:00", close: "23:00" }],
    })),
  });

  await page.goto("/admin/horarios");
  await expect(page.getByRole("heading", { level: 1, name: "Horarios" })).toBeVisible();

  // Lunes cerrado.
  await day("Lunes").getByRole("switch", { name: "Lunes: abierto" }).click();
  await expect(day("Lunes").getByText("Cerrado todo el día.")).toBeVisible();

  // Viernes: 9 a 15 y 19 a 1 (de la madrugada del sábado).
  const friday = day("Viernes");
  await friday.getByLabel("Cierra", { exact: true }).fill("15:00");
  await friday.getByRole("button", { name: /Agregar otro horario/ }).click();
  const second = friday.getByRole("group", { name: "Viernes, horario 2" });
  await second.getByLabel("Abre", { exact: true }).fill("19:00");
  await second.getByLabel("Cierra", { exact: true }).fill("01:00");

  // Sin marcar «Cierra al día siguiente»: no deja guardar y explica por qué.
  await page.getByRole("button", { name: "Guardar horario" }).click();
  await expect(second.getByText(/Termina antes de empezar/)).toBeVisible();

  await second.getByLabel(/Cierra al día siguiente/).check();
  await expect(second.getByText(/Termina antes de empezar/)).toHaveCount(0);
  await page.getByRole("button", { name: "Guardar horario" }).click();
  await expect(page.getByRole("region", { name: "Notifications" })).toContainText("Horario guardado");
  await expect(page.getByText("El horario está guardado.")).toBeVisible();

  const [settings] = await select<{ opening_hours: { day: string; ranges: unknown[] }[] }>(
    "site_settings",
    "select=opening_hours",
  );
  const stored = Object.fromEntries(settings.opening_hours.map((d) => [d.day, d.ranges]));
  expect(stored.monday).toEqual([]);
  expect(stored.friday).toEqual([
    { open: "09:00", close: "15:00" },
    { open: "19:00", close: "01:00" },
  ]);

  await page.goto("/contacto");
  const hours = page.getByRole("region", { name: "Horarios" });
  await expect(hours.locator("dt")).toHaveCount(7);
  const row = (label: string) =>
    hours.locator("dl > div").filter({ has: page.locator("dt", { hasText: label }) });
  await expect(row("Lunes").locator("dd")).toHaveText(/^Cerrado/);
  await expect(row("Viernes").locator("dd")).toHaveText(/^9:00 a 15:00 y 19:00 a 1:00/);
  // Hoy (hora de Córdoba) resaltado.
  await expect(hours.locator('[aria-current="date"] dt')).toContainText(LABELS[weekdayOf(barDate())]);
  // El footer muestra el horario de hoy.
  await expect(page.locator("footer").getByRole("link", { name: /^Hoy:/ })).toBeVisible();
});

test("día especial: cerrado con nota, se ve en Ubicación; se edita y se elimina", async () => {
  const tomorrow = barDate(1);
  const note = `${prefix} Cerrado por lluvia`;

  await page.goto("/admin/horarios");
  await page.getByRole("button", { name: "Agregar día especial" }).click();
  const dialog = page.getByRole("dialog", { name: "Nuevo día especial" });
  await dialog.getByLabel("Fecha").fill(tomorrow);
  await dialog.getByLabel(/^Cerrado/).check();
  await dialog.getByLabel("Nota para la web").fill(note);
  await dialog.getByRole("button", { name: "Agregar día especial" }).click();
  await expect(dialog).toBeHidden();

  const list = page.getByRole("list", { name: "Próximos días especiales" });
  const item = list.getByRole("listitem").filter({ hasText: note });
  await expect(item).toContainText("Mañana");
  await expect(item).toContainText("Cerrado");

  await page.goto("/contacto");
  const specials = page.getByRole("region", { name: "Días especiales" });
  await expect(specials).toContainText(`${dayAndNumber(tomorrow)}: cerrado`);
  await expect(specials).toContainText(note);

  // La misma fecha dos veces: avisa y no duplica.
  await page.goto("/admin/horarios");
  await page.getByRole("button", { name: "Agregar día especial" }).click();
  await dialog.getByLabel("Fecha").fill(tomorrow);
  await dialog.getByRole("button", { name: "Agregar día especial" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Ya hay un día especial");
  await dialog.getByRole("button", { name: "Cerrar" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Descartar" }).click();

  // Editar: pasa a horario distinto, de 10 a 14.
  await item.getByRole("button", { name: /^Editar/ }).click();
  const edit = page.getByRole("dialog", { name: "Editar día especial" });
  await edit.getByLabel(/^Horario distinto/).check();
  await edit.getByLabel("Abre", { exact: true }).fill("10:00");
  await edit.getByLabel("Cierra", { exact: true }).fill("14:00");
  await edit.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(edit).toBeHidden();
  await expect(item).toContainText("10:00 a 14:00");

  await page.goto("/contacto");
  await expect(specials).toContainText(`${dayAndNumber(tomorrow)}: 10:00 a 14:00`);

  // Eliminar (con confirmación): vuelve al horario de la semana.
  await page.goto("/admin/horarios");
  await item.getByRole("button", { name: /^Eliminar/ }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Eliminar" }).click();
  await expect(item).toHaveCount(0);
  const rows = await select("opening_exceptions", `select=id&note=eq.${encodeURIComponent(note)}`);
  expect(rows).toHaveLength(0);

  await page.goto("/contacto");
  await expect(page.getByText(note)).toHaveCount(0);
});

test("no deja cargar una fecha que ya pasó", async () => {
  await page.goto("/admin/horarios");
  await page.getByRole("button", { name: "Agregar día especial" }).click();
  const dialog = page.getByRole("dialog", { name: "Nuevo día especial" });
  await dialog.getByLabel("Fecha").fill(barDate(-2));
  await dialog.getByRole("button", { name: "Agregar día especial" }).click();
  await expect(dialog.getByText("Elegí hoy o una fecha que todavía no pasó.")).toBeVisible();
});
