import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { renderToString } from 'vue/server-renderer'
import { createSSRApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { en, fr } from '../helpers/messages'
import HomeUpcoming from '@/components/home/HomeUpcoming.vue'
import SearchResultCard from '@/components/search/SearchResultCard.vue'
import AppHandoff from '@/components/search/AppHandoff.vue'
import UiButton from '@/components/ui/UiButton.vue'
import type { PublicAnnouncementCard } from '@/lib/public-search'

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBase: 'https://api.test/api/v1' } }))
  // `useLocalePath` est une auto-import de Nuxt : absente hors de l'app.
  vi.stubGlobal('useLocalePath', () => (path: string) => (path === '/envoyer-colis' ? '/en/send-a-parcel' : path))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function card(id: string, name = 'Mariam S.'): PublicAnnouncementCard {
  return {
    id,
    departureCity: 'Paris',
    arrivalCity: 'Abidjan',
    departureDate: '2026-12-20',
    currency: 'EUR',
    urgent: false,
    traveler: { displayName: name, identityVerified: true },
  }
}

function respond(content: PublicAnnouncementCard[], status = 200) {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ content, totalElements: content.length, page: 0, size: 20, totalPages: 1 }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

const components = { SearchResultCard, AppHandoff, UiButton }

function mountUpcoming(props: { from?: string; to?: string } = {}, locale: 'fr' | 'en' = 'fr') {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(HomeUpcoming, { props, global: { plugins: [i18n], components } })
}

describe('HomeUpcoming', () => {
  it('affiche les trois prochains départs sous un titre', async () => {
    respond([card('a'), card('b'), card('c'), card('d')])
    const wrapper = mountUpcoming()
    await flushPromises()
    expect(wrapper.find('h2').text()).toBe('Prochains départs')
    expect(wrapper.findAll('article')).toHaveLength(3)
    expect(wrapper.text()).not.toContain('Voyageur D.')
  })

  it('titre anglais', async () => {
    respond([card('a')])
    const wrapper = mountUpcoming({}, 'en')
    await flushPromises()
    expect(wrapper.find('h2').text()).toBe('Next departures')
  })

  it('sans filtre de ville par défaut', async () => {
    respond([card('a')])
    mountUpcoming()
    await flushPromises()
    const url = new URL(String(fetchMock.mock.calls[0]![0]))
    expect(url.searchParams.has('departureCity')).toBe(false)
    expect(url.searchParams.has('arrivalCity')).toBe(false)
  })

  it('filtre sur les villes données en propriétés', async () => {
    respond([card('a')])
    mountUpcoming({ from: 'Lyon', to: 'Dakar' })
    await flushPromises()
    const url = new URL(String(fetchMock.mock.calls[0]![0]))
    expect(url.searchParams.get('departureCity')).toBe('Lyon')
    expect(url.searchParams.get('arrivalCity')).toBe('Dakar')
  })

  it('sans ville, ne propose aucun lien vers la recherche', async () => {
    respond([card('a')])
    const wrapper = mountUpcoming()
    await flushPromises()
    expect(wrapper.find('a[href*="send-a-parcel"]').exists()).toBe(false)
  })

  it('avec des villes, propose « Voir tous les départs » vers la recherche déjà remplie', async () => {
    respond([card('a')])
    const wrapper = mountUpcoming({ from: 'Paris', to: 'Dakar' })
    await flushPromises()
    const link = wrapper.find('a[href*="send-a-parcel"]')
    expect(link.text()).toBe('Voir tous les départs')
    expect(link.attributes('href')).toBe('/en/send-a-parcel?depart=Paris&arrivee=Dakar')
  })

  it('lien traduit en anglais', async () => {
    respond([card('a')])
    const wrapper = mountUpcoming({ from: 'Lyon', to: 'Dakar' }, 'en')
    await flushPromises()
    expect(wrapper.find('a[href*="send-a-parcel"]').text()).toBe('See all departures')
  })

  it.each([
    ['une liste vide', () => respond([])],
    ['une erreur du serveur', () => respond([], 500)],
    ['un 429', () => respond([], 429)],
    ['une panne réseau', () => fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))],
  ])('disparaît entièrement, titre compris, après %s', async (_name, setup) => {
    setup()
    const wrapper = mountUpcoming()
    await flushPromises()
    expect(wrapper.find('section').exists()).toBe(false)
    expect(wrapper.find('h2').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('reste absente pendant le chargement', () => {
    fetchMock.mockReturnValue(new Promise(() => {}))
    const wrapper = mountUpcoming()
    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('ne lance aucun appel ni ne rend aucune donnée côté serveur', async () => {
    respond([card('a')])
    const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr, en } })
    const app = createSSRApp(HomeUpcoming)
    app.use(i18n)
    for (const [name, component] of Object.entries(components)) app.component(name, component)
    const html = await renderToString(app)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(html).not.toContain('Mariam')
    expect(html).not.toContain('<h2')
  })
})
