/** Inline stroke icons — a handful of 24px glyphs, no icon package needed. */
type Props = { className?: string }

// A default intrinsic size keeps icons sane inside flex buttons; CSS overrides it
// wherever a specific size is wanted (the nav bar, icon-only buttons).
const base = {
  viewBox: '0 0 24 24',
  width: 18,
  height: 18,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const HomeIcon = (p: Props) => (
  <svg {...base} {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
)

export const LibraryIcon = (p: Props) => (
  <svg {...base} {...p}><rect x="3" y="4" width="7" height="16" rx="1.5" /><rect x="14" y="4" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="6" rx="1.5" /></svg>
)

export const DumbbellIcon = (p: Props) => (
  <svg {...base} {...p}><path d="M6.5 8.5v7M4 10v3M17.5 8.5v7M20 10v3M6.5 12h11" /></svg>
)

export const HistoryIcon = (p: Props) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 1.9" /></svg>
)

export const SettingsIcon = (p: Props) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-1 1.47V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1.05-1.47 1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.47-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.47-1.05 1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.6 1.6 0 0 0 1.77.32H9a1.6 1.6 0 0 0 1-1.47V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.32 1.77V9a1.6 1.6 0 0 0 1.47 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" /></svg>
)

export const SearchIcon = (p: Props) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
)

export const CheckIcon = (p: Props) => (
  <svg {...base} strokeWidth={2.6} {...p}><path d="m4.5 12.5 5 5 10-11" /></svg>
)

export const PlusIcon = (p: Props) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
)

export const TrashIcon = (p: Props) => (
  <svg {...base} {...p}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></svg>
)

export const ChevronLeft = (p: Props) => (
  <svg {...base} {...p}><path d="m15 5-7 7 7 7" /></svg>
)

export const ChevronRight = (p: Props) => (
  <svg {...base} {...p}><path d="m9 5 7 7-7 7" /></svg>
)

export const ArrowUp = (p: Props) => (
  <svg {...base} {...p}><path d="M12 19V5M6 11l6-6 6 6" /></svg>
)

export const ArrowDown = (p: Props) => (
  <svg {...base} {...p}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
)

export const StarIcon = ({ filled, ...p }: Props & { filled?: boolean }) => (
  <svg {...base} fill={filled ? 'currentColor' : 'none'} {...p}><path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9Z" /></svg>
)

export const CloseIcon = (p: Props) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
)

export const PlayIcon = (p: Props) => (
  <svg {...base} {...p}><path d="M7 4.8v14.4L19 12Z" /></svg>
)

export const FlameIcon = (p: Props) => (
  <svg {...base} {...p}><path d="M12 3s4.5 4 4.5 8a4.5 4.5 0 0 1-9 0c0-1.2.4-2.2 1-3 .2 1.2 1 2 1.8 2C11.3 10 12 7 12 3Z" /><path d="M12 21a6 6 0 0 0 6-6" /></svg>
)

export const ExternalIcon = (p: Props) => (
  <svg {...base} {...p}><path d="M14 4h6v6M20 4l-8 8" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
)

export const ChartIcon = (p: Props) => (
  <svg {...base} {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
)

export const InfoIcon = (p: Props) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" /><circle cx="12" cy="7.8" r="0.9" fill="currentColor" stroke="none" /></svg>
)

export const SparkIcon = (p: Props) => (
  <svg {...base} {...p}><path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.4 10.1 12.8 4.5 10.9 10.1 9Z" /><path d="M18.5 4v3M20 5.5h-3" /></svg>
)

export const CompassIcon = (p: Props) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="m15.2 8.8-1.9 4.5-4.5 1.9 1.9-4.5Z" /></svg>
)

export const ShieldIcon = (p: Props) => (
  <svg {...base} {...p}><path d="M12 3.2 19 6v5.6c0 4.2-2.8 7.4-7 9.2-4.2-1.8-7-5-7-9.2V6Z" /><path d="m9.2 12.2 2 2 3.6-4" /></svg>
)
