import type { SectionType } from "@/types/template";

/**
 * Placeholder couple/event data used to render a template demo preview
 * (admin "Lihat Demo" link) without needing a real published Invitation.
 * Shaped exactly like the `content` map InvitationController@show returns,
 * keyed by section type, so each section component receives the same shape
 * it would from a real invitation.
 */
export const DUMMY_INVITATION_CONTENT: Record<SectionType, unknown> = {
  cover: {
    brideNickname: "Sinta",
    groomNickname: "Andy",
    eventDate: "12 Desember 2026",
    guestName: "Tamu Undangan",
    coverPhotoUrl: "https://images.unsplash.com/photo-1522231192900-4fbd354ff773?auto=format&fit=crop&w=1200&q=80",
  },
  couple: {
    bride: {
      name: "Sinta Wijaya",
      nickname: "Sinta",
      parents: "Putri dari Bapak Hendra & Ibu Rina",
      bio: "Anak kedua dari dua bersaudara.",
      photoUrl: "https://images.unsplash.com/photo-1700811489534-cef63289689d?auto=format&fit=crop&w=800&q=80",
    },
    groom: {
      name: "Andy Saputra",
      nickname: "Andy",
      parents: "Putra dari Bapak Bambang & Ibu Wati",
      bio: "Anak pertama dari tiga bersaudara.",
      photoUrl: "https://images.unsplash.com/photo-1732159488321-ffa71052091e?auto=format&fit=crop&w=800&q=80",
    },
  },
  event: {
    events: [
      {
        type: "akad",
        title: "Akad Nikah",
        date: "12 Desember 2026",
        startTime: "08:00",
        endTime: "10:00",
        venueName: "Masjid Al-Ikhlas",
        address: "Jl. Merdeka No. 10, Jakarta",
        mapsUrl: "https://maps.google.com",
      },
      {
        type: "resepsi",
        title: "Resepsi",
        date: "12 Desember 2026",
        startTime: "11:00",
        endTime: "14:00",
        venueName: "Gedung Serbaguna Melati",
        address: "Jl. Merdeka No. 12, Jakarta",
        mapsUrl: "https://maps.google.com",
      },
    ],
  },
  story: {
    title: "Kisah Kami",
    items: [
      { year: "2021", title: "Pertemuan Pertama", description: "Bertemu di kampus saat masa orientasi." },
      { year: "2023", title: "Mulai Dekat", description: "Sering mengerjakan tugas bersama hingga akhirnya dekat." },
      { year: "2025", title: "Lamaran", description: "Andy melamar Sinta di depan keluarga besar." },
    ],
  },
  gallery: {
    items: [
      {
        caption: "Foto 1",
        url: "https://images.unsplash.com/photo-1670529776180-60e4132ab90c?auto=format&fit=crop&w=800&q=80",
      },
      {
        caption: "Foto 2",
        url: "https://images.unsplash.com/photo-1751257547111-9641cb540f4d?auto=format&fit=crop&w=800&q=80",
      },
      {
        caption: "Foto 3",
        url: "https://images.unsplash.com/reserve/xd45Y326SvKzSR3Nanc8_MRJ_8125-1.jpg?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  rsvp: {
    invitationSlug: "demo",
    guestToken: null,
  },
  gift: {
    accounts: [
      { bankName: "Bank Contoh", accountNumber: "1234567890", accountHolder: "Andy Saputra" },
    ],
  },
  quote: {
    text: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup agar kamu merasa tenteram kepadanya.",
  },
  guest_greeting: {
    guestName: "Tamu Undangan",
  },
  closing: {
    brideNickname: "Sinta",
    groomNickname: "Andy",
  },
};
