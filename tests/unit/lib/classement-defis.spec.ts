import { describe, expect, it } from 'vitest'
import { bonusDefis, bugsDefis, DEFI_POINTS_BUG, defiAffiche, etatDefi, type Defi } from '@/lib/classement/defis'
import { classer, scoreTesteur } from '@/lib/classement/score'
import type { Testeur } from '@/lib/classement/types'

const d1: Defi = { numero: 1, debut: '2026-10-06T17:30:00Z', fin: '2026-10-06T22:00:00Z', points: null, enonce: null, gagnant: null }
const d2: Defi = { numero: 2, debut: '2026-10-07T17:30:00Z', fin: '2026-10-07T22:00:00Z', points: null, enonce: null, gagnant: null }

function testeur(id: string, nom: string, tests: string[] = []): Testeur {
  return { id, nom, tests, bugs: 0, suggestions: 0, ecransAvecAvis: 0, indicatif: { ecrans: 0, minutes: 0 }, dernierPoint: null }
}

describe('etatDefi', () => {
  it('est à venir avant 19 h 30, en cours jusqu’à minuit, puis terminé', () => {
    expect(etatDefi(d1, new Date('2026-10-06T17:29:59Z'))).toBe('a_venir')
    expect(etatDefi(d1, new Date('2026-10-06T17:30:00Z'))).toBe('en_cours')
    expect(etatDefi(d1, new Date('2026-10-06T21:59:59Z'))).toBe('en_cours')
    expect(etatDefi(d1, new Date('2026-10-06T22:00:00Z'))).toBe('termine')
  })

  it('est terminé dès qu’un gagnant est désigné, même avant minuit', () => {
    const gagne: Defi = { ...d1, points: 150, gagnant: 'aaaa1111' }
    expect(etatDefi(gagne, new Date('2026-10-06T20:00:00Z'))).toBe('termine')
    expect(etatDefi(gagne, new Date('2026-10-06T17:00:00Z'))).toBe('a_venir')
  })
})

describe('defiAffiche', () => {
  it('montre le défi du jour tant qu’il n’est pas terminé', () => {
    expect(defiAffiche([d1, d2], new Date('2026-10-06T20:00:00Z'))?.numero).toBe(1)
  })

  it('passe au défi suivant une fois le précédent terminé', () => {
    expect(defiAffiche([d1, d2], new Date('2026-10-07T08:00:00Z'))?.numero).toBe(2)
  })

  it('garde le dernier défi affiché quand tous sont terminés', () => {
    expect(defiAffiche([d1, d2], new Date('2026-10-20T08:00:00Z'))?.numero).toBe(2)
  })

  it('ne montre rien sans défi', () => {
    expect(defiAffiche([], new Date())).toBeNull()
  })
})

describe('bonusDefis', () => {
  const gagne: Defi = { ...d1, points: 100, gagnant: 'aaaa1111' }

  it('donne les points du défi à son seul gagnant', () => {
    expect(bonusDefis('aaaa1111', [gagne, d2])).toEqual([{ numero: 1, points: 100 }])
    expect(bonusDefis('bbbb2222', [gagne, d2])).toEqual([])
  })

  it('ignore un défi sans gagnant ou sans points valides', () => {
    expect(bonusDefis('aaaa1111', [{ ...gagne, points: null }, { ...gagne, numero: 3, points: -20 }])).toEqual([])
  })
})

describe('points de défi dans le score', () => {
  it('ajoute une ligne « défi » au détail et au total', () => {
    const s = scoreTesteur(testeur('aaaa1111', 'Awa D.', ['filtres']), [], [{ numero: 1, points: 100 }])
    expect(s.total).toBe(120)
    expect(s.detail[0]).toEqual({ cle: 'defi', points: 100, nombre: 1 })
  })

  it('fait monter le gagnant du défi dans le classement', () => {
    const defis: Defi[] = [{ ...d1, points: 150, gagnant: 'bbbb2222' }]
    const lignes = classer([testeur('aaaa1111', 'Awa D.', ['outils']), testeur('bbbb2222', 'Koro D.', ['filtres'])], {}, defis)
    expect(lignes[0]!.nom).toBe('Koro D.')
    expect(lignes[0]!.total).toBe(170)
  })
})

describe('bugs trouvés sur les parcours des défis', () => {
  it('additionne les bugs d\'un testeur sur tous les défis, entiers positifs seulement', () => {
    const defis: Defi[] = [
      { ...d1, bugs: { aaaa1111: 2, bbbb2222: -1 } },
      { ...d2, bugs: { aaaa1111: 1.7, cccc3333: Number.NaN } },
    ]
    expect(bugsDefis('aaaa1111', defis)).toBe(3)
    expect(bugsDefis('bbbb2222', defis)).toBe(0)
    expect(bugsDefis('cccc3333', defis)).toBe(0)
    expect(bugsDefis('dddd4444', [d1])).toBe(0)
  })

  it('rapporte 40 points par bug, sur une ligne à part du détail', () => {
    expect(DEFI_POINTS_BUG).toBe(40)
    const defis: Defi[] = [{ ...d1, bugs: { bbbb2222: 2 } }]
    const lignes = classer([testeur('aaaa1111', 'Awa D.', ['outils']), testeur('bbbb2222', 'Koro D.', ['filtres'])], {}, defis)
    const koro = lignes.find(l => l.id === 'bbbb2222')!
    expect(koro.total).toBe(100)
    expect(koro.detail).toContainEqual({ cle: 'defi_bug', points: 80, nombre: 2 })
    expect(lignes.find(l => l.id === 'aaaa1111')!.detail.some(l => l.cle === 'defi_bug')).toBe(false)
  })
})
