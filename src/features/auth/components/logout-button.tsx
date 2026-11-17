import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

import { logoutAction } from "../actions";

/** Server Component: un form que invoca la Server Action (funciona sin JS). */
export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="outline">
        <LogOut aria-hidden />
        Cerrar sesión
      </Button>
    </form>
  );
}
