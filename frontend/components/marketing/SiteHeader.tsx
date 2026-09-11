import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-[#FBF7F0]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight text-[#302C27]"
        >
          undangan-digital.link
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-[#302C27] transition-colors hover:bg-black/5 sm:inline-block"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#302C27] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4a4339] sm:px-5"
          >
            Buat Undangan
          </Link>
        </nav>
      </div>
    </header>
  );
}
