// Taux utilisé pour l'exemple chiffré du site uniquement. Le taux réel est
// paramétrable dans dony-admin : les textes le présentent toujours comme
// « taux actuel », jamais comme un engagement contractuel figé.
// Modèle des CGU (article 7) : la commission est prélevée sur la transaction —
// l'expéditeur paie le prix annoncé, le voyageur reçoit ce prix moins la
// commission.
export const COMMISSION_RATE = 0.05
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
  return Math.round(value * 100) / 100
}

export function computeQuote({ weightKg, pricePerKg }: QuoteInput): Quote {
  if (weightKg < 0) throw new Error('weightKg doit être positif')
  if (pricePerKg < 0) throw new Error('pricePerKg doit être positif')
  const travelerPrice = round2(weightKg * pricePerKg)
  const commission = round2(travelerPrice * COMMISSION_RATE)
  return {
    travelerPrice,
    commission,
    senderPays: travelerPrice,
    travelerEarns: round2(travelerPrice - commission),
  }
}
