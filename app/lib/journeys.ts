// Étapes des parcours racontés : un écran de l'app ou une illustration
// animée par étape, éventuellement une pose de Dony. Les textes vivent dans
// les fichiers de locale, à l'index de l'étape.
import type { AppScreenId, DonyPoseId } from './media'

export type JourneyArt =
  | 'priceCurve'
  | 'priceModes'
  | 'negotiation'
  | 'padlock'
  | 'route'
  | 'timeline'

export interface JourneyStep {
  id: string
  actor: 'traveler' | 'sender' | 'both'
  /** Un écran, ou plusieurs qui se succèdent dans le même téléphone. */
  screen?: AppScreenId | AppScreenId[]
  art?: JourneyArt
  pose?: DonyPoseId
}

export const senderJourney: JourneyStep[] = [
  { id: 'search', actor: 'sender', screen: ['search-map', 'request-step1'] },
  { id: 'choose', actor: 'sender', screen: 'traveler-profile' },
  { id: 'negotiate', actor: 'sender', art: 'negotiation' },
  { id: 'pay', actor: 'sender', art: 'padlock' },
  { id: 'handover', actor: 'sender', screen: 'parcel-ticket' },
  { id: 'track', actor: 'sender', screen: 'my-parcels' },
  { id: 'deliver', actor: 'sender', art: 'timeline' },
]

export const travelerJourney: JourneyStep[] = [
  { id: 'publish', actor: 'traveler', screen: 'publish-trip' },
  { id: 'price', actor: 'traveler', art: 'priceModes' },
  { id: 'poster', actor: 'traveler', screen: 'trip-detail' },
  { id: 'negotiate', actor: 'traveler', art: 'negotiation' },
  { id: 'scan', actor: 'traveler', screen: 'scan' },
  { id: 'arrive', actor: 'traveler', screen: 'my-trips' },
  { id: 'paid', actor: 'traveler', screen: ['money-overview', 'mobile-money'] },
]

// La page voyageur regroupe les sept étapes en quatre temps. Chaque nombre est
// l'index d'une étape de `travelerJourney` (et de `journeys.traveler.steps`) ;
// `visual` est l'étape dont le visuel illustre le temps. Le scan hors ligne
// (étape 4) et la question « Suis-je obligé d'accepter tous les colis ? » de
// la FAQ alimentent « Vous gardez la main ».
export const travelerTemps = [
  { id: 'publish', steps: [0], visual: 0 },
  { id: 'price', steps: [1], visual: 1 },
  { id: 'poster', steps: [2, 3], visual: 2 },
  { id: 'deliver', steps: [5, 6], visual: 6 },
] as const

export const travelerControl = { step: 4, faq: 1 } as const

export const flightsJourney: JourneyStep[] = [
  { id: 'search', actor: 'traveler', screen: 'flights-search' },
  { id: 'deals', actor: 'traveler', screen: ['flights-hub', 'flight-alerts'] },
  { id: 'alert', actor: 'traveler', art: 'priceCurve' },
  { id: 'found', actor: 'traveler', screen: 'flights-found' },
  { id: 'book', actor: 'traveler', art: 'route' },
]
