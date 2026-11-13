"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { FloralDivider } from "@/components/decor/Ornaments";

export type GateContent = {
  brideNickname: string;
  groomNickname: string;
  eventDate: string;
  coverPhotoUrl?: string;
  guestName?: string;
};

/**
 * Full-screen lock overlay shown on first load, standard on wedding invitation
 * sites: reveals the invitation content (and lets a body-level audio player
 * start, since autoplay needs a user gesture) only after the guest taps
 * "Buka Undangan". Not a template section — applies to every template,
 * layered above whatever cover variant is configured.
 */
export function InvitationGate({ content, children }: { content: GateContent; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {!open ? (
          <motion.div
            key="gate"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            role="dialog"
            aria-modal="true"
            aria-label="Sampul undangan"
            className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden px-6 pb-safe pt-safe text-center"
          >
            {content.coverPhotoUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${content.coverPhotoUrl})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-[var(--color-background)] bg-[image:var(--background-image)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative z-10 flex w-full max-w-sm flex-col items-center gap-4 text-white"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-white/90">The Wedding Of</p>
              <h1 className="text-[clamp(2.25rem,11vw,3.25rem)] font-medium leading-tight [overflow-wrap:anywhere] [text-wrap:balance]" style={{ fontFamily: "var(--font-heading)" }}>
                {content.groomNickname} &amp; {content.brideNickname}
              </h1>
              <FloralDivider className="h-4 w-28 text-white" />
              <p className="text-base tracking-wide">{content.eventDate}</p>

              {content.guestName ? (
                <div className="mt-4 w-full rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/20 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wide text-white/80">Kepada Yth. Bapak/Ibu/Saudara/i</p>
                  <p className="mt-1 text-lg font-medium [overflow-wrap:anywhere]">{content.guestName}</p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[var(--radius-button)] bg-white px-10 text-base font-medium text-[var(--color-text)] shadow-lg transition-transform active:scale-95"
              >
                Buka Undangan
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {open ? children : null}
    </MotionConfig>
  );
}
