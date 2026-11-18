import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SpecialDays } from "@/features/admin/hours/components/special-days";
import { WeeklyHoursForm } from "@/features/admin/hours/components/weekly-hours-form";
import { getAdminHours } from "@/features/admin/hours/queries";
import { weekFromStored } from "@/features/admin/hours/schemas";
import { barToday } from "@/lib/time";

export const metadata: Metadata = { title: "Horarios" };

export default async function AdminHoursPage() {
  const { hours, exceptions } = await getAdminHours();
  const today = barToday();

  return (
    <>
      <AdminPageHeader
        eyebrow="Horarios"
        title="Horarios"
        description="El horario de cada día de la semana y los días especiales (un feriado, un evento, la lluvia). Se ven en Ubicación y en el pie de la web, con la hora de Córdoba."
      />

      <section aria-labelledby="horario-semana">
        <h2 id="horario-semana" className="font-serif text-[2rem] leading-tight">
          Horario de la semana
        </h2>
        <p className="mt-1 mb-6 max-w-xl text-[0.95rem] text-muted-foreground">
          Hasta dos horarios por día, por ejemplo de 9:00 a 15:00 y de 19:00 a 1:00. Si cierra
          después de medianoche, marcá «Cierra al día siguiente».
        </p>
        <WeeklyHoursForm initial={weekFromStored(hours)} />
      </section>

      <section aria-labelledby="dias-especiales" className="mt-16">
        <h2 id="dias-especiales" className="font-serif text-[2rem] leading-tight">
          Días especiales
        </h2>
        <p className="mt-1 mb-6 max-w-xl text-[0.95rem] text-muted-foreground">
          Un día cerrado o con otro horario. Ese día reemplaza al horario de la semana, y la nota
          se ve en la web.
        </p>
        <SpecialDays exceptions={exceptions} today={today} />
      </section>
    </>
  );
}
