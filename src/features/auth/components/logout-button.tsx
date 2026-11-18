import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { logoutAction } from "../actions";

/**
 * Server Component: un form que invoca la Server Action (funciona sin JS).
 * `sidebar`: texto crema sobre la sidebar espresso del panel.
 */
export function LogoutButton({
  variant = "outline",
  className,
}: {
  variant?: "outline" | "sidebar";
  className?: string;
}) {
  return (
    <form action={logoutAction}>
      <Button
        type="submit"
        variant={variant === "sidebar" ? "ghost" : "outline"}
        className={cn(
          "min-h-11 gap-3 px-4",
          variant === "sidebar" &&
            "w-full justify-start rounded-xl text-[0.95rem] font-normal text-cream/75 hover:bg-cream/5 hover:text-cream [&_svg]:size-5",
          className,
        )}
      >
        <LogOut aria-hidden strokeWidth={1.6} />
        Cerrar sesión
      </Button>
    </form>
  );
}
