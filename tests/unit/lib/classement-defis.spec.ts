import { describe, expect, it } from 'vitest'
import { bonusDefis, bugsDefis, gagnantsDefi, DEFI_POINTS_BUG, defiAffiche, etatDefi, type Defi } from '@/lib/classement/defis'
import defisData from '../../../app/data/defis.json'
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

  it('est terminé dès que des gagnants sont désignés, même avant la fin', () => {
    const duo: Defi = { ...d1, points: 150, gagnants: ['aaaa1111', 'bbbb2222'] }
    expect(etatDefi(duo, new Date('2026-10-06T20:00:00Z'))).toBe('termine')
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

describe('données des défis', () => {
  it('annonce le défi n°2 de 21 h 00 à 23 h 30 (heure de Paris), avec son énoncé en cinq sujets et 200 points', () => {
    const [un, deux] = defisData.defis as Defi[]
    expect(un!.numero).toBe(1)
    expect(deux!.numero).toBe(2)
    expect(deux!.debut).toBe('2026-10-07T19:00:00Z')
    expect(deux!.fin).toBe('2026-10-07T21:30:00Z')
    expect(deux!.points).toBe(200)
    expect(deux!.enonce!.fr).toContain('Le colis qui revient')
    expect(deux!.enonce!.fr).toContain('Négocier jusqu\'au bout')
    expect(deux!.enonce!.fr).toContain('Le destinataire qui refuse')
    expect(deux!.enonce!.fr.startsWith('Prérequis : installez la dernière version de l\'application (TestFlight sur iPhone, Play Store sur Android).\n')).toBe(true)
    expect(deux!.enonce!.en.startsWith('Prerequisite: install the latest version of the app (TestFlight on iPhone, Play Store on Android).\n')).toBe(true)
    expect(deux!.enonce!.fr).toContain('Le colis qui revient (2 personnes : un expéditeur et un voyageur)')
    expect(deux!.enonce!.fr).toContain('Négocier jusqu\'au bout (2 personnes : un expéditeur et un voyageur)')
    expect(deux!.enonce!.fr).toContain('Le destinataire qui refuse (3 personnes : le destinataire, le voyageur et l\'expéditeur)')
    expect(deux!.enonce!.en).toContain('(3 people: the recipient, the traveller and the sender)')
    expect(deux!.enonce!.fr).toContain('gagne 200 points')
    expect(deux!.enonce!.fr).toContain('Relève les 5 défis avant 23 h 30')
    expect(deux!.enonce!.fr).toContain('1. S\'abonner à deux autres utilisateurs (3 personnes : toi et les deux utilisateurs suivis)')
    expect(deux!.enonce!.fr).toContain('2. Publier deux demandes d\'envoi (1 personne : l\'expéditeur)')
    expect(deux!.enonce!.fr).toContain('3. Le colis qui revient')
    expect(deux!.enonce!.fr).toContain('4. Négocier jusqu\'au bout')
    expect(deux!.enonce!.fr).toContain('5. Le destinataire qui refuse')
    expect(deux!.enonce!.en).toContain('Complete all 5 challenges before 11:30 pm')
    expect(deux!.enonce!.en).toContain('1. Follow two other users (3 people: you and the two users you follow)')
    expect(deux!.enonce!.en).toContain('2. Publish two shipping requests (1 person: the sender)')
    expect(deux!.enonce!.fr).toContain('Pour gagner, il faut avoir réussi les cinq sujets.')
    expect(deux!.enonce!.fr).toContain('Si deux testeurs réussissent ensemble les sujets 3 et 4 en binôme, ils gagnent ensemble : les deux reçoivent 200 points.')
    expect(deux!.enonce!.fr).toContain('terminez par l\'annulation du voyageur, qui clôt le colis')
    expect(deux!.enonce!.fr).toContain('compte Yadony dont le numéro (format international)')
    expect(deux!.enonce!.en).toContain('To win, you must complete all five topics.')
    expect(deux!.enonce!.en).toContain('If two testers complete topics 3 and 4 together as a pair, they win together: both receive 200 points.')
    expect(deux!.enonce!.en).toContain('finish with the traveller\'s cancellation')
    expect(deux!.enonce!.en).toContain('wins 200 points')
    expect(deux!.enonce!.en).toContain('before 11:30 pm')
    expect(deux!.gagnants).toEqual(['ftAUL354', '1aM5LVzU'])
    expect(deux!.sujets).toBe(5)
    expect(bonusDefis('ftAUL354', defisData.defis as Defi[])).toContainEqual({ numero: 2, points: 200 })
    expect(bonusDefis('1aM5LVzU', defisData.defis as Defi[])).toContainEqual({ numero: 2, points: 200 })
    expect(deux!.reussites!.map(r => r.nom)).toEqual(['Ibrahim D.', 'Koro D.'])
    expect(deux!.bilan).toHaveLength(6)
    expect(etatDefi(deux!, new Date('2026-10-07T12:00:00Z'))).toBe('a_venir')
    expect(etatDefi(deux!, new Date('2026-10-07T19:00:00Z'))).toBe('termine')
    expect(etatDefi(deux!, new Date('2026-10-07T21:30:00Z'))).toBe('termine')
  })

  it('met le défi n°2 en avant dès que le n°1 a un gagnant', () => {
    expect(defiAffiche(defisData.defis as Defi[], new Date('2026-10-07T12:00:00Z'))!.numero).toBe(2)
  })
})

describe('plusieurs gagnants', () => {
  const duo: Defi = { ...d1, points: 200, gagnant: null, gagnants: ['aaaa1111', 'bbbb2222'] }

  it('donne les points du défi à chacun des gagnants', () => {
    expect(bonusDefis('aaaa1111', [duo])).toEqual([{ numero: 1, points: 200 }])
    expect(bonusDefis('bbbb2222', [duo])).toEqual([{ numero: 1, points: 200 }])
    expect(bonusDefis('cccc3333', [duo])).toEqual([])
  })

  it('liste les gagnants sans doublon, le gagnant unique en premier', () => {
    expect(gagnantsDefi(duo)).toEqual(['aaaa1111', 'bbbb2222'])
    expect(gagnantsDefi({ ...duo, gagnant: 'bbbb2222' })).toEqual(['bbbb2222', 'aaaa1111'])
    expect(gagnantsDefi(d1)).toEqual([])
  })

  it('fait monter les deux gagnants dans le classement', () => {
    const lignes = classer(
      [testeur('aaaa1111', 'Awa D.', ['outils']), testeur('bbbb2222', 'Koro D.', ['filtres']), testeur('cccc3333', 'Ini N.', ['appels'])],
      {},
      [duo],
    )
    expect(lignes.map(l => l.nom)).toEqual(['Awa D.', 'Koro D.', 'Ini N.'])
    expect(lignes[0]!.total).toBe(280)
    expect(lignes[1]!.total).toBe(220)
  })
})

describe('défi à podium', () => {
  const grand: Defi = {
    numero: 3,
    debut: '2026-10-11T08:00:00Z',
    fin: '2026-10-11T20:00:00Z',
    points: 500,
    podium: [500, 300, 100],
    enonce: null,
    gagnant: null,
    classement: ['aaaa1111', 'bbbb2222', 'cccc3333', 'dddd4444'],
  }

  it('donne à chacun les points de sa place, rien au-delà du podium', () => {
    expect(bonusDefis('aaaa1111', [grand])).toEqual([{ numero: 3, points: 500 }])
    expect(bonusDefis('bbbb2222', [grand])).toEqual([{ numero: 3, points: 300 }])
    expect(bonusDefis('cccc3333', [grand])).toEqual([{ numero: 3, points: 100 }])
    expect(bonusDefis('dddd4444', [grand])).toEqual([])
  })

  it('liste comme gagnants les seuls testeurs du podium, dans l’ordre d’arrivée', () => {
    expect(gagnantsDefi(grand)).toEqual(['aaaa1111', 'bbbb2222', 'cccc3333'])
  })

  it('reste en cours tant que le podium n’est pas complet, et se termine à l’heure de fin', () => {
    const deuxArrivees: Defi = { ...grand, classement: ['aaaa1111', 'bbbb2222'] }
    expect(etatDefi(deuxArrivees, new Date('2026-10-11T15:00:00Z'))).toBe('en_cours')
    expect(etatDefi(deuxArrivees, new Date('2026-10-11T20:00:00Z'))).toBe('termine')
    expect(etatDefi(grand, new Date('2026-10-11T15:00:00Z'))).toBe('termine')
  })

  it('place chacun selon ses points de podium dans le classement', () => {
    const lignes = classer([testeur('cccc3333', 'Ini N.'), testeur('aaaa1111', 'Awa D.'), testeur('bbbb2222', 'Koro D.')], {}, [grand])
    expect(lignes.map(l => [l.nom, l.total])).toEqual([['Awa D.', 500], ['Koro D.', 300], ['Ini N.', 100]])
  })
})

describe('données du grand défi', () => {
  it('annonce le défi n°3 le dimanche 11 octobre de 10 h à 22 h (Paris), dix sujets, podium 500 / 300 / 100', () => {
    const trois = (defisData.defis as Defi[]).find(d => d.numero === 3)!
    expect(trois.debut).toBe('2026-10-11T08:00:00Z')
    expect(trois.fin).toBe('2026-10-11T20:00:00Z')
    expect(trois.podium).toEqual([500, 300, 100])
    expect(trois.sujets).toBe(10)
    expect(defiAffiche(defisData.defis as Defi[], new Date('2026-10-10T18:00:00Z'))!.numero).toBe(3)
  })
})
