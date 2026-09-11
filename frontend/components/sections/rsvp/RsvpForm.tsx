"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { submitRsvp } from "@/lib/api/invitations";
import { ApiError } from "@/lib/api/client";

export type RsvpContent = {
  invitationSlug: string;
  guestToken?: string | null;
};

export function RsvpForm({ content }: { content: RsvpContent }) {
  const [attendance, setAttendance] = useState<"attending" | "not_attending" | "maybe">("attending");
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      await submitRsvp(content.invitationSlug, {
        guestToken: content.guestToken ?? undefined,
        attendance,
        guestCount,
        message: message || undefined,
      });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Tidak dapat terhubung ke server.");
    }
  }

  if (status === "done") {
    return (
      <section className="px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto max-w-sm rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 text-center shadow-[var(--shadow-card)]"
        >
          <p style={{ fontFamily: "var(--font-heading)" }} className="text-lg">
            Terima kasih!
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Konfirmasi kehadiran Anda sudah kami terima.</p>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="px-6 py-16">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto flex max-w-sm flex-col gap-3 rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]"
      >
        <h3 className="text-center text-lg" style={{ fontFamily: "var(--font-heading)" }}>
          Konfirmasi Kehadiran
        </h3>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <select
          value={attendance}
          onChange={(e) => setAttendance(e.target.value as typeof attendance)}
          className="rounded-lg border border-[var(--color-secondary)] px-3 py-2 text-sm"
        >
          <option value="attending">Hadir</option>
          <option value="not_attending">Tidak Hadir</option>
          <option value="maybe">Belum Pasti</option>
        </select>

        <input
          type="number"
          min={1}
          max={20}
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
          placeholder="Jumlah tamu"
          className="rounded-lg border border-[var(--color-secondary)] px-3 py-2 text-sm"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ucapan & doa (opsional)"
          rows={3}
          className="rounded-lg border border-[var(--color-secondary)] px-3 py-2 text-sm"
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {status === "loading" ? "Mengirim..." : "Kirim"}
        </button>
      </motion.form>
    </section>
  );
}
