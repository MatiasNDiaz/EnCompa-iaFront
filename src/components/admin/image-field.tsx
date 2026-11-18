"use client";

import { ImagePlus, RotateCcw, Trash2, Upload } from "lucide-react";
import { useEffect, useId, useRef, useState, type DragEvent } from "react";

import { Button } from "@/components/ui/button";
import type { ImageFieldValue } from "@/features/admin/media/upload";
import { IMAGE_ACCEPT, imageProblem } from "@/lib/storage/image-rules";
import { cn } from "@/lib/utils";

/**
 * Campo único de imagen del panel: subir, vista previa, reemplazar y quitar.
 * No sube nada al elegir: la foto se sube al guardar el formulario (ver prepareImage),
 * así no quedan archivos sueltos si la persona cancela.
 */
export function ImageField({
  label,
  hint,
  currentUrl,
  currentNote,
  value,
  onChange,
  aspect = "4/3",
  removable = true,
}: {
  /** false: la foto actual es la de respaldo (no hay una propia para quitar). */
  removable?: boolean;
  label: string;
  hint?: string;
  /** Foto guardada hoy (o la que muestra la web por defecto). */
  currentUrl: string | null;
  /** Aclaración sobre la foto actual (p. ej. "Imagen ilustrativa"). */
  currentNote?: string | null;
  value: ImageFieldValue;
  onChange: (value: ImageFieldValue) => void;
  aspect?: "4/3" | "banner";
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Liberar la vista previa local al cambiarla o al cerrar el formulario.
  const preview = value.kind === "new" ? value.preview : null;
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const shown = value.kind === "new" ? value.preview : value.kind === "remove" ? null : currentUrl;

  const pick = (file: File | undefined) => {
    if (!file) return;
    const problem = imageProblem(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    onChange({ kind: "new", file, preview: URL.createObjectURL(file) });
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    pick(event.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-[0.95rem] font-medium">
        {label}
      </label>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-dashed bg-secondary/60 transition-colors",
          aspect === "banner" ? "aspect-16/7" : "aspect-4/3",
          dragging ? "border-olive bg-olive/10" : "border-caramel/60",
        )}
      >
        {shown ? (
          // Vista previa local (blob:) o de Storage: <img> simple, sin optimizar.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="Vista previa de la foto" className="size-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-full flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground"
          >
            <ImagePlus aria-hidden strokeWidth={1.4} className="size-9 text-olive" />
            <span className="font-medium text-foreground">Subí una foto</span>
            <span className="text-sm">Tocá acá o arrastrala. JPG, PNG, WebP o AVIF, hasta 8 MB.</span>
          </button>
        )}
        {shown && value.kind === "keep" && currentNote && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-espresso/75 px-2.5 py-1 text-xs text-cream">
            {currentNote}
          </span>
        )}
        {value.kind === "new" && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-olive px-2.5 py-1 text-xs font-medium text-cream">
            Foto nueva: se sube al guardar
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        onChange={(event) => {
          pick(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <div className="flex flex-wrap gap-2">
        {shown && (
          <Button type="button" variant="outline" className="h-11 px-4" onClick={() => inputRef.current?.click()}>
            <Upload aria-hidden />
            Reemplazar foto
          </Button>
        )}
        {shown && (value.kind === "new" || removable) && (
          <Button
            type="button"
            variant="ghost"
            className="h-11 px-4 text-vermouth hover:text-vermouth"
            onClick={() => onChange({ kind: "remove" })}
          >
            <Trash2 aria-hidden />
            Quitar
          </Button>
        )}
        {value.kind !== "keep" && currentUrl && (
          <Button type="button" variant="ghost" className="h-11 px-4" onClick={() => onChange({ kind: "keep" })}>
            <RotateCcw aria-hidden />
            Deshacer
          </Button>
        )}
      </div>

      {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
