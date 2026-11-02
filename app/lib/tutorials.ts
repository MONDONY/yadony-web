// Tutoriels vidéo du site : 6 démonstrations de l'app, en français et en
// anglais. Les fichiers (vidéo + affiche) sont produits par
// scripts/compress-tutorials.sh dans public/video/tutos/.
import type { Locale } from './locale'

export type TutorialAudience = 'sender' | 'recipient' | 'traveler'

export interface Tutorial {
  id: string
  audience: TutorialAudience
  /** Durée de la version française, en secondes. */
  durationSeconds: number
}

export const tutorials: Tutorial[] = [
  { id: 'search', audience: 'sender', durationSeconds: 89 },
  { id: 'track', audience: 'recipient', durationSeconds: 43 },
  { id: 'payments', audience: 'sender', durationSeconds: 44 },
  { id: 'alerts', audience: 'sender', durationSeconds: 81 },
  { id: 'poster', audience: 'sender', durationSeconds: 40 },
  { id: 'flights', audience: 'traveler', durationSeconds: 35 },
]

/** « 1 min 29 » / « 1 min 29 s » ; « 43 s » sous la minute. */
export function formatDuration(seconds: number, locale: Locale): string {
  const total = Math.round(seconds)
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  if (minutes === 0) return `${rest} s`
  if (rest === 0) return `${minutes} min`
  return locale === 'fr' ? `${minutes} min ${rest}` : `${minutes} min ${rest} s`
}

function suffix(locale: Locale): string {
  return locale === 'en' ? '-en' : ''
}

export function videoSrc(id: string, locale: Locale): string {
  return `/video/tutos/${id}${suffix(locale)}.mp4`
}

export function posterSrc(id: string, locale: Locale): string {
  return `/video/tutos/${id}${suffix(locale)}-poster.jpg`
}
