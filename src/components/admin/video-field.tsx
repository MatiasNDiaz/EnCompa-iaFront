"use client";

import { Film, RotateCcw, Upload } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { VIDEO_ACCEPT, videoProblem } from "@/lib/storage/video-rules";

export type VideoFieldValue = { kind: "keep" } | { kind: "new"; file: File; preview: string };

const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;

/**
 * Campo de video del panel (Novedades), igual que ImageField: elegir, ver y reemplazar.
 * No sube nada al elegir: el video se sube al guardar (ver prepareVideo).
 */
export function VideoField({
  label,
  hint,
  currentUrl,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  currentUrl: string | null;
  value: VideoFieldValue;
  onChange: (value: VideoFieldValue) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const preview = value.kind === "new" ? value.preview : null;
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const shown = value.kind === "new" ? value.preview : currentUrl;

  const pick = (file: File | undefined) => {
    if (!file) return;
    const problem = videoProblem(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    onChange({ kind: "new", file, preview: URL.createObjectURL(file) });
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-[0.95rem] font-medium">
        {label}
      </label>

      <div className="relative aspect-video overflow-hidden rounded-2xl border border-dashed border-caramel/60 bg-secondary/60">
        {shown ? (
          <video
            src={shown}
            controls
            muted
            playsInline
            preload="metadata"
            aria-label="Vista previa del video"
            className="size-full bg-espresso object-contain"
          />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-full flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground"
          >
            <Film aria-hidden strokeWidth={1.4} className="size-9 text-olive" />
            <span className="font-medium text-foreground">Subí un video</span>
            <span className="text-sm">Tocá acá. MP4 o WebM, hasta 50 MB.</span>
          </button>
        )}
        {value.kind === "new" && (
          <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-full bg-olive px-2.5 py-1 text-xs font-medium text-cream">
            Video nuevo ({megabytes(value.file.size)}): se sube al guardar
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={VIDEO_ACCEPT}
        className="sr-only"
        onChange={(event) => {
          pick(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <div className="flex flex-wrap gap-2">
        {shown && (
          <Button
            type="button"
            variant="outline"
            className="h-11 px-4"
            onClick={() => inputRef.current?.click()}
          >
            <Upload aria-hidden />
            Reemplazar video
          </Button>
        )}
        {value.kind === "new" && currentUrl && (
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
