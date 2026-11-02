import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { fr, en } from '../helpers/messages'
import TravelerTemps from '@/components/journey/TravelerTemps.vue'
import { travelerJourney } from '@/lib/journeys'

function mountTemps(locale: 'fr' | 'en' = 'fr') {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(TravelerTemps, {
    props: { steps: travelerJourney },
    global: { plugins: [i18n], stubs: { JourneyVisualInView: true } },
  })
}

describe('TravelerTemps', () => {
  it('rend quatre temps numérotés dans une liste étiquetée', () => {
    const wrapper = mountTemps()
    expect(wrapper.find('ol').attributes('aria-label')).toBe(fr.journeys.traveler.listLabel)
    const items = wrapper.findAll('ol > li')
    expect(items).toHaveLength(4)
    expect(items.map(item => item.find('h3').text())).toEqual([
      'Publiez votre trajet', 'Choisissez votre prix', 'Partagez votre affiche', 'Livrez contre le code',
    ])
    expect(items[0]!.text()).toContain('Étape 1')
  })

  it('reprend les textes existants des étapes, sans les dupliquer', () => {
    const text = mountTemps().text()
    const { steps } = fr.journeys.traveler
    for (const index of [0, 1, 2, 3, 5, 6]) expect(text).toContain(steps[index]!.text)
    // Le scan hors ligne vit dans « Vous gardez la main », pas dans les temps.
    expect(text).not.toContain(steps[4]!.text)
  })

  it('n’affiche le titre d’une étape que dans un temps groupé et s’il n’en répète pas le titre', () => {
    const items = mountTemps().findAll('ol > li')
    const { steps } = fr.journeys.traveler
    expect(items[0]!.text()).not.toContain(steps[0]!.title)
    expect(items[2]!.findAll('h4').map(h => h.text())).toEqual([steps[3]!.title])
    expect(items[3]!.findAll('h4').map(h => h.text())).toEqual([steps[5]!.title])
  })

  it.each(['fr', 'en'] as const)('chaque titre n’est rendu qu’une fois (%s)', (locale) => {
    const items = mountTemps(locale).findAll('ol > li')
    for (const item of items) {
      const titles = item.findAll('h3, h4').map(h => h.text().toLowerCase())
      expect(new Set(titles).size).toBe(titles.length)
      // Aucun titre d'étape ne recommence par le titre du temps.
      const [temps, ...steps] = titles
      for (const step of steps) expect(step.startsWith(temps!)).toBe(false)
    }
    // Le texte de l'étape dont le titre est omis reste affiché.
    const { steps } = (locale === 'fr' ? fr : en).journeys.traveler
    expect(items[2]!.text()).toContain(steps[2]!.text)
    expect(items[3]!.text()).toContain(steps[6]!.text)
  })

  it('parle anglais en anglais', () => {
    const items = mountTemps('en').findAll('ol > li')
    expect(items.map(item => item.find('h3').text())).toEqual([
      'Post your trip', 'Choose your price', 'Share your poster', 'Deliver against the code',
    ])
    expect(items[0]!.text()).toContain('Step 1')
  })
})
