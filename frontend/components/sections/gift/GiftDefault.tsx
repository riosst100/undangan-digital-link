"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/sections/SectionHeading";

export type GiftContent = {
  accounts: { bankName: string; accountNumber: string; accountHolder: string; qrisUrl?: string }[];
};

function AccountCard({ account }: { account: GiftContent["accounts"][number] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — no-op, number is still visible to copy manually
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-5 text-center shadow-[var(--shadow-card)]">
      <p className="text-[15px] sm:text-sm font-medium">{account.bankName}</p>
      <p className="mt-1 select-all break-all text-xl tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
        {account.accountNumber}
      </p>
      <p className="text-[15px] sm:text-sm text-[var(--color-muted)]">a.n. {account.accountHolder}</p>
      {account.qrisUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img loading="lazy" decoding="async" src={account.qrisUrl} alt="QRIS" className="mx-auto mt-3 h-32 w-32 object-contain" />
      ) : null}
      <button
        type="button"
        onClick={handleCopy}
        aria-live="polite"
        className={`mt-4 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-button)] border px-6 text-sm font-medium transition-colors active:scale-95 ${copied ? "border-transparent bg-[var(--color-primary)] text-white" : "border-[var(--color-primary)] text-[var(--color-primary)]"}`}
      >
        {copied ? "✓ Tersalin" : "Salin Nomor"}
      </button>
    </div>
  );
}

export function GiftDefault({ content }: { content: GiftContent }) {
  if (content.accounts.length === 0) return null;

  return (
    <section className="px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-sm"
      >
        <SectionHeading eyebrow="Wedding Gift" title="Tanda Kasih" />
        <div className="flex flex-col gap-3">
          {content.accounts.map((account, index) => (
            <AccountCard key={index} account={account} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
