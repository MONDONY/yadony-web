// Corridors desservis, source des pages SEO /envoyer-colis/{slug}.
// Les slugs sont identiques dans les deux langues : ce sont des paires de
// villes, invariantes. Le contenu éditorial vit dans les fichiers de locale
// sous corridorPages.pages.{key}.

export interface Corridor {
  /** Clé des fichiers de locale (corridorPages.pages.{key}). */
  key: string
  /** Segment d'URL, commun aux deux langues. */
  slug: string
  from: string
  to: string
  /** Pays de destination (nom propre, invariant). */
  country: string
}

// Les cinq corridors de lancement restent en tête, dans leur ordre d'origine :
// leurs URL sont déjà connues de Google.
export const corridors: Corridor[] = [
  { key: 'parisAbidjan', slug: 'paris-abidjan', from: 'Paris', to: 'Abidjan', country: "Côte d'Ivoire" },
  { key: 'parisDakar', slug: 'paris-dakar', from: 'Paris', to: 'Dakar', country: 'Sénégal' },
  { key: 'lyonAbidjan', slug: 'lyon-abidjan', from: 'Lyon', to: 'Abidjan', country: "Côte d'Ivoire" },
  { key: 'marseilleBamako', slug: 'marseille-bamako', from: 'Marseille', to: 'Bamako', country: 'Mali' },
  { key: 'parisDouala', slug: 'paris-douala', from: 'Paris', to: 'Douala', country: 'Cameroun' },
  { key: 'parisBamako', slug: 'paris-bamako', from: 'Paris', to: 'Bamako', country: 'Mali' },
  { key: 'lyonDakar', slug: 'lyon-dakar', from: 'Lyon', to: 'Dakar', country: 'Sénégal' },
  { key: 'lyonBamako', slug: 'lyon-bamako', from: 'Lyon', to: 'Bamako', country: 'Mali' },
  { key: 'lyonDouala', slug: 'lyon-douala', from: 'Lyon', to: 'Douala', country: 'Cameroun' },
  { key: 'marseilleDakar', slug: 'marseille-dakar', from: 'Marseille', to: 'Dakar', country: 'Sénégal' },
  { key: 'marseilleAbidjan', slug: 'marseille-abidjan', from: 'Marseille', to: 'Abidjan', country: "Côte d'Ivoire" },
  { key: 'marseilleDouala', slug: 'marseille-douala', from: 'Marseille', to: 'Douala', country: 'Cameroun' },
]

export function findCorridor(slug: unknown): Corridor | null {
  if (typeof slug !== 'string') return null
  return corridors.find(corridor => corridor.slug === slug) ?? null
}

// Corridors voisins, pour le maillage interne : même destination d'abord
// (« envoyer un colis à Dakar » depuis une autre ville), puis même départ.
export function neighbors(corridor: Corridor, count = 4): Corridor[] {
  const sameDestination = corridors.filter(other => other !== corridor && other.to === corridor.to)
  const sameOrigin = corridors.filter(other => other !== corridor && other.from === corridor.from && other.to !== corridor.to)
  return [...sameDestination, ...sameOrigin].slice(0, count)
}
