import { Lightbulb } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { MANUAL_IMAGES } from "../images";
import type { Manual, ManualBlock } from "../manual";

/** "**negrita**" → <strong>. El manual no usa otro formato dentro del texto. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

function Block({ block }: { block: ManualBlock }) {
  switch (block.type) {
    case "p":
      return <p className="leading-relaxed text-muted-foreground">{inline(block.text)}</p>;
    case "note":
      return (
        <p className="flex gap-3 rounded-2xl bg-olive/[0.08] px-4 py-3.5 text-[0.95rem] leading-relaxed">
          <Lightbulb aria-hidden strokeWidth={1.6} className="mt-0.5 size-5 shrink-0 text-olive" />
          <span>{inline(block.text)}</span>
        </p>
      );
    case "ul":
      return (
        <ul className="flex flex-col gap-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 leading-relaxed text-muted-foreground">
              <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-caramel" />
              <span>{inline(item)}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="flex flex-col gap-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3.5 leading-relaxed">
              <span
                aria-hidden
                className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-espresso font-serif text-[1.05rem] text-cream tabular-nums"
              >
                {i + 1}
              </span>
              <span className="pt-0.5">{inline(item)}</span>
            </li>
          ))}
        </ol>
      );
    case "images":
      return (
        <div className="flex flex-wrap justify-center gap-5 py-2 sm:justify-start">
          {block.images.map((image) => {
            const src = MANUAL_IMAGES[image.src];
            if (!src) return null;
            return (
              <figure key={image.src} className="w-[min(100%,15.5rem)]">
                <Image
                  src={src}
                  alt={image.alt}
                  sizes="15.5rem"
                  placeholder="blur"
                  className="h-auto w-full rounded-[1.6rem] border-[5px] border-espresso shadow-[0_20px_40px_-24px_rgb(48_36_27/0.6)]"
                />
                <figcaption className="mt-2 text-center text-xs text-muted-foreground">
                  {image.alt}
                </figcaption>
              </figure>
            );
          })}
        </div>
      );
    default:
      return null;
  }
}

/**
 * El manual en el panel: índice con los temas y cada tema con sus pasos numerados,
 * notas y capturas del celular (en un marco de teléfono).
 */
export function ManualView({ manual }: { manual: Manual }) {
  return (
    <div className="flex flex-col gap-12">
      {manual.intro.length > 0 && (
        <div className="flex max-w-2xl flex-col gap-4">
          {manual.intro.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>
      )}

      <nav
        aria-label="Temas del manual"
        className="rounded-3xl border border-caramel/25 bg-card p-5 sm:p-6"
      >
        <p className="eyebrow mb-4 text-terracotta">Temas</p>
        <ol className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {manual.sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="flex min-h-11 items-center rounded-lg text-[0.95rem] font-medium underline-offset-4 hover:text-olive hover:underline"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {manual.sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-titulo`}
          className="flex scroll-mt-24 flex-col gap-5 border-t border-caramel/25 pt-10"
        >
          <h2 id={`${section.id}-titulo`} className="font-serif text-[2rem] leading-tight">
            {section.title}
          </h2>
          <div className="flex max-w-2xl flex-col gap-5">
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
