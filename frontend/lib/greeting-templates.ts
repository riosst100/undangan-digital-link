/**
 * WhatsApp message templates for the buku tamu share button. Placeholders
 * are replaced per guest by renderGreeting():
 *   {nama_tamu}      guest name
 *   {mempelai}       "Groom & Bride"
 *   {link_undangan}  personal invitation link (?to=<guest token>)
 */
export type GreetingTemplate = { key: string; label: string; message: string };

const COMMON_BODY = `Kepada Yth.
Bapak/Ibu/Saudara/i
*{nama_tamu}*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:

*{mempelai}*

Berikut link undangan kami untuk info lengkap dari acara:
{link_undangan}

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

Mohon maaf perihal undangan hanya dibagikan melalui pesan ini.

Terima kasih banyak atas perhatiannya.`;

export const GREETING_TEMPLATES: GreetingTemplate[] = [
  {
    key: "pernikahan_muslim",
    label: "Undangan Pernikahan - Muslim",
    message: `Assalamu'alaikum Warahmatullahi Wabarakatuh\n\n${COMMON_BODY}\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh`,
  },
  {
    key: "pernikahan_kristen",
    label: "Undangan Pernikahan - Kristen",
    message: `Salam sejahtera dalam kasih Tuhan Yesus Kristus.\n\n${COMMON_BODY}\n\nTuhan Yesus memberkati.`,
  },
  {
    key: "pernikahan_katolik",
    label: "Undangan Pernikahan - Katolik",
    message: `Salam damai dalam Kristus.\n\n${COMMON_BODY}\n\nBerkah Dalem.`,
  },
  {
    key: "pernikahan_hindu",
    label: "Undangan Pernikahan - Hindu",
    message: `Om Swastiastu\n\n${COMMON_BODY}\n\nOm Shanti Shanti Shanti Om`,
  },
  {
    key: "pernikahan_buddha",
    label: "Undangan Pernikahan - Buddha",
    message: `Namo Buddhaya\n\n${COMMON_BODY}\n\nSemoga semua makhluk hidup berbahagia. Sadhu, sadhu, sadhu.`,
  },
  {
    key: "pernikahan_umum",
    label: "Undangan Pernikahan - Umum",
    message: `Halo!\n\n${COMMON_BODY}\n\nSalam hangat,\n{mempelai}`,
  },
];

export const DEFAULT_GREETING_KEY = "pernikahan_umum";

export function findGreetingTemplate(key: string | null | undefined): GreetingTemplate | undefined {
  return GREETING_TEMPLATES.find((template) => template.key === key);
}

export function renderGreeting(
  message: string,
  values: { guestName: string; coupleNames: string; invitationUrl: string },
): string {
  return message
    .replaceAll("{nama_tamu}", values.guestName)
    .replaceAll("{mempelai}", values.coupleNames)
    .replaceAll("{link_undangan}", values.invitationUrl);
}
