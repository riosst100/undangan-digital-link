"use client";

import type { ReactNode } from "react";
import { eventOptions, INVITATION_TYPES, isDefaultEventName, KHITAN_KINDS, MAX_VENUE_LINES, wordingDefaults, wordingForType, parseGuests, type TahlilFormState } from "./form-state";
import { IllustrationInput } from "./IllustrationInput";
import type { InvitationType, KhitanKind } from "@/types/tahlil";
import type { Theme } from "./themes";


function Field({
  label,
  hint,
  htmlFor,
  theme,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={theme.label}>
        {label}
      </label>
      {children}
      {hint ? <p className={theme.hint}>{hint}</p> : null}
    </div>
  );
}

type Props = {
  form: TahlilFormState;
  onChange: <K extends keyof TahlilFormState>(key: K, value: TahlilFormState[K]) => void;
  theme: Theme;
  maxGuests: number;
  /** Who is filling it in — changes the wording of the contact field. */
  audience: "public" | "admin";
  /** The WhatsApp field is hidden when an admin drafts an invitation without a sender. */
  showContact?: boolean;
};

/** The invitation fields shared by the public form and the admin editor. */
export function TahlilFields({ form, onChange: set, theme, maxGuests, audience, showContact = true }: Props) {
  const female = form.deceased_gender === "P";
  const isTahlil = form.type === "tahlil";
  const current = eventOptions(form.type, form.khitan_kind);

  /** Switch type/kind; the event name follows only while it is still a default. */
  function changeKind(type: InvitationType, kind: KhitanKind) {
    if (isDefaultEventName(form.event_name)) set("event_name", eventOptions(type, kind).defaultName);
    for (const [field, value] of Object.entries(wordingForType(form, type))) set(field as keyof TahlilFormState, value as never);
    set("type", type);
    set("khitan_kind", kind);
  }
  const guestCount = parseGuests(form.guests).length;

  return (
    <>
      <section className={theme.card}>
        <h2 className={theme.heading}>{isTahlil ? "Almarhum/ah" : form.type === "pernikahan" ? "Pernikahan" : "Khitan"}</h2>

        <fieldset>
          <legend className={theme.label}>Jenis undangan</legend>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {INVITATION_TYPES.map((option) => (
              <label
                key={option.value}
                className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm transition-colors ${
                  form.type === option.value ? theme.choiceOn : theme.choiceOff
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={form.type === option.value}
                  onChange={() => changeKind(option.value, form.khitan_kind)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        {form.type === "khitan" ? (
          <fieldset>
            <legend className={theme.label}>Jenis khitan</legend>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {KHITAN_KINDS.map((option) => (
                <label
                  key={option.value}
                  className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm transition-colors ${
                    form.khitan_kind === option.value ? theme.choiceOn : theme.choiceOff
                  }`}
                >
                  <input
                    type="radio"
                    name="khitan_kind"
                    value={option.value}
                    checked={form.khitan_kind === option.value}
                    onChange={() => changeKind("khitan", option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <Field theme={theme} label="Judul undangan" htmlFor="title">
          <input
            id="title"
            required
            maxLength={30}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={theme.input}
          />
        </Field>

        <IllustrationInput
          value={form.illustration}
          onChange={(v) => set("illustration", v)}
          inputClass={theme.input}
          labelClass={theme.label}
          hintClass={theme.hint}
        />

        <Field theme={theme} label="Nama acara" htmlFor="event_name">
          <input
            id="event_name"
            list="event-suggestions"
            required
            maxLength={40}
            value={form.event_name}
            onChange={(e) => set("event_name", e.target.value)}
            className={theme.input}
          />
          <datalist id="event-suggestions">
            {current.suggestions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </Field>

        {isTahlil ? (
          <>
        <fieldset>
          <legend className={theme.label}>Jenis kelamin</legend>
          <div className="mt-1.5 flex gap-2">
            {(
              [
                ["P", "Perempuan (Almh.)"],
                ["L", "Laki-laki (Alm.)"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm transition-colors ${
                  form.deceased_gender === value ? theme.choiceOn : theme.choiceOff
                }`}
              >
                <input
                  type="radio"
                  name="deceased_gender"
                  value={value}
                  checked={form.deceased_gender === value}
                  onChange={() => set("deceased_gender", value)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <Field theme={theme} label="Nama almarhum/ah" htmlFor="deceased_name" hint="Tanpa gelar Alm./Almh., ditambahkan otomatis.">
          <input
            id="deceased_name"
            required
            maxLength={60}
            placeholder="Ibu Tarsem"
            value={form.deceased_name}
            onChange={(e) => set("deceased_name", e.target.value)}
            className={theme.input}
          />
        </Field>

        <Field theme={theme} label={`Nama orang tua (${female ? "binti" : "bin"})`} htmlFor="parent_name" hint="Opsional.">
          <input
            id="parent_name"
            maxLength={60}
            placeholder="Surma (Gandamisastra)"
            value={form.parent_name}
            onChange={(e) => set("parent_name", e.target.value)}
            className={theme.input}
          />
        </Field>
          </>
        ) : null}

        {form.type === "pernikahan" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field theme={theme} label="Mempelai pria" htmlFor="groom_name">
              <input id="groom_name" required maxLength={40} value={form.groom_name} onChange={(e) => set("groom_name", e.target.value)} className={theme.input} />
            </Field>
            <Field theme={theme} label="Mempelai wanita" htmlFor="bride_name">
              <input id="bride_name" required maxLength={40} value={form.bride_name} onChange={(e) => set("bride_name", e.target.value)} className={theme.input} />
            </Field>
          </div>
        ) : null}

        {form.type === "khitan" ? (
          <>
            <Field theme={theme} label="Nama anak yang dikhitan" htmlFor="child_name">
              <input id="child_name" required maxLength={60} value={form.child_name} onChange={(e) => set("child_name", e.target.value)} className={theme.input} />
            </Field>
            <Field theme={theme} label="Nama orang tua (putra dari)" htmlFor="parent_name" hint="Opsional.">
              <input id="parent_name" maxLength={60} value={form.parent_name} onChange={(e) => set("parent_name", e.target.value)} className={theme.input} />
            </Field>
          </>
        ) : null}
      </section>

      <section className={theme.card}>
        <h2 className={theme.heading}>Waktu &amp; tempat</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field theme={theme} label="Tanggal" htmlFor="date" hint="Hari terisi otomatis.">
            <input
              id="date"
              type="date"
              required
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className={theme.input}
            />
          </Field>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Field theme={theme} label="Pukul" htmlFor="time">
              <input
                id="time"
                type="time"
                required
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                className={theme.input}
              />
            </Field>
            <Field theme={theme} label="Zona" htmlFor="timezone">
              <select
                id="timezone"
                value={form.timezone}
                onChange={(e) => set("timezone", e.target.value as TahlilFormState["timezone"])}
                className={theme.input}
              >
                <option>WIB</option>
                <option>WITA</option>
                <option>WIT</option>
              </select>
            </Field>
          </div>
        </div>

        <Field theme={theme} label="Keterangan waktu" htmlFor="time_note" hint="Opsional, contoh: Ba’da Ashar, Ba’da Isya.">
          <input
            id="time_note"
            maxLength={30}
            value={form.time_note}
            onChange={(e) => set("time_note", e.target.value)}
            className={theme.input}
          />
        </Field>

        <Field theme={theme} label="Tempat" htmlFor="venue" hint={`Maksimal ${MAX_VENUE_LINES} baris.`}>
          <textarea
            id="venue"
            required
            rows={2}
            maxLength={150}
            placeholder={"Rumah Almh. Ibu Tarsem\nDesa Tiwulandu RT 02/RW 01"}
            value={form.venue}
            onChange={(e) => set("venue", e.target.value)}
            className={theme.input}
          />
        </Field>
      </section>

      <section className={theme.card}>
        <h2 className={theme.heading}>Pengundang &amp; tamu</h2>

        <Field theme={theme} label="Hormat kami (nama pengundang)" htmlFor="host">
          <input
            id="host"
            required
            maxLength={60}
            placeholder="Bpk Kono - Ibu Tuti"
            value={form.host}
            onChange={(e) => set("host", e.target.value)}
            className={theme.input}
          />
        </Field>

        <Field theme={theme} label="Sapaan untuk tamu" htmlFor="guest_salutation">
          <input
            id="guest_salutation"
            required
            maxLength={30}
            value={form.guest_salutation}
            onChange={(e) => set("guest_salutation", e.target.value)}
            className={theme.input}
          />
        </Field>

        <label className={theme.checkLabel}>
          <input
            type="checkbox"
            checked={form.no_gifts}
            onChange={(e) => set("no_gifts", e.target.checked)}
            className={theme.checkbox}
          />
          Tampilkan “Tidak menerima kondangan”
        </label>

        <Field
          theme={theme}
          label="Nama tamu (opsional)"
          htmlFor="guests"
          hint={`Satu nama per baris, masing-masing dicetak di kotak “Kepada Yth” pada halaman sendiri. Kosongkan untuk satu halaman dengan kotak nama kosong. ${guestCount}/${maxGuests} nama.`}
        >
          <textarea
            id="guests"
            rows={4}
            placeholder={"Bapak H. Ahmad\nKeluarga Bapak Darmaji"}
            value={form.guests}
            onChange={(e) => set("guests", e.target.value)}
            className={theme.input}
          />
        </Field>
      </section>

      <section className={theme.card}>
        <div className="flex items-start justify-between gap-3">
          <h2 className={theme.heading}>Kata-kata surat</h2>
          <button
            type="button"
            onClick={() => {
              for (const [field, value] of Object.entries(wordingDefaults(form.type))) set(field as keyof TahlilFormState, value as never);
            }}
            className="text-xs text-zinc-500 underline-offset-2 hover:underline"
          >
            Kembalikan ke bawaan
          </button>
        </div>
        <p className={theme.hint}>
          Sudah terisi teks bawaan, ubah jika perlu. <code>{"{sapaan}"}</code> akan diganti dengan sapaan tamu.
        </p>

        <Field theme={theme} label="Kalimat pembuka" htmlFor="opening_text" hint="Nama acara dicetak tebal setelah kalimat ini.">
          <textarea id="opening_text" rows={3} maxLength={300} value={form.opening_text} onChange={(e) => set("opening_text", e.target.value)} className={theme.input} />
        </Field>

        <Field theme={theme} label="Kata setelah nama acara" htmlFor="subject_label" hint="Contoh: wafatnya: / pernikahan: / khitanan:. Kosongkan untuk bawaan.">
          <input id="subject_label" maxLength={40} value={form.subject_label} onChange={(e) => set("subject_label", e.target.value)} className={theme.input} />
        </Field>

        <Field theme={theme} label="Pengantar jadwal" htmlFor="schedule_intro">
          <input id="schedule_intro" maxLength={60} value={form.schedule_intro} onChange={(e) => set("schedule_intro", e.target.value)} className={theme.input} />
        </Field>

        <Field theme={theme} label="Kalimat penutup" htmlFor="closing_text">
          <textarea id="closing_text" rows={3} maxLength={300} value={form.closing_text} onChange={(e) => set("closing_text", e.target.value)} className={theme.input} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field theme={theme} label="Salam penutup" htmlFor="salam_text">
            <input id="salam_text" maxLength={60} value={form.salam_text} onChange={(e) => set("salam_text", e.target.value)} className={theme.input} />
          </Field>
          <Field theme={theme} label="Sebelum nama pengundang" htmlFor="signoff_text">
            <input id="signoff_text" maxLength={60} value={form.signoff_text} onChange={(e) => set("signoff_text", e.target.value)} className={theme.input} />
          </Field>
          <Field theme={theme} label="Sapaan di kotak penerima" htmlFor="recipient_label">
            <input id="recipient_label" maxLength={30} value={form.recipient_label} onChange={(e) => set("recipient_label", e.target.value)} className={theme.input} />
          </Field>
          <Field theme={theme} label="Teks tanpa kondangan" htmlFor="no_gifts_text" hint="Tampil jika opsi di atas dicentang.">
            <input id="no_gifts_text" maxLength={40} value={form.no_gifts_text} onChange={(e) => set("no_gifts_text", e.target.value)} className={theme.input} />
          </Field>
        </div>
      </section>

      {showContact ? (
      <section className={theme.card}>
        <h2 className={theme.heading}>Kontak</h2>

        <Field
          theme={theme}
          label="No. WhatsApp"
          htmlFor="contact_phone"
          hint={audience === "public" ? "Undangan PDF akan kami kirim ke nomor ini." : "Nomor pengirim, untuk mengirim PDF."}
        >
          <input
            id="contact_phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required={audience === "public"}
            maxLength={20}
            placeholder="0812 3456 7890"
            value={form.contact_phone}
            onChange={(e) => set("contact_phone", e.target.value)}
            className={theme.input}
          />
        </Field>
      </section>
      ) : null}
    </>
  );
}
