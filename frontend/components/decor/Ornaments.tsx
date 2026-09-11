// Reusable decorative SVG accents shared across "modern" section variants,
// so templates don't rely only on flat color blocks and plain photos.

export function FloralDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 24"
      className={className}
      aria-hidden
      style={{ color: "var(--color-primary)" }}
    >
      <path
        d="M0 12h70M130 12h70"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
      />
      <path
        d="M100 12c-6-8-16-8-20 0 4 8 14 8 20 0Zm0 0c6-8 16-8 20 0-4 8-14 8-20 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="100" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function CornerFlourish({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      aria-hidden
      style={{ color: "var(--color-primary)" }}
    >
      <path
        d="M2 2c0 30 6 50 20 64M2 2c30 0 50 6 64 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <circle cx="2" cy="2" r="3" fill="currentColor" />
    </svg>
  );
}

/** A tall arch shape used to frame a cover photo instead of a plain rectangle. */
export function ArchFrame({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 140" className={className} aria-hidden preserveAspectRatio="none">
      <path d="M0 140V50C0 22 22 0 50 0S100 22 100 50V140Z" fill="currentColor" />
    </svg>
  );
}

export function ArchOutline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 140" className={className} aria-hidden preserveAspectRatio="none">
      <path
        d="M2 138V50C2 24 24 2 50 2S98 24 98 50V138"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function BackgroundBlobs({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      aria-hidden
      style={{ color: "var(--color-secondary)" }}
    >
      <circle cx="330" cy="60" r="140" fill="currentColor" opacity="0.35" />
      <circle cx="40" cy="360" r="110" fill="currentColor" opacity="0.25" />
    </svg>
  );
}
