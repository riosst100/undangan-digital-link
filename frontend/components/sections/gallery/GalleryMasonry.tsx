"use client";

import { motion } from "framer-motion";
import type { GalleryContent } from "./GalleryGrid";

// Alternates tall/short aspect ratios per column position so the gallery
// reads as a curated masonry layout instead of a uniform square grid.
const ASPECTS = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-square"];

export function GalleryMasonry({ content }: { content: GalleryContent }) {
  if (content.items.length === 0) return null;

  return (
    <section className="px-6 py-16">
      <div className="mx-auto columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
        {content.items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: (index % 6) * 0.06 }}
            className={`break-inside-avoid overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-secondary)] shadow-[var(--shadow-card)] ${ASPECTS[index % ASPECTS.length]}`}
          >
            {item.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt={item.caption ?? ""} className="h-full w-full object-cover" />
            ) : null}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
