import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiButton from '@/components/ui/UiButton.vue'

describe('UiButton', () => {
  it('rend un bouton natif par défaut', () => {
    const wrapper = mount(UiButton, { slots: { default: 'Envoyer' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.text()).toBe('Envoyer')
  })

  it('rend un lien interne quand `to` est fourni', () => {
    const wrapper = mount(UiButton, { props: { to: '/tarifs' }, slots: { default: 'Tarifs' } })
    expect(wrapper.find('a').attributes('href')).toBe('/tarifs')
  })

  it('rend un lien externe sécurisé quand `href` est fourni', () => {
    const wrapper = mount(UiButton, {
      props: { href: 'https://apps.apple.com/app/id0000000000' },
      slots: { default: 'App Store' },
    })
    const anchor = wrapper.find('a')
    expect(anchor.attributes('href')).toBe('https://apps.apple.com/app/id0000000000')
    expect(anchor.attributes('rel')).toBe('noopener noreferrer')
    expect(anchor.attributes('target')).toBe('_blank')
  })

  it('applique la variante ghost', () => {
    const wrapper = mount(UiButton, { props: { variant: 'ghost' }, slots: { default: 'En savoir plus' } })
    expect(wrapper.classes().join(' ')).toContain('border-line')
  })
})
