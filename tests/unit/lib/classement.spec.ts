import { describe, expect, it } from 'vitest'
import { BAREME, POINTS, TEST_GROUPS, TEST_KEYS, TOTAL_TESTS } from '@/lib/classement/bareme'
import {
  classer,
  instantInitial,
  joursRestants,
  localeDates,
  progression,
  scoreTesteur,
  statutPeriode,
} from '@/lib/classement/score'
import type { Testeur } from '@/lib/classement/types'

function testeur(partiel: Partial<Testeur> & { id: string }): Testeur {
  return {
    nom: partiel.id,
    tests: [],
    bugs: 0,
    suggestions: 0,
    ecransAvecAvis: 0,
    indicatif: { ecrans: 0, minutes: 0 },
    dernierPoint: null,
    ...partiel,
  }
}

describe('barème', () => {
  it('reprend exactement les points du guide du concours', () => {
    expect(BAREME).toEqual({
      outils: 80,
      paiement_mm: 100,
      paiement_carte: 100,
      paiement_especes: 100,
      scenario_complet: 100,
      trois_continents: 40,
      parrainage: 40,
      avis_parcours: 40,
      grille_kilos: 40,
      absence_expediteur: 100,
      absence_destinataire_procedure: 80,
      absence_voyageur: 100,
      annulation_voyageur: 100,
      annulation_expediteur: 100,
      code_retour: 80,
      retard_voyageur: 60,
      destinataire_absent: 60,
      litige: 60,
      appels: 40,
      message_destinataire: 20,
      message_app: 20,
      nego_trajet: 60,
      nego_colis: 60,
      filtres: 20,
    })
    expect(POINTS).toEqual({ bug: 20, suggestion: 30, avisEcran: 20 })
    expect(TOTAL_TESTS).toBe(26)
  })

  it('range chaque test dans exactement un groupe', () => {
    const ranges = TEST_GROUPS.flatMap(g => g.tests)
    expect([...ranges].sort()).toEqual([...TEST_KEYS].sort())
    expect(new Set(ranges).size).toBe(ranges.length)
  })
})

describe('scoreTesteur', () => {
  it('additionne tests, bugs, suggestions et écrans avec avis', () => {
    const s = scoreTesteur(
      testeur({
        id: 'a',
        tests: ['outils', 'message_app', 'paiement_mm'],
        bugs: 2,
        suggestions: 1,
        ecransAvecAvis: 3,
      }),
    )
    expect(s.total).toBe(80 + 20 + 100 + 2 * 20 + 30 + 3 * 20)
    expect(s.testsValides).toEqual(['paiement_mm', 'outils', 'message_app'])
  })

  it('ignore un test en double et une clé inconnue', () => {
    const s = scoreTesteur(testeur({ id: 'a', tests: ['litige', 'litige', 'inconnu'] }))
    expect(s.total).toBe(60)
    expect(s.detail).toEqual([{ cle: 'litige', points: 60 }])
  })

  it('ramène les compteurs négatifs, non entiers ou absents à des entiers positifs', () => {
    const s = scoreTesteur(
      testeur({ id: 'a', bugs: -3, suggestions: 1.9, ecransAvecAvis: Number.NaN }),
    )
    expect(s.total).toBe(30)
    expect(s.detail).toEqual([{ cle: 'suggestion', points: 30, nombre: 1 }])
  })

  it('ordonne le détail par points décroissants', () => {
    const s = scoreTesteur(
      testeur({ id: 'a', tests: ['filtres', 'scenario_complet'], bugs: 3, ecransAvecAvis: 1 }),
    )
    expect(s.detail.map(l => l.points)).toEqual([100, 60, 20, 20])
    expect(s.detail.find(l => l.cle === 'bug')).toEqual({ cle: 'bug', points: 60, nombre: 3 })
    expect(s.detail.find(l => l.cle === 'avis_ecran')).toEqual({
      cle: 'avis_ecran',
      points: 20,
      nombre: 1,
    })
  })

  it('donne zéro à un testeur sans activité', () => {
    expect(scoreTesteur(testeur({ id: 'a' }))).toEqual({
      total: 0,
      detail: [],
      testsValides: [],
      compteurs: { bugs: 0, suggestions: 0, ecransAvecAvis: 0 },
      nbTests: 0,
    })
  })
})

describe('classer', () => {
  it('trie par total décroissant et partage le rang en cas d’égalité', () => {
    const lignes = classer([
      testeur({ id: 'c', tests: ['filtres'] }),
      testeur({ id: 'a', tests: ['litige'], dernierPoint: '2026-10-06T10:00:00Z' }),
      testeur({ id: 'b', tests: ['nego_colis'], dernierPoint: '2026-10-06T09:00:00Z' }),
    ])
    expect(lignes.map(l => [l.id, l.rang, l.total])).toEqual([
      ['b', 1, 60],
      ['a', 1, 60],
      ['c', 3, 20],
    ])
  })

  it('départage à égalité sans date par le nom, et met les dates absentes après', () => {
    const lignes = classer([
      testeur({ id: 'z', nom: 'Zoé K.', tests: ['filtres'] }),
      testeur({ id: 'y', nom: 'Awa D.', tests: ['filtres'] }),
      testeur({ id: 'x', nom: 'Moussa T.', tests: ['filtres'], dernierPoint: '2026-10-07T00:00:00Z' }),
    ])
    expect(lignes.map(l => l.id)).toEqual(['x', 'y', 'z'])
  })

  it('renvoie une liste vide sans testeur', () => {
    expect(classer([])).toEqual([])
  })
})

describe('période', () => {
  const debut = '2026-10-05T18:30:00Z'
  const fin = '2026-10-12T18:30:00Z'

  it('donne le statut selon la date', () => {
    expect(statutPeriode(debut, fin, new Date('2026-10-05T18:29:59Z'))).toBe('bientot')
    expect(statutPeriode(debut, fin, new Date(debut))).toBe('en_cours')
    expect(statutPeriode(debut, fin, new Date(fin))).toBe('termine')
  })

  it('borne la progression entre 0 et 1', () => {
    expect(progression(debut, fin, new Date('2026-10-01T00:00:00Z'))).toBe(0)
    expect(progression(debut, fin, new Date('2026-10-09T06:30:00Z'))).toBeCloseTo(0.5)
    expect(progression(debut, fin, new Date('2026-10-20T00:00:00Z'))).toBe(1)
  })

  it('compte les jours restants à l’arrondi supérieur, jamais négatifs', () => {
    expect(joursRestants(fin, new Date('2026-10-12T17:30:00Z'))).toBe(1)
    expect(joursRestants(fin, new Date('2026-10-08T18:30:00Z'))).toBe(4)
    expect(joursRestants(fin, new Date('2026-10-13T00:00:00Z'))).toBe(0)
  })
})

describe('compteurs affichés', () => {
  it('compte les tests affichés « n / 26 » à partir des valeurs normalisées', () => {
    const s = scoreTesteur(
      testeur({ id: 'a', tests: ['litige', 'filtres'], ecransAvecAvis: 2, suggestions: 1 }),
    )
    expect(s.nbTests).toBe(4)
    expect(s.compteurs).toEqual({ bugs: 0, suggestions: 1, ecransAvecAvis: 2 })
  })

  it('ne compte pas un demi-écran ni une valeur absente', () => {
    const brut = { id: 'a', ecransAvecAvis: 0.5, bugs: undefined } as unknown as Partial<Testeur> & { id: string }
    const s = scoreTesteur(testeur(brut))
    expect(s.nbTests).toBe(0)
    expect(s.compteurs).toEqual({ bugs: 0, suggestions: 0, ecransAvecAvis: 0 })
  })
})

describe('classer : identifiants en double', () => {
  it('garde la première occurrence d’un même testeur', () => {
    const lignes = classer([
      testeur({ id: 'a', nom: 'Awa D.', tests: ['litige'] }),
      testeur({ id: 'a', nom: 'Awa D.', tests: ['filtres'] }),
    ])
    expect(lignes).toHaveLength(1)
    expect(lignes[0]!.total).toBe(60)
  })
})

describe('instantInitial', () => {
  const data = { debut: '2026-10-05T18:30:00Z', fin: '2026-10-12T18:30:00Z', testeurs: [] }

  it('se place juste avant le début quand le classement n’a jamais été mis à jour', () => {
    const t = instantInitial({ ...data, miseAJour: null })
    expect(statutPeriode(data.debut, data.fin, t)).toBe('bientot')
  })

  it('reprend l’heure de la dernière mise à jour', () => {
    expect(instantInitial({ ...data, miseAJour: '2026-10-07T09:00:00Z' }).toISOString()).toBe(
      '2026-10-07T09:00:00.000Z',
    )
  })
})

describe('localeDates', () => {
  it('formate les dates anglaises à la britannique et les françaises en français', () => {
    expect(localeDates('en')).toBe('en-GB')
    expect(localeDates('fr')).toBe('fr-FR')
    expect(localeDates('de')).toBe('fr-FR')
  })
})
