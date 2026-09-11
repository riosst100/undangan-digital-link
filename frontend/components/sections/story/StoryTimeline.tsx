"use client";

import { motion } from "framer-motion";

export type StoryContent = {
  title?: string;
  items: { year?: string; title: string; description?: string }[];
};

export function StoryTimeline({ content }: { content: StoryContent }) {
  if (content.items.length === 0) return null;

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-md">
        {content.title ? (
          <h2 className="mb-8 text-center text-xl" style={{ fontFamily: "var(--font-heading)" }}>
            {content.title}
          </h2>
        ) : null}

        <div className="relative flex flex-col gap-8 border-l border-[var(--color-secondary)] pl-6">
          {content.items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
              className="relative"
            >
              <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-[var(--color-primary)]" />
              {item.year ? (
                <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-primary)]">
                  {item.year}
                </p>
              ) : null}
              <h3 className="mt-1 text-base font-medium">{item.title}</h3>
              {item.description ? (
                <p className="mt-1 text-sm text-[var(--color-muted)]">{item.description}</p>
              ) : null}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
