import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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

  it.each(['fr', 'en'] as const)('donne au total le nom accessible de son libellé (%s)', (locale) => {
    const wrapper = mountSimulator(locale)
    const output = wrapper.find('output')
    const labelId = output.attributes('aria-labelledby')
    expect(labelId).toBeTruthy()
    const label = wrapper.find(`#${labelId}`)
    expect(label.text()).toBe((locale === 'fr' ? fr : en).journeys.traveler.simulator.totalLabel)
    expect(output.attributes('for')).toBe('earnings-kg earnings-price')
  })
})

// Les pseudo-éléments de la poignée ne se testent pas dans happy-dom : on lit
// la feuille de style du composant.
describe('EarningsSimulator : poignée des curseurs', () => {
  const source = readFileSync(resolve(__dirname, '../../../app/components/journey/EarningsSimulator.vue'), 'utf8')
  const style = source.slice(source.indexOf('<style'))
  const rule = (selector: string) => {
    const start = style.indexOf(`${selector} {`)
    expect(start, selector).toBeGreaterThan(-1)
    return style.slice(start, style.indexOf('}', start))
  }

  it('fait 28 px de côté, bordure comprise, dans les deux moteurs', () => {
    for (const selector of ['.earnings-range::-webkit-slider-thumb', '.earnings-range::-moz-range-thumb']) {
      const body = rule(selector)
      expect(body).toContain('box-sizing: border-box')
      expect(body).toContain('width: 28px')
      expect(body).toContain('height: 28px')
    }
  })

  it('coupe la transition et l’agrandissement en mouvement réduit', () => {
    const reduced = style.slice(style.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reduced).toContain('.earnings-range::-webkit-slider-thumb')
    expect(reduced).toContain('.earnings-range::-moz-range-thumb')
    expect(reduced).toContain('transition: none')
    expect(reduced).toContain('scale: none')
  })
})
