import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="pb-safe border-t border-black/5 pt-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6">
        <p className="font-[family-name:var(--font-heading)] text-lg font-semibold text-ink">
          undangan<span className="text-gold">-digital</span>.link
        </p>
        <nav className="flex flex-wrap justify-center gap-x-2 text-sm text-stone">
          <Link href="/#katalog" className="inline-flex min-h-11 items-center px-2 hover:text-ink">Katalog</Link>
          <Link href="/login" className="inline-flex min-h-11 items-center px-2 hover:text-ink">Masuk</Link>
        </nav>
        <p className="text-xs text-pebble">© {new Date().getFullYear()} undangan-digital.link. Semua hak dilindungi.</p>
      </div>
    </footer>
  );
}
