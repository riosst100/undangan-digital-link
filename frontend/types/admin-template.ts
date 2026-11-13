import type { SectionType, ThemeTokens } from "./template";

export type AdminTemplateSection = {
  type: SectionType;
  variant: string;
  enabled: boolean;
  settings?: Record<string, string | number | boolean>;
};

export type AdminTemplate = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  price: number;
  tier: "standard" | "exclusive";
  thumbnail_url: string | null;
  images: { path: string; url: string }[];
  invitations_count: number | null;
  latest_version: {
    id: string;
    version: number;
    status: string;
    schema: { sections: AdminTemplateSection[] };
  } | null;
  theme: ThemeTokens | null;
  created_at: string;
};

export type CreateTemplateThemeInput = {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  typography: { heading: string; body: string };
  animations: { preset: string };
};

export type CreateTemplateInput = {
  name: string;
  slug: string;
  description?: string;
  price: number;
  tier: "standard" | "exclusive";
  thumbnail_url?: string;
  sections: { type: SectionType; variant: string; enabled: boolean }[];
  theme: CreateTemplateThemeInput;
};

export type UpdateTemplateInput = {
  name?: string;
  description?: string | null;
  price?: number;
  tier?: "standard" | "exclusive";
  is_active?: boolean;
};
