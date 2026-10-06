/**
 * Défis quotidiens du concours : un énoncé dévoilé à 19 h 30, à réussir avant
 * minuit (heure de Paris). Seul le plus rapide gagne les points ; si personne
 * ne réussit, personne ne les gagne. Écrits dans `app/data/defis.json`.
 */
export interface Defi {
  numero: number
  /** Dévoilement de l'énoncé (ISO). */
  debut: string
  /** Fin du défi (ISO). */
  fin: string
  /** Points en jeu (50 à 150), connus avec l'énoncé. */
  points: number | null
  /** Énoncé, publié à l'heure du dévoilement seulement (le site est statique). */
  enonce: { fr: string; en: string } | null
  /** Id (8 caractères) du gagnant, renseigné après la fin. */
  gagnant: string | null
  /** Bugs pertinents trouvés sur les parcours du défi et validés par l'équipe, par id (8 caractères). */
  bugs?: Record<string, number>
  /** Testeurs qui ont réussi le défi, dans l'ordre d'arrivée (nom affiché, heure de fin ISO). */
  reussites?: { nom: string; fin: string }[]
  /** Testeurs qui n'ont réussi qu'une partie du défi (nombre de parties réussies), dans l'ordre d'arrivée. */
  partiels?: { nom: string; parties: number }[]
  /** Récit du défi une fois terminé : ce qui s'est passé, partie par partie. */
  bilan?: { titre: { fr: string; en: string }; texte: { fr: string; en: string } }[]
}

export type EtatDefi = 'a_venir' | 'en_cours' | 'termine'

export const DEFI_POINTS = { min: 50, max: 150 } as const

/** Points par bug pertinent trouvé sur les parcours d'un défi. */
export const DEFI_POINTS_BUG = 40

export function etatDefi(defi: Defi, maintenant: Date): EtatDefi {
  const t = maintenant.getTime()
  if (t < Date.parse(defi.debut)) return 'a_venir'
  // Le plus rapide gagne : un gagnant désigné clôt le défi avant minuit.
  if (defi.gagnant) return 'termine'
  return t < Date.parse(defi.fin) ? 'en_cours' : 'termine'
}

/** Le défi du moment : le premier pas encore terminé, sinon le dernier. */
export function defiAffiche(defis: Defi[], maintenant: Date): Defi | null {
  if (!defis.length) return null
  return defis.find(d => etatDefi(d, maintenant) !== 'termine') ?? defis[defis.length - 1]!
}

/** Points de défi gagnés par un testeur. */
export function bonusDefis(id: string, defis: Defi[]): { numero: number; points: number }[] {
  return defis
    .filter(d => d.gagnant === id && typeof d.points === 'number' && d.points > 0)
    .map(d => ({ numero: d.numero, points: d.points as number }))
}

/** Nombre de bugs pertinents trouvés par un testeur sur les parcours des défis. */
export function bugsDefis(id: string, defis: Defi[]): number {
  return defis.reduce((somme, d) => {
    const n = d.bugs?.[id] ?? 0
    return somme + (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0)
  }, 0)
}
