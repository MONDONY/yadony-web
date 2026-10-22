import { describe, expect, it } from 'vitest'
import { openLinkAppUrl, parseOpenLink } from '@/lib/open-link'

const BID = '0b9d1f3e-5a4c-4e8b-9a77-1c2d3e4f5a6b'

describe('parseOpenLink', () => {
  it('accepte un type et un identifiant UUID', () => {
    expect(parseOpenLink({ type: 'BID_ACCEPTED', bidId: BID })).toEqual({
      type: 'BID_ACCEPTED',
      ids: { bidId: BID },
    })
  })

  it('met l’UUID en minuscules et prend la première valeur répétée', () => {
    expect(parseOpenLink({ type: ['BID_CREATED', 'X'], bidId: [BID.toUpperCase()] })).toEqual({
      type: 'BID_CREATED',
      ids: { bidId: BID },
    })
  })

  it('ignore un identifiant qui n’est pas un UUID et une clé inconnue', () => {
    expect(parseOpenLink({ type: 'BID_CREATED', bidId: '../admin', other: BID })).toEqual({
      type: 'BID_CREATED',
      ids: {},
    })
  })

  it.each([
    ['sans type', {}],
    ['type en minuscules', { type: 'bid_accepted' }],
    ['type avec injection', { type: 'BID&x=1' }],
    ['type trop court', { type: 'AB' }],
    ['type non texte', { type: 42 }],
  ])('refuse %s', (_label, query) => {
    expect(parseOpenLink(query)).toBeNull()
  })
})

describe('openLinkAppUrl', () => {
  it('construit le lien yadony://open', () => {
    expect(openLinkAppUrl({ type: 'BID_ACCEPTED', ids: { bidId: BID } })).toBe(
      `yadony://open?type=BID_ACCEPTED&bidId=${BID}`,
    )
  })
})
