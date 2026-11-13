import Link from "next/link";

const HIGHLIGHTS = ["Siap dibagikan via WhatsApp", "RSVP & ucapan tamu", "Nama tamu otomatis"];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[480px] w-[min(900px,140vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(201,168,106,0.22),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pb-20 sm:pt-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center sm:gap-6">
          <span className="rounded-full bg-beige/60 px-4 py-1.5 text-xs font-medium tracking-wide text-gold-deep">
            Undangan digital untuk hari bahagia Anda
          </span>

          <h1 className="font-[family-name:var(--font-heading)] text-[clamp(2rem,8.5vw,3.5rem)] font-semibold leading-[1.15] tracking-tight text-ink [text-wrap:balance]">
            Undangan pernikahan digital yang cantik, cepat, dan mudah diisi
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-stone sm:text-lg">
            Pilih desain favorit Anda, isi data pernikahan, lalu bagikan lewat WhatsApp
            dalam hitungan menit — tanpa perlu desain sendiri.
          </p>

          <div className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-7 text-base font-medium text-white shadow-sm transition hover:bg-gold-deep active:scale-[0.98]"
            >
              Buat Undangan Gratis
            </Link>
            <Link
              href="#katalog"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink/15 bg-white px-7 text-base font-medium text-ink transition-colors hover:bg-black/5"
            >
              Lihat Semua Desain
            </Link>
          </div>

          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 pt-2 text-sm text-stone">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <span aria-hidden className="text-gold">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
