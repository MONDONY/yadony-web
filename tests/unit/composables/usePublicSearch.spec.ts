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
})
