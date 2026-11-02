import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { fr, en } from '../helpers/messages'
import EarningsSimulator from '@/components/journey/EarningsSimulator.vue'

function mountSimulator(locale: 'fr' | 'en' = 'fr') {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(EarningsSimulator, { global: { plugins: [i18n] } })
}

// Intl met des espaces insécables avant le symbole € en français.
const flat = (text: string) => text.replace(/\s/g, ' ')

afterEach(() => vi.unstubAllGlobals())

describe('EarningsSimulator', () => {
  it('part de 15 kg à 8 € le kilo, soit 120 €', () => {
    const wrapper = mountSimulator()
    expect((wrapper.find('#earnings-kg').element as HTMLInputElement).value).toBe('15')
    expect((wrapper.find('#earnings-price').element as HTMLInputElement).value).toBe('8')
    expect(flat(wrapper.find('output').text())).toBe('120 €')
  })

  it('étiquette chaque curseur et annonce le total poliment', () => {
    const wrapper = mountSimulator()
    for (const id of ['earnings-kg', 'earnings-price']) {
      const input = wrapper.find(`#${id}`)
      expect(input.attributes('type')).toBe('range')
      expect(wrapper.find(`label[for="${id}"]`).exists()).toBe(true)
    }
    expect(wrapper.find('output').attributes('aria-live')).toBe('polite')
  })

  it('met le total à jour quand un curseur bouge', async () => {
    const wrapper = mountSimulator()
    await wrapper.find('#earnings-kg').setValue('20')
    expect(flat(wrapper.find('output').text())).toBe('160 €')
    await wrapper.find('#earnings-price').setValue('10')
    expect(flat(wrapper.find('output').text())).toBe('200 €')
  })

  it('formate le montant selon la langue', () => {
    expect(mountSimulator('en').find('output').text()).toBe('€120')
  })

  it('affiche la mention indicative, sans net estimé', () => {
    const text = flat(mountSimulator().text())
    expect(text).toContain('Exemple indicatif : chaque voyageur fixe son propre prix.')
    expect(text).toContain('Le montant que vous recevez, après la commission de service, est affiché avant que vous acceptiez.')
    expect(text).not.toMatch(/net/i)
  })

  it('n’appelle jamais le réseau', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const wrapper = mountSimulator()
    await wrapper.find('#earnings-kg').setValue('5')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
