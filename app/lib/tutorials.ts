// Tutoriels vidéo du site : 6 démonstrations de l'app, en français et en
// anglais. Les fichiers (vidéo + affiche) sont produits par
// scripts/compress-tutorials.sh dans public/video/tutos/.
import type { Locale } from './locale'

export type TutorialAudience = 'sender' | 'recipient' | 'traveler'

export interface Tutorial {
  id: string
  audience: TutorialAudience
  /** Durée réelle de chaque version, en secondes (arrondie à la seconde). */
  durationSeconds: Record<Locale, number>
}

export const tutorials: Tutorial[] = [
  { id: 'search', audience: 'sender', durationSeconds: { fr: 89, en: 95 } },
  { id: 'track', audience: 'recipient', durationSeconds: { fr: 43, en: 76 } },
  { id: 'payments', audience: 'sender', durationSeconds: { fr: 44, en: 51 } },
  { id: 'alerts', audience: 'sender', durationSeconds: { fr: 81, en: 86 } },
  { id: 'poster', audience: 'sender', durationSeconds: { fr: 40, en: 46 } },
  { id: 'flights', audience: 'traveler', durationSeconds: { fr: 35, en: 34 } },
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

/** Durée d'un tutoriel dans la langue demandée, prête à afficher. */
export function tutorialDuration(tutorial: Tutorial, locale: Locale): string {
  return formatDuration(tutorial.durationSeconds[locale], locale)
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
