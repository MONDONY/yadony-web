import { describe, expect, it } from 'vitest'
import { normaliserPremiers, premiersDe } from '@/lib/classement/premiers'
import type { Testeur } from '@/lib/classement/types'

function testeur(id: string, nom: string, tests: string[]): Testeur {
  return {
    id,
    nom,
    tests,
    bugs: 0,
    suggestions: 0,
    ecransAvecAvis: 0,
    indicatif: { ecrans: 0, minutes: 0 },
    dernierPoint: null,
  }
}

const testeurs = [
  testeur('a', 'Awa D.', ['litige', 'filtres']),
  testeur('b', 'Koro D.', ['litige']),
]

describe('normaliserPremiers', () => {
  it('associe chaque test à son premier testeur', () => {
    expect(normaliserPremiers({ litige: 'b', filtres: 'a' }, testeurs)).toEqual({
      litige: { id: 'b', nom: 'Koro D.' },
      filtres: { id: 'a', nom: 'Awa D.' },
    })
  })

  it('ignore une clé de test inconnue, un testeur absent, ou un testeur qui n’a pas validé le test', () => {
    expect(
      normaliserPremiers({ inconnu: 'a', appels: 'z', filtres: 'b' }, testeurs),
    ).toEqual({})
  })

  it('accepte l’absence de données', () => {
    expect(normaliserPremiers(undefined, testeurs)).toEqual({})
  })
})

describe('premiersDe', () => {
  it('liste les tests réussis en premier par un testeur', () => {
    const premiers = normaliserPremiers({ litige: 'b', filtres: 'a' }, testeurs)
    expect(premiersDe('a', premiers)).toEqual(['filtres'])
    expect(premiersDe('b', premiers)).toEqual(['litige'])
    expect(premiersDe('c', premiers)).toEqual([])
  })
})
