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
