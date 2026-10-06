import { BAREME, POINTS, type TestKey } from './bareme'
import type { ClassementData, Testeur } from './types'
import { bonusDefis, bugsDefis, DEFI_POINTS_BUG, type Defi } from './defis'

export type CleDetail = TestKey | 'bug' | 'suggestion' | 'avis_ecran' | 'premier' | 'defi' | 'defi_bug'

export interface LigneDetail {
  cle: CleDetail
  points: number
  /** Nombre d'éléments pour les lignes comptées à l'unité (bugs, suggestions, écrans), numéro pour un défi. */
  nombre?: number
}

export interface Compteurs {
  bugs: number
  suggestions: number
  ecransAvecAvis: number
}

export interface Score {
  total: number
  detail: LigneDetail[]
  testsValides: TestKey[]
  /** Compteurs normalisés (entiers positifs), à afficher à la place des valeurs brutes. */
  compteurs: Compteurs
  /** Tests du compteur « n / 26 » : tests à action, plus avis écran et suggestion s'il y en a. */
  nbTests: number
}

export type LigneClassement = Testeur & Score & { rang: number }

export type StatutPeriode = 'bientot' | 'en_cours' | 'termine'

function estTest(cle: string): cle is TestKey {
  return Object.prototype.hasOwnProperty.call(BAREME, cle)
}

function compteur(valeur: number): number {
  return Number.isFinite(valeur) && valeur > 0 ? Math.floor(valeur) : 0
}

/**
 * `premiersCles` : tests que ce testeur a réussis en premier (bonus de 40 points chacun).
 * `defis` : défis quotidiens qu'il a gagnés, avec leurs points.
 * `bugsDefi` : bugs pertinents trouvés sur les parcours des défis (40 points chacun).
 */
export function scoreTesteur(
  t: Testeur,
  premiersCles: string[] = [],
  defis: { numero: number; points: number }[] = [],
  bugsDefi = 0,
): Score {
  const valides = [...new Set(t.tests ?? [])].filter(estTest)
  const nbPremiers = new Set(premiersCles.filter(cle => (valides as string[]).includes(cle))).size
  const detail: LigneDetail[] = valides.map(cle => ({ cle, points: BAREME[cle] }))
  const compteurs: Compteurs = {
    bugs: compteur(t.bugs),
    suggestions: compteur(t.suggestions),
    ecransAvecAvis: compteur(t.ecransAvecAvis),
  }

  const unitaires: [CleDetail, number, number][] = [
    ['bug', compteurs.bugs, POINTS.bug],
    ['suggestion', compteurs.suggestions, POINTS.suggestion],
    ['avis_ecran', compteurs.ecransAvecAvis, POINTS.avisEcran],
    ['premier', nbPremiers, POINTS.premier],
    ['defi_bug', compteur(bugsDefi), DEFI_POINTS_BUG],
  ]
  for (const [cle, nombre, unite] of unitaires) {
    if (nombre > 0) detail.push({ cle, points: nombre * unite, nombre })
  }

  for (const d of defis) detail.push({ cle: 'defi', points: d.points, nombre: d.numero })

  // Tri stable : à points égaux, l'ordre du JSON puis bugs, suggestions, écrans.
  detail.sort((a, b) => b.points - a.points)
  const testsValides = detail.map(l => l.cle).filter(estTest)
  return {
    total: detail.reduce((somme, ligne) => somme + ligne.points, 0),
    detail,
    testsValides,
    compteurs,
    nbTests:
      testsValides.length + (compteurs.ecransAvecAvis > 0 ? 1 : 0) + (compteurs.suggestions > 0 ? 1 : 0),
  }
}

function heure(iso: string | null): number {
  const t = iso ? Date.parse(iso) : Number.NaN
  return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY
}

/**
 * Classe les testeurs par total décroissant. Les ex æquo partagent le rang
 * (1, 1, 3) ; à l'affichage, le premier à avoir atteint le total passe devant,
 * puis l'ordre alphabétique.
 */
export function classer(
  testeurs: Testeur[],
  premiers: Record<string, string> = {},
  defis: Defi[] = [],
): LigneClassement[] {
  const vus = new Set<string>()
  const uniques = testeurs.filter(t => !vus.has(t.id) && vus.add(t.id))
  const lignes = uniques
    .map(t => {
      const cles = Object.keys(premiers).filter(cle => premiers[cle] === t.id)
      return { ...t, ...scoreTesteur(t, cles, bonusDefis(t.id, defis), bugsDefis(t.id, defis)), rang: 0 }
    })
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

/**
 * Heure de référence du HTML prérendu. Sans mise à jour, on se place juste
 * avant le début : la page partagée avant 20 h 30 affiche « Bientôt », y
 * compris dans les aperçus de lien qui n'exécutent pas le JavaScript.
 */
export function instantInitial(data: ClassementData): Date {
  return data.miseAJour ? new Date(data.miseAJour) : new Date(Date.parse(data.debut) - 1)
}

/** Locale des dates : la version anglaise du site est en-GB (24 h, jour avant le mois). */
export function localeDates(locale: string): 'fr-FR' | 'en-GB' {
  return locale === 'en' ? 'en-GB' : 'fr-FR'
}
