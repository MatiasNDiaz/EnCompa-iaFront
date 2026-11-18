"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, PencilLine } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";
import { useForm, useWatch, type Control } from "react-hook-form";

import { ImageField } from "@/components/admin/image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetBody, SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import { describedBy, FormField } from "@/features/admin/menu/components/form-field";
import { prepareImage, type ImageFieldValue } from "@/features/admin/media/upload";
import { SpecialShowcase } from "@/features/specials/components/special-showcase";
import { momentLabel, type DailySpecial } from "@/features/specials/moments";
import { parsePrice, priceToInput } from "@/lib/format";
import { cn } from "@/lib/utils";

import { saveSpecial } from "../actions";
import {
  MAX_INGREDIENTS_LENGTH,
  PUBLISH_NEEDS,
  specialSchema,
  type SpecialInput,
} from "../schemas";
import type { AdminSpecial } from "../types";

type Values = {
  title: string;
  subtitle: string;
  body: string;
  price: string;
  ingredients: string;
};

/**
 * Formulario de un espacio del plato del día: foto, título, subtítulo, texto y,
 * opcionales, precio e ingredientes (texto libre). "Vista previa" muestra el plato
 * con el MISMO componente que la web pública.
 */
export function SpecialForm({
  special,
  onDirtyChange,
  registerDirtyCheck,
  onDone,
  onCancel,
}: {
  special: AdminSpecial;
  onDirtyChange: (dirty: boolean) => void;
  registerDirtyCheck: (check: () => boolean) => void;
  onDone: () => void;
  onCancel: () => void;
}) {
  const ids = {
    title: useId(),
    subtitle: useId(),
    body: useId(),
    price: useId(),
    ingredients: useId(),
  };
  const [image, setImage] = useState<ImageFieldValue>({ kind: "keep" });
  const [serverError, setServerError] = useState<string | null>(null);
  const [view, setView] = useState<"form" | "preview">("form");
  const [pending, setPending] = useState<"publish" | "draft" | null>(null);

  const { register, control, handleSubmit, getValues, formState } = useForm<
    Values,
    unknown,
    SpecialInput
  >({
    resolver: zodResolver(specialSchema) as never,
    defaultValues: {
      title: special.title ?? "",
      subtitle: special.subtitle ?? "",
      body: special.body ?? "",
      price: priceToInput(special.price),
      ingredients: special.ingredients ?? "",
    },
  });

  const { errors, isDirty } = formState;
  const dirty = isDirty || image.kind !== "keep";
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(
    () => registerDirtyCheck(() => formState.isDirty || image.kind !== "keep"),
    [registerDirtyCheck, formState, image],
  );

  const submit = (publish: boolean) =>
    handleSubmit(
      async () => {
        setServerError(null);
        const values = getValues();
        const hasImage =
          image.kind === "new" || (image.kind === "keep" && Boolean(special.imagePath));
        if (publish && (!hasImage || values.title.trim() === "")) {
          setView("form");
          setServerError(PUBLISH_NEEDS);
          return;
        }

        setPending(publish ? "publish" : "draft");
        try {
          const uploaded = await prepareImage(image, "specials");
          if (!uploaded.ok) {
            setServerError(uploaded.error);
            return;
          }
          const result = await saveSpecial(special.moment, values, uploaded.change, publish);
          if (!result.ok) {
            setView("form");
            setServerError(result.error);
            return;
          }
        } finally {
          setPending(null);
        }

        onDirtyChange(false);
        const label = momentLabel(special.moment).toLowerCase();
        if (publish) {
          toast.success(
            special.isPublished ? "Plato guardado" : "Plato publicado",
            `Ya se ve en la web (${label}).`,
          );
        } else {
          toast.success(
            special.isPublished ? "Plato quitado de la web" : "Plato guardado",
            "No se ve en la web hasta que lo publiques.",
          );
        }
        onDone();
      },
      () => setView("form"),
    )();

  const busy = pending !== null;

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <SheetBody className="flex flex-col gap-6">
        <div
          role="group"
          aria-label="Modo"
          className="flex gap-1 self-start rounded-full border border-caramel/40 bg-card p-1"
        >
          <ViewButton
            active={view === "form"}
            onClick={() => setView("form")}
            icon={<PencilLine aria-hidden />}
          >
            Datos
          </ViewButton>
          <ViewButton
            active={view === "preview"}
            onClick={() => setView("preview")}
            icon={<Eye aria-hidden />}
          >
            Vista previa
          </ViewButton>
        </div>

        {view === "preview" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Así se ve en la web (en un celular).</p>
            <LivePreview control={control} special={special} image={image} />
          </div>
        )}

        {/* Los campos quedan montados (ocultos) en la vista previa: no se pierde la foto elegida. */}
        <div hidden={view !== "form"} className="flex flex-col gap-6">
          <ImageField
            label="Foto del plato"
            hint="Obligatoria para publicar. Una foto horizontal o cuadrada se ve mejor."
            currentUrl={special.imageUrl}
            value={image}
            onChange={setImage}
          />

          <FormField
            id={ids.title}
            label="Título"
            hint="Obligatorio para publicar."
            error={errors.title?.message}
          >
            <Input
              id={ids.title}
              autoComplete="off"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={describedBy(ids.title, errors.title?.message, true)}
              className="h-12 text-base"
              {...register("title")}
            />
          </FormField>

          <FormField
            id={ids.subtitle}
            label="Subtítulo"
            hint="Una línea que lo presente. Es opcional."
            error={errors.subtitle?.message}
          >
            <Input
              id={ids.subtitle}
              autoComplete="off"
              aria-invalid={Boolean(errors.subtitle)}
              aria-describedby={describedBy(ids.subtitle, errors.subtitle?.message, true)}
              className="h-12 text-base"
              {...register("subtitle")}
            />
          </FormField>

          <FormField
            id={ids.body}
            label="Texto"
            hint="Contá cómo es el plato. Es opcional."
            error={errors.body?.message}
          >
            <Textarea
              id={ids.body}
              rows={4}
              aria-invalid={Boolean(errors.body)}
              aria-describedby={describedBy(ids.body, errors.body?.message, true)}
              {...register("body")}
            />
          </FormField>

          <FormField
            id={ids.price}
            label="Precio"
            hint="Opcional. Solo números, por ejemplo 12500."
            error={errors.price?.message}
          >
            <div className="relative">
              <span
                aria-hidden
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
              >
                $
              </span>
              <Input
                id={ids.price}
                inputMode="decimal"
                autoComplete="off"
                aria-invalid={Boolean(errors.price)}
                aria-describedby={describedBy(ids.price, errors.price?.message, true)}
                className="h-12 pl-8 text-base tabular-nums"
                {...register("price")}
              />
            </div>
          </FormField>

          <FormField
            id={ids.ingredients}
            label="Ingredientes"
            hint={`Opcional. Escribilos como quieras, por ejemplo separados por comas (hasta ${MAX_INGREDIENTS_LENGTH} caracteres).`}
            error={errors.ingredients?.message}
          >
            <Textarea
              id={ids.ingredients}
              rows={3}
              maxLength={MAX_INGREDIENTS_LENGTH}
              placeholder="Pan de masa madre, palta, huevo, tomates cherry…"
              aria-invalid={Boolean(errors.ingredients)}
              aria-describedby={describedBy(ids.ingredients, errors.ingredients?.message, true)}
              {...register("ingredients")}
            />
          </FormField>
        </div>

        {serverError && (
          <p
            role="alert"
            className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {serverError}
          </p>
        )}
      </SheetBody>

      {/* Mobile: las dos acciones lado a lado (cerrar ya está en la X y deslizando). */}
      <SheetFooter>
        <Button
          type="button"
          variant="ghost"
          className="hidden h-12 px-5 text-base sm:inline-flex"
          onClick={onCancel}
          disabled={busy}
        >
          Cancelar
        </Button>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Button
            type="button"
            variant="outline"
            className="h-12 px-3 text-[0.95rem] sm:px-5 sm:text-base"
            disabled={busy}
            onClick={() => void submit(false)}
          >
            {pending === "draft"
              ? "Guardando…"
              : special.isPublished
                ? "Quitar de la web"
                : "Guardar sin publicar"}
          </Button>
          <Button
            type="button"
            className="h-12 px-3 text-[0.95rem] sm:px-6 sm:text-base"
            disabled={busy}
            onClick={() => void submit(true)}
          >
            {pending === "publish"
              ? "Publicando…"
              : special.isPublished
                ? "Guardar cambios"
                : "Publicar"}
          </Button>
        </div>
      </SheetFooter>
    </form>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors [&_svg]:size-4",
        active ? "bg-espresso text-cream" : "text-foreground hover:text-olive",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/** Vista previa en vivo con los valores del formulario (sin guardar). */
function LivePreview({
  control,
  special,
  image,
}: {
  control: Control<Values, unknown, SpecialInput>;
  special: AdminSpecial;
  image: ImageFieldValue;
}) {
  const values = useWatch({ control });
  const price = parsePrice(values.price ?? "");
  const preview: DailySpecial = {
    moment: special.moment,
    title: values.title?.trim() || "Título del plato",
    subtitle: values.subtitle?.trim() || null,
    body: values.body?.trim() || null,
    price: price !== null && Number.isFinite(price) ? price : null,
    ingredients: values.ingredients?.trim() || null,
    imageUrl:
      image.kind === "new" ? image.preview : image.kind === "remove" ? null : special.imageUrl,
  };
  return <SpecialShowcase special={preview} preview className="min-h-[38rem]" />;
}
