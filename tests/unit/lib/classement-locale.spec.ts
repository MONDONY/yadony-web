import { describe, expect, it } from 'vitest'
import fr from '../../../i18n/locales/fr.json'
import en from '../../../i18n/locales/en.json'
import { TEST_GROUPS, TEST_KEYS } from '@/lib/classement/bareme'
import donnees from '@/data/classement.json'

type Messages = { contest?: { tests?: Record<string, string>; groups?: Record<string, string> } }

describe.each([
  ['fr', fr as Messages],
  ['en', en as Messages],
])('textes du classement (%s)', (_langue, messages) => {
  it('donne un libellé à chaque test du barème', () => {
    const manquants = TEST_KEYS.filter(cle => !messages.contest?.tests?.[cle])
    expect(manquants).toEqual([])
  })

  it('donne un titre à chaque groupe du barème', () => {
    const manquants = TEST_GROUPS.filter(g => !messages.contest?.groups?.[g.id]).map(g => g.id)
    expect(manquants).toEqual([])
  })
})

describe('données du classement', () => {
  it('couvre la semaine du concours, du lundi 5 au lundi 12 octobre à 20 h 30 (Paris)', () => {
    expect(donnees.debut).toBe('2026-10-05T18:30:00Z')
    expect(donnees.fin).toBe('2026-10-12T18:30:00Z')
    expect(Array.isArray(donnees.testeurs)).toBe(true)
  })
})
