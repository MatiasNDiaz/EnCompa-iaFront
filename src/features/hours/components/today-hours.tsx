"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { barToday } from "@/lib/time";

import { hoursFor } from "../format";
import type { OpeningException, OpeningHours } from "../schemas";

const noop = () => () => {};

/**
 * "Hoy: 9:00 a 23:00" (o la nota del día especial) en el footer. El "hoy" se calcula en
 * el navegador con la hora del local: el footer está en páginas estáticas y no puede
 * quedar con el día en que se generaron. En el servidor (y sin JavaScript) muestra
 * "Ver horarios", con el mismo alto: no mueve nada al cambiar.
 */
export function TodayHours({
  hours,
  exceptions,
}: {
  hours: OpeningHours | null;
  exceptions: OpeningException[];
}) {
  const today = useSyncExternalStore(noop, () => barToday(), () => null);
  const info = today ? hoursFor(today, hours, exceptions) : null;

  return (
    <Link href="/contacto#horarios" className="underline-offset-4 hover:underline">
      {info ? (
        <>
          <span className="font-semibold">Hoy:</span> {info.value.toLowerCase()}
          {info.note && <span className="block text-cream/85 italic">{info.note}</span>}
        </>
      ) : (
        "Ver horarios"
      )}
    </Link>
  );
}
