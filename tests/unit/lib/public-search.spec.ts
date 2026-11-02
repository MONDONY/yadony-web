import { describe, it, expect } from 'vitest'
import {
  formatCapacity,
  formatCardPrice,
  formatDepartureDate,
  formatPrice,
  hasSearch,
  parseSearchQuery,
  suggestCities,
  toApiParams,
  type PublicAnnouncementCard,
  type SearchQuery,
} from '@/lib/public-search'

const baseQuery: SearchQuery = { depart: '', arrivee: '', quand: '', page: 0 }

function card(overrides: Partial<PublicAnnouncementCard> = {}): PublicAnnouncementCard {
  return {
    id: 'a1',
    departureCity: 'Paris',
    arrivalCity: 'Abidjan',
    departureDate: '2026-11-20',
    currency: 'EUR',
    urgent: false,
    traveler: { displayName: 'Awa', identityVerified: true },
    ...overrides,
  }
}

describe('parseSearchQuery', () => {
  it('ramène une requête vide aux valeurs par défaut', () => {
    expect(parseSearchQuery({})).toEqual(baseQuery)
  })

  it('ramène une page négative à 0 et ne retient que du texte rogné pour la ville', () => {
    const q = parseSearchQuery({ page: '-3', depart: '<script>' })
    expect(q.page).toBe(0)
    expect(q.depart).toBe('<script>')
  })

  it('limite la page à 4 et ignore les non-entiers', () => {
    expect(parseSearchQuery({ page: '9' }).page).toBe(4)
    expect(parseSearchQuery({ page: '2' }).page).toBe(2)
    expect(parseSearchQuery({ page: '1.5' }).page).toBe(0)
    expect(parseSearchQuery({ page: 'abc' }).page).toBe(0)
  })

  it('rogne les villes à 80 caractères et retire les espaces', () => {
    const q = parseSearchQuery({ depart: `  ${'a'.repeat(100)}  `, arrivee: '  Dakar ' })
    expect(q.depart).toHaveLength(80)
    expect(q.arrivee).toBe('Dakar')
  })

  it('prend la première valeur d’un paramètre répété et ignore les non-textes', () => {
    expect(parseSearchQuery({ depart: ['Paris', 'Lyon'] }).depart).toBe('Paris')
    expect(parseSearchQuery({ depart: 42, arrivee: null }).depart).toBe('')
    expect(parseSearchQuery({ arrivee: null }).arrivee).toBe('')
  })

  it('limite quand aux valeurs connues', () => {
    expect(parseSearchQuery({ quand: 'xx' }).quand).toBe('')
    expect(parseSearchQuery({ quand: 'ce-mois' }).quand).toBe('ce-mois')
    expect(parseSearchQuery({ quand: '3-mois' }).quand).toBe('3-mois')
  })

  it('lit minKg et maxPrix dans leurs bornes et ignore le reste', () => {
    const q = parseSearchQuery({ minKg: '15', maxPrix: '12.5' })
    expect(q.minKg).toBe(15)
    expect(q.maxPrix).toBe(12.5)
    expect(parseSearchQuery({ minKg: '0' }).minKg).toBeUndefined()
    expect(parseSearchQuery({ minKg: '-2' }).minKg).toBeUndefined()
    expect(parseSearchQuery({ minKg: '1001' }).minKg).toBeUndefined()
    expect(parseSearchQuery({ minKg: 'abc' }).minKg).toBeUndefined()
    expect(parseSearchQuery({ maxPrix: '100001' }).maxPrix).toBeUndefined()
    expect(parseSearchQuery({ maxPrix: '0' }).maxPrix).toBeUndefined()
    expect(parseSearchQuery({ maxPrix: '' }).maxPrix).toBeUndefined()
  })

  it('lit urgent et ne retient que les modes de transport connus', () => {
    expect(parseSearchQuery({ urgent: '1' }).urgent).toBe(true)
    expect(parseSearchQuery({ urgent: 'true' }).urgent).toBe(true)
    expect(parseSearchQuery({ urgent: '0' }).urgent).toBeUndefined()
    expect(parseSearchQuery({ mode: 'plane' }).mode).toBe('PLANE')
    expect(parseSearchQuery({ mode: 'BUS' }).mode).toBe('BUS')
    expect(parseSearchQuery({ mode: 'rocket' }).mode).toBeUndefined()
  })
})

describe('toApiParams', () => {
  const today = new Date(2026, 10, 2)

  it('ne produit que la page pour une recherche vide', () => {
    expect(toApiParams(baseQuery, today).toString()).toBe('page=0')
  })

  it('transforme les champs en paramètres du back', () => {
    const params = toApiParams(
      { depart: 'Paris', arrivee: 'Abidjan', quand: '', minKg: 10, maxPrix: 8, urgent: true, mode: 'PLANE', page: 2 },
      today,
    )
    expect(params.get('departureCity')).toBe('Paris')
    expect(params.get('arrivalCity')).toBe('Abidjan')
    expect(params.get('minAvailableKg')).toBe('10')
    expect(params.get('maxPricePerKg')).toBe('8')
    expect(params.get('urgent')).toBe('true')
    expect(params.get('transportMode')).toBe('PLANE')
    expect(params.get('page')).toBe('2')
    expect(params.has('departureDateFrom')).toBe(false)
  })

  it('« ce mois » va d’aujourd’hui à la fin du mois', () => {
    const params = toApiParams({ ...baseQuery, quand: 'ce-mois' }, today)
    expect(params.get('departureDateFrom')).toBe('2026-11-02')
    expect(params.get('departureDateTo')).toBe('2026-11-30')
  })

  it('« 3 mois » est tronqué à 90 jours', () => {
    const params = toApiParams({ ...baseQuery, quand: '3-mois' }, today)
    expect(params.get('departureDateFrom')).toBe('2026-11-02')
    expect(params.get('departureDateTo')).toBe('2027-01-31')
  })
})

describe('hasSearch', () => {
  it('est faux pour une requête vide, même paginée', () => {
    expect(hasSearch(baseQuery)).toBe(false)
    expect(hasSearch({ ...baseQuery, page: 3 })).toBe(false)
  })

  it('est vrai dès qu’un critère est renseigné', () => {
    expect(hasSearch({ ...baseQuery, depart: 'Paris' })).toBe(true)
    expect(hasSearch({ ...baseQuery, arrivee: 'Dakar' })).toBe(true)
    expect(hasSearch({ ...baseQuery, quand: 'ce-mois' })).toBe(true)
    expect(hasSearch({ ...baseQuery, minKg: 5 })).toBe(true)
    expect(hasSearch({ ...baseQuery, maxPrix: 5 })).toBe(true)
    expect(hasSearch({ ...baseQuery, urgent: true })).toBe(true)
    expect(hasSearch({ ...baseQuery, mode: 'CAR' })).toBe(true)
  })
})

describe('formatPrice', () => {
  it('formate en euros avec deux décimales en français', () => {
    expect(formatPrice(10.7, 'EUR', 'fr')).toContain('10,70')
  })

  it('formate en anglais', () => {
    expect(formatPrice(10.7, 'EUR', 'en')).toContain('10.70')
  })

  it('formate le franc CFA sans décimales', () => {
    expect(formatPrice(3000, 'XOF', 'fr')).toMatch(/3\s?000/)
  })

  it('rend une chaîne vide sans valeur', () => {
    expect(formatPrice(undefined, 'EUR', 'fr')).toBe('')
  })

  it('ne lève rien sur un code de devise mal formé et affiche valeur et code', () => {
    expect(formatPrice(12, 'EURO!', 'fr')).toBe('12 EURO!')
    expect(formatPrice(12.5, '', 'en')).toBe('12.5 ')
  })
})

describe('formatCardPrice', () => {
  it('formate le prix au kilo quand il existe', () => {
    expect(formatCardPrice(card({ pricePerKgDisplay: 10.7 }), 'fr')).toContain('10,70')
  })

  it('annonce un prix par article pour un trajet MIXED sans prix au kilo', () => {
    expect(formatCardPrice(card({ pricingMode: 'MIXED' }), 'fr')).toBe('Prix par article')
    expect(formatCardPrice(card({ pricingMode: 'MIXED' }), 'en')).toBe('Price per item')
  })

  it('rend une chaîne vide sans prix ni mode MIXED', () => {
    expect(formatCardPrice(card({ pricingMode: 'KG' }), 'fr')).toBe('')
    expect(formatCardPrice(card(), 'en')).toBe('')
  })
})

describe('formatDepartureDate', () => {
  it('formate une date ISO en français', () => {
    expect(formatDepartureDate('2026-11-20', 'fr')).toBe('ven. 20 nov.')
  })

  it('formate une date ISO en anglais', () => {
    expect(formatDepartureDate('2026-11-20', 'en')).toMatch(/Fri,? 20 Nov|Fri,? Nov 20/)
  })

  it('ne dépend pas du fuseau de la machine', () => {
    const original = process.env.TZ
    try {
      for (const tz of ['Pacific/Auckland', 'America/Los_Angeles', 'UTC']) {
        process.env.TZ = tz
        expect(formatDepartureDate('2026-11-20', 'fr')).toBe('ven. 20 nov.')
        expect(formatDepartureDate('2026-01-01', 'fr')).toBe('jeu. 1 janv.')
      }
    } finally {
      if (original === undefined) delete process.env.TZ
      else process.env.TZ = original
    }
  })

  it('rend la valeur reçue si elle n’est pas une date ISO', () => {
    expect(formatDepartureDate('bientôt', 'fr')).toBe('bientôt')
  })
})

describe('formatCapacity', () => {
  it('affiche les kilos seulement pour KG_EXACT', () => {
    expect(formatCapacity(card({ capacityUnit: 'KG_EXACT', availableKg: 12 }), 'fr')).toBe('12 kg')
    expect(formatCapacity(card({ capacityUnit: 'KG_EXACT', availableKg: 7.5 }), 'fr')).toBe('7,5 kg')
    expect(formatCapacity(card({ capacityUnit: 'KG_EXACT', availableKg: 7.5 }), 'en')).toBe('7.5 kg')
  })

  it('n’affiche aucune quantité pour KG_EXACT sans kilos', () => {
    expect(formatCapacity(card({ capacityUnit: 'KG_EXACT' }), 'fr')).toBe('')
  })

  it('donne le libellé des kilos libres sans jamais montrer la valeur technique', () => {
    expect(formatCapacity(card({ capacityUnit: 'KG_FREE', availableKg: 1 }), 'fr')).toBe('Kg libre')
    expect(formatCapacity(card({ capacityUnit: 'KG_FREE', availableKg: 1 }), 'en')).toBe('Flexible kg')
  })

  it('donne le libellé des valises', () => {
    expect(formatCapacity(card({ capacityUnit: 'SUITCASE_23KG', availableKg: 23 }), 'fr')).toBe('Valise 23 kg')
    expect(formatCapacity(card({ capacityUnit: 'SUITCASE_32KG', availableKg: 32 }), 'fr')).toBe('Valise 32 kg')
    expect(formatCapacity(card({ capacityUnit: 'SUITCASE_23KG' }), 'en')).toBe('23 kg suitcase')
    expect(formatCapacity(card({ capacityUnit: 'SUITCASE_32KG' }), 'en')).toBe('32 kg suitcase')
  })

  it('n’affiche aucune quantité sans capacityUnit', () => {
    expect(formatCapacity(card({ availableKg: 20 }), 'fr')).toBe('')
  })
})

describe('suggestCities', () => {
  it('trouve une ville sans tenir compte de la casse', () => {
    expect(suggestCities('abi')).toContain('Abidjan')
    expect(suggestCities('ABI')).toContain('Abidjan')
  })

  it('ignore les accents', () => {
    expect(suggestCities('mars')).toEqual(['Marseille'])
    expect(suggestCities('Dóu')).toEqual(['Douala'])
  })

  it('liste les villes de départ et d’arrivée une seule fois', () => {
    const all = suggestCities('')
    expect(all).toEqual(expect.arrayContaining(['Paris', 'Lyon', 'Marseille', 'Abidjan', 'Dakar', 'Bamako', 'Douala']))
    expect(new Set(all).size).toBe(all.length)
  })

  it('ne propose rien quand aucune ville ne correspond', () => {
    expect(suggestCities('zzz')).toEqual([])
  })
})
