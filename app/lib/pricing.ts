// Taux utilisé pour l'exemple chiffré du site uniquement. Le taux réel est
// paramétrable dans dony-admin : les textes le présentent toujours comme
// « taux actuel », jamais comme un engagement contractuel figé.
export const COMMISSION_RATE = 0.12
export const MAX_DECLARED_VALUE_EUR = 500

export interface QuoteInput {
  weightKg: number
  pricePerKg: number
}

export interface Quote {
  travelerPrice: number
  commission: number
  senderPays: number
  travelerEarns: number
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function computeQuote({ weightKg, pricePerKg }: QuoteInput): Quote {
  if (weightKg < 0) throw new Error('weightKg doit être positif')
  if (pricePerKg < 0) throw new Error('pricePerKg doit être positif')

  const travelerPrice = round2(weightKg * pricePerKg)
  const commission = round2(travelerPrice * COMMISSION_RATE)

  return {
    travelerPrice,
    commission,
    senderPays: round2(travelerPrice + commission),
    travelerEarns: travelerPrice,
  }
}
