import { describe, expect, it } from 'vitest'
import { classerFinal } from '@/lib/classement/final'
import { classerPhase1 } from '@/lib/classement/phase1'
import { classer } from '@/lib/classement/score'
import type { ClassementData } from '@/lib/classement/types'
import type { Defi } from '@/lib/classement/defis'
import donnees from '@/data/classement.json'
import donneesPhase1 from '@/data/classement-phase1.json'
import donneesDefis from '@/data/defis.json'

describe('classerFinal', () => {
  it('additionne les deux phases par nom, phase 1 arrondie à l\'unité', () => {
    const lignes = classerFinal(
      [{ nom: 'Awa D.', score: 100.6 }, { nom: 'Koro D.', score: 10 }],
      [{ id: 'k', nom: 'Koro D.', total: 200 }, { id: 'm', nom: 'Moussa T.', total: 50 }],
    )
    expect(lignes).toEqual([
      { nom: 'Koro D.', phase1: 10, phase2: 200, total: 210, rang: 1 },
      { nom: 'Awa D.', phase1: 101, phase2: 0, total: 101, rang: 2 },
      { nom: 'Moussa T.', phase1: 0, phase2: 50, total: 50, rang: 3 },
    ])
  })

  it('distingue deux homonymes de la phase 1 par leur identifiant', () => {
    const lignes = classerFinal(
      [{ id: 'aaaaaaaa', nom: 'Ibrahim O.', score: 206 }, { id: 'bbbbbbbb', nom: 'Ibrahim O.', score: 7 }],
      [{ id: 'aaaaaaaa', nom: 'Ibrahim O.', total: 330 }],
    )
    expect(lignes.map(l => [l.nom, l.total])).toEqual([['Ibrahim O.', 536], ['Ibrahim O.', 7]])
  })

  it('ignore les comptes sans nom et partage le rang des ex æquo', () => {
    const lignes = classerFinal(
      [{ nom: null, score: 999 }, { nom: 'Awa D.', score: 5 }],
      [{ id: 'm', nom: 'Moussa T.', total: 5 }],
    )
    expect(lignes.map(l => [l.nom, l.rang])).toEqual([['Awa D.', 1], ['Moussa T.', 1]])
  })

  it('donne le classement final validé le 13/10 sur les données du site', () => {
    const data = donnees as ClassementData
    const phase2 = classer(data.testeurs, data.premiers, donneesDefis.defis as unknown as Defi[])
    const lignes = classerFinal(classerPhase1(donneesPhase1.testeurs), phase2)
    expect(lignes.slice(0, 10).map(l => [l.rang, l.nom, l.total, l.phase1, l.phase2])).toEqual([
      [1, 'Hadja Maferima T.', 2871, 651, 2220],
      [2, 'Koro D.', 2723, 613, 2110],
      [3, 'Salimata D.', 2626, 386, 2240],
      [4, 'Ibrahim D.', 1563, 233, 1330],
      [5, 'Mahoua O.', 1316, 356, 960],
      [6, "N'da O.", 978, 168, 810],
      [7, 'Ini N.', 702, 252, 450],
      [8, 'Ibrahim O.', 536, 206, 330],
      [9, 'Mariam D.', 460, 0, 460],
      [10, 'Tidiane H.', 282, 202, 80],
    ])
  })
})
