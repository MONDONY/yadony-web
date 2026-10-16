import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useInView } from '@/composables/useInView'
import { FakeIntersectionObserver, installObservers } from '../helpers/observers'

function host(options?: Parameters<typeof useInView>[1]) {
  let state!: ReturnType<typeof useInView>
  const Host = defineComponent({
    setup() {
      const el = ref<HTMLElement | null>(null)
      state = useInView(el, options)
      return () => h('div', { ref: el })
    },
  })
  const wrapper = mount(Host)
  return { wrapper, state: () => state }
}

afterEach(() => vi.unstubAllGlobals())

describe('useInView', () => {
  it('devient vrai quand l’élément entre à l’écran', async () => {
    installObservers()
    const { wrapper, state } = host()
    await nextTick()
    expect(state().inView.value).toBe(false)
    FakeIntersectionObserver.last().trigger(wrapper.element, true)
    expect(state().inView.value).toBe(true)
  })

  it('reste vrai après la sortie avec `once`, et cesse d’observer', async () => {
    installObservers()
    const { wrapper, state } = host({ once: true })
    await nextTick()
    const observer = FakeIntersectionObserver.last()
    observer.trigger(wrapper.element, true)
    observer.trigger(wrapper.element, false)
    expect(state().inView.value).toBe(true)
    expect(observer.disconnected).toBe(true)
  })

  it('suit l’entrée et la sortie sans `once`', async () => {
    installObservers()
    const { wrapper, state } = host()
    await nextTick()
    const observer = FakeIntersectionObserver.last()
    observer.trigger(wrapper.element, true)
    observer.trigger(wrapper.element, false)
    expect(state().inView.value).toBe(false)
  })

  it('est vrai d’office quand le visiteur demande moins d’animations', async () => {
    installObservers({ reducedMotion: true })
    const { state } = host()
    await nextTick()
    expect(state().reducedMotion.value).toBe(true)
    expect(state().inView.value).toBe(true)
    expect(FakeIntersectionObserver.instances).toHaveLength(0)
  })

  it('est vrai d’office sans IntersectionObserver (vieux navigateur)', async () => {
    installObservers()
    vi.stubGlobal('IntersectionObserver', undefined)
    const { state } = host()
    await nextTick()
    expect(state().inView.value).toBe(true)
  })

  it('se déconnecte au démontage', async () => {
    installObservers()
    const { wrapper } = host()
    await nextTick()
    const observer = FakeIntersectionObserver.last()
    wrapper.unmount()
    expect(observer.disconnected).toBe(true)
  })
})
