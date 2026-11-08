/** Full class strings per look, so Tailwind can see every one of them. */
export const THEMES = {
  admin: {
    input:
      "mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none",
    label: "text-sm font-medium text-zinc-900",
    hint: "mt-1 text-xs text-zinc-500",
    card: "space-y-4 rounded-xl border border-zinc-200 bg-white p-6",
    heading: "text-sm font-semibold uppercase tracking-wide text-zinc-500",
    choiceOn: "border-zinc-900 bg-zinc-50 font-medium text-zinc-900",
    choiceOff: "border-zinc-200 text-zinc-500",
    checkLabel: "flex items-center gap-2 text-sm text-zinc-900",
    checkbox: "h-4 w-4 accent-zinc-900",
    primary:
      "rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60",
    secondary:
      "rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-60",
  },
  public: {
    input:
      "mt-1.5 w-full rounded-lg border border-[#E8DCC8] bg-white px-3 py-2 text-sm text-[#302C27] placeholder:text-[#B5ACA1] focus:border-[#C9A86A] focus:outline-none",
    label: "text-sm font-medium text-[#302C27]",
    hint: "mt-1 text-xs text-[#81786E]",
    card: "space-y-4 rounded-2xl bg-white p-6 shadow-sm",
    heading: "text-sm font-semibold uppercase tracking-wide text-[#81786E]",
    choiceOn: "border-[#C9A86A] bg-[#FBF7F0] font-medium text-[#302C27]",
    choiceOff: "border-[#E8DCC8] text-[#81786E]",
    checkLabel: "flex items-center gap-2 text-sm text-[#302C27]",
    checkbox: "h-4 w-4 accent-[#C9A86A]",
    primary:
      "rounded-full bg-[#C9A86A] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#b8975a] disabled:opacity-60",
    secondary:
      "rounded-full border border-[#E8DCC8] bg-white px-5 py-3 text-sm font-medium text-[#302C27] transition-colors hover:bg-[#FBF7F0] disabled:opacity-60",
  },
};

export type ThemeName = keyof typeof THEMES;
export type Theme = (typeof THEMES)[ThemeName];
