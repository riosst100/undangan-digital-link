"use client";

import { useLayoutEffect, useRef } from "react";

// Elements inside a section that can be customised individually. They are
// addressed by their index in document order, so the override keys are
// `el.<index>.<prop>`. Changing a section's variant changes its DOM, so the
// builder clears these overrides at that point.
export const ELEMENT_SELECTOR = "h1,h2,h3,h4,h5,p,img,a,button,blockquote,figure";

export const ELEMENT_RADIUS: Record<string, string> = {
  rounded: "24px",
  pill: "9999px",
  arch: "9999px 9999px 0 0",
};

type Settings = Record<string, string | number | boolean>;

const TEXT_LEAVES = new Set(["DIV", "SPAN"]);

/** Selectable elements in document order: semantic tags, plus text-only div/span (e.g. the "&" between a couple). */
export function collectElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>("*")).filter(
    (el) =>
      el.matches(ELEMENT_SELECTOR) ||
      (TEXT_LEAVES.has(el.tagName) && el.children.length === 0 && (el.textContent ?? "").trim() !== ""),
  );
}

/** A container is a flex/grid box with 2+ visible children that hold content. Its children are its columns. */
export function collectContainers(root: HTMLElement): { el: HTMLElement; cells: HTMLElement[] }[] {
  const result: { el: HTMLElement; cells: HTMLElement[] }[] = [];
  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const display = getComputedStyle(el).display;
    if (display !== "flex" && display !== "grid") return;
    const cells = Array.from(el.children).filter(
      (c): c is HTMLElement =>
        c instanceof HTMLElement && getComputedStyle(c).display !== "none" && (c.textContent ?? "").trim() !== "",
    );
    if (cells.length >= 2) result.push({ el, cells });
  });
  return result;
}

function applyContainer(ct: { el: HTMLElement; cells: HTMLElement[] }, s: Settings, i: number) {
  const widths = ct.cells.map((_, j) => Number(s[`ct.${i}.w${j}`] ?? 0));
  const isGrid = getComputedStyle(ct.el).display === "grid";
  const applied: string[] = [];

  // Widths only take effect from the `sm` breakpoint up (see globals.css);
  // below that the section's own mobile layout (stacked, full width) wins.
  if (isGrid && widths.some(Boolean)) {
    ct.el.style.setProperty("--ct-cols", widths.map((w) => `${w || 1}fr`).join(" "));
    ct.el.dataset.ctGrid = "";
    applied.push("--ct-cols");
  } else {
    delete ct.el.dataset.ctGrid;
  }
  ct.el.dataset.ctApplied = applied.join(",");
  ct.el.dataset.ct = String(i);

  ct.cells.forEach((cell, j) => {
    (cell.dataset.ctApplied ?? "").split(",").filter(Boolean).forEach((p) => cell.style.removeProperty(p));
    cell.dataset.cell = String(j);
    const cellApplied: string[] = [];
    if (!isGrid && widths[j]) {
      cell.style.setProperty("--col-w", `${widths[j]}%`);
      cell.dataset.colw = "";
      cellApplied.push("--col-w");
    } else {
      delete cell.dataset.colw;
    }
    cell.dataset.ctApplied = cellApplied.join(",");
  });
}

function apply(el: HTMLElement, s: Settings, i: number, editor: boolean) {
  const key = (p: string) => s[`el.${i}.${p}`];
  const applied: string[] = [];
  const set = (prop: string, value: string) => {
    el.style.setProperty(prop, value);
    applied.push(prop);
  };

  const x = Number(key("x") ?? 0);
  const y = Number(key("y") ?? 0);
  if (x || y) set("translate", `${x}px ${y}px`);

  const mt = Number(key("mt") ?? 0);
  const mb = Number(key("mb") ?? 0);
  if (mt) set("margin-top", `${mt}px`);
  if (mb) set("margin-bottom", `${mb}px`);

  const align = key("align");
  if (align === "left" || align === "center" || align === "right") {
    set("text-align", align);
    if (el.tagName === "IMG") {
      set("display", "block");
      set("margin-left", align === "left" ? "0" : "auto");
      set("margin-right", align === "right" ? "0" : "auto");
    }
  }

  const bg = key("bg");
  if (typeof bg === "string" && bg) {
    set("background-color", bg);
    if (el.tagName !== "IMG") set("padding", `${Number(key("pad") ?? 12)}px`);
  } else if (Number(key("pad") ?? 0)) {
    set("padding", `${Number(key("pad"))}px`);
  }

  const shape = key("shape");
  if (typeof shape === "string" && ELEMENT_RADIUS[shape]) {
    set("border-radius", ELEMENT_RADIUS[shape]);
    set("overflow", "hidden");
  }

  if (key("hide") === true) {
    if (editor) set("opacity", "0.25");
    else set("display", "none");
  }

  el.dataset.elApplied = applied.join(",");
}

export function ElementOverrides({
  settings,
  editor = false,
  children,
}: {
  settings: Settings;
  editor?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-ct]").forEach((el) => {
      (el.dataset.ctApplied ?? "").split(",").filter(Boolean).forEach((p) => el.style.removeProperty(p));
      delete el.dataset.ct;
    });
    root.querySelectorAll<HTMLElement>("[data-cell]").forEach((el) => delete el.dataset.cell);
    collectContainers(root).forEach((ct, i) => applyContainer(ct, settings, i));
    collectElements(root).forEach((el, i) => {
      el.dataset.el = String(i);
      // Undo only what we applied last time, never the component's own styles.
      (el.dataset.elApplied ?? "").split(",").filter(Boolean).forEach((p) => el.style.removeProperty(p));
      apply(el, settings, i, editor);
    });
  });

  return (
    <div ref={ref} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
