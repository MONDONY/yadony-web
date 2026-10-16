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

// Accueil : Awa (voyageuse) et Moussa (expéditeur) se croisent.
export const crossedJourney: JourneyStep[] = [
  { id: 'publish', actor: 'traveler', art: 'priceModes', pose: 'scale' },
  { id: 'search', actor: 'sender', screen: 'search-map', pose: 'search' },
  { id: 'negotiate', actor: 'both', art: 'negotiation', pose: 'handshake' },
  { id: 'escrow', actor: 'sender', art: 'padlock', pose: 'padlock' },
  { id: 'handover', actor: 'both', screen: 'scan', pose: 'scan' },
  { id: 'flight', actor: 'both', art: 'route', pose: 'travel' },
  { id: 'delivery', actor: 'both', art: 'timeline', pose: 'delivery' },
]

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

export const flightsJourney: JourneyStep[] = [
  { id: 'search', actor: 'traveler', screen: 'flights-search' },
  { id: 'deals', actor: 'traveler', screen: ['flights-hub', 'flight-alerts'] },
  { id: 'alert', actor: 'traveler', art: 'priceCurve' },
  { id: 'found', actor: 'traveler', screen: 'flights-found' },
  { id: 'book', actor: 'traveler', art: 'route' },
]
