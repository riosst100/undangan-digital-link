"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateShareMessage } from "@/lib/api/guestbook";
import { DEFAULT_GREETING_KEY, findGreetingTemplate } from "@/lib/greeting-templates";
import type { CustomerInvitation } from "@/types/guestbook";
import { GuestList } from "./GuestList";
import { ShareMessageEditor } from "./ShareMessageEditor";
import { useAutoSave, useSaveTracker, type SaveStatus } from "./use-auto-save";

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: "Perubahan tersimpan otomatis",
  saving: "Menyimpan…",
  saved: "Semua perubahan tersimpan",
  error: "Gagal menyimpan — periksa koneksi Anda",
};

export function coupleNames(invitation: CustomerInvitation): string {
  const groom = invitation.couple?.groom_nickname || invitation.couple?.groom_name;
  const bride = invitation.couple?.bride_nickname || invitation.couple?.bride_name;
  return groom && bride ? `${groom} & ${bride}` : groom || bride || invitation.slug;
}

function withShareDefaults(invitation: CustomerInvitation): CustomerInvitation {
  const shareTemplate = invitation.share_template ?? DEFAULT_GREETING_KEY;
  return {
    ...invitation,
    share_template: shareTemplate,
    share_message: invitation.share_message ?? findGreetingTemplate(shareTemplate)?.message ?? "",
  };
}

type Props = {
  invitations: CustomerInvitation[];
  initialInvitationId?: string;
};

export function GuestbookManager({ invitations: initialInvitations, initialInvitationId }: Props) {
  const router = useRouter();
  const { status, tracker } = useSaveTracker();
  const [invitations, setInvitations] = useState(() => initialInvitations.map(withShareDefaults));
  const [selectedId, setSelectedId] = useState(
    () => invitations.find((inv) => inv.id === initialInvitationId)?.id ?? invitations[0]?.id ?? "",
  );

  const shareSaver = useAutoSave(
    ({ id, shareTemplate, shareMessage }: { id: string; shareTemplate: string; shareMessage: string }) =>
      updateShareMessage(id, { shareTemplate, shareMessage }).then(() => undefined),
    tracker,
    800,
  );

  const selected = invitations.find((inv) => inv.id === selectedId);

  if (invitations.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-[#81786E]">Anda belum memiliki undangan. Buat undangan terlebih dahulu.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-[#C9A86A] px-5 py-2 text-sm font-medium text-white"
        >
          Pilih Desain Undangan
        </Link>
      </div>
    );
  }

  function handleSelect(id: string) {
    shareSaver.flush();
    setSelectedId(id);
    router.replace(`/buku-tamu?undangan=${encodeURIComponent(id)}`, { scroll: false });
  }

  function handleShareChange(shareTemplate: string, shareMessage: string) {
    if (!selected) return;
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === selected.id ? { ...inv, share_template: shareTemplate, share_message: shareMessage } : inv,
      ),
    );
    shareSaver.queue({ id: selected.id, shareTemplate, shareMessage });
  }

  return (
    <div className="mt-8 space-y-6">
      <p
        aria-live="polite"
        className={`text-xs ${status === "error" ? "text-red-600" : "text-[#81786E]"}`}
      >
        {STATUS_LABEL[status]}
      </p>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <label htmlFor="invitation" className="text-sm font-medium text-[#302C27]">
          1. Pilih undangan
        </label>
        <select
          id="invitation"
          value={selectedId}
          onChange={(e) => handleSelect(e.target.value)}
          className="mt-2 w-full rounded-lg border border-[#E8DCC8] bg-white px-3 py-2 text-sm"
        >
          {invitations.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {coupleNames(inv)} — /{inv.slug}
            </option>
          ))}
        </select>
        {selected && selected.status !== "published" ? (
          <p className="mt-2 text-xs text-amber-700">
            Undangan ini belum dipublikasikan — tamu belum bisa membuka link undangan.
          </p>
        ) : null}
      </section>

      {selected ? (
        <>
          <ShareMessageEditor
            key={`share-${selected.id}`}
            shareTemplate={selected.share_template ?? DEFAULT_GREETING_KEY}
            shareMessage={selected.share_message ?? ""}
            onChange={handleShareChange}
            onBlur={shareSaver.flush}
          />
          <GuestList
            key={`guests-${selected.id}`}
            invitation={selected}
            coupleNames={coupleNames(selected)}
            tracker={tracker}
          />
        </>
      ) : null}
    </div>
  );
}
