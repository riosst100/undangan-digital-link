"use client";

import type { ReactNode } from "react";
import { MAX_VENUE_LINES, parseGuests, type TahlilFormState } from "./form-state";
import type { Theme } from "./themes";

const EVENT_SUGGESTIONS = [
  "Tahlil 3 Hari",
  "Tahlil 7 Hari",
  "Tahlil 40 Hari",
  "Tahlil 100 Hari",
  "Haul 1 Tahun",
  "Haul 2 Tahun",
  "Tahlil 1000 Hari",
];

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
  const guestCount = parseGuests(form.guests).length;

  return (
    <>
      <section className={theme.card}>
        <h2 className={theme.heading}>Almarhum/ah</h2>

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
            {EVENT_SUGGESTIONS.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </Field>

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
            required
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
