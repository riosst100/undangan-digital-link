"use client";

import { motion } from "framer-motion";

export type QuoteContent = {
  text: string | null;
};

export function QuoteDefault({ content }: { content: QuoteContent }) {
  if (!content.text) return null;

  return (
    <section className="px-6 py-16">
      <motion.blockquote
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-md text-center text-lg italic"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        &ldquo;{content.text}&rdquo;
      </motion.blockquote>
    </section>
  );
}
