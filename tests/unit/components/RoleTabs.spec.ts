import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import fr from '../../../i18n/locales/fr.json'
import RoleTabs from '@/components/sections/RoleTabs.vue'

const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr } })

function mountTabs(modelValue: 'expediteur' | 'voyageur') {
  return mount(RoleTabs, { props: { modelValue }, global: { plugins: [i18n] } })
}

describe('RoleTabs', () => {
  it('expose une liste d’onglets accessible', () => {
    const wrapper = mountTabs('expediteur')
    expect(wrapper.find('[role="tablist"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(2)
  })

  it('marque l’onglet actif avec aria-selected', () => {
    const wrapper = mountTabs('voyageur')
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0]!.attributes('aria-selected')).toBe('false')
    expect(tabs[1]!.attributes('aria-selected')).toBe('true')
  })

  it('émet le nouveau rôle au clic', async () => {
    const wrapper = mountTabs('expediteur')
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['voyageur']])
  })

  it('n’émet rien si on clique sur l’onglet déjà actif', async () => {
    const wrapper = mountTabs('expediteur')
    await wrapper.findAll('[role="tab"]')[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('un seul onglet porte tabindex="0" à un instant donné', () => {
    const wrapper = mountTabs('voyageur')
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0]!.attributes('tabindex')).toBe('-1')
    expect(tabs[1]!.attributes('tabindex')).toBe('0')
  })

  it('la flèche droite sélectionne l’onglet suivant', async () => {
    const wrapper = mountTabs('expediteur')
    await wrapper.findAll('[role="tab"]')[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['voyageur']])
  })

  it('la flèche gauche depuis le premier onglet boucle sur le dernier', async () => {
    const wrapper = mountTabs('expediteur')
    await wrapper.findAll('[role="tab"]')[0]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['voyageur']])
  })

  it('End sélectionne le dernier onglet', async () => {
    const wrapper = mountTabs('expediteur')
    await wrapper.findAll('[role="tab"]')[0]!.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['voyageur']])
  })

  it('Home ramène au premier onglet', async () => {
    const wrapper = mountTabs('voyageur')
    await wrapper.findAll('[role="tab"]')[1]!.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['expediteur']])
  })
})
