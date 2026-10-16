import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import UiReveal from '@/components/ui/UiReveal.vue'
import UiScrollScene from '@/components/ui/UiScrollScene.vue'
import UiPhone from '@/components/ui/UiPhone.vue'
import { FakeIntersectionObserver, installObservers } from '../helpers/observers'

afterEach(() => vi.unstubAllGlobals())

describe('UiReveal', () => {
  it('reste visible au rendu serveur, puis se masque et se révèle à l’entrée', async () => {
    installObservers()
    const wrapper = mount(UiReveal, { props: { variant: 'scale', delay: 120 }, slots: { default: 'Bonjour' } })
    await nextTick()
    expect(wrapper.classes()).toContain('reveal-scale')
    expect(wrapper.attributes('data-state')).toBe('hidden')
    expect(wrapper.attributes('style')).toContain('--reveal-delay: 120ms')
    FakeIntersectionObserver.last().trigger(wrapper.element, true)
    await nextTick()
    expect(wrapper.attributes('data-state')).toBe('shown')
  })

  it('ne masque jamais un bloc déjà à l’écran au chargement (titre du haut de page, LCP)', async () => {
    installObservers()
    const rect = { top: 120, bottom: 400, left: 0, right: 800, width: 800, height: 280, x: 0, y: 120, toJSON: () => ({}) }
    const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect as DOMRect)
    const wrapper = mount(UiReveal, { slots: { default: 'Titre' } })
    await nextTick()
    expect(wrapper.attributes('data-state')).toBeUndefined()
    spy.mockRestore()
  })

  it('ne masque rien quand le visiteur demande moins d’animations', async () => {
    installObservers({ reducedMotion: true })
    const wrapper = mount(UiReveal, { slots: { default: 'Bonjour' } })
    await nextTick()
    expect(wrapper.attributes('data-state')).toBe('shown')
  })
})

describe('UiScrollScene', () => {
  it('rend chaque étape, avec l’étape active signalée', async () => {
    installObservers()
    const wrapper = mount(UiScrollScene, {
      props: { count: 3, label: 'Le parcours' },
      slots: {
        step: `<template #step="{ index, active }"><h3>Étape {{ index + 1 }}</h3><span v-if="active">active</span></template>`,
        visual: `<template #visual="{ active, mobile }"><p class="visual">visuel {{ active }} {{ mobile ? 'mobile' : 'épinglé' }}</p></template>`,
      },
    })
    await nextTick()
    const steps = wrapper.findAll('li')
    expect(steps).toHaveLength(3)
    expect(wrapper.text()).toContain('Étape 3')
    expect(steps[0]!.attributes('aria-current')).toBe('step')
    FakeIntersectionObserver.last().trigger(steps[2]!.element, true)
    await nextTick()
    expect(steps[2]!.attributes('aria-current')).toBe('step')
    expect(steps[0]!.attributes('aria-current')).toBeUndefined()
    // Visuel épinglé (desktop) + un visuel par étape (mobile).
    expect(wrapper.findAll('.visual').map(node => node.text())).toEqual([
      'visuel 2 épinglé', 'visuel 0 mobile', 'visuel 1 mobile', 'visuel 2 mobile',
    ])
  })
})

describe('UiPhone', () => {
  it('superpose les écrans et n’affiche que l’écran actif', () => {
    const wrapper = mount(UiPhone, {
      props: { screens: ['scan', 'wallet'], alts: ['Scan', 'Portefeuille'], active: 1 },
    })
    const layers = wrapper.findAll('[data-screen]')
    expect(layers.map(layer => layer.attributes('data-screen'))).toEqual(['scan', 'wallet'])
    expect(layers[1]!.attributes('data-active')).toBe('true')
    expect(layers[0]!.attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('img[alt="Portefeuille"]').exists()).toBe(true)
  })
})
