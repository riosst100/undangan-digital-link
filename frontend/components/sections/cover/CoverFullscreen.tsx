"use client";

import { motion } from "framer-motion";

export type CoverContent = {
  brideNickname: string;
  groomNickname: string;
  eventDate: string;
  coverPhotoUrl?: string;
  guestName?: string;
};

export function CoverFullscreen({ content }: { content: CoverContent }) {
  return (
    <section className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden">
      {content.coverPhotoUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${content.coverPhotoUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--color-surface)]" />
      )}
      <div className="absolute inset-0 bg-black/30" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-4 px-6 text-center text-white"
      >
        {content.guestName ? (
          <p className="text-sm tracking-wide">Kepada Yth. {content.guestName}</p>
        ) : null}
        <h1
          className="text-4xl font-medium tracking-wide"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {content.groomNickname} &amp; {content.brideNickname}
        </h1>
        <p className="text-sm">{content.eventDate}</p>
      </motion.div>
    </section>
  );
}
