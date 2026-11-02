import { describe, expect, it } from 'vitest'
import { EARNINGS_BOUNDS, clampEarningsInput, computeGrossEarnings } from '@/lib/earnings'

describe('simulateur de gain', () => {
  it('expose les bornes et les valeurs de départ du simulateur', () => {
    expect(EARNINGS_BOUNDS).toEqual({
      kg: { min: 1, max: 30, default: 15 },
      pricePerKg: { min: 3, max: 20, default: 8 },
    })
  })

  it('multiplie les kilos par le prix au kilo', () => {
    expect(computeGrossEarnings(15, 8)).toBe(120)
  })

  it('ramène les valeurs hors bornes dans les bornes', () => {
    expect(computeGrossEarnings(0, 8)).toBe(8)
    expect(computeGrossEarnings(99, 99)).toBe(600)
    expect(clampEarningsInput({ kg: -5, pricePerKg: 1 })).toEqual({ kg: 1, pricePerKg: 3 })
    expect(clampEarningsInput({ kg: Infinity, pricePerKg: -Infinity })).toEqual({ kg: 30, pricePerKg: 3 })
  })

  it('ramène une valeur absente ou invalide à la valeur par défaut', () => {
    expect(clampEarningsInput({ kg: NaN, pricePerKg: NaN })).toEqual({ kg: 15, pricePerKg: 8 })
    expect(computeGrossEarnings(NaN, NaN)).toBe(120)
  })

  it('arrondit à l’entier le plus proche, le total reste entier', () => {
    expect(clampEarningsInput({ kg: 7.4, pricePerKg: 7.6 })).toEqual({ kg: 7, pricePerKg: 8 })
    expect(Number.isInteger(computeGrossEarnings(7.5, 9.5))).toBe(true)
  })
})
