import { describe, it, expect } from 'vitest'
import { computeQuote } from '@/lib/pricing'

describe('computeQuote', () => {
  it('calcule le cas de référence : 5 kg à 8 €/kg', () => {
    // La commission s'ajoute au prix, payée par l'expéditeur : le voyageur
    // touche son prix en entier. Le taux n'est pas publié sur le site, donc
    // l'exemple n'expose aucun montant qui permettrait de le déduire.
    const quote = computeQuote({ weightKg: 5, pricePerKg: 8 })
    expect(quote.travelerPrice).toBe(40)
    expect(quote.travelerEarns).toBe(40)
  })

  it('arrondit à deux décimales', () => {
    const quote = computeQuote({ weightKg: 3, pricePerKg: 9.99 })
    expect(quote.travelerPrice).toBe(29.97)
    expect(quote.travelerEarns).toBe(29.97)
  })

  it('retourne des montants nuls pour un poids nul', () => {
    const quote = computeQuote({ weightKg: 0, pricePerKg: 12 })
    expect(quote.travelerEarns).toBe(0)
  })

  it('rejette un poids négatif', () => {
    expect(() => computeQuote({ weightKg: -1, pricePerKg: 12 })).toThrow('weightKg doit être positif')
  })

  it('rejette un prix négatif', () => {
    expect(() => computeQuote({ weightKg: 5, pricePerKg: -3 })).toThrow('pricePerKg doit être positif')
  })
})
