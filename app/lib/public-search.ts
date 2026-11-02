// Recherche publique de trajets (GET {apiBase}/public/announcements, sans
// authentification). Logique pure : lecture de l'URL, paramètres envoyés au
// back, formats d'affichage. Aucun accès réseau ni état ici.
import { corridors } from './corridors'
import type { Locale } from './locale'

export interface PublicTravelerCard {
  displayName: string
  averageRating?: number
  totalTrips?: number
  identityVerified: boolean
}

export type CapacityUnit = 'SUITCASE_23KG' | 'SUITCASE_32KG' | 'KG_FREE' | 'KG_EXACT'

// Le back omet les clés absentes (NON_NULL) : tout champ optionnel peut manquer.
export interface PublicAnnouncementCard {
  id: string
  departureCity: string
  arrivalCity: string
  /** Date ISO `YYYY-MM-DD`. */
  departureDate: string
  availableKg?: number
  pricePerKgDisplay?: number
  currency: string
  transportMode?: string
  urgent: boolean
  acceptedContentTypes?: string[]
  capacityUnit?: CapacityUnit
  pricingMode?: 'KG' | 'MIXED'
  traveler: PublicTravelerCard
}

export interface PublicPage {
  content: PublicAnnouncementCard[]
  totalElements: number
  page: number
  size: number
  totalPages: number
}

export type SearchWhen = 'ce-mois' | '3-mois' | ''

export interface SearchQuery {
  depart: string
  arrivee: string
  quand: SearchWhen
  minKg?: number
  maxPrix?: number
  urgent?: boolean
  mode?: string
  page: number
}

const MAX_CITY_LENGTH = 80
const MAX_PAGE = 4
const MAX_MIN_KG = 1000
const MAX_PRICE_PER_KG = 100000
const MAX_RANGE_DAYS = 90
const WHEN_VALUES: SearchWhen[] = ['ce-mois', '3-mois']
const TRANSPORT_MODES = ['PLANE', 'CAR', 'TRAIN', 'BUS', 'BOAT', 'OTHER']

function firstText(value: unknown): string {
  const first = Array.isArray(value) ? value[0] : value
  return typeof first === 'string' ? first.trim() : ''
}

function city(value: unknown): string {
  return firstText(value).slice(0, MAX_CITY_LENGTH)
}

function boundedNumber(value: unknown, max: number): number | undefined {
  const text = firstText(value)
  if (text === '') return undefined
  const n = Number(text)
  return Number.isFinite(n) && n > 0 && n <= max ? n : undefined
}

function page(value: unknown): number {
  const text = firstText(value)
  if (!/^-?\d+$/.test(text)) return 0
  return Math.min(Math.max(Number(text), 0), MAX_PAGE)
}

export function parseSearchQuery(raw: Record<string, unknown>): SearchQuery {
  const quand = firstText(raw.quand) as SearchWhen
  const urgent = ['1', 'true'].includes(firstText(raw.urgent))
  const mode = firstText(raw.mode).toUpperCase()
  const query: SearchQuery = {
    depart: city(raw.depart),
    arrivee: city(raw.arrivee),
    quand: WHEN_VALUES.includes(quand) ? quand : '',
    page: page(raw.page),
  }
  const minKg = boundedNumber(raw.minKg, MAX_MIN_KG)
  const maxPrix = boundedNumber(raw.maxPrix, MAX_PRICE_PER_KG)
  if (minKg !== undefined) query.minKg = minKg
  if (maxPrix !== undefined) query.maxPrix = maxPrix
  if (urgent) query.urgent = true
  if (TRANSPORT_MODES.includes(mode)) query.mode = mode
  return query
}

function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function toApiParams(q: SearchQuery, today: Date): URLSearchParams {
  const params = new URLSearchParams()
  if (q.depart) params.set('departureCity', q.depart)
  if (q.arrivee) params.set('arrivalCity', q.arrivee)
  if (q.quand) {
    const end = q.quand === 'ce-mois'
      ? new Date(today.getFullYear(), today.getMonth() + 1, 0)
      : new Date(today.getFullYear(), today.getMonth(), today.getDate() + MAX_RANGE_DAYS)
    params.set('departureDateFrom', isoDate(today))
    params.set('departureDateTo', isoDate(end))
  }
  if (q.minKg !== undefined) params.set('minAvailableKg', String(q.minKg))
  if (q.maxPrix !== undefined) params.set('maxPricePerKg', String(q.maxPrix))
  if (q.urgent) params.set('urgent', 'true')
  if (q.mode) params.set('transportMode', q.mode)
  params.set('page', String(q.page))
  return params
}

// La page n'entre pas dans le test : une page seule ne cherche rien.
export function hasSearch(q: SearchQuery): boolean {
  return Boolean(q.depart || q.arrivee || q.quand || q.minKg !== undefined || q.maxPrix !== undefined || q.urgent || q.mode)
}

export function formatPrice(value: number | undefined, currency: string, locale: Locale): string {
  if (value === undefined) return ''
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { style: 'currency', currency }).format(value)
}

const labels = {
  fr: { pricePerItem: 'Prix par article', kgFree: 'Kg libre', suitcase23: 'Valise 23 kg', suitcase32: 'Valise 32 kg' },
  en: { pricePerItem: 'Price per item', kgFree: 'Flexible kg', suitcase23: '23 kg suitcase', suitcase32: '32 kg suitcase' },
} satisfies Record<Locale, Record<string, string>>

// Prix au kilo de la carte. Un trajet MIXED sans prix au kilo n'a qu'une grille
// par article. Rend '' quand il n'y a rien à afficher.
export function formatCardPrice(card: PublicAnnouncementCard, locale: Locale): string {
  if (card.pricePerKgDisplay !== undefined) return formatPrice(card.pricePerKgDisplay, card.currency, locale)
  return card.pricingMode === 'MIXED' ? labels[locale].pricePerItem : ''
}

// Capacité alignée sur la carte de l'app (tripKgFree, tripCapacitySuitcase*).
// Seul KG_EXACT porte un nombre de kilos : pour KG_FREE, availableKg est une
// valeur technique, et sans capacityUnit la quantité n'est pas fiable.
export function formatCapacity(card: PublicAnnouncementCard, locale: Locale): string {
  switch (card.capacityUnit) {
    case 'KG_EXACT': {
      if (card.availableKg === undefined) return ''
      const kg = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: 1 }).format(card.availableKg)
      return `${kg} kg`
    }
    case 'KG_FREE':
      return labels[locale].kgFree
    case 'SUITCASE_23KG':
      return labels[locale].suitcase23
    case 'SUITCASE_32KG':
      return labels[locale].suitcase32
    default:
      return ''
  }
}

// `YYYY-MM-DD` lu comme une date civile : construite et formatée en UTC pour
// que le fuseau de la machine ne décale jamais le jour affiché.
export function formatDepartureDate(iso: string, locale: Locale): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return iso
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}

function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

export function suggestCities(prefix: string): string[] {
  const needle = fold(prefix.trim())
  const cities = new Set(corridors.flatMap(corridor => [corridor.from, corridor.to]))
  return [...cities].filter(name => fold(name).startsWith(needle))
}
