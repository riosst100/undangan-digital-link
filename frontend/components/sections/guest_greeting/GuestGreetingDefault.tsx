"use client";

import { motion } from "framer-motion";

export type GuestGreetingContent = {
  guestName?: string | null;
};

export function GuestGreetingDefault({ content }: { content: GuestGreetingContent }) {
  if (!content.guestName) return null;

  return (
    <section className="px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-sm rounded-[var(--radius-card)] bg-[var(--color-secondary)]/40 px-5 py-4 text-center"
      >
        <p className="text-sm text-[var(--color-muted)]">Undangan ini ditujukan kepada</p>
        <p className="mt-1 text-lg" style={{ fontFamily: "var(--font-heading)" }}>
          {content.guestName}
        </p>
      </motion.div>
    </section>
  );
}
