import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher.vue'

describe('LanguageSwitcher', () => {
  it('affiche le code de la langue cible', () => {
    const wrapper = mount(LanguageSwitcher, {
      props: { href: '/en/pricing', targetLocale: 'en' },
    })
    expect(wrapper.find('a').text()).toBe('EN')
    expect(wrapper.find('a').attributes('href')).toBe('/en/pricing')
  })

  it('affiche FR quand la cible est le français', () => {
    const wrapper = mount(LanguageSwitcher, {
      props: { href: '/tarifs', targetLocale: 'fr' },
    })
    expect(wrapper.find('a').text()).toBe('FR')
    expect(wrapper.find('a').attributes('href')).toBe('/tarifs')
  })

  it('annonce la langue cible aux lecteurs d’écran', () => {
    const wrapper = mount(LanguageSwitcher, {
      props: { href: '/en', targetLocale: 'en' },
    })
    expect(wrapper.find('a').attributes('hreflang')).toBe('en')
    expect(wrapper.find('a').attributes('aria-label')).toContain('English')
  })

  it('provoque un chargement complet plutôt qu’une navigation cliente', () => {
    const wrapper = mount(LanguageSwitcher, {
      props: { href: '/en', targetLocale: 'en' },
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.findComponent({ name: 'NuxtLink' }).exists()).toBe(false)
  })
})
