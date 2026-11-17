import { loadTestEnv } from "./env";
import { createUser, e2eUsers } from "./users";

export default async function globalSetup() {
  loadTestEnv();
  const { admin, user } = e2eUsers();
  await createUser(admin.email, admin.password, "admin");
  await createUser(user.email, user.password, null); // autenticado SIN rol admin
}
