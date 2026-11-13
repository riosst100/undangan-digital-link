"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { submitRsvp } from "@/lib/api/invitations";
import { ApiError } from "@/lib/api/client";

export type RsvpContent = {
  invitationSlug: string;
  guestToken?: string | null;
};

const ATTENDANCE_OPTIONS = [
  { value: "attending", label: "Hadir" },
  { value: "not_attending", label: "Tidak Hadir" },
  { value: "maybe", label: "Belum Pasti" },
] as const;

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
          <p className="mt-1 text-[15px] sm:text-sm text-[var(--color-muted)]">Konfirmasi kehadiran Anda sudah kami terima.</p>
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
        className="mx-auto flex w-full max-w-sm flex-col gap-5 rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]"
      >
        <h3 className="text-center text-lg" style={{ fontFamily: "var(--font-heading)" }}>
          Konfirmasi Kehadiran
        </h3>

        {error ? (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-[15px] text-red-700 sm:text-sm">
            {error}
          </p>
        ) : null}

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[15px] font-medium sm:text-sm">Apakah Anda akan hadir?</legend>
          <div className="grid grid-cols-3 gap-2">
            {ATTENDANCE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex min-h-11 cursor-pointer items-center justify-center rounded-[var(--radius-button)] border px-2 text-center text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--color-primary)] ${
                  attendance === option.value
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-secondary)] bg-transparent"
                }`}
              >
                <input
                  type="radio"
                  name="attendance"
                  value={option.value}
                  checked={attendance === option.value}
                  onChange={() => setAttendance(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        {attendance !== "not_attending" ? (
          <div className="flex items-center justify-between gap-3">
            <span id="rsvp-guest-count" className="text-[15px] font-medium sm:text-sm">
              Jumlah tamu
            </span>
            <div role="group" aria-labelledby="rsvp-guest-count" className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Kurangi jumlah tamu"
                onClick={() => setGuestCount((n) => Math.max(1, n - 1))}
                disabled={guestCount <= 1}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-secondary)] text-xl disabled:opacity-40"
              >
                −
              </button>
              <span aria-live="polite" className="w-10 text-center text-lg font-medium tabular-nums">
                {guestCount}
              </span>
              <button
                type="button"
                aria-label="Tambah jumlah tamu"
                onClick={() => setGuestCount((n) => Math.min(20, n + 1))}
                disabled={guestCount >= 20}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-secondary)] text-xl disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        ) : null}

        <label className="flex flex-col gap-2">
          <span className="text-[15px] font-medium sm:text-sm">Ucapan &amp; doa (opsional)</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis ucapan untuk kedua mempelai…"
            rows={4}
            className="w-full rounded-xl border border-[var(--color-secondary)] bg-white/70 px-4 py-3 text-base text-[var(--color-text)] sm:text-sm"
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-1 inline-flex min-h-12 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 text-base font-medium text-white shadow-sm transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {status === "loading" ? "Mengirim…" : "Kirim Konfirmasi"}
        </button>
      </motion.form>
    </section>
  );
}
