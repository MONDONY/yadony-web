import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { usePublicSearch } from '../../../app/composables/usePublicSearch'
import { parseSearchQuery, type PublicAnnouncementCard } from '../../../app/lib/public-search'

const API_BASE = 'https://api.test/api/v1'

function card(id: string): PublicAnnouncementCard {
  return {
    id,
    departureCity: 'Paris',
    arrivalCity: 'Dakar',
    departureDate: '2026-12-01',
    currency: 'EUR',
    urgent: false,
    traveler: { displayName: 'Awa', identityVerified: true },
  }
}

function page(content: PublicAnnouncementCard[], totalElements = content.length) {
  return { content, totalElements, page: 0, size: 20, totalPages: 1, last: true }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

const query = parseSearchQuery({ depart: 'Paris', arrivee: 'Dakar' })
const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  // `useRuntimeConfig` est une auto-import de Nuxt : absente hors de l'app.
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: API_BASE } }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('usePublicSearch', () => {
  it('démarre à l’état idle, sans appel réseau', () => {
    const search = usePublicSearch()
    expect(search.status.value).toBe('idle')
    expect(search.results.value).toEqual([])
    expect(search.total.value).toBe(0)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('200 avec des cartes : ok, résultats et total', async () => {
    fetchMock.mockResolvedValue(jsonResponse(page([card('a'), card('b')], 42)))
    const search = usePublicSearch()
    const promise = search.run(query)
    expect(search.status.value).toBe('loading')
    await promise
    expect(search.status.value).toBe('ok')
    expect(search.results.value.map(c => c.id)).toEqual(['a', 'b'])
    expect(search.total.value).toBe(42)
  })

  it('200 avec content vide : empty', async () => {
    fetchMock.mockResolvedValue(jsonResponse(page([])))
    const search = usePublicSearch()
    await search.run(query)
    expect(search.status.value).toBe('empty')
    expect(search.results.value).toEqual([])
    expect(search.total.value).toBe(0)
  })

  it('429 lisible : rate-limited', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 429))
    const search = usePublicSearch()
    await search.run(query)
    expect(search.status.value).toBe('rate-limited')
  })

  it.each([404, 500, 503, 400])('statut %i : error', async (status) => {
    fetchMock.mockResolvedValue(jsonResponse({}, status))
    const search = usePublicSearch()
    await search.run(query)
    expect(search.status.value).toBe('error')
  })

  it('erreur réseau ou CORS (TypeError) : error', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const search = usePublicSearch()
    await search.run(query)
    expect(search.status.value).toBe('error')
  })

  it('JSON invalide : error', async () => {
    fetchMock.mockResolvedValue(new Response('<html>', { status: 200 }))
    const search = usePublicSearch()
    await search.run(query)
    expect(search.status.value).toBe('error')
  })

  it('JSON sans tableau content : error', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ totalElements: 1 }))
    const search = usePublicSearch()
    await search.run(query)
    expect(search.status.value).toBe('error')
  })

  it('un nouvel essai après une erreur repasse par loading puis ok', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    fetchMock.mockResolvedValueOnce(jsonResponse(page([card('a')])))
    const search = usePublicSearch()
    await search.run(query)
    expect(search.status.value).toBe('error')
    await search.run(query)
    expect(search.status.value).toBe('ok')
    expect(search.results.value).toHaveLength(1)
  })

  it('appelle {apiBase}/public/announcements avec les paramètres, via un GET simple', async () => {
    fetchMock.mockResolvedValue(jsonResponse(page([card('a')])))
    const search = usePublicSearch()
    await search.run(parseSearchQuery({ depart: 'Paris', arrivee: 'Dakar', page: '2' }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(String(url)).toBe(`${API_BASE}/public/announcements?departureCity=Paris&arrivalCity=Dakar&page=2`)
    expect(init).toMatchObject({ method: 'GET', mode: 'cors', credentials: 'omit' })
    // Aucun en-tête personnalisé : sinon le navigateur envoie une pré-vérification CORS.
    expect(init).not.toHaveProperty('headers')
  })

  it('calcule la date du jour à l’appel, côté client', async () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date(2026, 10, 2, 12))
      fetchMock.mockResolvedValue(jsonResponse(page([card('a')])))
      const search = usePublicSearch()
      await search.run(parseSearchQuery({ quand: 'ce-mois' }))
      const url = new URL(String(fetchMock.mock.calls[0]![0]))
      expect(url.searchParams.get('departureDateFrom')).toBe('2026-11-02')
      expect(url.searchParams.get('departureDateTo')).toBe('2026-11-30')
    } finally {
      vi.useRealTimers()
    }
  })

  it('deux appels rapprochés : seule la seconde réponse s’applique, la première est annulée', async () => {
    let resolveFirst!: (r: Response) => void
    const firstSignals: AbortSignal[] = []
    fetchMock.mockImplementationOnce((_url, init) => {
      firstSignals.push(init!.signal!)
      return new Promise<Response>((resolve) => { resolveFirst = resolve })
    })
    fetchMock.mockResolvedValueOnce(jsonResponse(page([card('second')])))
    const search = usePublicSearch()
    const first = search.run(query)
    const second = search.run(query)
    await second
    expect(firstSignals[0]!.aborted).toBe(true)
    expect(search.results.value.map(c => c.id)).toEqual(['second'])
    // La première réponse arrive après coup : elle ne change rien.
    resolveFirst(jsonResponse(page([card('first')])))
    await first
    expect(search.status.value).toBe('ok')
    expect(search.results.value.map(c => c.id)).toEqual(['second'])
  })

  it('une requête annulée qui échoue ne change pas l’état', async () => {
    fetchMock.mockImplementationOnce((_url, init) => new Promise<Response>((_resolve, reject) => {
      init!.signal!.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    }))
    fetchMock.mockResolvedValueOnce(jsonResponse(page([card('second')])))
    const search = usePublicSearch()
    const first = search.run(query)
    await search.run(query)
    await first
    expect(search.status.value).toBe('ok')
    expect(search.results.value.map(c => c.id)).toEqual(['second'])
  })

  describe('réponses mal formées et adresse de l’API', () => {
    it('retire les barres obliques finales de apiBase', async () => {
      vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: `${API_BASE}///` } }))
      fetchMock.mockResolvedValue(jsonResponse(page([card('a')])))
      await usePublicSearch().run(query)
      expect(String(fetchMock.mock.calls[0]![0]).startsWith(`${API_BASE}/public/announcements?`)).toBe(true)
    })

    it.each([
      ['absent', undefined],
      ['une chaîne', '42'],
      ['null', null],
      ['NaN', 'NaN'],
    ])('totalElements %s : le total retombe sur le nombre de cartes', async (_label, totalElements) => {
      fetchMock.mockResolvedValue(jsonResponse({ content: [card('a'), card('b')], totalElements, page: 0, size: 20, totalPages: 1 }))
      const search = usePublicSearch()
      await search.run(query)
      expect(search.status.value).toBe('ok')
      expect(search.total.value).toBe(2)
    })

    it('retire les cartes sans nom de voyageur, ou sans voyageur, ou nulles', async () => {
      const broken = [
        { ...card('x1'), traveler: undefined },
        { ...card('x2'), traveler: { identityVerified: true } },
        { ...card('x3'), traveler: { displayName: 42, identityVerified: true } },
        { ...card('x4'), traveler: { displayName: '', identityVerified: true } },
        null,
      ]
      fetchMock.mockResolvedValue(jsonResponse(page([card('a'), ...broken, card('b')], 7)))
      const search = usePublicSearch()
      await search.run(query)
      expect(search.status.value).toBe('ok')
      expect(search.results.value.map(c => c.id)).toEqual(['a', 'b'])
    })

    it('une page où aucune carte n’est affichable est vide', async () => {
      fetchMock.mockResolvedValue(jsonResponse(page([{ ...card('x1'), traveler: undefined }])))
      const search = usePublicSearch()
      await search.run(query)
      expect(search.status.value).toBe('empty')
      expect(search.results.value).toEqual([])
    })

    it('« more » écarte aussi les cartes mal formées et un total illisible', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ content: [card('a'), card('b')], totalElements: 6, page: 0, size: 2, totalPages: 3 }))
      const search = usePublicSearch()
      await search.run(query)
      fetchMock.mockResolvedValueOnce(jsonResponse({ content: [card('c'), { ...card('d'), traveler: null }], totalElements: 'beaucoup', page: 1, size: 2, totalPages: 3 }))
      expect(await search.more()).toBe(1)
      expect(search.results.value.map(c => c.id)).toEqual(['a', 'b', 'c'])
      expect(search.total.value).toBe(3)
    })
  })

  describe('capped', () => {
    const paged = (ids: string[], total: number, totalPages: number, size: number) =>
      jsonResponse({ content: ids.map(card), totalElements: total, page: 0, size, totalPages })

    it('est vrai quand la dernière page atteignable est chargée et qu’il reste des trajets', async () => {
      fetchMock.mockImplementation(async (url) => {
        const index = Number(new URL(String(url)).searchParams.get('page'))
        return paged([`p${index}a`, `p${index}b`], 200, 100, 2)
      })
      const search = usePublicSearch()
      await search.run(query)
      expect(search.capped.value).toBe(false)
      for (let i = 0; i < 4; i++) await search.more()
      expect(search.remaining.value).toBe(0)
      expect(search.total.value).toBe(200)
      expect(search.capped.value).toBe(true)
    })

    it('est faux quand tout est affiché, ou avant la dernière page', async () => {
      fetchMock.mockResolvedValueOnce(paged(['a', 'b'], 2, 1, 2))
      const search = usePublicSearch()
      await search.run(query)
      expect(search.capped.value).toBe(false)
      fetchMock.mockResolvedValueOnce(paged(['a', 'b'], 6, 3, 2))
      await search.run(query)
      expect(search.capped.value).toBe(false)
    })

    it('est faux sans résultats', () => {
      expect(usePublicSearch().capped.value).toBe(false)
    })
  })

  describe('more', () => {
    const paged = (ids: string[], total: number, totalPages: number, size = 20) =>
      jsonResponse({ content: ids.map(card), totalElements: total, page: 0, size, totalPages })

    it('charge la page suivante et ajoute les cartes sans repasser par loading', async () => {
      fetchMock.mockResolvedValueOnce(paged(['a', 'b'], 5, 3, 2))
      const search = usePublicSearch()
      await search.run(query)
      expect(search.remaining.value).toBe(2)
      fetchMock.mockResolvedValueOnce(paged(['c', 'd'], 5, 3, 2))
      const promise = search.more()
      expect(search.status.value).toBe('ok')
      expect(search.loadingMore.value).toBe(true)
      expect(await promise).toBe(2)
      expect(search.loadingMore.value).toBe(false)
      expect(search.results.value.map(c => c.id)).toEqual(['a', 'b', 'c', 'd'])
      const url = new URL(String(fetchMock.mock.calls[1]![0]))
      expect(url.searchParams.get('page')).toBe('1')
      expect(url.searchParams.get('departureCity')).toBe('Paris')
      expect(search.remaining.value).toBe(1)
    })

    it('ne propose rien quand tout est affiché', async () => {
      fetchMock.mockResolvedValueOnce(paged(['a', 'b'], 2, 1, 2))
      const search = usePublicSearch()
      await search.run(query)
      expect(search.remaining.value).toBe(0)
      expect(await search.more()).toBe(0)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('ne propose rien avant la première recherche', async () => {
      const search = usePublicSearch()
      expect(search.remaining.value).toBe(0)
      expect(await search.more()).toBe(0)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('ne demande jamais la page 5 : la page 4 est la dernière atteignable', async () => {
      fetchMock.mockImplementation(async (url) => {
        const index = Number(new URL(String(url)).searchParams.get('page'))
        return paged([`p${index}a`, `p${index}b`], 200, 100, 2)
      })
      const search = usePublicSearch()
      await search.run(query)
      for (let i = 0; i < 4; i++) {
        expect(search.remaining.value).toBe(2)
        await search.more()
      }
      expect(search.results.value).toHaveLength(10)
      expect(search.remaining.value).toBe(0)
      expect(await search.more()).toBe(0)
      const pages = fetchMock.mock.calls.map(([url]) => new URL(String(url)).searchParams.get('page'))
      expect(pages).toEqual(['0', '1', '2', '3', '4'])
    })

    it('annonce au plus une page de cartes, et seulement ce qu’il reste', async () => {
      fetchMock.mockResolvedValueOnce(paged(['a', 'b'], 3, 2, 2))
      const search = usePublicSearch()
      await search.run(query)
      expect(search.remaining.value).toBe(1)
    })

    it.each([
      ['une erreur réseau', () => fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))],
      ['un 500', () => fetchMock.mockResolvedValueOnce(jsonResponse({}, 500))],
      ['un 429', () => fetchMock.mockResolvedValueOnce(jsonResponse({}, 429))],
      ['une réponse sans content', () => fetchMock.mockResolvedValueOnce(jsonResponse({ totalElements: 9 }))],
    ])('%s garde les cartes déjà affichées et lève moreError', async (_label, fail) => {
      fetchMock.mockResolvedValueOnce(paged(['a', 'b'], 6, 3, 2))
      const search = usePublicSearch()
      await search.run(query)
      fail()
      expect(await search.more()).toBe(0)
      expect(search.status.value).toBe('ok')
      expect(search.results.value.map(c => c.id)).toEqual(['a', 'b'])
      expect(search.moreError.value).toBe(true)
      expect(search.loadingMore.value).toBe(false)
      // Un nouvel essai repart de la même page et efface l'erreur.
      fetchMock.mockResolvedValueOnce(paged(['c', 'd'], 6, 3, 2))
      await search.more()
      expect(search.moreError.value).toBe(false)
      expect(search.results.value.map(c => c.id)).toEqual(['a', 'b', 'c', 'd'])
      const retried = new URL(String(fetchMock.mock.calls.at(-1)![0]))
      expect(retried.searchParams.get('page')).toBe('1')
    })

    it('ignore les doublons de cartes et réajuste le total quand la page ne rapporte rien', async () => {
      fetchMock.mockResolvedValueOnce(paged(['a', 'b'], 9, 3, 2))
      const search = usePublicSearch()
      await search.run(query)
      fetchMock.mockResolvedValueOnce(paged(['b', 'c'], 9, 3, 2))
      expect(await search.more()).toBe(1)
      expect(search.results.value.map(c => c.id)).toEqual(['a', 'b', 'c'])
      fetchMock.mockResolvedValueOnce(paged(['a', 'c'], 9, 3, 2))
      expect(await search.more()).toBe(0)
      expect(search.total.value).toBe(3)
      expect(search.remaining.value).toBe(0)
    })

    it('un appel à more annulé par une nouvelle recherche ne change rien', async () => {
      fetchMock.mockResolvedValueOnce(paged(['a', 'b'], 6, 3, 2))
      const search = usePublicSearch()
      await search.run(query)
      let resolveMore!: (r: Response) => void
      const signals: AbortSignal[] = []
      fetchMock.mockImplementationOnce((_url, init) => {
        signals.push(init!.signal!)
        return new Promise<Response>((resolve) => { resolveMore = resolve })
      })
      const pending = search.more()
      fetchMock.mockResolvedValueOnce(paged(['x'], 1, 1, 2))
      await search.run(query)
      expect(signals[0]!.aborted).toBe(true)
      expect(search.loadingMore.value).toBe(false)
      resolveMore(paged(['c', 'd'], 6, 3, 2))
      expect(await pending).toBe(0)
      expect(search.results.value.map(c => c.id)).toEqual(['x'])
    })

    it('un more annulé qui échoue ne lève pas moreError', async () => {
      fetchMock.mockResolvedValueOnce(paged(['a', 'b'], 6, 3, 2))
      const search = usePublicSearch()
      await search.run(query)
      fetchMock.mockImplementationOnce((_url, init) => new Promise<Response>((_resolve, reject) => {
        init!.signal!.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      }))
      const pending = search.more()
      fetchMock.mockResolvedValueOnce(paged(['x'], 1, 1, 2))
      await search.run(query)
      expect(await pending).toBe(0)
      expect(search.moreError.value).toBe(false)
    })

    it('ignore un second appel pendant qu’un chargement est en cours', async () => {
      fetchMock.mockResolvedValueOnce(paged(['a', 'b'], 6, 3, 2))
      const search = usePublicSearch()
      await search.run(query)
      let resolveMore!: (r: Response) => void
      fetchMock.mockImplementationOnce(() => new Promise<Response>((resolve) => { resolveMore = resolve }))
      const first = search.more()
      expect(await search.more()).toBe(0)
      resolveMore(paged(['c', 'd'], 6, 3, 2))
      expect(await first).toBe(2)
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })
  })
})
