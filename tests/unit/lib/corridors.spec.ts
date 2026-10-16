import { describe, it, expect } from 'vitest'
import { corridors, findCorridor, neighbors } from '@/lib/corridors'
import { gpPages, findGpPage, gpForCorridor } from '@/lib/gp'
import { en, fr } from '../helpers/messages'

describe('corridors', () => {
  it('couvre les 12 trajets Paris, Lyon, Marseille × Dakar, Abidjan, Bamako, Douala', () => {
    expect(corridors).toHaveLength(12)
    expect(new Set(corridors.map(c => c.slug)).size).toBe(12)
    for (const from of ['Paris', 'Lyon', 'Marseille']) {
      for (const to of ['Dakar', 'Abidjan', 'Bamako', 'Douala']) {
        expect(corridors.some(c => c.from === from && c.to === to), `${from} → ${to}`).toBe(true)
      }
    }
    // Les cinq URL déjà indexées restent en tête, dans le même ordre.
    expect(corridors.slice(0, 5).map(c => c.slug)).toEqual([
      'paris-abidjan', 'paris-dakar', 'lyon-abidjan', 'marseille-bamako', 'paris-douala',
    ])
  })

  it('propose des voisins qui partagent la ville de départ ou d’arrivée', () => {
    const parisDakar = findCorridor('paris-dakar')!
    const list = neighbors(parisDakar)
    expect(list).toHaveLength(4)
    expect(list).not.toContain(parisDakar)
    for (const other of list) {
      expect(other.from === 'Paris' || other.to === 'Dakar').toBe(true)
    }
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

describe('pages GP', () => {
  it('existent pour les quatre capitales au départ de Paris', () => {
    expect(gpPages.map(page => page.slug)).toEqual(['paris-dakar', 'paris-abidjan', 'paris-bamako', 'paris-douala'])
  })

  it('pointent chacune vers son corridor', () => {
    for (const page of gpPages) expect(findCorridor(page.slug)?.slug).toBe(page.slug)
  })

  it('se retrouvent par slug ou par corridor', () => {
    expect(findGpPage('paris-dakar')?.key).toBe('parisDakar')
    expect(findGpPage('lyon-dakar')).toBeNull()
    expect(findGpPage(undefined)).toBeNull()
    expect(gpForCorridor(findCorridor('paris-bamako')!)?.slug).toBe('paris-bamako')
    expect(gpForCorridor(findCorridor('lyon-dakar')!)).toBeNull()
  })

  it('ont leur contenu complet en français', () => {
    const pages = (fr as Record<string, never>)['gp']['pages'] as Record<string, Record<string, unknown>>
    for (const page of gpPages) {
      for (const field of ['title', 'lead', 'what', 'risks', 'yadony', 'price']) {
        expect(typeof pages[page.key]?.[field], `${page.key}.${field}`).toBe('string')
      }
      expect(pages[page.key]?.how).toHaveLength(4)
      expect(pages[page.key]?.faq).toHaveLength(4)
    }
  })
})
