import type { ComponentType } from "react";
import type { SectionType } from "@/types/template";
import { CoverFullscreen, type CoverContent } from "@/components/sections/cover/CoverFullscreen";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SectionComponent = ComponentType<{ content: any }>;

type Registry = Partial<Record<SectionType, Record<string, SectionComponent>>>;

// Single source of truth for which (section type, variant) pairs exist.
// AI-generated and admin-authored template configs are validated against
// this same set (mirrored server-side in backend/config/templates.php).
export const SECTION_REGISTRY: Registry = {
  cover: {
    fullscreen: CoverFullscreen,
  },
};

export function resolveSectionComponent(type: SectionType, variant: string): SectionComponent | null {
  return SECTION_REGISTRY[type]?.[variant] ?? null;
}

export type { CoverContent };
