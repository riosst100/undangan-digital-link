"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { exportTahlilCsv, importTahlilCsv, type CsvImportResult } from "@/lib/api/tahlil";
import type { TahlilStatus } from "@/types/tahlil";

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const button = "rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50 disabled:opacity-60";

/** Export the invitations list to CSV and import it back (rows with an id are updated). */
export function CsvTools({ status }: { status: TahlilStatus | null }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"export" | "template" | "import" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);

  async function download(template: boolean) {
    setBusy(template ? "template" : "export");
    setError(null);
    try {
      const { blob, filename } = await exportTahlilCsv({ status, template });
      saveBlob(blob, filename ?? (template ? "template-undangan-hvs.csv" : "undangan-hvs.csv"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengunduh CSV.");
    } finally {
      setBusy(null);
    }
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy("import");
    setError(null);
    setResult(null);
    try {
      setResult(await importTahlilCsv(file));
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengimpor CSV.");
    } finally {
      setBusy(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => download(false)} disabled={busy !== null} className={button}>
          {busy === "export" ? "Mengekspor…" : "Ekspor CSV"}
        </button>
        <button type="button" onClick={() => fileInput.current?.click()} disabled={busy !== null} className={button}>
          {busy === "import" ? "Mengimpor…" : "Impor CSV"}
        </button>
        <button type="button" onClick={() => download(true)} disabled={busy !== null} className="px-2 py-2 text-sm text-zinc-500 underline-offset-2 hover:underline">
          Unduh template
        </button>
        <input ref={fileInput} type="file" accept=".csv,text/csv" hidden onChange={(e) => void upload(e.target.files?.[0])} />
      </div>

      {error ? (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {result ? (
        <div role="status" className="mt-3 rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          <p>
            Impor selesai: <strong>{result.created}</strong> dibuat, <strong>{result.updated}</strong> diperbarui
            {result.errors.length ? `, ${result.errors.length} baris gagal.` : "."}
          </p>
          {result.errors.length ? (
            <ul className="mt-2 list-disc pl-5 text-red-700">
              {result.errors.map((item) => (
                <li key={`${item.row}-${item.message}`}>
                  Baris {item.row}: {item.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
