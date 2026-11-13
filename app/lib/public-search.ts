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
  /** Arrivée estimée au plus tôt (début de fourchette en bateau). */
  arrivalDate?: string
  /** Fin de la fourchette d'arrivée estimée (bateau) ; absente hors bateau. */
  arrivalDateMax?: string
  availableKg?: number
  /** Bateau au m³ : volume restant en m³ ; absent sinon (et absent d'un ancien back). */
  availableVolumeM3?: number
  pricePerKgDisplay?: number
  /** Bateau au m³ : prix au m³ payé par l'expéditeur (frais inclus) ; absent sinon. */
  pricePerM3Display?: number
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
  /** « Tous les trajets » : une recherche sans critère, demandée par l'accueil. */
  all?: boolean
  page: number
}

const MAX_CITY_LENGTH = 80
// Dernière page atteignable (pages 0 à 4) : le back refuse au-delà.
export const MAX_PAGE = 4
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
  const all = ['1', 'true'].includes(firstText(raw.tous))
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
  if (all) query.all = true
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

// Adresse de la recherche : seuls les champs renseignés y figurent, de sorte
// que l'adresse nue reste celle de la page sans recherche. La page n'y est
// jamais : une adresse partagée repart des premiers résultats. Relue par
// `parseSearchQuery`, jamais utilisée telle quelle.
export function toUrlQuery(q: SearchQuery): Record<string, string> {
  const query: Record<string, string> = {}
  if (q.depart) query.depart = q.depart
  if (q.arrivee) query.arrivee = q.arrivee
  if (q.quand) query.quand = q.quand
  if (q.minKg !== undefined) query.minKg = String(q.minKg)
  if (q.maxPrix !== undefined) query.maxPrix = String(q.maxPrix)
  if (q.urgent) query.urgent = '1'
  if (q.mode) query.mode = q.mode
  if (q.all) query.tous = '1'
  return query
}

// La page n'entre pas dans le test : une page seule ne cherche rien. Le
// marqueur « tous » (`tous=1`) est une recherche à part entière : il demande
// tous les trajets, sans aucun critère.
export function hasSearch(q: SearchQuery): boolean {
  return Boolean(q.depart || q.arrivee || q.quand || q.minKg !== undefined || q.maxPrix !== undefined || q.urgent || q.mode || q.all)
}

type Translate = (key: string, params?: Record<string, string>) => string

// Titre de l'état « aucun résultat », partagé par le panneau et par l'annonce
// vocale de la section : les deux disent la même phrase.
export function emptyStateTitle(q: SearchQuery, t: Translate): string {
  const route = [q.depart, q.arrivee].filter(Boolean).join(' → ')
  const month = q.quand === 'ce-mois'
  if (route) return t(month ? 'search.states.empty.titleMonth' : 'search.states.empty.title', { route })
  return t(month ? 'search.states.empty.titleAnyMonth' : 'search.states.empty.titleAny')
}

export function formatPrice(value: number | undefined, currency: string, locale: Locale): string {
  if (value === undefined) return ''
  try {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { style: 'currency', currency }).format(value)
  } catch {
    // Code de devise mal formé venu de l'API : RangeError. On montre le prix brut.
    return `${value} ${currency}`
  }
}

const labels = {
  fr: { pricePerItem: 'Prix par article', kgFree: 'Kg libre', suitcase23: 'Valise 23 kg', suitcase32: 'Valise 32 kg' },
  en: { pricePerItem: 'Price per item', kgFree: 'Flexible kg', suitcase23: '23 kg suitcase', suitcase32: '32 kg suitcase' },
} satisfies Record<Locale, Record<string, string>>

// Prix au kilo de la carte. Un trajet MIXED sans prix au kilo n'a qu'une grille
// par article. Rend '' quand il n'y a rien à afficher.
export function formatCardPrice(card: PublicAnnouncementCard, locale: Locale): string {
  if (card.pricePerKgDisplay !== undefined) return formatPrice(card.pricePerKgDisplay, card.currency, locale)
  if (card.pricePerM3Display !== undefined) return formatPrice(card.pricePerM3Display, card.currency, locale)
  return card.pricingMode === 'MIXED' ? labels[locale].pricePerItem : ''
}

// Unité du prix affiché : au kilo, au m³ (bateau) ou aucune (grille par article).
export function cardPriceUnit(card: PublicAnnouncementCard): 'kg' | 'm3' | null {
  if (card.pricePerKgDisplay !== undefined) return 'kg'
  if (card.pricePerM3Display !== undefined) return 'm3'
  return null
}

// Capacité alignée sur la carte de l'app (tripKgFree, tripCapacitySuitcase*).
// Seul KG_EXACT porte un nombre de kilos : pour KG_FREE, availableKg est une
// valeur technique, et sans capacityUnit la quantité n'est pas fiable.
export function formatCapacity(card: PublicAnnouncementCard, locale: Locale): string {
  // Trajet vendu au volume (bateau) : des m³, jamais des kilos.
  if (card.availableVolumeM3 !== undefined) {
    const m3 = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: 1 }).format(card.availableVolumeM3)
    return `${m3} m³`
  }
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

// Fourchette d'arrivée estimée (bateau) : « Arrivée du 12 déc. au 20 déc. ».
// Rend '' sans fin de fourchette : les autres modes n'affichent pas de ligne.
export function formatArrivalRange(
  card: PublicAnnouncementCard,
  locale: Locale,
  t: (key: string, params: Record<string, string>) => string,
): string {
  const max = card.arrivalDateMax
  if (max === undefined) return ''
  const to = formatDepartureDate(max, locale)
  const min = card.arrivalDate
  if (min === undefined || min > max) return t('search.card.arrivalBefore', { to })
  if (min === max) return t('search.card.arrivalOn', { to })
  return t('search.card.arrivalRange', { from: formatDepartureDate(min, locale), to })
}

function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

export function suggestCities(prefix: string): string[] {
  const needle = fold(prefix.trim())
  const cities = new Set(corridors.flatMap(corridor => [corridor.from, corridor.to]))
  return [...cities].filter(name => fold(name).startsWith(needle))
}
