"use client";

import { motion } from "framer-motion";
import { ArchFrame, ArchOutline, FloralDivider } from "@/components/decor/Ornaments";
import type { CoverContent } from "./CoverFullscreen";

/**
 * Modern editorial cover: photo clipped into an arch instead of a plain
 * rectangle/fullscreen bleed, framed by a thin outline and floral divider.
 */
export function CoverArch({ content }: { content: CoverContent }) {
  return (
    <section className="relative flex min-h-dvh w-full flex-col items-center justify-center gap-6 overflow-hidden px-6 py-20">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-xs uppercase tracking-[0.4em] text-[var(--color-primary)]"
      >
        {content.guestName ? `Kepada Yth. ${content.guestName}` : "The Wedding Of"}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative w-full max-w-[min(280px,72vw)]"
      >
        <div
          className="relative aspect-[5/7] w-full text-[var(--color-secondary)]"
          style={{ clipPath: "path('M0 140V50C0 22 22 0 50 0S100 22 100 50V140Z')" }}
        >
          <ArchFrame className="absolute inset-0 h-full w-full" />
          {content.coverPhotoUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${content.coverPhotoUrl})`,
                clipPath: "path('M0 140V50C0 22 22 0 50 0S100 22 100 50V140Z')",
              }}
            />
          ) : null}
        </div>
        <ArchOutline
          className="pointer-events-none absolute -inset-3 h-[calc(100%+24px)] w-[calc(100%+24px)] text-[var(--color-primary)]"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="flex flex-col items-center gap-3 text-center"
      >
        <h1
          className="flex flex-col items-center text-[clamp(2.25rem,10vw,3rem)] font-medium leading-[1.1] [overflow-wrap:anywhere] sm:flex-row sm:flex-wrap sm:justify-center"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {content.groomNickname}
          <span className="my-1 text-[0.7em] text-[var(--color-primary)] sm:mx-3 sm:my-0 sm:text-[1em]">&amp;</span>
          {content.brideNickname}
        </h1>
        <FloralDivider className="h-4 w-32" />
        <p className="text-[15px] sm:text-sm text-[var(--color-muted)]">{content.eventDate}</p>
      </motion.div>
    </section>
  );
}
