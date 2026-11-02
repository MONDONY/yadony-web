import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { en, fr } from '../helpers/messages'
import SearchStates from '@/components/search/SearchStates.vue'
import type { SearchStatus } from '@/composables/usePublicSearch'
import type { SearchQuery } from '@/lib/public-search'

const query: SearchQuery = { depart: 'Paris', arrivee: 'Abidjan', quand: '', page: 0 }

function mountStates(status: SearchStatus, q: SearchQuery = query, locale: 'fr' | 'en' = 'fr') {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(SearchStates, { props: { status, query: q }, global: { plugins: [i18n] } })
}

const markers: Record<string, string> = {
  loading: 'data-state="loading"',
  empty: 'data-state="empty"',
  error: 'data-state="error"',
  'rate-limited': 'data-state="rate-limited"',
}

describe('SearchStates', () => {
  it.each([['idle'], ['ok']] as const)('ne rend rien à l’état %s', (status) => {
    expect(mountStates(status).find('[data-state]').exists()).toBe(false)
  })

  it.each(['loading', 'empty', 'error', 'rate-limited'] as const)('rend un seul état à la fois : %s', (status) => {
    const wrapper = mountStates(status)
    const states = wrapper.findAll('[data-state]').map((el) => el.attributes('data-state'))
    expect(states).toEqual([status])
    expect(markers[status]).toContain(status)
  })

  it('rend trois squelettes de même hauteur pendant le chargement', () => {
    const wrapper = mountStates('loading')
    const skeletons = wrapper.findAll('[data-skeleton]')
    expect(skeletons).toHaveLength(3)
    expect(new Set(skeletons.map((s) => s.classes().join(' '))).size).toBe(1)
    expect(wrapper.find('[data-state="loading"]').attributes('aria-busy')).toBe('true')
    expect(wrapper.text()).toContain(fr.search.states.loading)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('nomme le trajet cherché quand rien ne correspond', () => {
    const wrapper = mountStates('empty')
    expect(wrapper.find('[data-state] > p').text()).toBe('Aucun voyageur pour Paris → Abidjan.')
    expect(wrapper.text()).toContain(fr.search.states.empty.text)
  })

  it('nomme un départ seul ou une arrivée seule', () => {
    expect(mountStates('empty', { ...query, arrivee: '' }).text()).toContain('Aucun voyageur pour Paris')
    expect(mountStates('empty', { ...query, depart: '' }).text()).toContain('Aucun voyageur pour Abidjan')
  })

  it('ajoute « ce mois-ci » seulement pour la recherche du mois', () => {
    const month = { ...query, quand: 'ce-mois' as const }
    expect(mountStates('empty', month).find('[data-state] > p').text()).toBe('Aucun voyageur pour Paris → Abidjan ce mois-ci.')
    expect(mountStates('empty', { ...month, depart: '', arrivee: '' }).find('[data-state] > p').text()).toBe(fr.search.states.empty.titleAnyMonth)
    expect(mountStates('empty', { ...query, quand: '3-mois' }).text()).not.toContain('ce mois-ci')
    expect(mountStates('empty', month, 'en').find('[data-state] > p').text()).toBe('No traveler for Paris → Abidjan this month.')
  })

  it('propose « Voir les 3 prochains mois » sauf si la recherche les couvre déjà, et émet widen', async () => {
    for (const quand of ['', 'ce-mois'] as const) {
      const wrapper = mountStates('empty', { ...query, quand })
      const widen = wrapper.findAll('button').find((b) => b.text() === fr.search.states.empty.widen)!
      expect(widen.attributes('type')).toBe('button')
      await widen.trigger('click')
      expect(wrapper.emitted('widen')).toHaveLength(1)
    }
    expect(mountStates('empty', { ...query, quand: '3-mois' }).find('button').exists()).toBe(false)
    expect(mountStates('empty', query, 'en').find('button').text()).toBe('See the next 3 months')
  })

  it('reste correct sans ville dans la requête', () => {
    const text = mountStates('empty', { ...query, depart: '', arrivee: '' }).text()
    expect(text).toContain(fr.search.states.empty.titleAny)
    expect(text).not.toMatch(/undefined|→/)
  })

  it('propose Réessayer à l’état indisponible et émet retry', async () => {
    const wrapper = mountStates('error')
    expect(wrapper.text()).toContain(fr.search.states.error.title)
    const retry = wrapper.findAll('button').find((b) => b.text() === fr.search.states.error.retry)!
    expect(retry.attributes('type')).toBe('button')
    await retry.trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('affiche le message dédié aux trop nombreuses requêtes, sans bouton', () => {
    const wrapper = mountStates('rate-limited')
    expect(wrapper.text()).toContain(fr.search.states.rateLimited.title)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('annonce les états non bloquants aux lecteurs d’écran', () => {
    expect(mountStates('error').find('[data-state]').attributes('role')).toBe('alert')
    expect(mountStates('empty').find('[data-state]').attributes('role')).toBe('status')
  })

  it('traduit les états en anglais', () => {
    expect(mountStates('error', query, 'en').text()).toContain(en.search.states.error.title)
    expect(mountStates('empty', query, 'en').text()).toContain('No traveler for Paris → Abidjan')
  })
})
