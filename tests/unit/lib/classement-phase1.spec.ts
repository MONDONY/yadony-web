import { describe, expect, it } from 'vitest'
import { classerPhase1, nomPublic, scorePhase1 } from '@/lib/classement/phase1'
import donnees from '@/data/classement-phase1.json'

describe('scorePhase1', () => {
  it('applique (minutes × 2 + écrans × 3 + bugs × 50) / 10, arrondi au dixième', () => {
    expect(scorePhase1({ minutes: 862.6, ecrans: 1245, bugs: 6 })).toBe(576)
    expect(scorePhase1({ minutes: 284.4, ecrans: 1195, bugs: 8 })).toBe(455.4)
    expect(scorePhase1({ minutes: 412.1, ecrans: 762, bugs: 11 })).toBe(366)
  })

  it('ramène les valeurs absentes ou négatives à zéro', () => {
    expect(scorePhase1({ minutes: Number.NaN, ecrans: -3, bugs: 1 })).toBe(5)
  })
})

describe('classerPhase1', () => {
  it('trie par score décroissant et partage le rang des ex æquo', () => {
    const lignes = classerPhase1([
      { nom: 'Awa D.', sessions: 1, minutes: 10, ecrans: 10, bugs: 0 },
      { nom: 'Koro D.', sessions: 1, minutes: 100, ecrans: 100, bugs: 1 },
      { nom: 'Moussa T.', sessions: 1, minutes: 10, ecrans: 10, bugs: 0 },
    ])
    expect(lignes.map(l => [l.nom, l.rang, l.score])).toEqual([
      ['Koro D.', 1, 55],
      ['Awa D.', 2, 5],
      ['Moussa T.', 2, 5],
    ])
  })
})

describe('nomPublic', () => {
  it('garde le prénom et l’initiale du nom, avec majuscules', () => {
    expect(nomPublic('Koro', 'DIAKITE')).toBe('Koro D.')
    expect(nomPublic('cheick kassoum', 'DIALLO')).toBe('Cheick Kassoum D.')
    expect(nomPublic("N'da", 'Ouattara')).toBe("N'da O.")
    expect(nomPublic('Aïcha', 'barry')).toBe('Aïcha B.')
  })

  it('affiche « Testeur anonyme » sans prénom', () => {
    expect(nomPublic('', '')).toBeNull()
    expect(nomPublic(null, 'Diallo')).toBeNull()
  })
})

describe('données de la phase 1', () => {
  it('couvre la période du 27 septembre au 5 octobre 20 h 30 (Paris)', () => {
    expect(donnees.debut).toBe('2026-09-26T22:00:00Z')
    expect(donnees.fin).toBe('2026-10-05T18:30:00Z')
  })

  it('ne publie ni email ni identifiant complet', () => {
    const texte = JSON.stringify(donnees.testeurs)
    expect(texte).not.toMatch(/@/)
    expect(texte).not.toMatch(/[A-Za-z0-9]{20,}/)
  })
})
