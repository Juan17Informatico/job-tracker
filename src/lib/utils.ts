import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function today() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function formatDate(value: string, locale = 'en') {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}
export function formatDateTime(value: string, locale = 'en') {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
export function salaryLabel(
  min: number | null,
  max: number | null,
  currency: string,
  locale = 'en',
  labels = { from: 'From', upTo: 'Up to' },
) {
  const format = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(n)
  if (min !== null && max !== null) return `${format(min)} – ${format(max)}`
  if (min !== null) return `${labels.from} ${format(min)}`
  if (max !== null) return `${labels.upTo} ${format(max)}`
  return null
}
