import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { en, fr } from '../helpers/messages'
import SearchResultCard from '@/components/search/SearchResultCard.vue'
import AppHandoff from '@/components/search/AppHandoff.vue'
import UiButton from '@/components/ui/UiButton.vue'
import type { PublicAnnouncementCard } from '@/lib/public-search'

function card(overrides: Partial<PublicAnnouncementCard> = {}): PublicAnnouncementCard {
  return {
    id: 'abc-123',
    departureCity: 'Paris',
    arrivalCity: 'Abidjan',
    departureDate: '2026-11-20',
    currency: 'EUR',
    urgent: false,
    traveler: { displayName: 'Awa', identityVerified: false },
    ...overrides,
  }
}

function mountCard(value: PublicAnnouncementCard, locale: 'fr' | 'en' = 'fr') {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(SearchResultCard, {
    props: { card: value },
    attachTo: document.body,
    global: { plugins: [i18n], components: { AppHandoff, UiButton } },
  })
}

describe('SearchResultCard', () => {
  it('affiche trajet, date, capacité, prix et voyageur', () => {
    const wrapper = mountCard(card({
      availableKg: 20,
      capacityUnit: 'KG_EXACT',
      pricePerKgDisplay: 10.7,
      transportMode: 'PLANE',
      traveler: { displayName: 'Awa', averageRating: 4.8, totalTrips: 12, identityVerified: true },
    }))
    const text = wrapper.text()
    expect(text).toContain('Paris')
    expect(text).toContain('Abidjan')
    expect(text).toContain('20 kg')
    expect(text).toContain('10,70')
    expect(text).toContain('ven.')
    expect(text).toContain('Awa')
    expect(text).toContain('4,8')
    expect(text).toContain('12 trajets')
    expect(text).toContain(fr.search.card.verified)
    expect(wrapper.find('[data-initial]').text()).toBe('A')
  })

  it('n’affiche ni undefined ni NaN quand prix, capacité, note et trajets manquent', () => {
    const wrapper = mountCard(card())
    const text = wrapper.text()
    expect(text).not.toMatch(/undefined|NaN|null/)
    expect(text).not.toContain(fr.search.card.verified)
    expect(text).not.toContain(fr.search.card.urgent)
    expect(text).not.toContain('/ kg')
    expect(wrapper.find('[data-price]').exists()).toBe(false)
    expect(wrapper.find('[data-capacity]').exists()).toBe(false)
  })

  it('affiche « Prix par article » pour un trajet MIXED sans prix au kilo', () => {
    const wrapper = mountCard(card({ pricingMode: 'MIXED' }))
    expect(wrapper.find('[data-price]').text()).toBe('Prix par article')
    expect(wrapper.text()).not.toContain('/ kg')
  })

  it('affiche le franc CFA correctement', () => {
    const wrapper = mountCard(card({ currency: 'XOF', pricePerKgDisplay: 3000 }))
    const price = wrapper.find('[data-price]').text()
    expect(price).toMatch(/3\s?000/)
    expect(price).toContain('CFA')
    expect(price).toContain('/ kg')
    expect(price).not.toMatch(/undefined|NaN/)
  })

  it('affiche le badge Urgent', () => {
    expect(mountCard(card({ urgent: true })).text()).toContain(fr.search.card.urgent)
  })

  it('rend un prénom hostile comme du texte, jamais comme du HTML', () => {
    const wrapper = mountCard(card({ traveler: { displayName: '<script>alert(1)</script>', identityVerified: false } }))
    expect(wrapper.find('script').exists()).toBe(false)
    expect(wrapper.text()).toContain('<script>alert(1)</script>')
    expect(wrapper.html()).toContain('&lt;script&gt;')
  })

  it('prend l’initiale entière d’un prénom commençant par un caractère hors BMP', () => {
    const wrapper = mountCard(card({ traveler: { displayName: '𝒜wa', identityVerified: false } }))
    expect(wrapper.find('[data-initial]').text()).toBe('𝒜')
  })

  it('n’affiche aucune initiale cassée pour un prénom vide', () => {
    const wrapper = mountCard(card({ traveler: { displayName: '', identityVerified: false } }))
    expect(wrapper.find('[data-initial]').text()).toBe('?')
  })

  it('lie « Détails » à la page publique, dans le même onglet, avec un nom accessible complet', () => {
    const wrapper = mountCard(card({ id: 'a b/1' }))
    const link = wrapper.find('a[href^="https://yadony.com/annonce/"]')
    expect(link.attributes('href')).toBe('https://yadony.com/annonce/a%20b%2F1')
    expect(link.attributes('target')).toBeUndefined()
    expect(link.text()).toBe(fr.search.card.details)
    const name = link.attributes('aria-label')!
    expect(name).toContain(fr.search.card.details)
    expect(name).toContain('Awa')
    expect(name).toContain('Paris')
    expect(name).toContain('Abidjan')
  })

  it('ouvre la remise à l’app depuis « Demander » et la referme', async () => {
    const wrapper = mountCard(card())
    expect(wrapper.find('dialog').exists()).toBe(false)
    const request = wrapper.findAll('button').find((b) => b.text() === fr.search.card.request)!
    expect(request.attributes('aria-label')).toContain('Awa')
    await request.trigger('click')

    const dialog = wrapper.find('dialog')
    expect(dialog.attributes('open')).toBeDefined()
    expect(dialog.text()).toContain(fr.search.handoff.title)

    // Équivalent de la touche Échap : le navigateur ferme la boîte.
    ;(dialog.element as HTMLDialogElement).close()
    await wrapper.vm.$nextTick()
    expect(dialog.attributes('open')).toBeUndefined()

    // On peut la rouvrir.
    await request.trigger('click')
    expect(wrapper.find('dialog').attributes('open')).toBeDefined()
  })

  it('traduit la carte en anglais', () => {
    const wrapper = mountCard(card({ urgent: true, traveler: { displayName: 'Awa', totalTrips: 1, identityVerified: true } }), 'en')
    const text = wrapper.text()
    expect(text).toContain(en.search.card.verified)
    expect(text).toContain('1 trip')
    expect(text).not.toContain('1 trips')
    expect(wrapper.find('a[href^="https://yadony.com/annonce/"]').text()).toBe(en.search.card.details)
  })
})
