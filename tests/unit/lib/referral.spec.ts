import { describe, expect, it } from 'vitest'
import { parseReferralCode } from '@/lib/referral'

describe('parseReferralCode', () => {
  it('accepte un code court alphanumérique, espaces autour tolérés', () => {
    expect(parseReferralCode('ABC123')).toBe('ABC123')
    expect(parseReferralCode('  amina-7_x ')).toBe('amina-7_x')
  })

  it('prend la première valeur quand le paramètre est répété', () => {
    expect(parseReferralCode(['FIRST', 'SECOND'])).toBe('FIRST')
  })

  it.each([
    ['absent', undefined],
    ['nul', null],
    ['nombre', 42],
    ['vide', ''],
    ['trop court', 'AB'],
    ['trop long', 'A'.repeat(25)],
    ['espace interne', 'AB C'],
    ['balise', '<b>X</b>'],
    ['chemin', '../admin'],
  ])('rejette une valeur %s', (_label, raw) => {
    expect(parseReferralCode(raw)).toBeNull()
  })
})
