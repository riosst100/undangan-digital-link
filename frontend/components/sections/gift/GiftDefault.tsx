"use client";

import { useState } from "react";
import { motion } from "framer-motion";

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
      <p className="text-sm font-medium">{account.bankName}</p>
      <p className="mt-1 text-lg tracking-wide" style={{ fontFamily: "var(--font-heading)" }}>
        {account.accountNumber}
      </p>
      <p className="text-sm text-[var(--color-muted)]">a.n. {account.accountHolder}</p>
      {account.qrisUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={account.qrisUrl} alt="QRIS" className="mx-auto mt-3 h-32 w-32 object-contain" />
      ) : null}
      <button
        type="button"
        onClick={handleCopy}
        className="mt-3 rounded-[var(--radius-button)] border border-[var(--color-primary)] px-4 py-1.5 text-xs font-medium text-[var(--color-primary)]"
      >
        {copied ? "Tersalin" : "Salin Nomor"}
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
        <h2 className="mb-6 text-center text-xl" style={{ fontFamily: "var(--font-heading)" }}>
          Tanda Kasih
        </h2>
        <div className="flex flex-col gap-3">
          {content.accounts.map((account, index) => (
            <AccountCard key={index} account={account} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
