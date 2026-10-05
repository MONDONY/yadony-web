/**
 * Fenêtre d'annonce du concours bêta-testeurs, ouverte à l'arrivée sur le
 * site. Une fois fermée, elle ne revient plus de la visite : le choix est
 * gardé en sessionStorage (propre à l'onglet), donc elle se rouvre à la visite
 * suivante (nouvel onglet, navigateur rouvert). Clé propre à ce concours.
 */
export const CONTEST_POPUP_KEY = 'yadony-concours-2026-10-ferme'

const PAGES_CLASSEMENT = /^\/(en\/leaderboard|classement)\/?$/

export interface ContextePopup {
  chemin: string
  stocke: string | null
  maintenant: Date
  debut: string
  fin: string
}

/**
 * Affichée tant que le concours n'est pas terminé (avant le départ, elle
 * l'annonce), sauf si le visiteur l'a déjà fermée ou se trouve déjà sur la
 * page du classement.
 */
export function doitAfficherPopup(ctx: ContextePopup): boolean {
  if (ctx.stocke === '1') return false
  if (PAGES_CLASSEMENT.test(ctx.chemin)) return false
  return ctx.maintenant.getTime() < Date.parse(ctx.fin)
}

export function compteARebours(
  echeance: string,
  maintenant: Date,
): { jours: number; heures: number; minutes: number } {
  const restant = Math.max(0, Date.parse(echeance) - maintenant.getTime())
  return {
    jours: Math.floor(restant / 86_400_000),
    heures: Math.floor((restant % 86_400_000) / 3_600_000),
    minutes: Math.floor((restant % 3_600_000) / 60_000),
  }
}
