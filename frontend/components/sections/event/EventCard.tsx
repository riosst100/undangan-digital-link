"use client";

import { motion } from "framer-motion";

export type EventContent = {
  events: {
    type: string;
    title: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    venueName?: string;
    address?: string;
    mapsUrl?: string;
    description?: string;
  }[];
};

function formatTimeRange(start?: string, end?: string): string | null {
  if (!start) return null;
  return end ? `${start} - ${end}` : start;
}

export function EventCard({ content }: { content: EventContent }) {
  if (content.events.length === 0) return null;

  return (
    <section className="px-6 py-16">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        {content.events.map((event, index) => (
          <motion.div
            key={`${event.type}-${index}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
            className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 text-center shadow-[var(--shadow-card)]"
          >
            <h3 className="text-lg" style={{ fontFamily: "var(--font-heading)" }}>
              {event.title}
            </h3>
            {event.date ? <p className="mt-2 text-sm text-[var(--color-muted)]">{event.date}</p> : null}
            {formatTimeRange(event.startTime, event.endTime) ? (
              <p className="text-sm text-[var(--color-muted)]">
                {formatTimeRange(event.startTime, event.endTime)}
              </p>
            ) : null}
            {event.venueName ? <p className="mt-3 text-sm font-medium">{event.venueName}</p> : null}
            {event.address ? <p className="text-sm text-[var(--color-muted)]">{event.address}</p> : null}
            {event.mapsUrl ? (
              <a
                href={event.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-2 text-xs font-medium text-white"
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
