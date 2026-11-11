"use client";

import { useState } from "react";

const MAX_SIDE = 1000;

/** Downscale in the browser so the stored/sent image stays small (a few hundred KB). */
function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas"));
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  labelClass: string;
  hintClass: string;
};

/** Optional illustration upload; without a file the cover has no illustration. */
export function IllustrationInput({ value, onChange, inputClass, labelClass, hintClass }: Props) {
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (PNG/JPG).");
      return;
    }
    try {
      onChange(await toDataUrl(file));
    } catch {
      setError("Gambar tidak bisa dibaca. Coba file lain.");
    }
  }

  return (
    <div>
      <label htmlFor="illustration" className={labelClass}>
        Ilustrasi (opsional)
      </label>
      <input
        id="illustration"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
        className={inputClass}
      />
      <p className={hintClass}>Tampil di cover, di bawah judul. Kosongkan jika tidak perlu.</p>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      {value ? (
        <div className="mt-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Pratinjau ilustrasi" className="h-20 max-w-[12rem] rounded border border-zinc-200 object-contain" />
          <button type="button" onClick={() => onChange("")} className="text-sm text-red-600 underline-offset-2 hover:underline">
            Hapus
          </button>
        </div>
      ) : null}
    </div>
  );
}
