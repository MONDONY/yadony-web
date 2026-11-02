// Simulateur de gain de la page voyageur : un exemple indicatif, calculé dans
// le navigateur. Il n'affiche que le produit kilos x prix au kilo, fixé par le
// voyageur : la commission de service est annoncée dans l'app avant
// l'acceptation, le site n'en estime donc aucun net.
export const EARNINGS_BOUNDS = {
  kg: { min: 1, max: 30, default: 15 },
  pricePerKg: { min: 3, max: 20, default: 8 },
} as const

export interface EarningsInput {
  kg: number
  pricePerKg: number
}

function clampToBounds(value: number, { min, max, default: fallback }: { min: number, max: number, default: number }): number {
  if (Number.isNaN(value)) return fallback
  return Math.min(max, Math.max(min, Math.round(value)))
}

export function clampEarningsInput({ kg, pricePerKg }: EarningsInput): EarningsInput {
  return {
    kg: clampToBounds(kg, EARNINGS_BOUNDS.kg),
    pricePerKg: clampToBounds(pricePerKg, EARNINGS_BOUNDS.pricePerKg),
  }
}

export function computeGrossEarnings(kg: number, pricePerKg: number): number {
  const input = clampEarningsInput({ kg, pricePerKg })
  return input.kg * input.pricePerKg
}
