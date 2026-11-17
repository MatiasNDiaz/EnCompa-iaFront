import { loadTestEnv } from "./env";
import { deleteUser, e2eUsers } from "./users";

export default async function globalTeardown() {
  loadTestEnv();
  const { admin, user } = e2eUsers();
  await deleteUser(admin.email);
  await deleteUser(user.email);
}
