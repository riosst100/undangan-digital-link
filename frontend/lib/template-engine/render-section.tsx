import { createElement } from "react";
import type { SectionConfig } from "@/types/template";
import { resolveSectionComponent } from "./registry";

export function RenderSection({
  section,
  content,
}: {
  section: SectionConfig;
  content: unknown;
}) {
  if (!section.enabled) return null;

  const Component = resolveSectionComponent(section.type, section.variant);

  if (!Component) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Unknown section variant: ${section.type}/${section.variant}`);
    }
    return null;
  }

  return createElement(Component, { content });
}
