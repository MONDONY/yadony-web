// Le site ne publie ni le taux de commission ni les montants qui permettraient
// de le déduire : le taux réel est paramétrable dans dony-admin et présenté à
// l'utilisateur au moment du paiement, dans l'application.
// Modèle du backend (PaymentService) : la commission s'ajoute au prix du
// voyageur, payée par l'expéditeur ; le voyageur reçoit son prix en entier.

export interface QuoteInput {
  weightKg: number
  pricePerKg: number
}

export interface Quote {
  travelerPrice: number
  travelerEarns: number
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
    travelerEarns: travelerPrice,
  }
}
