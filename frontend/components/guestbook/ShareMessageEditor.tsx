"use client";

import { GREETING_TEMPLATES, findGreetingTemplate } from "@/lib/greeting-templates";

type Props = {
  shareTemplate: string;
  shareMessage: string;
  onChange: (shareTemplate: string, shareMessage: string) => void;
  onBlur: () => void;
};

export function ShareMessageEditor({ shareTemplate, shareMessage, onChange, onBlur }: Props) {
  function handleTemplateChange(key: string) {
    const template = findGreetingTemplate(key);
    const isEdited = shareMessage !== findGreetingTemplate(shareTemplate)?.message;
    if (isEdited && !window.confirm("Ganti ucapan? Perubahan teks yang sudah Anda buat akan diganti.")) return;
    onChange(key, template?.message ?? shareMessage);
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <label htmlFor="share-template" className="text-sm font-medium text-[#302C27]">
        2. Pilih ucapan
      </label>
      <select
        id="share-template"
        value={shareTemplate}
        onChange={(e) => handleTemplateChange(e.target.value)}
        onBlur={onBlur}
        className="mt-2 w-full rounded-lg border border-[#E8DCC8] bg-white px-3 py-2 text-sm"
      >
        {GREETING_TEMPLATES.map((template) => (
          <option key={template.key} value={template.key}>
            {template.label}
          </option>
        ))}
      </select>

      <textarea
        aria-label="Teks ucapan"
        value={shareMessage}
        onChange={(e) => onChange(shareTemplate, e.target.value)}
        onBlur={onBlur}
        rows={10}
        className="mt-3 w-full rounded-lg border border-[#E8DCC8] px-3 py-2 text-sm leading-relaxed"
      />
      <p className="mt-1 text-xs text-[#81786E]">
        Teks boleh diubah. <code>{"{nama_tamu}"}</code>, <code>{"{mempelai}"}</code>, dan{" "}
        <code>{"{link_undangan}"}</code> akan diganti otomatis untuk tiap tamu.
      </p>
    </section>
  );
}
