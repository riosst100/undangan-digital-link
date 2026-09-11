"use client";

import { motion } from "framer-motion";

export type CoupleContent = {
  bride: { name: string; nickname?: string; parents?: string; bio?: string; photoUrl?: string };
  groom: { name: string; nickname?: string; parents?: string; bio?: string; photoUrl?: string };
};

function Person({ person, label }: { person: CoupleContent["bride"]; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-1 flex-col items-center gap-3 text-center"
    >
      {person.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={person.photoUrl}
          alt={person.name}
          className="h-32 w-32 rounded-full object-cover shadow-[var(--shadow-card)]"
        />
      ) : (
        <div
          className="flex h-32 w-32 items-center justify-center rounded-full bg-[var(--color-secondary)] text-2xl"
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)" }}
        >
          {person.name.charAt(0)}
        </div>
      )}
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">{label}</p>
        <h3 className="mt-1 text-xl" style={{ fontFamily: "var(--font-heading)" }}>
          {person.nickname || person.name}
        </h3>
        {person.parents ? <p className="mt-1 text-sm text-[var(--color-muted)]">{person.parents}</p> : null}
        {person.bio ? <p className="mt-2 max-w-xs text-sm">{person.bio}</p> : null}
      </div>
    </motion.div>
  );
}

export function CoupleClassic({ content }: { content: CoupleContent }) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-10 sm:flex-row sm:items-start sm:justify-center sm:gap-6">
        <Person person={content.bride} label="Mempelai Wanita" />
        <div
          className="hidden text-3xl sm:block"
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)" }}
        >
          &amp;
        </div>
        <Person person={content.groom} label="Mempelai Pria" />
      </div>
    </section>
  );
}
