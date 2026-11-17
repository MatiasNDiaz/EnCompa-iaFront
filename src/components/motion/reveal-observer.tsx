"use client";

import { useEffect } from "react";

import { MOTION } from "@/config/motion";

const PENDING = "[data-reveal]:not([data-revealed])";

/**
 * Un solo IntersectionObserver para todo el sitio. Observa los `[data-reveal]` y los marca
 * como `data-revealed` una única vez (no se repite al volver a hacer scroll).
 *
 * Un MutationObserver suma los `[data-reveal]` que aparecen después: navegar a otra página
 * o cambiar contenido sin cambiar de ruta (p. ej. el filtro ?momento= de la carta).
 */
export function RevealObserver() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      const revealAll = (root: ParentNode) =>
        root.querySelectorAll(PENDING).forEach((el) => el.setAttribute("data-revealed", ""));
      revealAll(document);
      const mutations = new MutationObserver(() => revealAll(document));
      mutations.observe(document.body, { childList: true, subtree: true });
      return () => mutations.disconnect();
    }

    const intersections = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          intersections.unobserve(entry.target);
        }
      },
      { threshold: MOTION.threshold, rootMargin: MOTION.rootMargin },
    );

    const observeIn = (root: Element | Document) => {
      if (root instanceof Element && root.matches(PENDING)) intersections.observe(root);
      root.querySelectorAll(PENDING).forEach((el) => intersections.observe(el));
    };

    observeIn(document);
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) observeIn(node);
        });
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      intersections.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
