"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api/client";
import { submitTahlilInvitation } from "@/lib/api/tahlil";
import { initialForm, MAX_GUESTS, toSubmissionInput, validateForm, type TahlilFormState } from "./form-state";
import { TahlilFields } from "./TahlilFields";
import { THEMES } from "./themes";
import { useFormDraft } from "./useFormDraft";

const theme = THEMES.public;

/** Public form: sends the data to admins, who review it and send back the PDF. */
export function PublicTahlilForm() {
  const [form, setForm] = useState<TahlilFormState>(initialForm);
  const clearDraft = useFormDraft("draft:undangan-form", form, setForm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof TahlilFormState>(key: K, value: TahlilFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = validateForm(form, MAX_GUESTS.public);
    setError(problem);
    if (problem) return;

    setStatus("sending");
    try {
      await submitTahlilInvitation(toSubmissionInput(form));
      clearDraft();
      setStatus("sent");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengirim. Periksa koneksi Anda lalu coba lagi.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="mt-8 max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="font-[family-name:var(--font-heading)] text-xl font-medium text-[#302C27]">Terima kasih, data terkirim</p>
        <p className="mt-2 text-sm text-[#81786E]">
          Kami akan memeriksa data undangan Anda, lalu mengirim file PDF siap cetak ke WhatsApp{" "}
          <span className="font-medium text-[#302C27]">{form.contact_phone}</span>.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(initialForm());
            setStatus("idle");
          }}
          className={`mt-6 ${theme.secondary}`}
        >
          Kirim data undangan lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
      <TahlilFields form={form} onChange={set} theme={theme} maxGuests={MAX_GUESTS.public} audience="public" />

      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button type="submit" hidden={!form.type} disabled={status === "sending"} className={`w-full ${theme.primary}`}>
        {status === "sending" ? "Mengirim…" : "Kirim data undangan"}
      </button>
    </form>
  );
}
