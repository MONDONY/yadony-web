/**
 * Classement final du concours (validé par le fondateur le 13/10/2026) :
 * total = points de la phase 1 + points de la phase 2. La phase 1 est arrondie
 * à l'unité avant l'addition, pour que « 651 + 2 220 = 2 871 » tombe juste à l'écran.
 *
 * Les deux phases se rejoignent par le nom public, sauf pour les homonymes :
 * une entrée de phase 1 qui porte un `id` (8 premiers caractères de l'UID) ne
 * rejoint que la ligne de phase 2 de même identifiant (deux « Ibrahim O. »).
 */
export interface LigneFinale {
  nom: string
  phase1: number
  phase2: number
  total: number
  rang: number
}

export function classerFinal(
  phase1: { id?: string; nom: string | null; score: number }[],
  phase2: { id: string; nom: string; total: number }[],
): LigneFinale[] {
  const parCle = new Map<string, LigneFinale>()
  const ligne = (cle: string, nom: string) => {
    let l = parCle.get(cle)
    if (!l) parCle.set(cle, (l = { nom, phase1: 0, phase2: 0, total: 0, rang: 0 }))
    return l
  }
  const idsPhase1 = new Set(phase1.map(p => p.id).filter(Boolean))
  for (const p of phase1) if (p.nom) ligne(p.id ? `id:${p.id}` : `nom:${p.nom}`, p.nom).phase1 += Math.round(p.score)
  for (const p of phase2) ligne(idsPhase1.has(p.id) ? `id:${p.id}` : `nom:${p.nom}`, p.nom).phase2 += p.total

  const lignes = [...parCle.values()]
  for (const l of lignes) l.total = l.phase1 + l.phase2
  lignes.sort((a, b) => b.total - a.total || a.nom.localeCompare(b.nom, 'fr'))
  lignes.forEach((l, i) => {
    const precedente = lignes[i - 1]
    l.rang = precedente && precedente.total === l.total ? precedente.rang : i + 1
  })
  return lignes
}
