import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { en, fr } from '../helpers/messages'
import HomeToday from '@/components/home/HomeToday.vue'

beforeEach(() => {
  vi.stubGlobal('useLocalePath', () => (path: string) => path)
})

function mountToday(locale: 'fr' | 'en' = 'fr') {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(HomeToday, { global: { plugins: [i18n] } })
}

describe('HomeToday', () => {
  it('liste six entrées, chacune un lien', () => {
    const wrapper = mountToday()
    expect(wrapper.find('h2').text()).toBe("Yadony aujourd'hui.")
    expect(wrapper.findAll('li')).toHaveLength(6)
    expect(wrapper.findAll('li a')).toHaveLength(6)
  })

  it('mène aux bonnes pages', () => {
    const hrefs = mountToday().findAll('li a').map((a) => a.attributes('href'))
    expect(hrefs).toEqual([
      '/envoyer-colis',
      '/devenir-voyageur',
      '/billets-avion',
      '/securite',
      '/comment-ca-marche',
      'https://pro.yadony.com',
    ])
  })

  it('ouvre Yadony Pro dans un nouvel onglet, annoncé aux lecteurs d’écran', () => {
    const pro = mountToday().findAll('li a')[5]!
    expect(pro.attributes('target')).toBe('_blank')
    expect(pro.attributes('rel')).toBe('noopener noreferrer')
    expect(pro.find('.sr-only').exists()).toBe(true)
  })

  it('n’ouvre pas les pages du site dans un nouvel onglet', () => {
    for (const a of mountToday().findAll('li a').slice(0, 5)) expect(a.attributes('target')).toBeUndefined()
  })

  it('existe en anglais', () => {
    const wrapper = mountToday('en')
    expect(wrapper.find('h2').text()).toBe('Yadony today.')
    expect(wrapper.findAll('li')).toHaveLength(6)
  })
})
