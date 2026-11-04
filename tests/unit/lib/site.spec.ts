import { describe, it, expect } from 'vitest'
import {
  appStoreUrl,
  playStoreUrl,
  siteUrl,
} from '@/lib/site'

describe('constantes du site', () => {
  it('sert le site en HTTPS sans barre oblique finale', () => {
    expect(siteUrl).toBe('https://yadony.com')
  })

  it('pointe vers les vraies fiches des stores', () => {
    expect(playStoreUrl).toBe('https://play.google.com/store/apps/details?id=com.yadony.yadony')
    expect(appStoreUrl).toBe('https://apps.apple.com/app/id6797821239')
  })
})
