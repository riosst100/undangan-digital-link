"use client";

import { motion } from "framer-motion";
import { FloralDivider } from "@/components/decor/Ornaments";
import type { CoupleContent } from "./CoupleClassic";

function Portrait({
  person,
  offset,
}: {
  person: CoupleContent["bride"];
  offset: "up" | "down";
}) {
  return (
    <div
      className={`relative h-40 w-40 overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-card)] sm:h-48 sm:w-48 ${
        offset === "up" ? "sm:-translate-y-4" : "sm:translate-y-4"
      }`}
    >
      {person.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={person.photoUrl} alt={person.name} className="h-full w-full object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-[var(--color-secondary)] text-4xl"
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)" }}
        >
          {person.name.charAt(0)}
        </div>
      )}
    </div>
  );
}

function Info({ person, label }: { person: CoupleContent["bride"]; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)]">{label}</p>
      <h3 className="text-xl" style={{ fontFamily: "var(--font-heading)" }}>
        {person.nickname || person.name}
      </h3>
      {person.parents ? <p className="max-w-[220px] text-xs text-[var(--color-muted)]">{person.parents}</p> : null}
    </div>
  );
}

/** Overlapping oversized portraits instead of small circular avatars, with a floral divider between. */
export function CoupleOverlap({ content }: { content: CoupleContent }) {
  return (
    <section className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mx-auto flex max-w-md flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center sm:gap-4"
      >
        <div className="flex flex-col items-center gap-4">
          <Portrait person={content.groom} offset="up" />
          <Info person={content.groom} label="Mempelai Pria" />
        </div>

        <FloralDivider className="h-6 w-16 rotate-90 sm:mt-16 sm:rotate-0" />

        <div className="flex flex-col items-center gap-4">
          <Portrait person={content.bride} offset="down" />
          <Info person={content.bride} label="Mempelai Wanita" />
        </div>
      </motion.div>
    </section>
  );
}
