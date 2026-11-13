"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/sections/SectionHeading";

export type GalleryContent = {
  items: { url?: string; caption?: string }[];
};

export function GalleryGrid({ content }: { content: GalleryContent }) {
  if (content.items.length === 0) return null;

  return (
    <section className="px-6 py-16">
      <SectionHeading eyebrow="Our Moments" title="Galeri" />
      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
        {content.items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
            className="aspect-square overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-secondary)]"
          >
            {item.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img loading="lazy" decoding="async" src={item.url} alt={item.caption ?? ""} className="h-full w-full object-cover" />
            ) : null}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
