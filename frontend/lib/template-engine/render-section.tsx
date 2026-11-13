import { createElement } from "react";
import type { SectionConfig } from "@/types/template";
import { resolveSectionComponent } from "./registry";
import { ContainerBlock } from "@/components/sections/container/ContainerBlock";
import { ElementOverrides } from "./element-overrides";

export function RenderSection({
  section,
  content,
  editor = false,
}: {
  section: SectionConfig;
  content: unknown;
  /** Builder mode: tags every element for selection even without overrides. */
  editor?: boolean;
}) {
  if (!section.enabled) return null;

  if (section.type === "spacer") {
    const height = Number(section.settings?.height ?? 40);
    return (
      <div
        aria-hidden
        style={{
          height: Math.max(0, Math.min(600, height)),
          ...(editor
            ? { backgroundImage: "repeating-linear-gradient(45deg, rgba(59,130,246,.12) 0 6px, transparent 6px 12px)" }
            : null),
        }}
      />
    );
  }

  const isContainer = section.type === "container";
  const Component = isContainer ? null : resolveSectionComponent(section.type, section.variant);

  if (!Component && !isContainer) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Unknown section variant: ${section.type}/${section.variant}`);
    }
    return null;
  }

  const st = section.settings ?? {};
  const num = (v: unknown) => (typeof v === "number" ? v : 0);
  const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
  const align = st.align === "left" || st.align === "center" || st.align === "right" ? st.align : undefined;
  const shape = str(st.shape);
  const boxed = st.container === "boxed";
  const bgImage = str(st.bgImage);
  const bgColor = str(st.bgColor);
  const hasElements = editor || Object.keys(st).some((k) => k.startsWith("el.") || k.startsWith("ct."));
  const hasLayout =
    align || shape || boxed || bgImage || bgColor ||
    hasElements || num(st.paddingTop) || num(st.paddingBottom) || num(st.offsetX) || num(st.offsetY);
  const inner = Component ? createElement(Component, { content }) : <ContainerBlock settings={st} />;
  const element = hasElements ? <ElementOverrides settings={st} editor={editor}>{inner}</ElementOverrides> : inner;
  if (!hasLayout) return element;

  const radius = { rounded: "32px", pill: "9999px", arch: "9999px 9999px 0 0" }[shape ?? ""] ;

  return (
    <div
      data-text-align={align}
      style={{
        paddingTop: num(st.paddingTop) || undefined,
        paddingBottom: num(st.paddingBottom) || undefined,
        transform: num(st.offsetX) || num(st.offsetY) ? `translate(${num(st.offsetX)}px, ${num(st.offsetY)}px)` : undefined,
        backgroundColor: bgColor,
        backgroundImage: bgImage ? `url("${bgImage.replace(/"/g, "%22")}")` : undefined,
        backgroundPosition: str(st.bgPosition) ?? "center",
        backgroundSize: str(st.bgSize) ?? "cover",
        backgroundRepeat: "no-repeat",
        borderRadius: radius,
        overflow: radius ? "hidden" : undefined,
        maxWidth: boxed ? 960 : undefined,
        marginInline: boxed ? "auto" : undefined,
      }}
    >
      {element}
    </div>
  );
}
