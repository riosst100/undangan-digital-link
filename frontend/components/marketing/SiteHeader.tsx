import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-cream/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="min-w-0 truncate font-[family-name:var(--font-heading)] text-base font-semibold tracking-tight text-ink min-[380px]:text-lg"
        >
          undangan<span className="text-gold">-digital</span>.link
        </Link>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-3">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-ink transition-colors hover:bg-black/5"
          >
            Masuk
          </Link>
        </nav>
      </div>
    </header>
  );
}
