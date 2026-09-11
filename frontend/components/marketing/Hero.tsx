import Link from "next/link";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <span className="rounded-full bg-[#E8DCC8]/60 px-4 py-1.5 text-xs font-medium tracking-wide text-[#8A6B3E]">
          Undangan digital untuk hari bahagia Anda
        </span>

        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-semibold leading-tight tracking-tight text-[#302C27] sm:text-5xl">
          Undangan pernikahan digital yang cantik, cepat, dan mudah diisi
        </h1>

        <p className="max-w-lg text-base leading-relaxed text-[#81786E]">
          Pilih desain favorit Anda, isi data pernikahan, lalu bagikan lewat WhatsApp
          dalam hitungan menit — tanpa perlu desain sendiri.
        </p>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Link
            href="/register"
            className="rounded-full bg-[#C9A86A] px-7 py-3 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02] hover:bg-[#b89457]"
          >
            Buat Undangan Gratis
          </Link>
          <Link
            href="#katalog"
            className="rounded-full border border-[#302C27]/15 bg-white px-7 py-3 text-sm font-medium text-[#302C27] transition-colors hover:bg-black/5"
          >
            Lihat Semua Desain
          </Link>
        </div>
      </div>
    </section>
  );
}
