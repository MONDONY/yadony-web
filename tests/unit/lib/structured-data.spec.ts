import { describe, it, expect } from 'vitest'
import { organizationJsonLd, mobileAppJsonLd, faqJsonLd, breadcrumbJsonLd } from '@/lib/structured-data'

describe('organizationJsonLd', () => {
  it('déclare une Organization avec son URL et son logo', () => {
    const data = organizationJsonLd() as Record<string, unknown>
    expect(data['@type']).toBe('Organization')
    expect(data.name).toBe('Yadony')
    expect(data.url).toBe('https://yadony.com')
    expect(data.logo).toBe('https://yadony.com/logos/logo-yadony.png')
  })
})

describe('mobileAppJsonLd', () => {
  it('déclare une MobileApplication gratuite', () => {
    const data = mobileAppJsonLd()
    expect(data['@type']).toBe('MobileApplication')
    expect(data.applicationCategory).toBe('TravelApplication')
    expect(data.offers.price).toBe('0')
  })
})

describe('faqJsonLd', () => {
  it('convertit les questions en FAQPage', () => {
    const data = faqJsonLd([{ question: 'Q1 ?', answer: 'R1.' }])
    expect(data['@type']).toBe('FAQPage')
    expect(data.mainEntity).toHaveLength(1)
    expect(data.mainEntity[0].name).toBe('Q1 ?')
    expect(data.mainEntity[0].acceptedAnswer.text).toBe('R1.')
  })

  it('retourne une liste vide sans question', () => {
    const data = faqJsonLd([])
    expect(data.mainEntity).toEqual([])
  })
})

describe('breadcrumbJsonLd', () => {
  it('produit un fil d’Ariane positionné, aux URL absolues', () => {
    const data = breadcrumbJsonLd([
      { name: 'Accueil', path: '/' },
      { name: 'Envoyer un colis', path: '/envoyer-colis' },
      { name: 'Paris → Dakar', path: '/envoyer-colis/paris-dakar/' },
    ])
    expect(data['@type']).toBe('BreadcrumbList')
    expect(data.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://yadony.com/' },
      { '@type': 'ListItem', position: 2, name: 'Envoyer un colis', item: 'https://yadony.com/envoyer-colis' },
      { '@type': 'ListItem', position: 3, name: 'Paris → Dakar', item: 'https://yadony.com/envoyer-colis/paris-dakar' },
    ])
  })
})
