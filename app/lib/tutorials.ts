// Tutoriels vidéo du site : démonstrations de l'app, en français et en
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
  { id: 'nearby', audience: 'sender', durationSeconds: { fr: 65, en: 66 } },
  { id: 'alerts', audience: 'sender', durationSeconds: { fr: 81, en: 86 } },
  { id: 'saved', audience: 'sender', durationSeconds: { fr: 41, en: 42 } },
  { id: 'templates', audience: 'traveler', durationSeconds: { fr: 192, en: 166 } },
  { id: 'recurring', audience: 'traveler', durationSeconds: { fr: 52, en: 54 } },
  { id: 'ai', audience: 'sender', durationSeconds: { fr: 77, en: 83 } },
  { id: 'itemprices', audience: 'traveler', durationSeconds: { fr: 49, en: 58 } },
  { id: 'poster', audience: 'sender', durationSeconds: { fr: 40, en: 46 } },
  { id: 'request', audience: 'sender', durationSeconds: { fr: 118, en: 124 } },
  { id: 'recipients', audience: 'sender', durationSeconds: { fr: 57, en: 43 } },
  { id: 'receiving', audience: 'recipient', durationSeconds: { fr: 22, en: 25 } },
  { id: 'track', audience: 'recipient', durationSeconds: { fr: 43, en: 76 } },
  { id: 'messages', audience: 'sender', durationSeconds: { fr: 74, en: 38 } },
  { id: 'call', audience: 'sender', durationSeconds: { fr: 42, en: 45 } },
  { id: 'assistant', audience: 'sender', durationSeconds: { fr: 49, en: 48 } },
  { id: 'money', audience: 'traveler', durationSeconds: { fr: 24, en: 26 } },
  { id: 'payments', audience: 'sender', durationSeconds: { fr: 44, en: 51 } },
  { id: 'invite', audience: 'sender', durationSeconds: { fr: 30, en: 28 } },
  { id: 'profile', audience: 'sender', durationSeconds: { fr: 31, en: 35 } },
  { id: 'gppro', audience: 'sender', durationSeconds: { fr: 24, en: 31 } },
  { id: 'security', audience: 'sender', durationSeconds: { fr: 41, en: 43 } },
  { id: 'disputes', audience: 'sender', durationSeconds: { fr: 27, en: 35 } },
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
