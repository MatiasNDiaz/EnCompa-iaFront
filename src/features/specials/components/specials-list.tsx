import { BrandIcon } from "@/components/shared/brand-icon";
import { MOMENT_ICONS } from "@/features/menu/components/moment-filter";
import { SubsectionHeading } from "@/features/menu/components/subsection-heading";
import { MOMENTS } from "@/features/menu/moments";

import { scheduleLabel, type DailySpecial } from "../moments";
import { SpecialShowcase } from "./special-showcase";

/**
 * Filtro "Platos del día" de la carta: una sección por momento (como las subsecciones:
 * título a la izquierda, línea verde y el horario) y debajo el plato.
 *
 * Entrada (`data-reveal="wipe"`, ver globals.css): el contenedor arranca cubierto por un
 * paño oliva y otro espresso que se retiran hacia arriba, uno detrás del otro; la foto se
 * asienta y los textos entran escalonados. Cada plato se anima al llegar a la pantalla,
 * una sola vez. El contenido está en el HTML: los paños son decorativos (aria-hidden).
 */
export function SpecialsList({ specials }: { specials: DailySpecial[] }) {
  return (
    // Más ancho que la lista de secciones: el texto respira y el contenedor no crece tanto en alto.
    <div className="mx-auto flex max-w-[68rem] flex-col gap-12 md:gap-16">
      {specials.map((special, index) => {
        const moment = MOMENTS.find((m) => m.value === special.moment)!;
        const headingId = `plato-${moment.param}`;
        return (
          <section key={special.moment} aria-labelledby={headingId}>
            <SubsectionHeading
              id={headingId}
              name={`Plato ${moment.ofLabel}`}
              meta={scheduleLabel(special.moment)}
              description={null}
            />
            <div data-reveal="wipe" className="relative isolate overflow-hidden rounded-[2rem]">
              <SpecialShowcase
                special={special}
                priority={index === 0}
                className="min-h-[27rem] md:min-h-[30rem]"
              />
              <div aria-hidden className="wipe-layer" data-layer="back" />
              <div aria-hidden className="wipe-layer" data-layer="front">
                <BrandIcon name={MOMENT_ICONS[special.moment]} className="wipe-mark h-14 w-20" />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
