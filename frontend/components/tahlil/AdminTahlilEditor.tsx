"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { deleteTahlilSubmission, previewTahlilPdf, updateTahlilSubmission } from "@/lib/api/tahlil";
import type { TahlilStatus, TahlilSubmission } from "@/types/tahlil";
import {
  formFromSubmission,
  initialForm,
  MAX_GUESTS,
  toInvitationInput,
  toSubmissionInput,
  validateForm,
  waNumber,
  type TahlilFormState,
} from "./form-state";
import { STATUS_LABEL } from "./StatusBadge";
import { TahlilFields } from "./TahlilFields";
import { THEMES } from "./themes";

const theme = THEMES.admin;

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

/**
 * Admin view of one submission (or a blank draft when `submission` is
 * omitted): edit the data, preview the PDF from the current fields, save,
 * download, and message the sender on WhatsApp.
 */
export function AdminTahlilEditor({ submission }: { submission?: TahlilSubmission }) {
  const router = useRouter();
  const [form, setForm] = useState<TahlilFormState>(() => (submission ? formFromSubmission(submission) : initialForm()));
  const [status, setStatus] = useState<TahlilStatus>(submission?.status ?? "baru");
  const [saved, setSaved] = useState(() => JSON.stringify({ form, status }));
  const [busy, setBusy] = useState<"preview" | "save" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pdf, setPdf] = useState<{ url: string; filename: string } | null>(null);

  const dirty = submission !== undefined && JSON.stringify({ form, status }) !== saved;

  // Release the previous preview's object URL whenever it's replaced or the page unmounts.
  useEffect(() => {
    return () => {
      if (pdf) URL.revokeObjectURL(pdf.url);
    };
  }, [pdf]);

  async function renderPreview(current: TahlilFormState) {
    const problem = validateForm(current, MAX_GUESTS.admin);
    if (problem) {
      setError(problem);
      return;
    }

    setBusy("preview");
    setError(null);
    try {
      const { blob, filename } = await previewTahlilPdf(toInvitationInput(current));
      setPdf({ url: URL.createObjectURL(blob), filename: filename ?? "undangan-tahlil.pdf" });
    } catch (err) {
      setError(errorMessage(err, "Gagal membuat PDF. Periksa koneksi lalu coba lagi."));
    } finally {
      setBusy(null);
    }
  }

  // Show the saved submission's PDF straight away when opening it.
  const previewedOnOpen = useRef(false);
  useEffect(() => {
    if (submission && !previewedOnOpen.current) {
      previewedOnOpen.current = true;
      void renderPreview(formFromSubmission(submission));
    }
    // Runs once per opened submission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission?.id]);

  function set<K extends keyof TahlilFormState>(key: K, value: TahlilFormState[K]) {
    setNotice(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!submission) {
      await renderPreview(form);
      return;
    }

    const problem = validateForm(form, MAX_GUESTS.admin);
    if (problem) {
      setError(problem);
      return;
    }

    setBusy("save");
    setError(null);
    try {
      const updated = await updateTahlilSubmission(submission.id, { ...toSubmissionInput(form), status });
      const next = formFromSubmission(updated);
      setForm(next);
      setSaved(JSON.stringify({ form: next, status: updated.status }));
      setNotice("Perubahan tersimpan.");
      router.refresh();
      void renderPreview(next);
    } catch (err) {
      setError(errorMessage(err, "Gagal menyimpan. Periksa koneksi lalu coba lagi."));
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!submission || !window.confirm("Hapus data undangan ini? Tindakan ini tidak bisa dibatalkan.")) return;

    setBusy("delete");
    try {
      await deleteTahlilSubmission(submission.id);
      router.push("/admin/undangan-tahlil");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err, "Gagal menghapus. Coba lagi."));
      setBusy(null);
    }
  }

  const waText = encodeURIComponent(
    `Assalamu’alaikum, berikut undangan ${form.event_name} ${form.deceased_gender === "P" ? "Almh." : "Alm."} ${form.deceased_name}.`,
  );

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form onSubmit={handleSave} className="space-y-6">
        {submission ? (
          <section className={theme.card}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <label htmlFor="status" className={theme.label}>
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => {
                    setNotice(null);
                    setStatus(e.target.value as TahlilStatus);
                  }}
                  className={theme.input}
                >
                  {(Object.keys(STATUS_LABEL) as TahlilStatus[]).map((value) => (
                    <option key={value} value={value}>
                      {STATUS_LABEL[value]}
                    </option>
                  ))}
                </select>
              </div>
              <a
                href={`https://wa.me/${waNumber(form.contact_phone)}?text=${waText}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
              >
                WhatsApp {form.contact_phone}
              </a>
            </div>
          </section>
        ) : null}

        <TahlilFields
          form={form}
          onChange={set}
          theme={theme}
          maxGuests={MAX_GUESTS.admin}
          audience="admin"
          showContact={submission !== undefined}
        />

        {error ? (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
          </p>
        ) : null}

        <div className="sticky bottom-0 -mx-1 flex flex-wrap gap-2 bg-zinc-50/95 px-1 py-3 backdrop-blur-sm">
          {submission ? (
            <>
              <button type="submit" disabled={busy !== null || !dirty} className={theme.primary}>
                {busy === "save" ? "Menyimpan…" : dirty ? "Simpan perubahan" : "Tersimpan"}
              </button>
              <button
                type="button"
                onClick={() => renderPreview(form)}
                disabled={busy !== null}
                className={theme.secondary}
              >
                {busy === "preview" ? "Membuat PDF…" : "Preview PDF"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy !== null}
                className="ml-auto rounded-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                {busy === "delete" ? "Menghapus…" : "Hapus"}
              </button>
            </>
          ) : (
            <button type="submit" disabled={busy !== null} className={`w-full ${theme.primary}`}>
              {busy === "preview" ? "Membuat PDF…" : pdf ? "Perbarui PDF" : "Buat PDF"}
            </button>
          )}
        </div>
      </form>

      <section className="flex min-h-[28rem] flex-col rounded-xl border border-zinc-200 bg-white p-4 lg:sticky lg:top-8 lg:h-[calc(100dvh-4rem)]">
        {pdf ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
              <div>
                <p className="text-sm font-medium text-zinc-900">Preview PDF</p>
                {dirty ? <p className="text-xs text-amber-700">Ada perubahan yang belum disimpan.</p> : null}
              </div>
              <div className="flex gap-2">
                <a
                  href={pdf.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50"
                >
                  Buka
                </a>
                <a
                  href={pdf.url}
                  download={pdf.filename}
                  className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                >
                  Unduh PDF
                </a>
              </div>
            </div>
            <iframe src={pdf.url} title="Preview undangan" className="w-full flex-1 rounded-lg border border-zinc-200" />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500">
            {busy === "preview" ? "Membuat PDF…" : "Preview PDF akan tampil di sini."}
          </div>
        )}
      </section>
    </div>
  );
}
