import { rmSync } from "node:fs";

import { loadTestEnv } from "./env";
import { deleteUser, e2eUsers } from "./users";

export default async function globalTeardown() {
  loadTestEnv();
  const { admin, user } = e2eUsers();
  await deleteUser(admin.email);
  await deleteUser(user.email);

  // Los tests del panel limpian sus datos directo en la base (sin pasar por las Server
  // Actions), así que la caché de fetch del build quedaría con secciones de prueba.
  // Se descarta: el próximo `next start` vuelve a leer la carta real.
  rmSync(".next/cache/fetch-cache", { recursive: true, force: true });
}
