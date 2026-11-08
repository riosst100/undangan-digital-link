import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PublicTahlilForm } from "@/components/tahlil/PublicTahlilForm";

export const metadata = {
  title: "Pesan Undangan Tahlil — undangan-digital.link",
  description: "Isi data acara tahlil, kami siapkan undangan siap cetak ukuran A4 dan kirim lewat WhatsApp. Tanpa daftar.",
};

export default function TahlilInvitationPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#FBF7F0] text-[#302C27]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-medium">Undangan Tahlil</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#81786E]">
          Isi data acara di bawah. Kami akan memeriksa datanya, lalu mengirim undangan siap cetak ukuran A4 ke
          WhatsApp Anda. Tanpa perlu daftar.
        </p>

        <PublicTahlilForm />
      </main>

      <SiteFooter />
    </div>
  );
}
