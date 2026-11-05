import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { en, fr } from '../helpers/messages'
import HomeHandoff from '@/components/home/HomeHandoff.vue'
import UiPhone from '@/components/ui/UiPhone.vue'
import UiPicture from '@/components/ui/UiPicture.vue'

function mountHandoff(locale: 'fr' | 'en' = 'fr') {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(HomeHandoff, { global: { plugins: [i18n], components: { UiPhone, UiPicture } } })
}

describe('HomeHandoff', () => {
  it('annonce le principe : chercher ici, réserver dans l’app', () => {
    expect(mountHandoff().find('h2').text()).toBe("Chercher ici, réserver dans l'app.")
    expect(mountHandoff('en').find('h2').text()).toBe('Search here, book in the app.')
  })

  it('déroule trois étapes numérotées', () => {
    const steps = mountHandoff().findAll('ol > li')
    expect(steps).toHaveLength(3)
    expect(steps[0]!.text()).toContain('Cherchez')
    expect(steps[1]!.text()).toContain('Demandez')
    expect(steps[2]!.text()).toContain('Suivez')
  })

  it('montre l’écran Mes colis avec un texte alternatif', () => {
    const phone = mountHandoff().find('[data-screen="my-parcels"]')
    expect(phone.exists()).toBe(true)
    expect(phone.find('img').attributes('alt')).not.toBe('')
  })

  it('ne propose aucun téléchargement : les badges des stores sont ailleurs', () => {
    const wrapper = mountHandoff()
    expect(wrapper.find('[data-store-badges]').exists()).toBe(false)
    expect(wrapper.find('a').exists()).toBe(false)
  })
})
