import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import fr from '../../../i18n/locales/fr.json'
import en from '../../../i18n/locales/en.json'
import BetaBanner from '@/components/layout/BetaBanner.vue'
import { betaWhatsAppGroupUrl } from '@/lib/site'
import { whatsappIconPath } from '@/lib/social'

function mountBanner(locale: 'fr' | 'en' = 'fr') {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(BetaBanner, { global: { plugins: [i18n] } })
}

describe('BetaBanner', () => {
  it('annonce la phase de test et invite à rejoindre le groupe', () => {
    const wrapper = mountBanner()
    expect(wrapper.text()).toContain(fr.beta.banner.badge)
    expect(wrapper.text()).toContain(fr.beta.banner.text)
    expect(wrapper.text()).toContain(fr.beta.banner.cta)
  })

  it('pointe vers le groupe WhatsApp dans un onglet neuf et sécurisé', () => {
    const anchor = mountBanner().find('a')
    expect(anchor.attributes('href')).toBe(betaWhatsAppGroupUrl)
    expect(anchor.attributes('target')).toBe('_blank')
    expect(anchor.attributes('rel')).toBe('noopener noreferrer')
  })

  it('annonce l’ouverture dans un nouvel onglet sans alourdir le libellé visible', () => {
    const anchor = mountBanner().find('a')
    expect(anchor.find('.sr-only').text()).toBe(fr.a11y.opensNewTab)
  })

  /**
   * Le bandeau est un point de repère pour les lecteurs d'écran : sans nom
   * accessible, la région est annoncée « region » et n'apprend rien.
   */
  it('expose une région nommée', () => {
    const region = mountBanner().find('[role="region"]')
    expect(region.exists()).toBe(true)
    expect(region.attributes('aria-label')).toBe(fr.beta.banner.label)
  })

  /**
   * Le logo WhatsApp est purement décoratif : le libellé du lien dit déjà
   * où il mène, donc le SVG reste hors de l'arbre d'accessibilité.
   */
  it('rend le logo WhatsApp en décoration', () => {
    const svg = mountBanner().find('svg')
    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.find('path').attributes('d')).toBe(whatsappIconPath)
  })

  it('bascule en anglais avec la locale', () => {
    const wrapper = mountBanner('en')
    expect(wrapper.text()).toContain(en.beta.banner.text)
    expect(wrapper.text()).toContain(en.beta.banner.cta)
    expect(wrapper.text()).not.toContain(fr.beta.banner.text)
  })
})
