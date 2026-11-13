import { FloralDivider } from "@/components/decor/Ornaments";

/** Shared section title so every invitation section reads as one consistent design. */
export function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="mb-10 flex flex-col items-center gap-2 text-center">
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-primary)]">{eyebrow}</p>
      ) : null}
      <h2
        className="text-[clamp(1.75rem,7vw,2.25rem)] leading-tight"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h2>
      <FloralDivider className="mt-1 h-4 w-28" />
    </div>
  );
}
