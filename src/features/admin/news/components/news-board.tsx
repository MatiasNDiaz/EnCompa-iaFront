"use client";

import { ExternalLink, EyeOff, MoreHorizontal, Newspaper, Pencil, Play, Plus, Send, Trash2 } from "lucide-react";
import { useCallback, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { MenuContent, MenuItem, MenuRoot, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toaster";
import { newsDateLabel } from "@/features/news/format";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { cn } from "@/lib/utils";

import { deleteNews, setNewsPublished } from "../actions";
import type { AdminNewsPost } from "../types";
import { NewsForm } from "./news-form";

/**
 * Novedades del panel: lista con miniatura, título, fecha y estado (Publicada / Borrador),
 * menú ⋯ (Editar · Publicar u Ocultar · Ver en la web · Eliminar) y "Nueva novedad".
 */
export function NewsBoard({ posts }: { posts: AdminNewsPost[] }) {
  const confirm = useConfirm();
  const [editing, setEditing] = useState<{ post: AdminNewsPost | null; key: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const counter = useRef(0);

  useUnsavedChanges(open && dirty);

  const edit = (post: AdminNewsPost | null) => {
    counter.current += 1;
    setDirty(false);
    setEditing({ post, key: counter.current });
    setOpen(true);
  };

  const close = useCallback(() => {
    setOpen(false);
    setDirty(false);
  }, []);

  const requestClose = useCallback(async () => {
    if (
      dirty &&
      !(await confirm({
        title: "¿Descartar los cambios?",
        description: "Tenés cambios sin guardar. Si cerrás ahora se pierden.",
        confirmLabel: "Descartar",
        cancelLabel: "Seguir editando",
        tone: "danger",
      }))
    ) {
      return;
    }
    close();
  }, [dirty, confirm, close]);

  return (
    <>
      <Button type="button" className="mb-6 h-12 px-5 text-base" onClick={() => edit(null)}>
        <Plus aria-hidden />
        Nueva novedad
      </Button>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-caramel/40 bg-card px-6 py-14 text-center">
          <Newspaper aria-hidden className="size-9 text-olive" strokeWidth={1.4} />
          <p className="font-serif text-[1.6rem]">Todavía no hay novedades</p>
          <p className="max-w-sm text-[0.95rem] text-muted-foreground">
            Publicá un evento, una promoción o una propuesta especial. Mientras no haya ninguna
            publicada, «Novedades» no aparece en el menú de la web.
          </p>
        </div>
      ) : (
        <ul aria-label="Novedades" className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.id}>
              <NewsRow post={post} onEdit={() => edit(post)} />
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : void requestClose())}
        title={editing?.post ? "Editar novedad" : "Nueva novedad"}
        description="Foto o video, título, descripción y un mensaje final. Solo se ven las publicadas."
      >
        {editing && (
          <NewsForm
            key={editing.key}
            post={editing.post}
            onDirtyChange={setDirty}
            onDone={close}
            onCancel={() => void requestClose()}
          />
        )}
      </Sheet>
    </>
  );
}

function NewsRow({ post, onEdit }: { post: AdminNewsPost; onEdit: () => void }) {
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();
  const thumbnail = post.mediaType === "video" ? post.posterUrl : post.mediaUrl;
  const date = newsDateLabel(post);

  const togglePublished = () =>
    startTransition(async () => {
      const publish = !post.isPublished;
      const result = await setNewsPublished(post.id, publish);
      if (!result.ok) toast.error(publish ? "No se pudo publicar" : "No se pudo ocultar", result.error);
      else
        toast.success(
          publish ? "Novedad publicada" : "Novedad ocultada",
          publish ? "Ya se ve en la web." : "Ya no se ve en la web. Queda guardada como borrador.",
        );
    });

  const remove = async () => {
    const ok = await confirm({
      title: `¿Eliminar «${post.title}»?`,
      description: `Se borra junto con ${post.mediaType === "video" ? "el video y su portada" : "su foto"}. No se puede deshacer.`,
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      tone: "danger",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteNews(post.id);
      if (!result.ok) toast.error("No se pudo eliminar", result.error);
      else toast.success("Novedad eliminada", "Ya no aparece en la web.");
    });
  };

  return (
    <article
      aria-label={post.title}
      aria-busy={pending || undefined}
      className={cn(
        "flex items-center gap-4 rounded-3xl border bg-card p-3 pr-2 transition-opacity sm:p-4",
        post.isPublished ? "border-olive/40" : "border-caramel/25",
        pending && "opacity-70",
      )}
    >
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar «${post.title}»`}
        className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-secondary sm:size-24"
      >
        {thumbnail && (
          // Miniatura de Storage: <img> simple (el panel no necesita variantes optimizadas).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt="" className="size-full object-cover" loading="lazy" />
        )}
        {post.mediaType === "video" && (
          <span className="absolute right-1.5 bottom-1.5 inline-flex size-6 items-center justify-center rounded-full bg-espresso/80 text-cream">
            <Play aria-hidden className="size-3 fill-current" />
          </span>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
            post.isPublished ? "bg-olive text-cream" : "bg-secondary text-espresso",
          )}
        >
          <span aria-hidden className={cn("size-1.5 rounded-full", post.isPublished ? "bg-cream" : "bg-caramel")} />
          {post.isPublished ? "Publicada" : "Borrador"}
        </span>
        <h2 className="mt-1.5 truncate font-serif text-[1.4rem] leading-tight sm:text-[1.6rem]">{post.title}</h2>
        <p className="truncate text-sm text-muted-foreground">
          {post.eventDate ? `Evento · ${date}` : date ? `Publicada el ${date.toLowerCase()}` : "Todavía no se publicó"}
        </p>
      </div>

      <MenuRoot>
        <MenuTrigger
          aria-label={`Opciones de ${post.title}`}
          disabled={pending}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-popup-open:bg-secondary data-popup-open:text-foreground"
        >
          <MoreHorizontal aria-hidden className="size-5" />
        </MenuTrigger>
        <MenuContent>
          <MenuItem onClick={onEdit}>
            <Pencil aria-hidden /> Editar
          </MenuItem>
          <MenuItem onClick={togglePublished}>
            {post.isPublished ? (
              <>
                <EyeOff aria-hidden /> Ocultar
              </>
            ) : (
              <>
                <Send aria-hidden /> Publicar
              </>
            )}
          </MenuItem>
          {post.isPublished && (
            <MenuItem onClick={() => window.open(`/novedades#${post.slug}`, "_blank", "noopener")}>
              <ExternalLink aria-hidden /> Ver en la web
            </MenuItem>
          )}
          <MenuSeparator />
          <MenuItem onClick={() => void remove()} className="text-vermouth">
            <Trash2 aria-hidden /> Eliminar
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </article>
  );
}
