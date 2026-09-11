"use client";

import { motion } from "framer-motion";
import type { CoverContent } from "./CoverFullscreen";

export function CoverMinimal({ content }: { content: CoverContent }) {
  return (
    <section className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      {content.guestName ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]"
        >
          Kepada Yth. {content.guestName}
        </motion.p>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
        className="flex flex-col items-center gap-2"
      >
        <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-primary)]">The Wedding Of</p>
        <h1
          className="text-5xl font-medium leading-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {content.groomNickname}
          <span className="mx-3 text-[var(--color-primary)]">&amp;</span>
          {content.brideNickname}
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-sm text-[var(--color-muted)]"
      >
        {content.eventDate}
      </motion.p>
    </section>
  );
}
