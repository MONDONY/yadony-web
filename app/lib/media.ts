// Registre des images du site : captures de l'app (anonymisées) et poses de
// la mascotte Dony. Les fichiers sont produits par `pnpm images`
// (scripts/images/build.mjs) et décrits par media-manifest.json.
import manifest from './media-manifest.json'

export const IMAGE_WIDTHS = { app: [480, 960], dony: [320, 640] } as const
export type ImageKind = keyof typeof IMAGE_WIDTHS

export interface SiteImage {
  kind: ImageKind
  /** Chemin public sans suffixe de largeur ni extension. */
  base: string
  width: number
  height: number
}

export const APP_SCREEN_IDS = [
  'flights-search',
  'flights-hub',
  'flight-alerts',
  'flights-found',
  'search-map',
  'trip-detail',
  'traveler-profile',
  'publish-trip',
  'my-trips',
  'negotiation',
  'scan',
  'my-parcels',
  'parcel-ticket',
  'parcel-tracking',
  'wallet',
  'mobile-money',
  'money-overview',
  'request-step1',
] as const
export type AppScreenId = (typeof APP_SCREEN_IDS)[number]

// Poses détourées existantes (dony_app/assets/mascotte) et poses demandées au
// propriétaire. Une pose absente du manifeste retombe sur sa pose de repli :
// déposer le fichier dans assets-src/dony/ puis lancer `pnpm images` suffit.
const POSE_FALLBACKS = {
  hello: 'hello',
  search: 'search',
  travel: 'travel',
  waiting: 'waiting',
  success: 'success',
  celebration: 'celebration',
  welcome: 'welcome',
  'no-result': 'no-result',
  'price-alert': 'search',
  ticket: 'travel',
  scale: 'success',
  'price-grid': 'welcome',
  handshake: 'hello',
  padlock: 'success',
  scan: 'waiting',
  window: 'travel',
  delivery: 'celebration',
  'id-card': 'success',
  download: 'hello',
} as const
export type DonyPoseId = keyof typeof POSE_FALLBACKS
export const DONY_POSE_IDS = Object.keys(POSE_FALLBACKS) as DonyPoseId[]

const files = manifest as Record<ImageKind, Record<string, { width: number; height: number }>>

function resolve(kind: ImageKind, id: string): SiteImage {
  const entry = files[kind][id]
  if (!entry) throw new Error(`Image absente du manifeste : ${kind}/${id}`)
  return { kind, base: `/img/${kind}/${id}`, ...entry }
}

export function appScreen(id: AppScreenId): SiteImage {
  return resolve('app', id)
}

export function donyPose(id: DonyPoseId): SiteImage {
  return resolve('dony', id in files.dony ? id : POSE_FALLBACKS[id])
}

export function srcset(base: string, format: 'avif' | 'webp', kind: ImageKind): string {
  return IMAGE_WIDTHS[kind].map(width => `${base}-${width}.${format} ${width}w`).join(', ')
}
