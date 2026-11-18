"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ImageField } from "@/components/admin/image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetBody, SheetFooter } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import { prepareImage, type ImageFieldValue } from "@/features/admin/media/upload";
import { priceToInput } from "@/lib/format";

import { saveProduct } from "../actions";
import { productSchema, type ProductInput } from "../schemas";
import { sectionOptions } from "../tree";
import type { AdminProduct, AdminSection } from "../types";
import { describedBy, FormField, SwitchRow } from "./form-field";

type Values = {
  categoryId: string;
  name: string;
  description: string;
  ingredients: string;
  price: string;
  isFeatured: boolean;
  isAvailable: boolean;
};

/**
 * Crear o editar un producto. Se usa en el panel y (Etapa 3) desde la carta pública.
 * La foto se sube al guardar; si guardar falla, el servidor borra la foto nueva.
 */
export function ProductForm({
  product,
  defaultCategoryId,
  sections,
  onDirtyChange,
  registerDirtyCheck,
  onDone,
  onCancel,
}: {
  product?: AdminProduct;
  defaultCategoryId?: string;
  sections: AdminSection[];
  onDirtyChange: (dirty: boolean) => void;
  registerDirtyCheck: (check: () => boolean) => void;
  onDone: () => void;
  onCancel: () => void;
}) {
  const ids = {
    name: useId(),
    category: useId(),
    description: useId(),
    ingredients: useId(),
    price: useId(),
  };
  const [image, setImage] = useState<ImageFieldValue>({ kind: "keep" });
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState,
  } = useForm<Values, unknown, ProductInput>({
    // El schema transforma (precio → número): se valida con él, pero al servidor se
    // envían los valores tal cual (el servidor vuelve a validar y transformar).
    resolver: zodResolver(productSchema) as never,
    defaultValues: {
      categoryId: product?.categoryId ?? defaultCategoryId ?? "",
      name: product?.name ?? "",
      description: product?.description ?? "",
      ingredients: product?.ingredients ?? "",
      price: priceToInput(product?.price ?? null),
      isFeatured: product?.isFeatured ?? false,
      isAvailable: product?.isAvailable ?? true,
    },
  });

  const { errors, isSubmitting, isDirty } = formState;
  const dirty = isDirty || image.kind !== "keep";
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  // formState es un proxy de react-hook-form: leído al cerrar, da el valor de ese instante.
  useEffect(
    () => registerDirtyCheck(() => formState.isDirty || image.kind !== "keep"),
    [registerDirtyCheck, formState, image],
  );

  const onSubmit = handleSubmit(async () => {
    setServerError(null);
    const values = getValues();
    const uploaded = await prepareImage(image, "products");
    if (!uploaded.ok) {
      setServerError(uploaded.error);
      return;
    }
    const result = await saveProduct(product?.id ?? null, values, uploaded.change);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    onDirtyChange(false);
    toast.success(
      product ? "Producto guardado" : "Producto creado",
      values.isAvailable ? "Ya se ve en la web." : "Está oculto: no aparece en la web.",
    );
    onDone();
  });

  const options = sectionOptions(sections);
  const hasOwnPhoto = Boolean(product?.imagePath);

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <SheetBody className="flex flex-col gap-6">
        <ImageField
          label="Foto del producto"
          hint="Una foto horizontal se ve mejor (la tarjeta es 4:3)."
          currentUrl={product?.thumbUrl ?? null}
          currentNote={
            product && !hasOwnPhoto && product.thumbUrl
              ? product.thumbIsIllustrative
                ? "Imagen ilustrativa (todavía sin foto propia)"
                : "Foto por defecto"
              : null
          }
          removable={hasOwnPhoto}
          value={image}
          onChange={setImage}
        />

        <FormField id={ids.name} label="Nombre" error={errors.name?.message}>
          <Input
            id={ids.name}
            autoComplete="off"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy(ids.name, errors.name?.message)}
            className="h-12 text-base"
            {...register("name")}
          />
        </FormField>

        <FormField id={ids.category} label="Sección" error={errors.categoryId?.message}>
          <select
            id={ids.category}
            aria-invalid={Boolean(errors.categoryId)}
            className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register("categoryId")}
          >
            <option value="" disabled>
              Elegí una sección
            </option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.depth === 1 ? option.path : option.label}
                {option.isActive ? "" : " (oculta)"}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id={ids.price}
          label="Precio"
          hint="Solo números, por ejemplo 8500. Dejalo vacío si todavía no tiene precio."
          error={errors.price?.message}
        >
          <div className="relative">
            <span aria-hidden className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground">
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
          id={ids.description}
          label="Descripción"
          hint="Una o dos frases que lo presenten."
          error={errors.description?.message}
        >
          <Textarea
            id={ids.description}
            rows={3}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={describedBy(ids.description, errors.description?.message, true)}
            {...register("description")}
          />
        </FormField>

        <FormField
          id={ids.ingredients}
          label="Ingredientes"
          hint="Separalos con comas. Es opcional."
          error={errors.ingredients?.message}
        >
          <Textarea
            id={ids.ingredients}
            rows={2}
            aria-invalid={Boolean(errors.ingredients)}
            aria-describedby={describedBy(ids.ingredients, errors.ingredients?.message, true)}
            {...register("ingredients")}
          />
        </FormField>

        <div className="flex flex-col gap-3">
          <SwitchRow
            title="De la casa"
            description="Lo destaca con la etiqueta «De la casa»."
            control={
              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="De la casa" />
                )}
              />
            }
          />
          <SwitchRow
            title="Visible en la carta"
            description="Si lo apagás no aparece en la web (por ejemplo, un producto de temporada)."
            control={
              <Controller
                control={control}
                name="isAvailable"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Visible en la carta"
                  />
                )}
              />
            }
          />
        </div>

        {serverError && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {serverError}
          </p>
        )}
      </SheetBody>

      <SheetFooter>
        <Button type="button" variant="outline" className="h-12 px-6 text-base" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="h-12 px-6 text-base" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
        </Button>
      </SheetFooter>
    </form>
  );
}
