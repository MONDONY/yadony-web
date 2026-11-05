import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { fr, en } from '../helpers/messages'
import LegalLayout from '@/components/layout/LegalLayout.vue'

const toc = [
  { id: 'section-1', label: 'Article 1. Qui peut utiliser Yadony ?' },
  { id: 'section-2', label: 'Article 2. Le paiement' },
  { id: 'section-3', label: 'Article 3. La livraison' },
]

function mountLayout(props: Record<string, unknown> = {}, locale: 'fr' | 'en' = 'fr') {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(LegalLayout, {
    props: { title: 'Conditions générales d’utilisation', toc, ...props },
    slots: { default: '<p data-testid="corps">Texte juridique</p>' },
    global: { plugins: [i18n] },
  })
}

beforeEach(() => {
  // Auto-import Nuxt : hors de Nuxt, on fournit l'équivalent sans préfixe de langue.
  vi.stubGlobal('useLocalePath', () => (path: string) => path)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('LegalLayout', () => {
  it('rend exactement un h1 avec le titre', () => {
    const wrapper = mountLayout()
    const titles = wrapper.findAll('h1')
    expect(titles).toHaveLength(1)
    expect(titles[0]!.text()).toBe('Conditions générales d’utilisation')
  })

  it('rend un sommaire dont chaque lien pointe vers #id', () => {
    const wrapper = mountLayout()
    const nav = wrapper.find('nav[aria-label="Sommaire"]')
    expect(nav.exists()).toBe(true)
    const links = nav.findAll('a')
    expect(links.map(link => link.attributes('href'))).toEqual(['#section-1', '#section-2', '#section-3'])
    expect(links.map(link => link.text())).toEqual(toc.map(entry => entry.label))
  })

  it('rend le fil d’Ariane Accueil › Légal › titre', () => {
    const wrapper = mountLayout()
    const crumbs = wrapper.find('nav[aria-label="Fil d’Ariane"]')
    expect(crumbs.exists()).toBe(true)
    const items = crumbs.findAll('li')
    expect(items.map(item => item.text())).toEqual(['Accueil', '›', 'Légal', '›', 'Conditions générales d’utilisation'])
    expect(items[0]!.find('a').attributes('href')).toBe('/')
    expect(items[2]!.find('a').exists()).toBe(false)
    expect(items[4]!.attributes('aria-current')).toBe('page')
  })

  it('place le contenu juridique dans le slot, intact', () => {
    const wrapper = mountLayout()
    expect(wrapper.find('[data-testid="corps"]').text()).toBe('Texte juridique')
  })

  it('affiche la date de mise à jour quand elle est fournie', () => {
    expect(mountLayout().find('[data-testid="legal-updated"]').exists()).toBe(false)
    const wrapper = mountLayout({ updated: 'Dernière mise à jour : 18 octobre 2026' })
    expect(wrapper.find('[data-testid="legal-updated"]').text()).toBe('Dernière mise à jour : 18 octobre 2026')
  })

  it('sans entrée de sommaire, ne rend pas de sommaire vide', () => {
    const wrapper = mountLayout({ toc: [] })
    expect(wrapper.find('nav[aria-label="Sommaire"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="corps"]').exists()).toBe(true)
  })

  it('le bouton du sommaire replie et déplie la liste sur mobile', async () => {
    const wrapper = mountLayout()
    const button = wrapper.find('button')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-testid="legal-toc-list"]').classes()).toContain('hidden')
    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('[data-testid="legal-toc-list"]').classes()).not.toContain('hidden')
  })

  it('replie le sommaire après le choix d’une section', async () => {
    const wrapper = mountLayout()
    await wrapper.find('button').trigger('click')
    await wrapper.find('[data-testid="legal-toc-list"] a').trigger('click')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
  })

  it('libelle le sommaire et le fil d’Ariane en anglais', () => {
    const wrapper = mountLayout({ title: 'Terms of use' }, 'en')
    expect(wrapper.find('nav[aria-label="Table of contents"]').exists()).toBe(true)
    expect(wrapper.find('nav[aria-label="Breadcrumb"]').exists()).toBe(true)
    expect(wrapper.find('nav[aria-label="Breadcrumb"]').text()).toContain('Home')
    expect(wrapper.find('nav[aria-label="Breadcrumb"]').text()).toContain('Legal')
  })
})
