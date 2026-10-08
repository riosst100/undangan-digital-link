"use client";

import { useEffect, useRef, useState } from "react";
import { createGuest, deleteGuest, listGuests, updateGuest } from "@/lib/api/guestbook";
import { renderGreeting } from "@/lib/greeting-templates";
import type { CustomerInvitation, Guest } from "@/types/guestbook";
import { useAutoSave, type SaveTracker } from "./use-auto-save";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

type Row = { key: string; guest: Guest | null };

let rowSeq = 0;
const draftRow = (): Row => ({ key: `draft-${++rowSeq}`, guest: null });

type Props = {
  invitation: CustomerInvitation;
  coupleNames: string;
  tracker: SaveTracker;
};

export function GuestList({ invitation, coupleNames, tracker }: Props) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const inputs = useRef(new Map<string, HTMLInputElement>());

  useEffect(() => {
    let active = true;
    listGuests(invitation.id)
      .then((guests) => {
        if (active) setRows([...guests.map((guest) => ({ key: guest.id, guest })), draftRow()]);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, [invitation.id]);

  function handleCreated(key: string, guest: Guest) {
    setRows((prev) => {
      if (!prev) return prev;
      const next = prev.map((row) => (row.key === key ? { ...row, guest } : row));
      return next.some((row) => row.guest === null) ? next : [...next, draftRow()];
    });
  }

  function handleDeleted(key: string) {
    setRows((prev) => prev?.filter((row) => row.key !== key) ?? prev);
  }

  function focusNext(key: string) {
    if (!rows) return;
    const index = rows.findIndex((row) => row.key === key);
    const next = rows[index + 1];
    if (next) inputs.current.get(next.key)?.focus();
  }

  const guestCount = rows?.filter((row) => row.guest).length ?? 0;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-medium text-[#302C27]">3. Daftar tamu</h2>
        {rows ? <span className="text-xs text-[#81786E]">{guestCount} tamu</span> : null}
      </div>
      <p className="mt-1 text-xs text-[#81786E]">
        Ketik nama tamu satu per satu, tekan Enter untuk tamu berikutnya. Tersimpan otomatis.
      </p>

      {loadError ? (
        <p className="mt-4 text-sm text-red-600">Gagal memuat daftar tamu. Muat ulang halaman.</p>
      ) : !rows ? (
        <p className="mt-4 text-sm text-[#81786E]">Memuat…</p>
      ) : (
        <ol className="mt-4 space-y-2">
          {rows.map((row, index) => (
            <GuestRow
              key={row.key}
              index={index}
              row={row}
              invitation={invitation}
              coupleNames={coupleNames}
              tracker={tracker}
              inputRef={(el) => {
                if (el) inputs.current.set(row.key, el);
                else inputs.current.delete(row.key);
              }}
              onCreated={handleCreated}
              onDeleted={handleDeleted}
              onEnter={focusNext}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

type RowProps = {
  index: number;
  row: Row;
  invitation: CustomerInvitation;
  coupleNames: string;
  tracker: SaveTracker;
  inputRef: (el: HTMLInputElement | null) => void;
  onCreated: (key: string, guest: Guest) => void;
  onDeleted: (key: string) => void;
  onEnter: (key: string) => void;
};

function GuestRow({ index, row, invitation, coupleNames, tracker, inputRef, onCreated, onDeleted, onEnter }: RowProps) {
  const [name, setName] = useState(row.guest?.name ?? "");
  const [deleting, setDeleting] = useState(false);
  const guestId = useRef(row.guest?.id ?? null);

  const saver = useAutoSave(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (guestId.current) {
      await updateGuest(invitation.id, guestId.current, trimmed);
    } else {
      const guest = await createGuest(invitation.id, trimmed);
      guestId.current = guest.id;
      onCreated(row.key, guest);
    }
  }, tracker);

  async function handleDelete() {
    if (!row.guest || !window.confirm(`Hapus tamu "${name.trim() || row.guest.name}"?`)) return;
    saver.cancel();
    setDeleting(true);
    tracker.begin();
    try {
      await deleteGuest(invitation.id, row.guest.id);
      tracker.end(true);
      onDeleted(row.key);
    } catch {
      tracker.end(false);
      setDeleting(false);
    }
  }

  const displayName = name.trim() || row.guest?.name || "";
  const waHref = row.guest
    ? `https://wa.me/?text=${encodeURIComponent(
        renderGreeting(invitation.share_message ?? "", {
          guestName: displayName,
          coupleNames,
          invitationUrl: `${APP_URL}/${invitation.slug}?to=${encodeURIComponent(row.guest.token)}`,
        }),
      )}`
    : undefined;

  return (
    <li className="flex items-center gap-2">
      <span className="w-6 shrink-0 text-right text-xs text-[#81786E]">{index + 1}.</span>
      <input
        ref={inputRef}
        type="text"
        value={name}
        maxLength={255}
        placeholder={row.guest ? "Nama tamu" : "Tambah nama tamu…"}
        disabled={deleting}
        onChange={(e) => {
          setName(e.target.value);
          saver.queue(e.target.value);
        }}
        onBlur={saver.flush}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            saver.flush();
            onEnter(row.key);
          }
        }}
        className="min-w-0 flex-1 rounded-lg border border-[#E8DCC8] px-3 py-2 text-sm disabled:opacity-50"
      />
      {row.guest?.opened_at ? (
        <span title="Tamu sudah membuka undangan" className="hidden text-xs text-emerald-700 sm:inline">
          Dibuka
        </span>
      ) : null}
      {waHref ? (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Kirim undangan ke ${displayName} lewat WhatsApp`}
          className="shrink-0 rounded-full bg-[#25D366] px-3 py-2 text-xs font-medium text-white hover:bg-[#1ebe5b]"
        >
          WA
        </a>
      ) : (
        <span className="shrink-0 rounded-full bg-black/5 px-3 py-2 text-xs font-medium text-black/30">WA</span>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={!row.guest || deleting}
        aria-label="Hapus tamu"
        className="shrink-0 rounded-full px-2 py-2 text-sm text-[#81786E] hover:bg-black/5 hover:text-red-600 disabled:invisible"
      >
        ✕
      </button>
    </li>
  );
}
