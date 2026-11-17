import { Reveal } from "@/components/motion/reveal";
import { BrandIcon } from "@/components/shared/brand-icon";
import { LinkButton } from "@/components/shared/link-button";
import type { Training } from "@/features/trainings/queries";

/**
 * "Nuestro equipo": sin fotos reales del equipo todavía, se presenta a través de su
 * formación (concepto oficial del cliente). Solo datos publicados; nada inventado.
 */
export function HomeTeam({ trainings }: { trainings: Training[] }) {
  if (trainings.length === 0) return null;

  return (
    <section aria-labelledby="equipo" className="border-y border-border bg-card py-20 md:py-28">
      <div className="container-site grid gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <p className="eyebrow mb-4 text-olive">Nuestro equipo</p>
          <h2 id="equipo" className="text-h2">
            Detrás de cada experiencia, hay conocimiento
          </h2>
          <LinkButton href="/capacitaciones" variant="outline" arrow className="mt-8">
            Formación y experiencia
          </LinkButton>
        </Reveal>

        <ul className="flex flex-col divide-y divide-border md:col-span-6 md:col-start-7">
          {trainings.map((training, index) => (
            <Reveal
              as="li"
              key={training.id}
              delay={index * 120}
              className="flex items-start gap-5 py-6 first:pt-0"
            >
              <BrandIcon
                name={training.slug === "cocteleria" ? "copa" : "taza"}
                className="mt-1 h-12 w-12 shrink-0 text-terracotta"
              />
              <div>
                <h3 className="font-serif text-h3">{training.title}</h3>
                {(training.organization || training.certificate_name) && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {[training.organization, training.certificate_name].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
