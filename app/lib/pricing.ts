// Le site ne publie ni le taux de commission ni les montants qui permettraient
// de le déduire : le taux réel est paramétrable dans dony-admin et présenté à
// l'utilisateur au moment du paiement, dans l'application.
// Modèle des CGU (article 7) : l'expéditeur paie le prix annoncé, le voyageur
// reçoit ce prix moins la commission de service.
export const MAX_DECLARED_VALUE_EUR = 500

export interface QuoteInput {
  weightKg: number
  pricePerKg: number
}

export interface Quote {
  travelerPrice: number
  senderPays: number
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function computeQuote({ weightKg, pricePerKg }: QuoteInput): Quote {
  if (weightKg < 0) throw new Error('weightKg doit être positif')
  if (pricePerKg < 0) throw new Error('pricePerKg doit être positif')
  const travelerPrice = round2(weightKg * pricePerKg)
  return {
    travelerPrice,
    senderPays: travelerPrice,
  }
}
