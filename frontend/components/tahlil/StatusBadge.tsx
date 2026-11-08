import type { TahlilStatus } from "@/types/tahlil";

export const STATUS_LABEL: Record<TahlilStatus, string> = {
  baru: "Baru",
  diproses: "Diproses",
  selesai: "Selesai",
};

const STATUS_CLASS: Record<TahlilStatus, string> = {
  baru: "bg-amber-100 text-amber-800",
  diproses: "bg-sky-100 text-sky-800",
  selesai: "bg-emerald-100 text-emerald-800",
};

export function StatusBadge({ status }: { status: TahlilStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
