import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiAccordion from '@/components/ui/UiAccordion.vue'

const items = [
  { id: 'delai', question: 'Combien de temps prend une livraison ?', answer: 'Entre 2 et 7 jours.' },
  { id: 'prix', question: 'Combien coûte un envoi ?', answer: 'Le voyageur fixe son prix au kilo.' },
]

describe('UiAccordion', () => {
  it('rend un élément details par question', () => {
    const wrapper = mount(UiAccordion, { props: { items } })
    expect(wrapper.findAll('details')).toHaveLength(2)
  })

  it('affiche question et réponse', () => {
    const wrapper = mount(UiAccordion, { props: { items } })
    expect(wrapper.text()).toContain('Combien de temps prend une livraison ?')
    expect(wrapper.text()).toContain('Entre 2 et 7 jours.')
  })

  it('rend toutes les réponses dans le DOM pour rester indexable', () => {
    const wrapper = mount(UiAccordion, { props: { items } })
    expect(wrapper.findAll('details p')).toHaveLength(2)
  })
})
