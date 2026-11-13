import type { CSSProperties } from "react";

type Settings = Record<string, string | number | boolean>;
type Kind = "heading" | "text" | "image";
type Item = { n: number; col: number; kind: Kind; text: string; align?: "left" | "center" | "right" };

export const CONTAINER_MAX_COLS = 4;

/** Items are stored flat as `item.<n>.<prop>` because section settings only allow primitives. */
export function parseContainerItems(settings: Settings): Item[] {
  const byN = new Map<number, Partial<Item> & { n: number }>();
  for (const [key, value] of Object.entries(settings)) {
    const m = /^item\.(\d{1,2})\.(col|kind|text|align)$/.exec(key);
    if (!m) continue;
    const n = Number(m[1]);
    const item = byN.get(n) ?? { n };
    if (m[2] === "col") item.col = Number(value);
    if (m[2] === "kind") item.kind = value as Kind;
    if (m[2] === "text") item.text = String(value);
    if (m[2] === "align") item.align = value as Item["align"];
    byN.set(n, item);
  }
  return Array.from(byN.values())
    .filter((i): i is Item => !!i.col && !!i.kind)
    .map((i) => ({ ...i, text: i.text ?? "" }))
    .sort((a, b) => a.n - b.n);
}

export function ContainerBlock({ settings }: { settings: Settings }) {
  const cols = Math.max(1, Math.min(CONTAINER_MAX_COLS, Number(settings.cols ?? 2) || 2));
  const items = parseContainerItems(settings);

  return (
    <section className="px-6 py-10">
      <div
        className="sec-grid mx-auto grid max-w-3xl gap-6"
        style={{ "--cols": cols } as CSSProperties}
      >
        {Array.from({ length: cols }, (_, c) => (
          <div key={c} className="min-w-0 space-y-3">
            {items
              .filter((i) => Math.min(i.col, cols) === c + 1)
              .map((item) => {
                const style: CSSProperties = { textAlign: item.align };
                if (item.kind === "heading")
                  return (
                    <h2 key={item.n} className="text-2xl" style={{ ...style, fontFamily: "var(--font-heading)" }}>
                      {item.text}
                    </h2>
                  );
                if (item.kind === "image")
                  return item.text ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={item.n} src={item.text} alt="" loading="lazy" className="w-full rounded-[var(--radius-card)] object-cover" />
                  ) : null;
                return (
                  <p key={item.n} className="whitespace-pre-line text-[15px] leading-relaxed" style={style}>
                    {item.text}
                  </p>
                );
              })}
          </div>
        ))}
      </div>
    </section>
  );
}
