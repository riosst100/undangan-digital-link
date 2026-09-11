"use client";

import { motion } from "framer-motion";
import { CornerFlourish } from "@/components/decor/Ornaments";
import type { EventContent } from "./EventCard";

function formatTimeRange(start?: string, end?: string): string | null {
  if (!start) return null;
  return end ? `${start} - ${end}` : start;
}

/** Event cards with a corner flourish and a large serif index number instead of a plain flat card. */
export function EventOrnate({ content }: { content: EventContent }) {
  if (content.events.length === 0) return null;

  return (
    <section className="px-6 py-16">
      <div className="mx-auto flex max-w-md flex-col gap-5">
        {content.events.map((event, index) => (
          <motion.div
            key={`${event.type}-${index}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
            className="relative overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 text-center shadow-[var(--shadow-card)]"
          >
            <CornerFlourish className="absolute left-2 top-2 h-8 w-8 opacity-70" />
            <CornerFlourish className="absolute right-2 top-2 h-8 w-8 rotate-90 opacity-70" />

            <span
              className="mx-auto mb-2 block text-4xl opacity-20"
              style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)" }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

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
