import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cache } from "react";

/**
 * El manual del panel vive en docs/MANUAL-PANEL.md (se lee también en GitHub). Acá se
 * lee y se convierte en bloques para mostrarlo en /admin/ayuda.
 *
 * Formato admitido (el que usa el manual; el archivo es nuestro, no lo escribe el
 * usuario): `#`, `##`, títulos; párrafos; listas `- ` y `1. `; notas `> `; una imagen
 * sola en su línea `![texto](manual/archivo.webp)`; y **negrita** dentro del texto.
 * next.config.ts incluye el archivo en el deploy (outputFileTracingIncludes).
 */

export type ManualBlock =
  | { type: "h1" | "h2" | "p" | "note"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "images"; images: { alt: string; src: string }[] };

export type ManualSection = { id: string; title: string; blocks: ManualBlock[] };

export type Manual = { title: string; intro: ManualBlock[]; sections: ManualSection[] };

const IMAGE = /^!\[([^\]]*)\]\(([^)]+)\)$/;

const slug = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function parseManual(markdown: string): Manual {
  const blocks: ManualBlock[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length) blocks.push({ type: "p", text: paragraph.join(" ") });
    paragraph = [];
  };
  const push = (block: ManualBlock) => {
    const last = blocks.at(-1);
    // Listas e imágenes seguidas se agrupan en un solo bloque.
    if (last && last.type === block.type && (block.type === "ul" || block.type === "ol"))
      (last as { items: string[] }).items.push(...(block as { items: string[] }).items);
    else if (last?.type === "images" && block.type === "images") last.images.push(...block.images);
    else blocks.push(block);
  };

  for (const raw of lines) {
    const line = raw.trim();
    const image = line.match(IMAGE);
    if (!line) {
      flush();
    } else if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "h2", text: line.slice(3) });
    } else if (line.startsWith("# ")) {
      flush();
      blocks.push({ type: "h1", text: line.slice(2) });
    } else if (image) {
      flush();
      push({ type: "images", images: [{ alt: image[1], src: image[2] }] });
    } else if (line.startsWith("> ")) {
      flush();
      blocks.push({ type: "note", text: line.slice(2) });
    } else if (line.startsWith("- ")) {
      flush();
      push({ type: "ul", items: [line.slice(2)] });
    } else if (/^\d+\. /.test(line)) {
      flush();
      push({ type: "ol", items: [line.replace(/^\d+\. /, "")] });
    } else {
      paragraph.push(line);
    }
  }
  flush();

  const title = blocks.find((b) => b.type === "h1");
  const intro: ManualBlock[] = [];
  const sections: ManualSection[] = [];
  for (const block of blocks) {
    if (block.type === "h1") continue;
    if (block.type === "h2") sections.push({ id: slug(block.text), title: block.text, blocks: [] });
    else (sections.at(-1)?.blocks ?? intro).push(block);
  }
  return { title: title && "text" in title ? title.text : "Manual del panel", intro, sections };
}

export const getManual = cache((): Manual => {
  const markdown = readFileSync(join(process.cwd(), "docs", "MANUAL-PANEL.md"), "utf8");
  return parseManual(markdown);
});
