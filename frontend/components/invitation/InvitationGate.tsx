"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <>
      <AnimatePresence>
        {!open ? (
          <motion.div
            key="gate"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-6 text-center"
          >
            {content.coverPhotoUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${content.coverPhotoUrl})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-[var(--color-background)] bg-[image:var(--background-image)]" />
            )}
            <div className="absolute inset-0 bg-black/35" />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative z-10 flex flex-col items-center gap-4 text-white"
            >
              <p className="text-xs uppercase tracking-[0.4em]">The Wedding Of</p>
              <h1 className="text-3xl font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                {content.groomNickname} &amp; {content.brideNickname}
              </h1>
              <FloralDivider className="h-4 w-28 text-white" />
              <p className="text-sm">{content.eventDate}</p>

              {content.guestName ? (
                <p className="mt-4 text-xs uppercase tracking-wide text-white/80">
                  Kepada Yth. Bapak/Ibu/Saudara/i
                  <br />
                  <span className="text-sm font-medium normal-case text-white">{content.guestName}</span>
                </p>
              ) : null}

              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-6 rounded-[var(--radius-button)] bg-white px-8 py-3 text-sm font-medium text-[var(--color-text)] shadow-lg transition-transform active:scale-95"
              >
                Buka Undangan
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {open ? children : null}
    </>
  );
}
