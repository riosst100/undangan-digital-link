export const SECTION_TYPES = [
  "cover",
  "couple",
  "story",
  "event",
  "gallery",
  "rsvp",
  "gift",
  "music",
  "quote",
  "closing",
  "guest_greeting",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

// Mirrors backend/config/templates.php `variants`. This is a UX allowlist
// only (limits what the form offers) — the backend re-validates against its
// own copy and is the actual security boundary. Keep both in sync.
export const SECTION_VARIANTS: Record<SectionType, string[]> = {
  cover: ["fullscreen", "minimal", "split"],
  couple: ["classic", "editorial", "split"],
  story: ["timeline", "cards"],
  event: ["card", "minimal", "timeline"],
  gallery: ["masonry", "grid", "carousel"],
  rsvp: ["form", "simple"],
  gift: ["default", "tabs"],
  music: ["player-minimal", "player-floating"],
  quote: ["default"],
  closing: ["default", "signature"],
  guest_greeting: ["default"],
};

export type SectionConfig = {
  type: SectionType;
  variant: string;
  enabled: boolean;
  settings?: Record<string, string | number | boolean>;
};

export type TemplateConfig = {
  name: string;
  version: number;
  sections: SectionConfig[];
};

export type ThemeTokens = {
  name: string;
  version: number;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  typography: {
    heading: string;
    body: string;
  };
  spacing?: { unit: number };
  radius?: { card?: string; button?: string };
  shadows?: { card?: string };
  animations?: { preset?: string };
};
