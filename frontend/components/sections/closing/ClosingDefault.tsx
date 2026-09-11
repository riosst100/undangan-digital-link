"use client";

import { motion } from "framer-motion";

export type ClosingContent = {
  brideNickname: string;
  groomNickname: string;
};

export function ClosingDefault({ content }: { content: ClosingContent }) {
  return (
    <section className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
        className="mx-auto flex max-w-md flex-col items-center gap-3 text-center"
      >
        <p className="text-sm text-[var(--color-muted)]">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.
        </p>
        <p className="mt-2 text-2xl" style={{ fontFamily: "var(--font-heading)" }}>
          {content.groomNickname} &amp; {content.brideNickname}
        </p>
      </motion.div>
    </section>
  );
}
