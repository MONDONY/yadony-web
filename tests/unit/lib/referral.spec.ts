import { describe, expect, it } from 'vitest'
import { parseReferralCode, referralAppLink } from '@/lib/referral'

describe('parseReferralCode', () => {
  it('accepte un code du back tel quel', () => {
    expect(parseReferralCode('ABOU1890')).toBe('ABOU1890')
  })

  it('normalise en majuscules et tolère les espaces autour', () => {
    expect(parseReferralCode('  abou1890 ')).toBe('ABOU1890')
    expect(parseReferralCode('amina-7x')).toBe('AMINA-7X')
  })

  it('accepte les longueurs limites (4 et 20)', () => {
    expect(parseReferralCode('AB12')).toBe('AB12')
    expect(parseReferralCode('A'.repeat(20))).toBe('A'.repeat(20))
  })

  it('prend la première valeur quand le paramètre est répété', () => {
    expect(parseReferralCode(['first1', 'SECOND'])).toBe('FIRST1')
  })

  it.each([
    ['absent', undefined],
    ['nul', null],
    ['nombre', 42],
    ['vide', ''],
    ['trop court', 'AB1'],
    ['trop long', 'A'.repeat(21)],
    ['espace interne', 'AB C1'],
    ['souligné', 'AB_C1'],
    ['balise', '<b>X</b>'],
    ['chemin', '../admin'],
    ['accent', 'ÉLODIE12'],
  ])('rejette une valeur %s', (_label, raw) => {
    expect(parseReferralCode(raw)).toBeNull()
  })
})

describe('referralAppLink', () => {
  it('construit le lien custom scheme attendu par l’app', () => {
    expect(referralAppLink('ABOU1890')).toBe('yadony://referral?code=ABOU1890')
  })

  it('encode le code par sécurité', () => {
    expect(referralAppLink('A&B=C')).toBe('yadony://referral?code=A%26B%3DC')
  })
})
