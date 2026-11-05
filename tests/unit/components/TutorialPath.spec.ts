import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { en, fr } from '../helpers/messages'
import TutorialPath from '@/components/tutorials/TutorialPath.vue'
import TutorialCard from '@/components/tutorials/TutorialCard.vue'
import TutorialPlayer from '@/components/tutorials/TutorialPlayer.vue'
import { tutorials } from '@/lib/tutorials'

function mountWith(component: object, props: Record<string, unknown>, locale: 'fr' | 'en') {
  const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
  return mount(component, { props, global: { plugins: [i18n], components: { TutorialPath } } })
}

// Texte que lit un lecteur d'écran : tout sauf les nœuds aria-hidden.
function accessibleText(root: Element): string {
  let out = ''
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) out += node.textContent
    else if (node instanceof Element && node.getAttribute('aria-hidden') !== 'true') out += accessibleText(node)
  })
  return out
}

describe('TutorialPath', () => {
  for (const [locale, messages] of [['fr', fr], ['en', en]] as const) {
    for (const id of ['payments', 'alerts']) {
      it(`${id} en ${locale} : glyphe ☰ masqué, « Menu » lu, texte visible inchangé`, () => {
        const wrapper = mountWith(TutorialPath, { id }, locale)
        const visible = (messages.tutorials.items as Record<string, { path: string }>)[id].path
        expect(wrapper.text().replace('Menu', '')).toBe(visible)
        expect(wrapper.find('[aria-hidden="true"]').text()).toBe('☰')
        const spoken = accessibleText(wrapper.element)
        expect(spoken).toContain('Menu')
        expect(spoken).not.toContain('☰')
      })
    }
  }

  it('laisse intact un chemin sans glyphe', () => {
    const wrapper = mountWith(TutorialPath, { id: 'search' }, 'fr')
    expect(wrapper.text()).toBe(fr.tutorials.items.search.path)
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(false)
  })

  it('la carte l’utilise : son nom accessible ne contient pas ☰', () => {
    const payments = tutorials.find(item => item.id === 'payments')!
    const wrapper = mountWith(TutorialCard, { tutorial: payments }, 'fr')
    const spoken = accessibleText(wrapper.element)
    expect(spoken).toContain('Menu')
    expect(spoken).not.toContain('☰')
  })

  it('le lecteur l’utilise aussi', () => {
    const payments = tutorials.find(item => item.id === 'payments')!
    const wrapper = mountWith(TutorialPlayer, { tutorial: payments }, 'en')
    const spoken = accessibleText(wrapper.element)
    expect(spoken).toContain('Activity › ')
    expect(spoken).toContain('Menu')
    expect(spoken).not.toContain('☰')
  })
})
