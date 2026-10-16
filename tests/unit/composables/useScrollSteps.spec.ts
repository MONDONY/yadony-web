import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useScrollSteps } from '@/composables/useScrollSteps'
import { FakeIntersectionObserver, installObservers } from '../helpers/observers'

function host(count: number) {
  let active!: ReturnType<typeof useScrollSteps>['active']
  const Host = defineComponent({
    setup() {
      const steps = ref<HTMLElement[]>([])
      active = useScrollSteps(steps).active
      return () => h('ol', Array.from({ length: count }, (_, i) => h('li', { ref: (el: unknown) => { if (el) steps.value[i] = el as HTMLElement } })))
    },
  })
  const wrapper = mount(Host)
  return { wrapper, active: () => active.value }
}

afterEach(() => vi.unstubAllGlobals())

describe('useScrollSteps', () => {
  it('commence sur la première étape (rendu sans JS identique)', async () => {
    installObservers()
    const { active } = host(3)
    await nextTick()
    expect(active()).toBe(0)
  })

  it('active l’étape qui traverse le milieu de l’écran', async () => {
    installObservers()
    const { wrapper, active } = host(3)
    await nextTick()
    const items = wrapper.findAll('li').map(item => item.element)
    const observer = FakeIntersectionObserver.last()
    expect(observer.options.rootMargin).toBe('-45% 0px -45% 0px')
    observer.trigger(items[2]!, true)
    expect(active()).toBe(2)
    observer.trigger(items[1]!, true)
    expect(active()).toBe(1)
  })

  it('ignore les sorties d’étapes', async () => {
    installObservers()
    const { wrapper, active } = host(3)
    await nextTick()
    const items = wrapper.findAll('li').map(item => item.element)
    const observer = FakeIntersectionObserver.last()
    observer.trigger(items[1]!, true)
    observer.trigger(items[1]!, false)
    expect(active()).toBe(1)
  })

  it('ne fait rien sans IntersectionObserver', async () => {
    installObservers()
    vi.stubGlobal('IntersectionObserver', undefined)
    const { active } = host(2)
    await nextTick()
    expect(active()).toBe(0)
  })
})
