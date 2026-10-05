import { BAREME, POINTS, type TestKey } from './bareme'
import type { Testeur } from './types'

export type CleDetail = TestKey | 'bug' | 'suggestion' | 'avis_ecran'

export interface LigneDetail {
  cle: CleDetail
  points: number
  /** Nombre d'éléments pour les lignes comptées à l'unité (bugs, suggestions, écrans). */
  nombre?: number
}

export interface Score {
  total: number
  detail: LigneDetail[]
  testsValides: TestKey[]
}

export type LigneClassement = Testeur & Score & { rang: number }

export type StatutPeriode = 'bientot' | 'en_cours' | 'termine'

function estTest(cle: string): cle is TestKey {
  return Object.prototype.hasOwnProperty.call(BAREME, cle)
}

function compteur(valeur: number): number {
  return Number.isFinite(valeur) && valeur > 0 ? Math.floor(valeur) : 0
}

export function scoreTesteur(t: Testeur): Score {
  const valides = [...new Set(t.tests)].filter(estTest)
  const detail: LigneDetail[] = valides.map(cle => ({ cle, points: BAREME[cle] }))

  const unitaires: [CleDetail, number, number][] = [
    ['bug', compteur(t.bugs), POINTS.bug],
    ['suggestion', compteur(t.suggestions), POINTS.suggestion],
    ['avis_ecran', compteur(t.ecransAvecAvis), POINTS.avisEcran],
  ]
  for (const [cle, nombre, unite] of unitaires) {
    if (nombre > 0) detail.push({ cle, points: nombre * unite, nombre })
  }

  // Tri stable : à points égaux, l'ordre du JSON puis bugs, suggestions, écrans.
  detail.sort((a, b) => b.points - a.points)
  return {
    total: detail.reduce((somme, ligne) => somme + ligne.points, 0),
    detail,
    testsValides: detail.map(l => l.cle).filter(estTest),
  }
}

function heure(iso: string | null): number {
  return iso ? Date.parse(iso) : Number.POSITIVE_INFINITY
}

/**
 * Classe les testeurs par total décroissant. Les ex æquo partagent le rang
 * (1, 1, 3) ; à l'affichage, le premier à avoir atteint le total passe devant,
 * puis l'ordre alphabétique.
 */
export function classer(testeurs: Testeur[]): LigneClassement[] {
  const lignes = testeurs
    .map(t => ({ ...t, ...scoreTesteur(t), rang: 0 }))
    .sort(
      (a, b) =>
        b.total - a.total ||
        heure(a.dernierPoint) - heure(b.dernierPoint) ||
        a.nom.localeCompare(b.nom, 'fr'),
    )
  lignes.forEach((ligne, i) => {
    const precedente = lignes[i - 1]
    ligne.rang = precedente && precedente.total === ligne.total ? precedente.rang : i + 1
  })
  return lignes
}

export function statutPeriode(debut: string, fin: string, maintenant: Date): StatutPeriode {
  const t = maintenant.getTime()
  if (t < Date.parse(debut)) return 'bientot'
  return t < Date.parse(fin) ? 'en_cours' : 'termine'
}

export function progression(debut: string, fin: string, maintenant: Date): number {
  const d = Date.parse(debut)
  const ratio = (maintenant.getTime() - d) / (Date.parse(fin) - d)
  return Math.min(1, Math.max(0, ratio))
}

export function joursRestants(fin: string, maintenant: Date): number {
  const restant = Date.parse(fin) - maintenant.getTime()
  return restant > 0 ? Math.ceil(restant / 86_400_000) : 0
}
