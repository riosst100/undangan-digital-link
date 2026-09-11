import type { SectionConfig, ThemeTokens } from "./template";

export type TemplatePreview = {
  name: string;
  slug: string;
  sections: SectionConfig[];
  theme: ThemeTokens;
};
