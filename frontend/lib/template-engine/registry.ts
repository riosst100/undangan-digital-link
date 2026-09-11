import type { ComponentType } from "react";
import type { SectionType } from "@/types/template";
import { CoverFullscreen, type CoverContent } from "@/components/sections/cover/CoverFullscreen";
import { CoverMinimal } from "@/components/sections/cover/CoverMinimal";
import { CoverArch } from "@/components/sections/cover/CoverArch";
import { CoupleClassic, type CoupleContent } from "@/components/sections/couple/CoupleClassic";
import { CoupleSplit } from "@/components/sections/couple/CoupleSplit";
import { CoupleOverlap } from "@/components/sections/couple/CoupleOverlap";
import { EventCard, type EventContent } from "@/components/sections/event/EventCard";
import { EventTimeline } from "@/components/sections/event/EventTimeline";
import { EventOrnate } from "@/components/sections/event/EventOrnate";
import { StoryTimeline, type StoryContent } from "@/components/sections/story/StoryTimeline";
import { GalleryGrid, type GalleryContent } from "@/components/sections/gallery/GalleryGrid";
import { GalleryMasonry } from "@/components/sections/gallery/GalleryMasonry";
import { RsvpForm, type RsvpContent } from "@/components/sections/rsvp/RsvpForm";
import { GiftDefault, type GiftContent } from "@/components/sections/gift/GiftDefault";
import { QuoteDefault, type QuoteContent } from "@/components/sections/quote/QuoteDefault";
import { GuestGreetingDefault, type GuestGreetingContent } from "@/components/sections/guest_greeting/GuestGreetingDefault";
import { ClosingDefault, type ClosingContent } from "@/components/sections/closing/ClosingDefault";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SectionComponent = ComponentType<{ content: any }>;

type Registry = Partial<Record<SectionType, Record<string, SectionComponent>>>;

// Single source of truth for which (section type, variant) pairs exist.
// AI-generated and admin-authored template configs are validated against
// this same set (mirrored server-side in backend/config/templates.php).
export const SECTION_REGISTRY: Registry = {
  cover: {
    fullscreen: CoverFullscreen,
    minimal: CoverMinimal,
    arch: CoverArch,
  },
  couple: {
    classic: CoupleClassic,
    split: CoupleSplit,
    overlap: CoupleOverlap,
  },
  event: {
    card: EventCard,
    timeline: EventTimeline,
    ornate: EventOrnate,
  },
  story: {
    timeline: StoryTimeline,
  },
  gallery: {
    grid: GalleryGrid,
    masonry: GalleryMasonry,
  },
  rsvp: {
    form: RsvpForm,
  },
  gift: {
    default: GiftDefault,
  },
  quote: {
    default: QuoteDefault,
  },
  guest_greeting: {
    default: GuestGreetingDefault,
  },
  closing: {
    default: ClosingDefault,
  },
};

export function resolveSectionComponent(type: SectionType, variant: string): SectionComponent | null {
  return SECTION_REGISTRY[type]?.[variant] ?? null;
}

export type {
  CoverContent,
  CoupleContent,
  EventContent,
  StoryContent,
  GalleryContent,
  RsvpContent,
  GiftContent,
  QuoteContent,
  GuestGreetingContent,
  ClosingContent,
};
