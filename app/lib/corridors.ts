// Corridors desservis, source des pages SEO /envoyer-colis/{slug}.
// Les slugs sont identiques dans les deux langues : ce sont des paires de
// villes, invariantes. Le contenu éditorial vit dans les fichiers de locale
// sous corridors.pages.{key}.

export interface Corridor {
  /** Clé des fichiers de locale (corridors.pages.{key}). */
  key: string
  /** Segment d'URL, commun aux deux langues. */
  slug: string
  from: string
  to: string
  /** Pays de destination (nom propre, invariant). */
  country: string
  /** Durée de vol directe indicative, en heures (fait vérifiable). */
  flightHours: number
}

export const corridors: Corridor[] = [
  { key: 'parisDakar', slug: 'paris-dakar', from: 'Paris', to: 'Dakar', country: 'Sénégal', flightHours: 5.5 },
  { key: 'lyonAbidjan', slug: 'lyon-abidjan', from: 'Lyon', to: 'Abidjan', country: "Côte d'Ivoire", flightHours: 6.5 },
  { key: 'marseilleBamako', slug: 'marseille-bamako', from: 'Marseille', to: 'Bamako', country: 'Mali', flightHours: 5.5 },
  { key: 'parisDouala', slug: 'paris-douala', from: 'Paris', to: 'Douala', country: 'Cameroun', flightHours: 6.5 },
]

export function findCorridor(slug: unknown): Corridor | null {
  if (typeof slug !== 'string') return null
  return corridors.find(corridor => corridor.slug === slug) ?? null
}
