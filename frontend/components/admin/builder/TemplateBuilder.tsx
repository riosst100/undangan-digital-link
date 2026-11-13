"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { saveTemplateDesign } from "@/lib/api/admin-templates";
import { ApiError } from "@/lib/api/client";
import { ThemeProvider } from "@/lib/template-engine/theme-provider";
import { RenderSection } from "@/lib/template-engine/render-section";
import { RenderSections } from "@/lib/template-engine/render-sections";
import { CONTAINER_MAX_COLS, parseContainerItems } from "@/components/sections/container/ContainerBlock";
import { ELEMENT_RADIUS } from "@/lib/template-engine/element-overrides";
import { DUMMY_INVITATION_CONTENT } from "@/lib/template-engine/dummy-content";
import {
  ANIMATION_PRESETS,
  FONTS,
  SECTION_TYPES,
  SECTION_VARIANTS,
  type SectionConfig,
  type SectionType,
  type ThemeTokens,
} from "@/types/template";
import type { AdminTemplate } from "@/types/admin-template";

type BuilderSection = SectionConfig & { uid: string };

let uidCounter = 0;
const newUid = () => `s${++uidCounter}`;

const COLOR_LABELS: Record<keyof ThemeTokens["colors"], string> = {
  primary: "Primer",
  secondary: "Sekunder",
  background: "Latar",
  surface: "Permukaan",
  text: "Teks",
  muted: "Redup",
};

type Drag = { kind: "new"; type: SectionType } | { kind: "move"; uid: string };

export function TemplateBuilder({ template }: { template: AdminTemplate }) {
  const [sections, setSections] = useState<BuilderSection[]>(() =>
    (template.latest_version?.schema.sections ?? []).map((s) => ({ ...s, uid: newUid() })),
  );
  const [theme, setTheme] = useState<ThemeTokens>(template.theme as ThemeTokens);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<"section" | "theme">("section");
  const [preview, setPreview] = useState(false);
  const [pvMobile, setPvMobile] = useState(true);
  const [win, setWin] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!preview) return;
    const update = () => setWin({ w: window.innerWidth, h: window.innerHeight });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPreview(false);
    update();
    window.addEventListener("resize", update);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("keydown", onKey);
    };
  }, [preview]);

  const [view, setView] = useState<"one" | "all">("one");
  const [mobile, setMobile] = useState(false);
  const [selectedEl, setSelectedEl] = useState<{ uid: string; idx: number; tag: string } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Device frames keep their real size (desktop 1280px, phone 390x780) and are
  // scaled down with CSS zoom to fit the editor area, so nothing scrolls sideways.
  const frameWidth = mobile ? 390 : 1280;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      setAvail((prev) => (Math.abs(prev.w - w) < 2 && Math.abs(prev.h - h) < 2 ? prev : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const PHONE_W = 390 + 24;
  const PHONE_H = 780 + 24;
  const rawZoom =
    avail.w === 0
      ? 1
      : mobile
        ? Math.min(1, (avail.w - 32) / PHONE_W, (avail.h - 110) / PHONE_H)
        : Math.min(1, avail.w / 1280);
  // Snap to 1% steps so tiny size changes can't re-trigger layout (scrollbar flicker).
  const zoom = Math.floor(rawZoom * 100) / 100;
  const [drag, setDrag] = useState<Drag | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Undo/redo: snapshots of {sections, theme}. Rapid consecutive changes
  // (dragging, sliders) within 500ms collapse into a single undo step.
  type Snapshot = { sections: BuilderSection[]; theme: ThemeTokens };
  const past = useRef<Snapshot[]>([]);
  const future = useRef<Snapshot[]>([]);
  const last = useRef<Snapshot>({ sections, theme });
  const skip = useRef(false);
  const grouping = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, setHistoryTick] = useState(0);

  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      last.current = { sections, theme };
      return;
    }
    if (!grouping.current) {
      past.current.push(last.current);
      if (past.current.length > 100) past.current.shift();
      future.current = [];
      setHistoryTick((n) => n + 1);
    } else {
      clearTimeout(grouping.current);
    }
    grouping.current = setTimeout(() => {
      grouping.current = null;
    }, 500);
    last.current = { sections, theme };
  }, [sections, theme]);

  function restore(snapshot: Snapshot) {
    if (grouping.current) {
      clearTimeout(grouping.current);
      grouping.current = null;
    }
    skip.current = true;
    setSections(snapshot.sections);
    setTheme(snapshot.theme);
    setSelectedEl(null);
    setHistoryTick((n) => n + 1);
  }

  function undo() {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(last.current);
    restore(prev);
  }

  function redo() {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(last.current);
    restore(next);
  }

  const undoRef = useRef(undo);
  const redoRef = useRef(redo);
  undoRef.current = undo;
  redoRef.current = redo;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey)) return;
      const el = e.target as HTMLElement;
      const textual =
        el.tagName === "TEXTAREA" ||
        el.isContentEditable ||
        (el.tagName === "INPUT" && !["range", "color", "checkbox", "file"].includes((el as HTMLInputElement).type));
      if (textual) return; // keep native text undo inside text fields
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) {
        e.preventDefault();
        undoRef.current();
      } else if ((k === "z" && e.shiftKey) || k === "y") {
        e.preventDefault();
        redoRef.current();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // In "one" mode the canvas shows only the active section instead of the whole page.
  const activeUid = sections.some((s) => s.uid === selected) ? selected : (sections[0]?.uid ?? null);

  useEffect(() => {
    if (view === "one" && activeUid && selected !== activeUid) setSelected(activeUid);
  }, [view, activeUid, selected]);

  const selectedSection = sections.find((s) => s.uid === selected) ?? null;

  function update(uid: string, patch: Partial<SectionConfig>) {
    setSections((prev) => prev.map((s) => (s.uid === uid ? { ...s, ...patch } : s)));
  }

  function setSetting(uid: string, key: string, value: string | number | boolean | undefined) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.uid !== uid) return s;
        const settings = { ...(s.settings ?? {}) };
        if (value === undefined) delete settings[key];
        else settings[key] = value;
        return { ...s, settings };
      }),
    );
  }

  // Highlight the selected element (tagged with data-el by ElementOverrides).
  useEffect(() => {
    const root = canvasRef.current;
    if (!root) return;
    root.querySelectorAll("[data-el-selected]").forEach((n) => n.removeAttribute("data-el-selected"));
    if (!selectedEl) return;
    root
      .querySelector(`[data-uid="${selectedEl.uid}"] [data-el="${selectedEl.idx}"]`)
      ?.setAttribute("data-el-selected", "");
  });

  const [selectedCt, setSelectedCt] = useState<{ uid: string; idx: number } | null>(null);
  const [containerList, setContainerList] = useState<{ idx: number; cols: number }[]>([]);
  const [elementList, setElementList] = useState<{ idx: number; tag: string; label: string }[]>([]);
  useEffect(() => {
    const root = canvasRef.current;
    const list = selected
      ? Array.from(root?.querySelectorAll<HTMLElement>(`[data-uid="${selected}"] [data-el]`) ?? []).map((n) => ({
          idx: Number(n.dataset.el),
          tag: n.tagName.toLowerCase(),
          label: (n.tagName === "IMG" ? (n as HTMLImageElement).alt : n.textContent)?.trim().slice(0, 40) || "(kosong)",
        }))
      : [];
    const cts = selected
      ? Array.from(root?.querySelectorAll<HTMLElement>(`[data-uid="${selected}"] [data-ct]`) ?? []).map((n) => ({
          idx: Number(n.dataset.ct),
          cols: n.querySelectorAll(":scope > [data-cell]").length,
        }))
      : [];
    setContainerList((prev) => (JSON.stringify(prev) === JSON.stringify(cts) ? prev : cts));
    setElementList((prev) => (JSON.stringify(prev) === JSON.stringify(list) ? prev : list));
  });

  const elKey = (idx: number, prop: string) => `el.${idx}.${prop}`;

  function startElementDrag(e: React.PointerEvent, uid: string) {
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-el]");
    setSelected(uid);
    setTab("section");
    if (!target || !e.currentTarget.contains(target)) {
      setSelectedEl(null);
      setSelectedCt(null);
      return;
    }
    const idx = Number(target.dataset.el);
    setSelectedCt(null);
    setSelectedEl({ uid, idx, tag: target.tagName.toLowerCase() });

  }

  function removeItem(uid: string, n: number) {
    setSections((prev) =>
      prev.map((s) =>
        s.uid !== uid
          ? s
          : { ...s, settings: Object.fromEntries(Object.entries(s.settings ?? {}).filter(([k]) => !k.startsWith(`item.${n}.`))) },
      ),
    );
  }

  function addItem(uid: string, col: number, kind: "heading" | "text" | "image") {
    const section = sections.find((s) => s.uid === uid);
    const used = new Set(parseContainerItems(section?.settings ?? {}).map((i) => i.n));
    let n = 1;
    while (used.has(n) && n < 40) n++;
    if (n >= 40) return;
    setSetting(uid, `item.${n}.col`, col);
    setSetting(uid, `item.${n}.kind`, kind);
    setSetting(uid, `item.${n}.text`, kind === "heading" ? "Judul" : kind === "text" ? "Teks baru" : "");
  }

  function resetElement(uid: string, idx: number) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.uid !== uid) return s;
        const prefix = `el.${idx}.`;
        const settings = Object.fromEntries(Object.entries(s.settings ?? {}).filter(([k]) => !k.startsWith(prefix)));
        return { ...s, settings };
      }),
    );
  }

  function insertAt(index: number, type: SectionType) {
    const settings =
      type === "container"
        ? {
            cols: 2,
            "item.1.col": 1,
            "item.1.kind": "text",
            "item.1.text": "Teks kolom kiri",
            "item.2.col": 2,
            "item.2.kind": "text",
            "item.2.text": "Teks kolom kanan",
          }
        : undefined;
    const section: BuilderSection = { uid: newUid(), type, variant: SECTION_VARIANTS[type][0], enabled: true, settings };
    setSections((prev) => [...prev.slice(0, index), section, ...prev.slice(index)]);
    setSelected(section.uid);
    setTab("section");
  }

  function drop(index: number) {
    if (!drag) return;
    if (drag.kind === "new") {
      insertAt(index, drag.type);
    } else {
      setSections((prev) => {
        const from = prev.findIndex((s) => s.uid === drag.uid);
        if (from < 0) return prev;
        const next = prev.filter((s) => s.uid !== drag.uid);
        next.splice(index > from ? index - 1 : index, 0, prev[from]);
        return next;
      });
    }
    setDrag(null);
    setDropIndex(null);
  }

  function moveBy(uid: string, delta: number) {
    setSections((prev) => {
      const i = prev.findIndex((s) => s.uid === uid);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function remove(uid: string) {
    setSections((prev) => prev.filter((s) => s.uid !== uid));
    setSelected((cur) => (cur === uid ? null : cur));
  }

  async function save() {
    setMessage(null);
    if (sections.length === 0) {
      setMessage({ ok: false, text: "Minimal satu bagian diperlukan." });
      return;
    }
    setSaving(true);
    try {
      await saveTemplateDesign(template.id, {
        sections: sections.map(({ type, variant, enabled, settings }) => ({ type, variant, enabled, settings })),
        theme: {
          colors: theme.colors,
          typography: theme.typography,
          animations: { preset: theme.animations?.preset ?? "fade-up" },
        },
      });
      setMessage({ ok: true, text: "Tersimpan sebagai versi baru." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof ApiError ? err.message : "Tidak dapat terhubung ke server." });
    } finally {
      setSaving(false);
    }
  }

  function renderBlock(section: BuilderSection) {
    return (
                  <div
        data-uid={section.uid}
                    onPointerDown={(e) => {
                      if ((e.target as HTMLElement).closest("[data-toolbar]")) return;
                      startElementDrag(e, section.uid);
                    }}
                    onClickCapture={(e) => e.preventDefault()}
                    className={`group relative cursor-pointer ${
                      selected === section.uid ? "outline outline-2 -outline-offset-2 outline-blue-500" : "hover:outline hover:outline-1 hover:-outline-offset-1 hover:outline-blue-300"
                    } ${section.enabled ? "" : "opacity-40"}`}
                  >
                    <div data-toolbar className="absolute left-2 top-2 z-20 flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs text-white opacity-0 shadow group-hover:opacity-100">
                      <span
                        draggable
                        onDragStart={(e) => {
                          const block = (e.currentTarget as HTMLElement).closest("[data-uid]");
                          if (block) e.dataTransfer.setDragImage(block, 20, 20);
                          setDrag({ kind: "move", uid: section.uid });
                        }}
                        onDragEnd={() => {
                          setDrag(null);
                          setDropIndex(null);
                        }}
                        className="cursor-grab"
                        title="Seret untuk memindah section"
                      >
                        ⠿
                      </span>
                      <span className="capitalize">{section.type.replace("_", " ")}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); moveBy(section.uid, -1); }} className="px-1">↑</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); moveBy(section.uid, 1); }} className="px-1">↓</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); remove(section.uid); }} className="px-1">✕</button>
                    </div>
                    {/* Block interaction with the live section so a click selects instead of navigating. */}
                    <div>
                      <RenderSection
                        editor
                        section={{ ...section, enabled: true }}
                        content={DUMMY_INVITATION_CONTENT[section.type]}
                      />
                    </div>
                  </div>
    );
  }

  function renderCanvas() {
    return (
            <ThemeProvider theme={theme}>
              {sections.length === 0 ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDropIndex(0);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    drop(0);
                  }}
                  className="p-16 text-center text-sm text-zinc-500"
                >
                  Seret elemen ke sini
                </div>
              ) : null}
              {view === "all" ? <DropZone index={0} /> : null}
              {sections.map((section, i) =>
                view === "one" && section.uid !== activeUid ? null : (
                  <div key={section.uid}>
                    {renderBlock(section)}
                    {view === "all" ? <DropZone index={i + 1} /> : null}
                  </div>
                ),
              )}
            </ThemeProvider>
    );
  }

  const DropZone = ({ index }: { index: number }) => (
    <div
      onDragOver={(e) => {
        if (!drag) return;
        e.preventDefault();
        setDropIndex(index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        drop(index);
      }}
      className={`transition-all ${drag ? "h-6" : "h-1"} ${
        dropIndex === index && drag ? "bg-blue-500/60" : drag ? "bg-blue-500/10" : ""
      }`}
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-100">
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2">
        <Link href="/admin/templates" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← Templates
        </Link>
        <h1 className="text-sm font-medium text-zinc-900">Customize {template.name}</h1>
        <span className="hidden text-xs text-zinc-500 sm:inline">Simpan membuat versi baru; undangan yang sudah dibuat tidak berubah.</span>
      </div>
    <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
      {/* Palette */}
      <aside className="space-y-2 overflow-y-auto border-r border-zinc-200 bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Elemen</p>
        <p className="text-xs text-zinc-500">Seret ke kanvas, atau klik untuk menambah di akhir.</p>
        {SECTION_TYPES.map((type) => (
          <div
            key={type}
            draggable
            onDragStart={() => setDrag({ kind: "new", type })}
            onDragEnd={() => {
              setDrag(null);
              setDropIndex(null);
            }}
            onClick={() => insertAt(sections.length, type)}
            className="cursor-grab rounded-lg border border-zinc-200 px-3 py-2 text-sm capitalize text-zinc-800 hover:border-zinc-400 active:cursor-grabbing"
          >
            ⠿ {type === "spacer" ? "spacer (jarak)" : type === "container" ? "container (kolom)" : type.replace("_", " ")}
          </div>
        ))}

        <div className="mt-4 border-t border-zinc-200 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Struktur</p>
          <ul className="space-y-1">
            {sections.map((section, i) => (
              <li key={section.uid}>
                <div
                  onClick={() => {
                    setSelected(section.uid);
                    setSelectedEl(null);
                    setTab("section");
                  }}
                  className={`flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs capitalize ${
                    selected === section.uid ? "bg-blue-50 text-blue-700" : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <span className="flex-1 truncate">{section.type.replace("_", " ")}</span>
                  <button type="button" title="Naik" onClick={(e) => { e.stopPropagation(); moveBy(section.uid, -1); }} disabled={i === 0} className="px-1 disabled:opacity-30">↑</button>
                  <button type="button" title="Turun" onClick={(e) => { e.stopPropagation(); moveBy(section.uid, 1); }} disabled={i === sections.length - 1} className="px-1 disabled:opacity-30">↓</button>
                </div>
                {selected === section.uid && containerList.length > 0 ? (
                  <ul className="ml-3 mt-1 space-y-0.5 border-l border-zinc-200 pl-2">
                    {containerList.map((ct) => (
                      <li key={ct.idx}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEl(null);
                            setSelectedCt({ uid: section.uid, idx: ct.idx });
                            setTab("section");
                          }}
                          className={`w-full rounded px-1.5 py-0.5 text-left text-[11px] normal-case ${
                            selectedCt?.idx === ct.idx && selectedCt.uid === section.uid ? "bg-green-50 text-green-700" : "text-zinc-600 hover:bg-zinc-50"
                          }`}
                        >
                          ▦ Container · {ct.cols} kolom
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {selected === section.uid && section.type !== "spacer" && elementList.length > 0 ? (
                  <ul className="ml-3 mt-1 space-y-0.5 border-l border-zinc-200 pl-2">
                    {elementList.map((el) => (
                      <li key={el.idx}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEl({ uid: section.uid, idx: el.idx, tag: el.tag });
                            setTab("section");
                          }}
                          className={`flex w-full items-center gap-1 rounded px-1.5 py-0.5 text-left text-[11px] normal-case ${
                            selectedEl?.idx === el.idx && selectedEl.uid === section.uid
                              ? "bg-amber-50 text-amber-700"
                              : "text-zinc-600 hover:bg-zinc-50"
                          }`}
                        >
                          <span className="shrink-0 rounded bg-zinc-100 px-1 font-mono text-[10px]">{el.tag}</span>
                          <span className="truncate">{el.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Canvas */}
      <div ref={viewportRef} className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]">
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-3 py-2 backdrop-blur">
          <div className="flex gap-1 text-xs">
            {[true, false].map((m) => (
              <button
                key={String(m)}
                type="button"
                onClick={() => setMobile(m)}
                className={`rounded-full px-3 py-1 ${mobile === m ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"}`}
              >
                {m ? "Mobile 390" : "Desktop 1280"}
              </button>
            ))}
          <div className="ml-3 flex gap-1 text-xs">
            {(["one", "all"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-full px-3 py-1 ${view === v ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600"}`}
              >
                {v === "one" ? "Per section" : "Semua"}
              </button>
            ))}
          </div>
          {zoom < 1 ? <span className="ml-2 self-center text-xs text-zinc-500">Skala {Math.round(zoom * 100)}%</span> : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={undo}
                disabled={past.current.length === 0}
                title="Undo (Ctrl+Z)"
                className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700 disabled:opacity-40"
              >
                ↶ Undo
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={future.current.length === 0}
                title="Redo (Ctrl+Shift+Z)"
                className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700 disabled:opacity-40"
              >
                ↷ Redo
              </button>
            </div>
            {message ? <span className={`text-xs ${message.ok ? "text-green-700" : "text-red-600"}`}>{message.text}</span> : null}
            <button
              type="button"
              onClick={() => setPreview(true)}
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              ▶ Preview
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>

        {view === "one" && sections.length > 0 ? (
          <div className="sticky top-[49px] z-30 flex gap-1 overflow-x-auto border-b border-zinc-200 bg-zinc-50 px-3 py-1.5">
            {sections.map((section, i) => (
              <button
                key={section.uid}
                type="button"
                onClick={() => {
                  setSelected(section.uid);
                  setSelectedEl(null);
                  setSelectedCt(null);
                }}
                className={`shrink-0 rounded-md px-3 py-1 text-xs capitalize ${
                  section.uid === activeUid ? "bg-zinc-900 text-white" : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100"
                } ${section.enabled ? "" : "opacity-50"}`}
              >
                {i + 1}. {section.type.replace("_", " ")}
              </button>
            ))}
          </div>
        ) : null}
        <div ref={canvasRef} className={`builder-canvas ${mobile ? "py-6" : ""}`} >
          {mobile ? (
            <div className="relative mx-auto rounded-[3rem] border-[12px] border-zinc-900 bg-zinc-900 shadow-2xl" style={{ width: PHONE_W, zoom }}>
              <div className="pointer-events-none absolute left-1/2 top-0 z-50 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-zinc-900" />
              <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-50 h-1 w-28 -translate-x-1/2 rounded-full bg-zinc-400/70" />
              <div
                className="device-screen no-scrollbar overflow-y-auto overflow-x-hidden rounded-[2.2rem] bg-zinc-900"
                style={{ width: frameWidth, height: 780, ["--screen-h" as string]: "752px" }}
              >
                {/* Status bar: sits above the page like on a real phone. */}
                <div className="sticky top-0 z-40 flex h-7 items-center justify-between bg-zinc-900 px-7 text-[11px] font-medium text-white">
                  <span>9:41</span>
                  <svg width="46" height="12" viewBox="0 0 46 12" fill="white" aria-hidden>
                    <rect x="0" y="8" width="3" height="4" rx="0.8" />
                    <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
                    <rect x="10" y="3" width="3" height="9" rx="0.8" />
                    <rect x="15" y="0" width="3" height="12" rx="0.8" />
                    <rect x="24" y="1" width="19" height="10" rx="2.8" fill="none" stroke="white" strokeOpacity="0.6" />
                    <rect x="26" y="3" width="13" height="6" rx="1.4" />
                    <rect x="44" y="4.5" width="1.6" height="3" rx="0.8" />
                  </svg>
                </div>
                {renderCanvas()}
              </div>
            </div>
          ) : (
            <div className="device-screen mx-auto overflow-hidden bg-white" style={{ width: frameWidth, zoom, ["--screen-h" as string]: "720px" }}>
              {renderCanvas()}
            </div>
          )}
        </div>
      </div>

      {/* Inspector */}
      <aside className="space-y-4 overflow-y-auto border-l border-zinc-200 bg-white p-3">
        <div className="flex gap-1 text-xs">
          {(["section", "theme"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1 ${tab === t ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"}`}
            >
              {t === "section" ? "Bagian" : "Tema"}
            </button>
          ))}
        </div>

        {tab === "section" ? (
          selectedCt && selectedSection && selectedCt.uid === selectedSection.uid ? (
            (() => {
              const info = containerList.find((c) => c.idx === selectedCt.idx);
              const cols = info?.cols ?? 0;
              const key = (j: number) => `ct.${selectedCt.idx}.w${j}`;
              const widths = Array.from({ length: cols }, (_, j) => Number(selectedSection.settings?.[key(j)] ?? 0));
              const total = widths.reduce((a, w) => a + (w || Math.round(100 / cols)), 0);
              return (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-zinc-900">Container · {cols} kolom</p>
                    <button type="button" onClick={() => setSelectedCt(null)} className="text-xs text-zinc-500">
                      ← Section
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Lebar kolom dalam %. Berlaku di layar lebar; di mobile kolom otomatis tersusun ke bawah, lebar penuh.
                  </p>
                  {widths.map((w, j) => (
                    <label key={j} className="block">
                      <span className="mb-1 flex justify-between text-zinc-600">
                        Kolom {j + 1}
                        <span className="text-xs text-zinc-400">{w || `${Math.round(100 / cols)} (otomatis)`}%</span>
                      </span>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        value={w || Math.round(100 / cols)}
                        onChange={(e) => setSetting(selectedSection.uid, key(j), Number(e.target.value))}
                        className="w-full"
                      />
                    </label>
                  ))}
                  <p className={`text-xs ${total > 100 ? "text-amber-600" : "text-zinc-400"}`}>Total: {total}%</p>
                  <button
                    type="button"
                    onClick={() => widths.forEach((_, j) => setSetting(selectedSection.uid, key(j), undefined))}
                    className="text-xs font-medium text-red-600"
                  >
                    Reset lebar kolom
                  </button>
                </div>
              );
            })()
          ) : selectedEl && selectedSection && selectedEl.uid === selectedSection.uid ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium text-zinc-900">Elemen &lt;{selectedEl.tag}&gt;</p>
                <button type="button" onClick={() => setSelectedEl(null)} className="text-xs text-zinc-500">
                  ← Section
                </button>
              </div>
              <p className="text-xs text-zinc-500">
                Elemen mengikuti layout section (grid, lebar penuh). Untuk memberi jarak, atur jarak atas/bawah di sini atau tambahkan elemen Spacer.
              </p>
              {(["mt", "mb"] as const).map((p) => (
                <label key={p} className="block">
                  <span className="mb-1 flex justify-between text-zinc-600">
                    {p === "mt" ? "Jarak atas" : "Jarak bawah"}
                    <span className="text-xs text-zinc-400">{Number(selectedSection.settings?.[elKey(selectedEl.idx, p)] ?? 0)}px</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={300}
                    value={Number(selectedSection.settings?.[elKey(selectedEl.idx, p)] ?? 0)}
                    onChange={(e) => setSetting(selectedSection.uid, elKey(selectedEl.idx, p), Number(e.target.value) || undefined)}
                    className="w-full"
                  />
                </label>
              ))}
              <div>
                <span className="mb-1 block text-zinc-600">Rata teks</span>
                <div className="flex gap-1">
                  {([undefined, "left", "center", "right"] as const).map((a) => (
                    <button
                      key={a ?? "auto"}
                      type="button"
                      onClick={() => setSetting(selectedSection.uid, elKey(selectedEl.idx, "align"), a)}
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-xs ${
                        selectedSection.settings?.[elKey(selectedEl.idx, "align")] === a ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 text-zinc-700"
                      }`}
                    >
                      {{ auto: "Bawaan", left: "Kiri", center: "Tengah", right: "Kanan" }[a ?? "auto"]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1 block text-zinc-600">Bentuk</span>
                <div className="flex flex-wrap gap-1">
                  {([undefined, ...Object.keys(ELEMENT_RADIUS)] as (string | undefined)[]).map((sh) => (
                    <button
                      key={sh ?? "none"}
                      type="button"
                      onClick={() => setSetting(selectedSection.uid, elKey(selectedEl.idx, "shape"), sh)}
                      className={`rounded-lg border px-2 py-1.5 text-xs ${
                        selectedSection.settings?.[elKey(selectedEl.idx, "shape")] === sh ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 text-zinc-700"
                      }`}
                    >
                      {sh ?? "Bawaan"}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-zinc-700">
                <input
                  type="color"
                  value={String(selectedSection.settings?.[elKey(selectedEl.idx, "bg")] ?? "#ffffff")}
                  onChange={(e) => setSetting(selectedSection.uid, elKey(selectedEl.idx, "bg"), e.target.value)}
                  className="h-6 w-6 cursor-pointer border-0 bg-transparent p-0"
                />
                Background elemen
                {selectedSection.settings?.[elKey(selectedEl.idx, "bg")] ? (
                  <button type="button" onClick={() => setSetting(selectedSection.uid, elKey(selectedEl.idx, "bg"), undefined)} className="text-xs text-red-600">
                    reset
                  </button>
                ) : null}
              </label>
              <label className="block">
                <span className="mb-1 flex justify-between text-zinc-600">
                  Padding
                  <span className="text-xs text-zinc-400">{Number(selectedSection.settings?.[elKey(selectedEl.idx, "pad")] ?? 0)}px</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Number(selectedSection.settings?.[elKey(selectedEl.idx, "pad")] ?? 0)}
                  onChange={(e) => setSetting(selectedSection.uid, elKey(selectedEl.idx, "pad"), Number(e.target.value) || undefined)}
                  className="w-full"
                />
              </label>
              <label className="flex items-center gap-2 text-zinc-700">
                <input
                  type="checkbox"
                  checked={selectedSection.settings?.[elKey(selectedEl.idx, "hide")] === true}
                  onChange={(e) => setSetting(selectedSection.uid, elKey(selectedEl.idx, "hide"), e.target.checked || undefined)}
                />
                Sembunyikan elemen
              </label>
              <button type="button" onClick={() => resetElement(selectedSection.uid, selectedEl.idx)} className="text-xs font-medium text-red-600">
                Reset elemen
              </button>
            </div>
          ) : selectedSection?.type === "spacer" ? (
            <div className="space-y-3 text-sm">
              <p className="font-medium text-zinc-900">Spacer</p>
              <label className="block">
                <span className="mb-1 flex justify-between text-zinc-600">
                  Tinggi
                  <span className="text-xs text-zinc-400">{Number(selectedSection.settings?.height ?? 40)}px</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={600}
                  value={Number(selectedSection.settings?.height ?? 40)}
                  onChange={(e) => setSetting(selectedSection.uid, "height", Number(e.target.value))}
                  className="w-full"
                />
              </label>
              <button type="button" onClick={() => remove(selectedSection.uid)} className="text-xs font-medium text-red-600">
                Hapus spacer
              </button>
            </div>
          ) : selectedSection ? (
            <div className="space-y-3 text-sm">
              <p className="font-medium capitalize text-zinc-900">{selectedSection.type.replace("_", " ")}</p>
              {selectedSection.type === "container" ? (
                (() => {
                  const cols = Math.max(1, Math.min(CONTAINER_MAX_COLS, Number(selectedSection.settings?.cols ?? 2) || 2));
                  const items = parseContainerItems(selectedSection.settings ?? {});
                  const uid = selectedSection.uid;
                  return (
                    <div className="space-y-3 rounded-lg border border-green-200 bg-green-50/40 p-2">
                      <p className="text-xs text-zinc-500">
                        Tanpa container, teks hanya 1 kolom (rata teks tetap bisa diatur). Untuk teks kiri-kanan, pakai 2 kolom atau lebih di sini.
                      </p>
                      <div>
                        <span className="mb-1 block text-zinc-600">Jumlah kolom</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setSetting(uid, "cols", n)}
                              className={`flex-1 rounded-lg border px-2 py-1.5 text-xs ${
                                cols === n ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 bg-white text-zinc-700"
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                      {Array.from({ length: cols }, (_, c) => (
                        <div key={c} className="space-y-2 rounded border border-zinc-200 bg-white p-2">
                          <p className="text-xs font-semibold text-zinc-600">Kolom {c + 1}</p>
                          {items
                            .filter((i) => Math.min(i.col, cols) === c + 1)
                            .map((item) => (
                              <div key={item.n} className="space-y-1 rounded border border-zinc-100 p-1.5">
                                <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                                  <span className="rounded bg-zinc-100 px-1 font-mono">{item.kind}</span>
                                  <select
                                    value={Math.min(item.col, cols)}
                                    onChange={(e) => setSetting(uid, `item.${item.n}.col`, Number(e.target.value))}
                                    className="rounded border border-zinc-200 px-1 py-0.5"
                                    title="Pindah kolom"
                                  >
                                    {Array.from({ length: cols }, (_, k) => (
                                      <option key={k} value={k + 1}>Kolom {k + 1}</option>
                                    ))}
                                  </select>
                                  <select
                                    value={item.align ?? ""}
                                    onChange={(e) => setSetting(uid, `item.${item.n}.align`, e.target.value || undefined)}
                                    className="rounded border border-zinc-200 px-1 py-0.5"
                                    title="Rata teks"
                                  >
                                    <option value="">rata: bawaan</option>
                                    <option value="left">kiri</option>
                                    <option value="center">tengah</option>
                                    <option value="right">kanan</option>
                                  </select>
                                  <button type="button" onClick={() => removeItem(uid, item.n)} className="ml-auto text-red-600">✕</button>
                                </div>
                                {item.kind === "text" ? (
                                  <textarea
                                    rows={3}
                                    value={item.text}
                                    onChange={(e) => setSetting(uid, `item.${item.n}.text`, e.target.value)}
                                    className="w-full rounded border border-zinc-300 px-2 py-1 text-xs"
                                  />
                                ) : (
                                  <input
                                    type={item.kind === "image" ? "url" : "text"}
                                    placeholder={item.kind === "image" ? "https://... (URL gambar)" : "Judul"}
                                    value={item.text}
                                    onChange={(e) => setSetting(uid, `item.${item.n}.text`, e.target.value)}
                                    className="w-full rounded border border-zinc-300 px-2 py-1 text-xs"
                                  />
                                )}
                              </div>
                            ))}
                          <div className="flex gap-1 text-[11px]">
                            {(["heading", "text", "image"] as const).map((k) => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => addItem(uid, c + 1, k)}
                                className="rounded border border-zinc-300 px-1.5 py-0.5 text-zinc-700 hover:bg-zinc-50"
                              >
                                + {k === "heading" ? "Judul" : k === "text" ? "Teks" : "Gambar"}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : null}
              <label className="block">
                <span className="mb-1 block text-zinc-600">Varian</span>
                <select
                  value={selectedSection.variant}
                  onChange={(e) => {
                    const settings = Object.fromEntries(
                      Object.entries(selectedSection.settings ?? {}).filter(([k]) => !k.startsWith("el.") && !k.startsWith("ct.")),
                    );
                    update(selectedSection.uid, { variant: e.target.value, settings });
                    setSelectedEl(null);
                    setSelectedCt(null);
                  }}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  {SECTION_VARIANTS[selectedSection.type].map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-zinc-700">
                <input
                  type="checkbox"
                  checked={selectedSection.enabled}
                  onChange={(e) => update(selectedSection.uid, { enabled: e.target.checked })}
                />
                Tampilkan di undangan
              </label>
              <div>
                <span className="mb-1 block text-zinc-600">Posisi teks</span>
                <div className="flex gap-1">
                  {([undefined, "left", "center", "right"] as const).map((a) => (
                    <button
                      key={a ?? "auto"}
                      type="button"
                      onClick={() => setSetting(selectedSection.uid, "align", a)}
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-xs ${
                        selectedSection.settings?.align === a ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 text-zinc-700"
                      }`}
                    >
                      {{ auto: "Bawaan", left: "Kiri", center: "Tengah", right: "Kanan" }[a ?? "auto"]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3 border-t border-zinc-200 pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Container & background</p>
                {(
                  [
                    ["container", "Lebar container", [["full", "Penuh"], ["boxed", "Kotak"]]],
                    ["shape", "Bentuk background", [["square", "Kotak"], ["rounded", "Rounded"], ["pill", "Pill"], ["arch", "Arch"]]],
                  ] as const
                ).map(([key, label, opts]) => (
                  <div key={key}>
                    <span className="mb-1 block text-zinc-600">{label}</span>
                    <div className="flex flex-wrap gap-1">
                      {opts.map(([val, text]) => {
                        const current = selectedSection.settings?.[key] ?? (key === "container" ? "full" : "square");
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setSetting(selectedSection.uid, key, val === "full" || val === "square" ? undefined : val)}
                            className={`rounded-lg border px-2 py-1.5 text-xs ${
                              current === val ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-300 text-zinc-700"
                            }`}
                          >
                            {text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <label className="flex items-center gap-2 text-zinc-700">
                  <input
                    type="color"
                    value={String(selectedSection.settings?.bgColor ?? "#ffffff")}
                    onChange={(e) => setSetting(selectedSection.uid, "bgColor", e.target.value)}
                    className="h-6 w-6 cursor-pointer border-0 bg-transparent p-0"
                  />
                  Warna background
                  {selectedSection.settings?.bgColor ? (
                    <button type="button" onClick={() => setSetting(selectedSection.uid, "bgColor", undefined)} className="text-xs text-red-600">
                      reset
                    </button>
                  ) : null}
                </label>
                <label className="block">
                  <span className="mb-1 block text-zinc-600">Gambar background (URL)</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={String(selectedSection.settings?.bgImage ?? "")}
                    onChange={(e) => setSetting(selectedSection.uid, "bgImage", e.target.value || undefined)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </label>
                {(
                  [
                    ["bgPosition", "Posisi background", ["center", "top", "bottom", "left", "right"]],
                    ["bgSize", "Ukuran background", ["cover", "contain"]],
                  ] as const
                ).map(([key, label, opts]) => (
                  <label key={key} className="block">
                    <span className="mb-1 block text-zinc-600">{label}</span>
                    <select
                      value={String(selectedSection.settings?.[key] ?? opts[0])}
                      onChange={(e) => setSetting(selectedSection.uid, key, e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    >
                      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </label>
                ))}
              </div>
              {(
                [
                  ["offsetX", "Geser horizontal", -200, 200],
                  ["offsetY", "Geser vertikal", -200, 200],
                  ["paddingTop", "Jarak atas", 0, 300],
                  ["paddingBottom", "Jarak bawah", 0, 300],
                ] as const
              ).map(([key, label, min, max]) => (
                <label key={key} className="block">
                  <span className="mb-1 flex justify-between text-zinc-600">
                    {label}
                    <span className="text-xs text-zinc-400">{Number(selectedSection.settings?.[key] ?? 0)}px</span>
                  </span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={Number(selectedSection.settings?.[key] ?? 0)}
                    onChange={(e) => setSetting(selectedSection.uid, key, Number(e.target.value) || undefined)}
                    className="w-full"
                  />
                </label>
              ))}
              <button type="button" onClick={() => remove(selectedSection.uid)} className="text-xs font-medium text-red-600">
                Hapus bagian
              </button>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Klik sebuah bagian di kanvas untuk mengeditnya.</p>
          )
        ) : (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(COLOR_LABELS) as (keyof ThemeTokens["colors"])[]).map((key) => (
                <label key={key} className="flex items-center gap-2 rounded-lg border border-zinc-200 px-2 py-1.5">
                  <input
                    type="color"
                    value={theme.colors[key]}
                    onChange={(e) => setTheme((t) => ({ ...t, colors: { ...t.colors, [key]: e.target.value } }))}
                    className="h-6 w-6 shrink-0 cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-xs text-zinc-700">{COLOR_LABELS[key]}</span>
                </label>
              ))}
            </div>
            {(["heading", "body"] as const).map((k) => (
              <label key={k} className="block">
                <span className="mb-1 block text-zinc-600">{k === "heading" ? "Font judul" : "Font teks"}</span>
                <select
                  value={theme.typography[k]}
                  onChange={(e) => setTheme((t) => ({ ...t, typography: { ...t.typography, [k]: e.target.value } }))}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                >
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>
            ))}
            <label className="block">
              <span className="mb-1 block text-zinc-600">Animasi</span>
              <select
                value={theme.animations?.preset ?? "fade-up"}
                onChange={(e) => setTheme((t) => ({ ...t, animations: { ...t.animations, preset: e.target.value } }))}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                {ANIMATION_PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>
        )}
      </aside>
    </div>
    {preview ? (
      <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-200">
        <div className="flex items-center gap-3 border-b border-zinc-300 bg-white px-4 py-2">
          <span className="text-sm font-medium text-zinc-900">Preview</span>
          <span className="hidden text-xs text-zinc-500 sm:inline">Tampilan akhir dengan data contoh, belum tersimpan.</span>
          <div className="ml-4 flex gap-1 text-xs">
            {[true, false].map((m) => (
              <button
                key={String(m)}
                type="button"
                onClick={() => setPvMobile(m)}
                className={`rounded-full px-3 py-1 ${pvMobile === m ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"}`}
              >
                {m ? "Mobile" : "Desktop"}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setPreview(false)} className="ml-auto rounded-full bg-zinc-900 px-4 py-1.5 text-sm text-white">
            ✕ Tutup (Esc)
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {pvMobile ? (
            <div className="flex justify-center py-5">
              <div
                className="relative rounded-[3rem] border-[12px] border-zinc-900 bg-zinc-900 shadow-2xl"
                style={{ width: PHONE_W, zoom: win.h ? Math.min(1, (win.h - 110) / PHONE_H) : 1 }}
              >
                <div className="pointer-events-none absolute left-1/2 top-0 z-50 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-zinc-900" />
                <div
                  className="device-screen no-scrollbar overflow-y-auto overflow-x-hidden rounded-[2.2rem] bg-zinc-900"
                  style={{ width: 390, height: 780, ["--screen-h" as string]: "752px" }}
                >
                  <div className="sticky top-0 z-40 flex h-7 items-center justify-between bg-zinc-900 px-7 text-[11px] font-medium text-white">
                    <span>9:41</span>
                  </div>
                  <ThemeProvider theme={theme}>
                    <RenderSections
                      sections={sections.filter((x) => x.enabled)}
                      getContent={(x) => DUMMY_INVITATION_CONTENT[x.type]}
                    />
                  </ThemeProvider>
                </div>
              </div>
            </div>
          ) : (
            <ThemeProvider theme={theme}>
              <RenderSections
                sections={sections.filter((x) => x.enabled)}
                getContent={(x) => DUMMY_INVITATION_CONTENT[x.type]}
              />
            </ThemeProvider>
          )}
        </div>
      </div>
    ) : null}
    </div>
  );
}
