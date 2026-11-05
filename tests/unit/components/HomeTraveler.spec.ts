import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { en, fr } from '../helpers/messages'
import HomeTraveler from '@/components/home/HomeTraveler.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPhone from '@/components/ui/UiPhone.vue'
import UiPicture from '@/components/ui/UiPicture.vue'

beforeEach(() => {
  vi.stubGlobal('useLocalePath', () => (path: string) => (path === '/devenir-voyageur' ? '/en/become-a-traveler' : path))
})

function mountTraveler(locale: 'fr' | 'en' = 'fr') {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(HomeTraveler, { global: { plugins: [i18n], components: { UiButton, UiPhone, UiPicture } } })
}

describe('HomeTraveler', () => {
  it('invite le voyageur à vendre ses kilos libres', () => {
    const wrapper = mountTraveler()
    expect(wrapper.find('h2').text()).toBe('Vous voyagez ? Vendez vos kilos libres.')
    expect(wrapper.text()).toContain('Publiez votre trajet dans l\'app')
    expect(mountTraveler('en').find('h2').text()).toBe('Traveling? Sell your spare kilos.')
  })

  it('son seul appel mène à la page Devenir voyageur, pas à une action de l\'app', () => {
    const links = mountTraveler().findAll('a')
    expect(links).toHaveLength(1)
    expect(links[0]!.attributes('href')).toBe('/en/become-a-traveler')
    expect(links[0]!.text()).toBe('Devenir voyageur')
    expect(mountTraveler().text()).not.toContain('Publier mon trajet')
    expect(mountTraveler('en').find('a').text()).toBe('Become a traveler')
  })

  it('met le texte avant le téléphone dans l\'ordre de lecture, le téléphone repassant à gauche sur grand écran', () => {
    const wrapper = mountTraveler()
    const html = wrapper.html()
    expect(html.indexOf('<h2')).toBeGreaterThan(-1)
    expect(html.indexOf('<h2')).toBeLessThan(html.indexOf('data-screen="my-trips"'))
    const phoneColumn = wrapper.find('[data-screen="my-trips"]').element.closest('[class*="lg:col-span-5"]')!
    const textColumn = wrapper.find('h2').element.closest('[class*="lg:col-span-7"]')!
    expect(phoneColumn.classList.contains('lg:order-1')).toBe(true)
    expect(textColumn.classList.contains('lg:order-2')).toBe(true)
  })

  it('montre l\'écran Mes trajets avec un texte alternatif', () => {
    const phone = mountTraveler().find('[data-screen="my-trips"]')
    expect(phone.exists()).toBe(true)
    expect(phone.find('img').attributes('alt')).not.toBe('')
  })
})
