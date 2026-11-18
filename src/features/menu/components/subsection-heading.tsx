import { Reveal } from "@/components/motion/reveal";

/**
 * Encabezado de una subsección dentro de su sección (p. ej. «Tartas» dentro de
 * «Pastelería»): título, línea, un dato a la derecha y una frase opcional.
 * Las subsecciones NO tienen banner ni foto. Es el mismo componente en la carta pública,
 * en la vista previa del panel y en el filtro "Platos del día".
 */
export function SubsectionHeading({
  id,
  name,
  description,
  count,
  meta,
  reveal = true,
}: {
  id?: string;
  name: string;
  description: string | null;
  /** Cantidad de productos (a la derecha). */
  count?: number;
  /** Texto a la derecha en lugar de la cantidad (p. ej. el horario). */
  meta?: string;
  /** false en la vista previa del panel (sin animación de entrada). */
  reveal?: boolean;
}) {
  const aside = meta ?? (count !== undefined ? String(count) : null);
  const row = (
    <>
      <h2 id={id} className="text-h3 text-olive">
        {name}
      </h2>
      <span aria-hidden className="h-px flex-1 bg-olive/25" />
      {aside && <span className="text-sm text-muted-foreground tabular-nums">{aside}</span>}
    </>
  );

  return (
    <>
      {reveal ? (
        <Reveal className="mb-5 flex items-center gap-4">{row}</Reveal>
      ) : (
        <div className="mb-5 flex items-center gap-4">{row}</div>
      )}
      {description && <p className="mb-4 text-sm text-muted-foreground">{description}</p>}
    </>
  );
}
