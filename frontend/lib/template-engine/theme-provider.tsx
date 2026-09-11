import type { CSSProperties } from "react";
import type { ThemeTokens } from "@/types/template";

export function themeToCssVars(theme: ThemeTokens): CSSProperties {
  return {
    "--color-primary": theme.colors.primary,
    "--color-secondary": theme.colors.secondary,
    "--color-background": theme.colors.background,
    "--color-surface": theme.colors.surface,
    "--color-text": theme.colors.text,
    "--color-muted": theme.colors.muted,
    "--font-heading": theme.typography.heading,
    "--font-body": theme.typography.body,
    "--radius-card": theme.radius?.card ?? "16px",
    "--radius-button": theme.radius?.button ?? "999px",
    "--shadow-card": theme.shadows?.card ?? "none",
  } as CSSProperties;
}

export function ThemeProvider({ theme, children }: { theme: ThemeTokens; children: React.ReactNode }) {
  return (
    <div style={themeToCssVars(theme)} className="bg-[var(--color-background)] text-[var(--color-text)]">
      {children}
    </div>
  );
}
