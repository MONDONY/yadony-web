import { describe, it, expect } from 'vitest'
import { corridors, findCorridor } from '@/lib/corridors'
import fr from '../../../i18n/locales/fr.json'
import en from '../../../i18n/locales/en.json'

describe('corridors', () => {
  it('expose les quatre corridors de lancement', () => {
    expect(corridors.map(c => c.slug)).toEqual([
      'paris-dakar',
      'lyon-abidjan',
      'marseille-bamako',
      'paris-douala',
    ])
  })

  it('retrouve un corridor par son slug', () => {
    expect(findCorridor('paris-dakar')?.to).toBe('Dakar')
  })

  it.each([['inconnu'], [''], [undefined], [42]])('renvoie null pour %j', (slug) => {
    expect(findCorridor(slug)).toBeNull()
  })

  it('a un contenu éditorial complet dans les deux langues pour chaque corridor', () => {
    // Chaque page corridor lit ces clés : une clé absente rendrait la page
    // avec un chemin de clé brut à la place du texte.
    for (const messages of [fr, en]) {
      const pages = (messages as Record<string, never>)['corridorPages']['pages'] as Record<
        string,
        Record<string, unknown>
      >
      for (const corridor of corridors) {
        const page = pages[corridor.key]
        expect(page, `${corridor.key} manquant`).toBeDefined()
        for (const field of ['title', 'lead', 'how', 'price', 'delay', 'safety']) {
          expect(typeof page?.[field], `${corridor.key}.${field}`).toBe('string')
        }
        expect(Array.isArray(page?.faq), `${corridor.key}.faq`).toBe(true)
        expect((page?.faq as unknown[]).length).toBeGreaterThanOrEqual(3)
      }
    }
  })
})
