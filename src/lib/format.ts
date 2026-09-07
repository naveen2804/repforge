import type { Unit } from './types'

const LB_PER_KG = 2.2046226218

export function kgToDisplay(kg: number, unit: Unit): number {
  return unit === 'kg' ? kg : kg * LB_PER_KG
}

export function displayToKg(value: number, unit: Unit): number {
  return unit === 'kg' ? value : value / LB_PER_KG
}

/** Trims trailing zeros so 62.5 stays 62.5 but 60.0 reads as 60. */
export function formatWeight(kg: number | null | undefined, unit: Unit): string {
  if (kg == null) return '—'
  const value = kgToDisplay(kg, unit)
  const rounded = Math.round(value * 100) / 100
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} ${unit}`
}

export function formatVolume(kg: number, unit: Unit): string {
  const value = kgToDisplay(kg, unit)
  if (value >= 10000) return `${(value / 1000).toFixed(1)}k ${unit}`
  return `${Math.round(value).toLocaleString()} ${unit}`
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function relativeDay(iso: string): string {
  const then = new Date(iso)
  const days = Math.round((startOfDay(new Date()).getTime() - startOfDay(then).getTime()) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return formatDate(iso)
}

export function startOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Epley 1RM — the usual "estimated max" you see in lifting apps. */
export function estimate1RM(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg
  return weightKg * (1 + reps / 30)
}
