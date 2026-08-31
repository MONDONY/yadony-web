import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import fr from '../../../i18n/locales/fr.json'
import HomeFaq from '@/components/sections/HomeFaq.vue'
import UiAccordion from '@/components/ui/UiAccordion.vue'

const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr } })
const global = { plugins: [i18n], components: { UiAccordion } }

describe('HomeFaq', () => {
  it('rend huit questions', () => {
    const wrapper = mount(HomeFaq, { global })
    expect(wrapper.findAll('details')).toHaveLength(8)
  })

  it('rend les réponses dans le DOM même repliées, pour l’indexation', () => {
    const wrapper = mount(HomeFaq, { global })
    expect(wrapper.findAll('details p')).toHaveLength(8)
  })

  it('n’ouvre aucune question par défaut', () => {
    const wrapper = mount(HomeFaq, { global })
    expect(wrapper.findAll('details[open]')).toHaveLength(0)
  })
})
