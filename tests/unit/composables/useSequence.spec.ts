import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useSequence } from '@/composables/useSequence'
import { installObservers } from '../helpers/observers'

beforeEach(() => vi.useFakeTimers())
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function sequenceHost(initial: boolean, length = 4) {
  const active = ref(initial)
  let state!: ReturnType<typeof useSequence>
  const wrapper = mount(defineComponent({
    setup() {
      state = useSequence(active, length, 500)
      return () => h('div')
    },
  }))
  return { active, wrapper, index: () => state.index.value }
}

describe('useSequence', () => {
  it('déroule les états un à un quand la scène devient active, puis s’arrête au dernier', async () => {
    installObservers()
    const { active, index } = sequenceHost(false)
    await nextTick()
    expect(index()).toBe(0)
    active.value = true
    await nextTick()
    expect(index()).toBe(0)
    vi.advanceTimersByTime(500)
    expect(index()).toBe(1)
    vi.advanceTimersByTime(5000)
    expect(index()).toBe(3)
  })

  it('revient au début quand la scène n’est plus active', async () => {
    installObservers()
    const { active, index } = sequenceHost(true)
    await nextTick()
    vi.advanceTimersByTime(1000)
    active.value = false
    await nextTick()
    expect(index()).toBe(0)
  })

  it('montre directement l’état final en mouvement réduit', async () => {
    installObservers({ reducedMotion: true })
    const { index } = sequenceHost(true)
    await nextTick()
    expect(index()).toBe(3)
  })

  it('s’arrête au démontage', async () => {
    installObservers()
    const { wrapper, index } = sequenceHost(true)
    await nextTick()
    wrapper.unmount()
    vi.advanceTimersByTime(5000)
    expect(index()).toBe(0)
  })
})
