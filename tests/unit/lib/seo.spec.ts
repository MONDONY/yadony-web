import { describe, it, expect } from 'vitest'
import { buildSeoMeta } from '@/lib/seo'

describe('buildSeoMeta', () => {
  const input = {
    title: 'Tarifs',
    description: 'Commission de 12 %, sans frais cachés.',
    path: '/tarifs',
    locale: 'fr' as const,
  }

  it('suffixe le titre avec le nom du site', () => {
    expect(buildSeoMeta(input).title).toBe('Tarifs | yadony')
  })

  it('ne suffixe pas deux fois la page d’accueil', () => {
    const meta = buildSeoMeta({ ...input, title: 'yadony', path: '/' })
    expect(meta.title).toBe('yadony')
  })

  it('reprend la description en og:description', () => {
    expect(buildSeoMeta(input).ogDescription).toBe('Commission de 12 %, sans frais cachés.')
  })

  it('construit une og:url absolue à partir du chemin réel', () => {
    expect(buildSeoMeta({ ...input, locale: 'en', path: '/en/pricing' }).ogUrl).toBe(
      'https://yadony.com/en/pricing',
    )
  })

  it('retombe sur l’image Open Graph par défaut', () => {
    expect(buildSeoMeta(input).ogImage).toBe('https://yadony.com/og/default.png')
  })

  it('utilise l’image fournie si elle existe', () => {
    expect(buildSeoMeta({ ...input, image: '/og/tarifs.png' }).ogImage).toBe(
      'https://yadony.com/og/tarifs.png',
    )
  })

  it('mappe la locale au format Open Graph', () => {
    expect(buildSeoMeta(input).ogLocale).toBe('fr_FR')
    expect(buildSeoMeta({ ...input, locale: 'en' }).ogLocale).toBe('en_GB')
  })
})
