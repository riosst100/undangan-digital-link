// Only lists section types that have a real component in
// lib/template-engine/registry.ts. Mirrors backend/config/templates.php —
// keep both in lockstep; the backend is the actual security boundary, this
// is just what the admin form offers.
export const SECTION_TYPES = [
  "cover",
  "couple",
  "event",
  "story",
  "gallery",
  "rsvp",
  "gift",
  "quote",
  "guest_greeting",
  "closing",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_VARIANTS: Record<SectionType, string[]> = {
  cover: ["fullscreen", "minimal", "arch"],
  couple: ["classic", "split", "overlap"],
  event: ["card", "timeline", "ornate"],
  story: ["timeline"],
  gallery: ["grid", "masonry"],
  rsvp: ["form"],
  gift: ["default"],
  quote: ["default"],
  guest_greeting: ["default"],
  closing: ["default"],
};

// Mirrors backend/config/templates.php `fonts` and `animation_presets`.
export const FONTS = [
  "Playfair Display",
  "Cormorant Garamond",
  "Inter",
  "Poppins",
  "EB Garamond",
  "Marcellus",
] as const;

export const ANIMATION_PRESETS = [
  "fade",
  "fade-up",
  "fade-down",
  "fade-left",
  "fade-right",
  "zoom",
  "scale",
  "blur",
  "slide",
  "parallax",
] as const;

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
  /** Optional CSS background-image (gradient) applied behind the whole invitation, layered over `colors.background`. */
  backgroundImage?: string;
};
