/**
 * Phase 1 du concours (du 27 septembre au 5 octobre 20 h 30, Paris), classée
 * avec l'ancienne formule : (minutes × 2 + écrans × 3 + bugs × 50) / 10.
 * Le barème du guide (`bareme.ts`) prend le relais pour la suite du concours.
 */
export interface TesteurPhase1 {
  /** Prénom + initiale, ou null pour un compte sans nom (« Testeur anonyme »). */
  nom: string | null
  sessions: number
  minutes: number
  ecrans: number
  bugs: number
}

export interface LignePhase1 extends TesteurPhase1 {
  rang: number
  score: number
}

function positif(valeur: number): number {
  return Number.isFinite(valeur) && valeur > 0 ? valeur : 0
}

export function scorePhase1(t: Pick<TesteurPhase1, 'minutes' | 'ecrans' | 'bugs'>): number {
  const brut = (positif(t.minutes) * 2 + positif(t.ecrans) * 3 + positif(t.bugs) * 50) / 10
  return Math.round(brut * 10) / 10
}

export function classerPhase1(testeurs: TesteurPhase1[]): LignePhase1[] {
  const lignes = testeurs
    .map(t => ({ ...t, score: scorePhase1(t), rang: 0 }))
    .sort((a, b) => b.score - a.score || (a.nom ?? '~').localeCompare(b.nom ?? '~', 'fr'))
  lignes.forEach((ligne, i) => {
    const precedente = lignes[i - 1]
    ligne.rang = precedente && precedente.score === ligne.score ? precedente.rang : i + 1
  })
  return lignes
}

function majuscule(mot: string): string {
  return mot.charAt(0).toLocaleUpperCase('fr') + mot.slice(1).toLocaleLowerCase('fr')
}

/**
 * Les résultats ne sont montrés qu'à partir de l'heure de révélation, et
 * jamais au rendu serveur (heure du visiteur inconnue, `null`) : le HTML
 * statique ne les contient pas, même déployé avant l'heure.
 */
export function phase1Visible(revelation: string, maintenant: Date | null, nombre: number): boolean {
  if (!maintenant || nombre === 0) return false
  return maintenant.getTime() >= Date.parse(revelation)
}

/** « cheick kassoum » + « DIALLO » → « Cheick Kassoum D. » ; sans prénom → null. */
export function nomPublic(prenom: string | null, nom: string | null): string | null {
  const p = (prenom ?? '').trim()
  if (!p) return null
  const prenomPropre = p
    .split(/\s+/)
    .map(mot => mot.split('-').map(majuscule).join('-'))
    .join(' ')
  const initiale = (nom ?? '').trim().charAt(0).toLocaleUpperCase('fr')
  return initiale ? `${prenomPropre} ${initiale}.` : prenomPropre
}
