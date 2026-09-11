"use client";

import { motion } from "framer-motion";
import type { EventContent } from "./EventCard";

function formatTimeRange(start?: string, end?: string): string | null {
  if (!start) return null;
  return end ? `${start} - ${end}` : start;
}

export function EventTimeline({ content }: { content: EventContent }) {
  if (content.events.length === 0) return null;

  return (
    <section className="px-6 py-16">
      <div className="relative mx-auto max-w-md border-l border-[var(--color-secondary)] pl-6">
        {content.events.map((event, index) => (
          <motion.div
            key={`${event.type}-${index}`}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.15 }}
            className="relative pb-10 last:pb-0"
          >
            <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-[var(--color-background)] bg-[var(--color-primary)]" />
            <p className="text-xs uppercase tracking-widest text-[var(--color-primary)]">{event.date}</p>
            <h3 className="mt-1 text-lg" style={{ fontFamily: "var(--font-heading)" }}>
              {event.title}
            </h3>
            {formatTimeRange(event.startTime, event.endTime) ? (
              <p className="text-sm text-[var(--color-muted)]">
                {formatTimeRange(event.startTime, event.endTime)}
              </p>
            ) : null}
            {event.venueName ? <p className="mt-2 text-sm font-medium">{event.venueName}</p> : null}
            {event.address ? <p className="text-sm text-[var(--color-muted)]">{event.address}</p> : null}
            {event.mapsUrl ? (
              <a
                href={event.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs font-medium text-[var(--color-primary)] underline underline-offset-2"
              >
                Lihat Lokasi
              </a>
            ) : null}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
