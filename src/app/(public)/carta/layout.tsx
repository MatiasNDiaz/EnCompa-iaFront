import { MenuMarquee } from "@/features/menu/components/menu-marquee";
import { getMenu } from "@/features/menu/queries";

/** Toda la carta (/carta y /carta/[categoria]) comparte la cinta con las secciones reales. */
export default async function MenuLayout({ children }: LayoutProps<"/carta">) {
  const menu = await getMenu();

  return (
    <>
      <MenuMarquee items={menu.map((category) => category.name)} />
      {children}
    </>
  );
}
