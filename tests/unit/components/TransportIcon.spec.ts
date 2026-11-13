import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TransportIcon from '@/components/ui/TransportIcon.vue'

function icon(mode?: string) {
  return mount(TransportIcon, { props: mode === undefined ? {} : { mode } })
}

describe('TransportIcon', () => {
  it.each([
    ['PLANE', 'plane'],
    ['BOAT', 'ship'],
    ['CAR', 'car'],
    ['BUS', 'car'],
    ['TRAIN', 'route'],
    ['OTHER', 'route'],
    ['ROCKET', 'route'],
  ])('%s : icône %s', (mode, name) => {
    const w = icon(mode)
    expect(w.attributes('data-icon')).toBe(name)
    expect(w.attributes('aria-hidden')).toBe('true')
    expect(w.attributes('stroke')).toBe('currentColor')
    expect(w.findAll('path, circle').length).toBeGreaterThan(0)
  })

  it('mode absent : icône neutre, jamais l’avion', () => {
    expect(icon().attributes('data-icon')).toBe('route')
  })
})
