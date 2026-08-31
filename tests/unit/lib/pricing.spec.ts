import { describe, it, expect } from 'vitest'
import { computeQuote, COMMISSION_RATE, MAX_DECLARED_VALUE_EUR } from '@/lib/pricing'

describe('constantes tarifaires', () => {
  it('la commission affichée en exemple est de 5 % (CGU, article 7)', () => {
    expect(COMMISSION_RATE).toBe(0.05)
  })

  it('la valeur maximale déclarée est de 500 €', () => {
    expect(MAX_DECLARED_VALUE_EUR).toBe(500)
  })
})

describe('computeQuote', () => {
  it('calcule le cas de référence : 5 kg à 12 €/kg, commission prélevée', () => {
    // Modèle des CGU : l'expéditeur paie le prix annoncé, la commission est
    // prélevée sur la transaction, le voyageur reçoit le reste.
    const quote = computeQuote({ weightKg: 5, pricePerKg: 12 })
    expect(quote.travelerPrice).toBe(60)
    expect(quote.commission).toBe(3)
    expect(quote.senderPays).toBe(60)
    expect(quote.travelerEarns).toBe(57)
  })

  it('arrondit à deux décimales', () => {
    const quote = computeQuote({ weightKg: 3, pricePerKg: 9.99 })
    expect(quote.travelerPrice).toBe(29.97)
    expect(quote.commission).toBe(1.5)
    expect(quote.senderPays).toBe(29.97)
    expect(quote.travelerEarns).toBe(28.47)
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
