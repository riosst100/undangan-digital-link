export function formatIdr(amount: number): string {
  if (amount === 0) return "Gratis";

  return formatIdrAmount(amount);
}

/** Like formatIdr, but always renders the currency amount — never "Gratis"
 * for zero. Use for totals/sums (e.g. sales) where zero means "none yet",
 * not "free". */
export function formatIdrAmount(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}
