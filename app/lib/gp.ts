// Pages « GP vérifié » (/gp/{slug}), en français seulement : le terme GP,
// employé par la diaspora pour le voyageur qui transporte des colis, n'a pas
// d'équivalent anglais. Contenu sous gp.pages.{key} (i18n/locales/fr/gp.json).
import type { Corridor } from './corridors'

export interface GpPage {
  key: string
  slug: string
  from: string
  to: string
}

export const gpPages: GpPage[] = [
  { key: 'parisDakar', slug: 'paris-dakar', from: 'Paris', to: 'Dakar' },
  { key: 'parisAbidjan', slug: 'paris-abidjan', from: 'Paris', to: 'Abidjan' },
  { key: 'parisBamako', slug: 'paris-bamako', from: 'Paris', to: 'Bamako' },
  { key: 'parisDouala', slug: 'paris-douala', from: 'Paris', to: 'Douala' },
]

export function findGpPage(slug: unknown): GpPage | null {
  if (typeof slug !== 'string') return null
  return gpPages.find(page => page.slug === slug) ?? null
}

export function gpForCorridor(corridor: Corridor): GpPage | null {
  return findGpPage(corridor.slug)
}
