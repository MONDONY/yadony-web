import { describe, it, expect } from 'vitest'
import { absoluteUrl, locales, defaultLocale } from '@/lib/locale'

describe('locales', () => {
  it('expose les deux langues du site', () => {
    expect(locales).toEqual(['fr', 'en'])
  })

  it('le français est la langue par défaut', () => {
    expect(defaultLocale).toBe('fr')
  })
})

describe('absoluteUrl', () => {
  it('préfixe le chemin par l’origine du site', () => {
    expect(absoluteUrl('/tarifs')).toBe('https://yadony.com/tarifs')
    expect(absoluteUrl('/en/pricing')).toBe('https://yadony.com/en/pricing')
  })

  it('gère la racine', () => {
    expect(absoluteUrl('/')).toBe('https://yadony.com/')
  })

  it('supprime une barre oblique finale superflue', () => {
    expect(absoluteUrl('/tarifs/')).toBe('https://yadony.com/tarifs')
  })

  it('ignore la query string', () => {
    expect(absoluteUrl('/comment-ca-marche?role=voyageur')).toBe(
      'https://yadony.com/comment-ca-marche',
    )
  })
})
