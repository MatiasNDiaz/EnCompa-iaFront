import { MapPin } from "lucide-react";
import Image from "next/image";

import { LOCAL_RENDERS, RENDER_CAPTION } from "@/assets/local";
import { Reveal } from "@/components/motion/reveal";
import { LinkButton } from "@/components/shared/link-button";
import { IllustrativeTag } from "@/components/shared/media-image";
import { SITE } from "@/config/site";
import type { SiteSettings } from "@/features/settings/queries";

/** Ubicación: dirección y "Cómo llegar" solo si están cargados; si no, estado "Muy pronto". */
export function HomeLocation({ settings }: { settings: SiteSettings | null }) {
  const directions = settings?.google_maps_directions_url;

  return (
    <section aria-labelledby="ubicacion" className="pb-20 md:pb-32">
      <div className="container-site">
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-secondary md:grid-cols-12">
          <Reveal className="px-6 pt-10 md:col-span-6 md:py-16 md:pl-14">
            <p className="eyebrow mb-4 text-olive">Ubicación</p>
            <h2 id="ubicacion" className="text-h2">
              {SITE.locality}
            </h2>
            <p className="mt-5 flex items-start gap-2 text-lead text-muted-foreground">
              <MapPin className="mt-1.5 size-5 shrink-0 text-olive" aria-hidden />
              {settings?.address ?? "Muy pronto vas a encontrar acá la dirección y los horarios."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {directions ? (
                <LinkButton href={directions} target="_blank" rel="noopener noreferrer" arrow>
                  Cómo llegar
                </LinkButton>
              ) : (
                <LinkButton href="/contacto" variant="outline" arrow>
                  Ubicación y contacto
                </LinkButton>
              )}
            </div>
          </Reveal>

          {/* Fachada con terraza (render del proyecto, rotulado). */}
          <Reveal
            variant="clip"
            className="relative mx-4 mb-4 aspect-[16/10] overflow-hidden rounded-2xl md:col-span-6 md:mx-0 md:my-4 md:mr-4"
          >
            <Image
              src={LOCAL_RENDERS.renderFachadaTerraza}
              alt="Render de la fachada de En Compañía con la terraza"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              placeholder="blur"
              className="object-cover"
            />
            <IllustrativeTag label={RENDER_CAPTION} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
