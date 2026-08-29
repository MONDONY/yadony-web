import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import fr from '../../../i18n/locales/fr.json'
import TrackingWalkthrough from '@/components/sections/TrackingWalkthrough.vue'

const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr } })

describe('TrackingWalkthrough', () => {
  it('rend les quatre étapes du parcours', () => {
    const wrapper = mount(TrackingWalkthrough, { global: { plugins: [i18n] } })
    expect(wrapper.findAll('[data-step]')).toHaveLength(4)
  })

  it('numérote les étapes de 1 à 4', () => {
    const wrapper = mount(TrackingWalkthrough, { global: { plugins: [i18n] } })
    const numbers = wrapper.findAll('[data-step-number]').map((n) => n.text())
    expect(numbers).toEqual(['01', '02', '03', '04'])
  })

  it('donne un texte alternatif à chaque capture', () => {
    const wrapper = mount(TrackingWalkthrough, { global: { plugins: [i18n] } })
    const alts = wrapper.findAll('img').map((img) => img.attributes('alt'))
    expect(alts).toEqual([
      fr.home.tracking.steps.deposit.alt,
      fr.home.tracking.steps.airport.alt,
      fr.home.tracking.steps.transit.alt,
      fr.home.tracking.steps.delivery.alt,
    ])
  })

  it('déclare les dimensions des images pour éviter le décalage de mise en page', () => {
    const wrapper = mount(TrackingWalkthrough, { global: { plugins: [i18n] } })
    for (const img of wrapper.findAll('img')) {
      expect(img.attributes('width')).toBe('640')
      expect(img.attributes('height')).toBe('1385')
    }
  })
})
