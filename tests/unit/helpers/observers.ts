import { vi } from 'vitest'

// IntersectionObserver piloté à la main : chaque test déclenche lui-même
// les entrées d'intersection, sans dépendre d'un vrai moteur de mise en page.
export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []
  readonly observed = new Set<Element>()
  disconnected = false

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options: IntersectionObserverInit = {},
  ) {
    FakeIntersectionObserver.instances.push(this)
  }

  observe(element: Element) { this.observed.add(element) }
  unobserve(element: Element) { this.observed.delete(element) }
  disconnect() { this.disconnected = true; this.observed.clear() }
  takeRecords() { return [] }

  trigger(target: Element, isIntersecting: boolean) {
    const entry = { target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 } as IntersectionObserverEntry
    this.callback([entry], this as unknown as IntersectionObserver)
  }

  static last(): FakeIntersectionObserver {
    const instance = FakeIntersectionObserver.instances.at(-1)
    if (!instance) throw new Error('Aucun IntersectionObserver créé')
    return instance
  }
}

export function installObservers({ reducedMotion = false } = {}) {
  FakeIntersectionObserver.instances = []
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reducedMotion && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }))
}
