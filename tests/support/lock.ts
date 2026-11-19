import { mkdirSync, openSync, readFileSync, rmSync, writeSync, closeSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Candado entre procesos para los tests que guardan el estado de una tabla compartida
 * y lo restauran al terminar (plato del día, horarios). Si dos corridas se pisan, la
 * segunda guarda como "estado previo" los datos de prueba de la primera y los datos
 * reales se pierden. Con el candado, la segunda corrida falla sin tocar nada.
 * Un candado de un proceso que ya no existe (corrida cortada) se descarta.
 */
// Fuera de test-results/ (Playwright lo vacía al empezar cada corrida).
const DIR = join(tmpdir(), "encompania-e2e-locks");

function alive(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function acquireLock(name: string): () => void {
  mkdirSync(DIR, { recursive: true });
  const file = join(DIR, `${name}.lock`);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const fd = openSync(file, "wx");
      writeSync(fd, String(process.pid));
      closeSync(fd);
      return () => rmSync(file, { force: true });
    } catch {
      const owner = Number(readFileSync(file, "utf8"));
      if (owner && owner !== process.pid && alive(owner)) {
        throw new Error(
          `Otra corrida de tests está usando «${name}» (proceso ${owner}). ` +
            "Estos tests restauran datos reales al terminar: no se pueden correr en paralelo.",
        );
      }
      rmSync(file, { force: true }); // candado viejo
    }
  }
  throw new Error(`No se pudo tomar el candado «${name}».`);
}
