import { describe, it, expect } from 'vitest'
import { organizationJsonLd, mobileAppJsonLd, faqJsonLd } from '@/lib/structured-data'

describe('organizationJsonLd', () => {
  it('déclare une Organization avec son URL et son logo', () => {
    const data = organizationJsonLd() as Record<string, unknown>
    expect(data['@type']).toBe('Organization')
    expect(data.name).toBe('yadony')
    expect(data.url).toBe('https://yadony.com')
    expect(data.logo).toBe('https://yadony.com/logos/logo-yadony.png')
  })
})

describe('mobileAppJsonLd', () => {
  it('déclare une MobileApplication gratuite', () => {
    const data = mobileAppJsonLd() as Record<string, any>
    expect(data['@type']).toBe('MobileApplication')
    expect(data.applicationCategory).toBe('TravelApplication')
    expect(data.offers.price).toBe('0')
  })
})

describe('faqJsonLd', () => {
  it('convertit les questions en FAQPage', () => {
    const data = faqJsonLd([{ question: 'Q1 ?', answer: 'R1.' }]) as Record<string, any>
    expect(data['@type']).toBe('FAQPage')
    expect(data.mainEntity).toHaveLength(1)
    expect(data.mainEntity[0].name).toBe('Q1 ?')
    expect(data.mainEntity[0].acceptedAnswer.text).toBe('R1.')
  })

  it('retourne une liste vide sans question', () => {
    const data = faqJsonLd([]) as Record<string, any>
    expect(data.mainEntity).toEqual([])
  })
})
