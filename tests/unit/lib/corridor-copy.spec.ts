import { describe, expect, it } from 'vitest'
import { corridorDelayKeys, parsePublicModes } from '@/lib/transport-modes'
import { en, fr } from '../helpers/messages'

type Messages = typeof fr

function pageTexts(messages: Messages): Array<[string, string]> {
  const out: Array<[string, string]> = []
  const walk = (value: unknown, path: string) => {
    if (typeof value === 'string') out.push([path, value])
    else if (Array.isArray(value)) value.forEach((item, i) => walk(item, `${path}[${i}]`))
    else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k)
    }
  }
  walk(messages.corridorPages.pages, '')
  return out
}

// Retire la phrase qui commence par « En avion, » / « By plane, » jusqu'au
// point : la durée de vol reste légitime, comme cas de l'avion.
function stripPlaneClauses(text: string): string {
  return text.replace(/(En avion|By plane),[\s\S]*?[.!?](?=\s|$)/g, '')
}

const FR_BANNED = /\b(en vol|son vol|du vol|franchise|bagages?|valise|atterri\w*|compagnies?|vols? quotidiens?)\b|a[ée]roport de\b/i
const EN_BANNED = /\b(flying|fly|flights? (?:time|date)|baggage|luggage|suitcase|lands?|landing|airline)\b|airport of\b/i

describe('textes des pages corridors', () => {
  it('aucune page corridor ne parle de vol hors « En avion » (FR)', () => {
    for (const [key, text] of pageTexts(fr)) {
      expect(stripPlaneClauses(text), key).not.toMatch(FR_BANNED)
    }
  })

  it('aucune page corridor ne parle de vol hors « By plane » (EN)', () => {
    for (const [key, text] of pageTexts(en)) {
      expect(stripPlaneClauses(text), key).not.toMatch(EN_BANNED)
    }
  })

  it('chaque délai d’une page commence par la mention du mode (avion)', () => {
    for (const [key, text] of pageTexts(fr)) if (key.endsWith('.delay')) expect(text, key).toMatch(/^En avion,/)
    for (const [key, text] of pageTexts(en)) if (key.endsWith('.delay')) expect(text, key).toMatch(/^By plane,/)
  })

  it('le texte des corridors ne contient aucun tiret cadratin', () => {
    for (const [key, text] of [...pageTexts(fr), ...pageTexts(en)]) expect(text, key).not.toContain('—')
  })

  it('stripPlaneClauses ne coupe pas sur un nombre décimal', () => {
    expect(stripPlaneClauses('By plane, about 5.5 hours. Next.')).toBe(' Next.')
  })
})

describe('corridorDelayKeys', () => {
  it('avion seul : un seul paragraphe, celui de la page', () => {
    expect(corridorDelayKeys('parisDakar', parsePublicModes('PLANE'))).toEqual(['corridorPages.pages.parisDakar.delay'])
  })

  it('route publique : paragraphe Route en plus', () => {
    expect(corridorDelayKeys('parisDakar', parsePublicModes('PLANE,ROAD'))).toEqual([
      'corridorPages.pages.parisDakar.delay',
      'corridorPages.common.delayRoad',
    ])
  })

  it('route et bateau : les deux paragraphes, dans l’ordre', () => {
    expect(corridorDelayKeys('lyonDakar', parsePublicModes('BOAT,ROAD'))).toEqual([
      'corridorPages.pages.lyonDakar.delay',
      'corridorPages.common.delayRoad',
      'corridorPages.common.delayBoat',
    ])
  })

  it('les paragraphes communs existent dans les deux langues', () => {
    for (const messages of [fr, en]) {
      expect(messages.corridorPages.common.delayRoad.length).toBeGreaterThan(20)
      expect(messages.corridorPages.common.delayBoat.length).toBeGreaterThan(20)
    }
  })
})
