"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Film, ImageIcon, PencilLine } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";

import { ImageField } from "@/components/admin/image-field";
import { VideoField, type VideoFieldValue } from "@/components/admin/video-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetBody, SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import { discardUploads } from "@/features/admin/media/actions";
import { prepareImage, prepareVideo, type ImageFieldValue } from "@/features/admin/media/upload";
import { describedBy, FormField } from "@/features/admin/menu/components/form-field";
import { NewsArticle } from "@/features/news/components/news-article";
import { NEWS_LIMITS, type NewsMedia } from "@/features/news/types";
import { cn } from "@/lib/utils";

import { saveNews } from "../actions";
import {
  MEDIA_NEEDED,
  newsSchema,
  POSTER_NEEDED,
  type MediaChange,
  type NewsFormValues,
  type NewsInput,
} from "../schemas";
import type { AdminNewsPost } from "../types";

/**
 * Formulario de una novedad (panel lateral): foto o video (con portada), título,
 * descripción, fecha del evento y mensaje final. "Vista previa" la muestra con el mismo
 * componente que la web. Los archivos se suben recién al guardar.
 */
export function NewsForm({
  post,
  onDirtyChange,
  onDone,
  onCancel,
}: {
  post: AdminNewsPost | null;
  onDirtyChange: (dirty: boolean) => void;
  onDone: () => void;
  onCancel: () => void;
}) {
  const ids = {
    title: useId(),
    description: useId(),
    eventDate: useId(),
    closing: useId(),
  };
  const [view, setView] = useState<"form" | "preview">("form");
  const [image, setImage] = useState<ImageFieldValue>({ kind: "keep" });
  const [video, setVideo] = useState<VideoFieldValue>({ kind: "keep" });
  const [poster, setPoster] = useState<ImageFieldValue>({ kind: "keep" });
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState<"publish" | "draft" | null>(null);

  const { register, control, handleSubmit, getValues, setValue, formState } = useForm<
    NewsFormValues,
    unknown,
    NewsInput
  >({
    resolver: zodResolver(newsSchema) as never,
    defaultValues: {
      title: post?.title ?? "",
      description: post?.description ?? "",
      closingMessage: post?.closingMessage ?? "",
      eventDate: post?.eventDate ?? "",
      mediaType: post?.mediaType ?? "image",
    },
  });
  const mediaType = useWatch({ control, name: "mediaType" });
  const { errors, isDirty } = formState;

  const filesChanged = image.kind !== "keep" || video.kind !== "keep" || poster.kind !== "keep";
  const dirty = isDirty || filesChanged;
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  // Lo guardado sirve solo si es del mismo tipo que el elegido ahora.
  const savedImage = post?.mediaType === "image" ? post.mediaUrl : null;
  const savedVideo = post?.mediaType === "video" ? post.mediaUrl : null;
  const savedPoster = post?.mediaType === "video" ? post.posterUrl : null;

  const hasMedia =
    mediaType === "image"
      ? image.kind === "new" || (image.kind === "keep" && Boolean(savedImage))
      : video.kind === "new" || Boolean(savedVideo);
  const hasPoster = poster.kind === "new" || (poster.kind === "keep" && Boolean(savedPoster));

  const submit = (publish: boolean) =>
    handleSubmit(
      async () => {
        setServerError(null);
        if (!hasMedia) return showError(MEDIA_NEEDED);
        if (mediaType === "video" && !hasPoster) return showError(POSTER_NEEDED);

        setPending(publish ? "publish" : "draft");
        const uploaded: string[] = [];
        try {
          let media: MediaChange = { kind: "keep" };
          let posterChange: Parameters<typeof saveNews>[3] = { kind: "keep" };

          if (mediaType === "image" && image.kind === "new") {
            const result = await prepareImage(image, "news");
            if (!result.ok) return showError(result.error);
            if (result.change.kind === "new") {
              media = { kind: "new", path: result.change.path };
              uploaded.push(result.change.path);
            }
          }
          if (mediaType === "video") {
            if (poster.kind === "new") {
              const result = await prepareImage(poster, "news");
              if (!result.ok) return showError(result.error);
              posterChange = result.change;
              if (result.change.kind === "new") uploaded.push(result.change.path);
            }
            if (video.kind === "new") {
              const result = await prepareVideo(video.file);
              if (!result.ok) {
                await discardUploads(uploaded);
                return showError(result.error);
              }
              media = { kind: "new", path: result.path };
            }
          }

          const result = await saveNews(post?.id ?? null, getValues(), media, posterChange, publish);
          if (!result.ok) return showError(result.error); // el servidor ya borró lo subido
        } finally {
          setPending(null);
        }

        onDirtyChange(false);
        if (publish) {
          toast.success(post?.isPublished ? "Novedad guardada" : "Novedad publicada", "Ya se ve en la web.");
        } else {
          toast.success(
            post?.isPublished ? "Novedad ocultada" : "Borrador guardado",
            "No se ve en la web hasta que la publiques.",
          );
        }
        onDone();
      },
      () => setView("form"),
    )();

  function showError(message: string) {
    setView("form");
    setServerError(message);
  }

  const busy = pending !== null;
  const previewMedia = buildPreviewMedia(mediaType, { image, video, poster, savedImage, savedVideo, savedPoster });

  return (
    <form onSubmit={(event) => event.preventDefault()} noValidate className="flex min-h-0 flex-1 flex-col">
      <SheetBody className="flex flex-col gap-6">
        <div role="group" aria-label="Modo" className="flex gap-1 self-start rounded-full border border-caramel/40 bg-card p-1">
          <Toggle active={view === "form"} onClick={() => setView("form")} icon={<PencilLine aria-hidden />}>
            Datos
          </Toggle>
          <Toggle active={view === "preview"} onClick={() => setView("preview")} icon={<Eye aria-hidden />}>
            Vista previa
          </Toggle>
        </div>

        {view === "preview" && <Preview control={control} media={previewMedia} publishedAt={post?.publishedAt ?? null} />}

        {/* Los campos quedan montados (ocultos) en la vista previa: no se pierden los archivos. */}
        <div hidden={view !== "form"} className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-[0.95rem] font-medium">Foto o video</legend>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["image", "Foto", <ImageIcon key="i" aria-hidden className="size-5" />],
                  ["video", "Video", <Film key="v" aria-hidden className="size-5" />],
                ] as const
              ).map(([type, label, icon]) => (
                <label
                  key={type}
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border bg-card px-4 font-medium transition-colors",
                    mediaType === type ? "border-olive text-olive ring-2 ring-olive/25" : "border-caramel/30",
                  )}
                >
                  <input
                    type="radio"
                    value={type}
                    checked={mediaType === type}
                    disabled={busy}
                    onChange={() => setValue("mediaType", type, { shouldDirty: true })}
                    className="sr-only"
                  />
                  {icon}
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {mediaType === "image" ? (
            <ImageField
              label="Foto"
              hint="Obligatoria. Una foto horizontal se ve mejor."
              currentUrl={savedImage}
              value={image}
              onChange={setImage}
              removable={false}
            />
          ) : (
            <>
              <VideoField
                label="Video"
                hint="Obligatorio. En la web no arranca solo ni con sonido: se reproduce al tocarlo."
                currentUrl={savedVideo}
                value={video}
                onChange={setVideo}
              />
              <ImageField
                label="Portada del video"
                hint="Obligatoria. Es la imagen que se ve antes de reproducirlo y en la lista."
                currentUrl={savedPoster}
                value={poster}
                onChange={setPoster}
                removable={false}
              />
            </>
          )}

          <FormField id={ids.title} label="Título" error={errors.title?.message}>
            <Input
              id={ids.title}
              autoComplete="off"
              maxLength={NEWS_LIMITS.title}
              placeholder="Noche de chicas"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={describedBy(ids.title, errors.title?.message)}
              className="h-12 text-base"
              {...register("title")}
            />
          </FormField>

          <FormField
            id={ids.description}
            label="Descripción"
            hint={`Contá de qué se trata. Para separar párrafos, dejá una línea en blanco (hasta ${NEWS_LIMITS.description} caracteres).`}
            error={errors.description?.message}
          >
            <Textarea
              id={ids.description}
              rows={7}
              maxLength={NEWS_LIMITS.description}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={describedBy(ids.description, errors.description?.message, true)}
              {...register("description")}
            />
          </FormField>

          <FormField
            id={ids.eventDate}
            label="Fecha del evento"
            hint="Opcional. Si es un evento con fecha, se muestra arriba del título."
            error={errors.eventDate?.message}
          >
            <input
              id={ids.eventDate}
              type="date"
              aria-invalid={Boolean(errors.eventDate) || undefined}
              aria-describedby={describedBy(ids.eventDate, errors.eventDate?.message, true)}
              className="h-12 w-full rounded-xl border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:max-w-xs"
              {...register("eventDate")}
            />
          </FormField>

          <FormField
            id={ids.closing}
            label="Mensaje final"
            hint="Opcional. Una frase destacada al cierre, por ejemplo «¡Te esperamos!»."
            error={errors.closingMessage?.message}
          >
            <Input
              id={ids.closing}
              autoComplete="off"
              maxLength={NEWS_LIMITS.closingMessage}
              aria-invalid={Boolean(errors.closingMessage)}
              aria-describedby={describedBy(ids.closing, errors.closingMessage?.message, true)}
              className="h-12 text-base"
              {...register("closingMessage")}
            />
          </FormField>
        </div>

        {serverError && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {serverError}
          </p>
        )}
      </SheetBody>

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
            {pending === "draft" ? "Guardando…" : post?.isPublished ? "Ocultar de la web" : "Guardar borrador"}
          </Button>
          <Button
            type="button"
            className="h-12 px-3 text-[0.95rem] sm:px-6 sm:text-base"
            disabled={busy}
            onClick={() => void submit(true)}
          >
            {pending === "publish" ? "Publicando…" : post?.isPublished ? "Guardar cambios" : "Publicar"}
          </Button>
        </div>
      </SheetFooter>
    </form>
  );
}

function buildPreviewMedia(
  mediaType: "image" | "video",
  files: {
    image: ImageFieldValue;
    video: VideoFieldValue;
    poster: ImageFieldValue;
    savedImage: string | null;
    savedVideo: string | null;
    savedPoster: string | null;
  },
): NewsMedia | null {
  if (mediaType === "image") {
    const url = files.image.kind === "new" ? files.image.preview : files.image.kind === "keep" ? files.savedImage : null;
    return url ? { type: "image", url } : null;
  }
  const url = files.video.kind === "new" ? files.video.preview : files.savedVideo;
  const posterUrl =
    files.poster.kind === "new" ? files.poster.preview : files.poster.kind === "keep" ? files.savedPoster : null;
  return url && posterUrl ? { type: "video", url, posterUrl } : null;
}

function Preview({
  control,
  media,
  publishedAt,
}: {
  control: ReturnType<typeof useForm<NewsFormValues, unknown, NewsInput>>["control"];
  media: NewsMedia | null;
  publishedAt: string | null;
}) {
  const [title, description, closingMessage, eventDate] = useWatch({
    control,
    name: ["title", "description", "closingMessage", "eventDate"],
  });

  if (!media) {
    return (
      <p className="rounded-2xl bg-secondary px-4 py-6 text-center text-sm text-muted-foreground">
        Para ver la vista previa, elegí la foto (o el video y su portada).
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">Así se ve en la web.</p>
      <div className="rounded-3xl border border-caramel/25 bg-background p-5">
        <NewsArticle
          preview
          post={{
            title: title ?? "",
            description: description ?? "",
            closingMessage: closingMessage?.trim() ? closingMessage : null,
            eventDate: /^\d{4}-\d{2}-\d{2}$/.test(eventDate ?? "") ? (eventDate as string) : null,
            publishedAt: publishedAt ?? new Date().toISOString(),
            media,
          }}
        />
      </div>
    </div>
  );
}

function Toggle({
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
        "inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors [&_svg]:size-4",
        active ? "bg-espresso text-cream" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
