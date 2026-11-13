import type { SectionConfig } from "@/types/template";
import { RenderSection } from "./render-section";

/** Sections always stack vertically, one full-width row each. */
export function RenderSections({
  sections,
  getContent,
}: {
  sections: SectionConfig[];
  getContent: (section: SectionConfig) => unknown;
}) {
  return (
    <>
      {sections.map((section, index) => (
        <RenderSection key={`${section.type}-${index}`} section={section} content={getContent(section)} />
      ))}
    </>
  );
}
