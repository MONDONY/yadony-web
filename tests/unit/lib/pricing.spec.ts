import { describe, it, expect } from 'vitest'
import { computeQuote, COMMISSION_RATE, MAX_DECLARED_VALUE_EUR } from '@/lib/pricing'

describe('constantes tarifaires', () => {
  it('la commission est de 12 %', () => {
    expect(COMMISSION_RATE).toBe(0.12)
  })

  it('la valeur maximale déclarée est de 500 €', () => {
    expect(MAX_DECLARED_VALUE_EUR).toBe(500)
  })
})

describe('computeQuote', () => {
  it('calcule le cas de référence : 5 kg à 12 €/kg', () => {
    const quote = computeQuote({ weightKg: 5, pricePerKg: 12 })
    expect(quote.travelerPrice).toBe(60)
    expect(quote.commission).toBe(7.2)
    expect(quote.senderPays).toBe(67.2)
    expect(quote.travelerEarns).toBe(60)
  })

  it('arrondit à deux décimales', () => {
    const quote = computeQuote({ weightKg: 3, pricePerKg: 9.99 })
    expect(quote.travelerPrice).toBe(29.97)
    expect(quote.commission).toBe(3.6)
    expect(quote.senderPays).toBe(33.57)
  })

  it('retourne des montants nuls pour un poids nul', () => {
    const quote = computeQuote({ weightKg: 0, pricePerKg: 12 })
    expect(quote.senderPays).toBe(0)
    expect(quote.commission).toBe(0)
  })

  it('rejette un poids négatif', () => {
    expect(() => computeQuote({ weightKg: -1, pricePerKg: 12 })).toThrow('weightKg doit être positif')
  })

  it('rejette un prix négatif', () => {
    expect(() => computeQuote({ weightKg: 5, pricePerKg: -3 })).toThrow('pricePerKg doit être positif')
  })
})
