"use client";

import { motion } from "framer-motion";
import type { CoupleContent } from "./CoupleClassic";

function Half({
  person,
  label,
  align,
}: {
  person: CoupleContent["bride"];
  label: string;
  align: "left" | "right";
}) {
  const isLeft = align === "left";

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`flex flex-1 flex-col gap-2 px-6 py-10 text-center ${isLeft ? "sm:items-end sm:text-right" : "sm:items-start sm:text-left"}`}
    >
      <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">{label}</p>
      <h3 className="text-2xl" style={{ fontFamily: "var(--font-heading)" }}>
        {person.nickname || person.name}
      </h3>
      <p className="text-sm text-[var(--color-muted)]">{person.name}</p>
      {person.parents ? <p className="mt-1 text-sm text-[var(--color-muted)]">{person.parents}</p> : null}
      {person.bio ? <p className="mt-2 max-w-xs text-sm">{person.bio}</p> : null}
    </motion.div>
  );
}

export function CoupleSplit({ content }: { content: CoupleContent }) {
  return (
    <section className="py-4">
      <div className="mx-auto flex max-w-3xl flex-col sm:flex-row sm:items-center">
        <Half person={content.groom} label="Mempelai Pria" align="left" />
        <div
          className="mx-auto h-px w-16 bg-[var(--color-primary)] sm:h-24 sm:w-px"
          aria-hidden
        />
        <Half person={content.bride} label="Mempelai Wanita" align="right" />
      </div>
    </section>
  );
}
