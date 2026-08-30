import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, type Ref } from 'vue'
import { useCookieConsent } from '../../../app/composables/useCookieConsent'
import { CONSENT_STORAGE_KEY } from '../../../app/lib/consent'

// `useState` de Nuxt n'existe pas hors de l'app : on le remplace par un
// registre de refs partagées, ce qui reproduit exactement son contrat
// (même clé → même ref).
const states = new Map<string, Ref<unknown>>()

vi.stubGlobal('useState', <T>(key: string, init: () => T): Ref<T> => {
  if (!states.has(key)) states.set(key, ref(init()) as Ref<unknown>)
  return states.get(key) as Ref<T>
})

beforeEach(() => {
  states.clear()
  window.localStorage.clear()
})

describe('useCookieConsent', () => {
  it('part sans choix et non hydraté', () => {
    const { consent, hydrated } = useCookieConsent()
    expect(consent.value).toBeNull()
    expect(hydrated.value).toBe(false)
  })

  it('hydrate depuis un choix enregistré', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted')
    const { consent, hydrated, hydrate } = useCookieConsent()
    hydrate()
    expect(consent.value).toBe('accepted')
    expect(hydrated.value).toBe(true)
  })

  it('ignore une valeur corrompue en stockage', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'peut-être')
    const { consent, hydrate } = useCookieConsent()
    hydrate()
    expect(consent.value).toBeNull()
  })

  it('enregistre le choix et le persiste', () => {
    const { consent, choose } = useCookieConsent()
    choose('refused')
    expect(consent.value).toBe('refused')
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('refused')
  })

  it('rouvre la bannière en effaçant le choix', () => {
    const { consent, choose, reopen } = useCookieConsent()
    choose('accepted')
    reopen()
    expect(consent.value).toBeNull()
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull()
  })

  it('partage le même état entre deux appels (bannière et footer)', () => {
    const banner = useCookieConsent()
    const footer = useCookieConsent()
    banner.choose('accepted')
    expect(footer.consent.value).toBe('accepted')
    footer.reopen()
    expect(banner.consent.value).toBeNull()
  })

  it('survit à un localStorage indisponible', () => {
    const throwing = {
      getItem: () => {
        throw new Error('bloqué')
      },
      setItem: () => {
        throw new Error('bloqué')
      },
      removeItem: () => {
        throw new Error('bloqué')
      },
    }
    const original = window.localStorage
    Object.defineProperty(window, 'localStorage', { value: throwing, configurable: true })
    try {
      const { consent, hydrate, choose, reopen } = useCookieConsent()
      hydrate()
      expect(consent.value).toBeNull()
      choose('accepted')
      expect(consent.value).toBe('accepted')
      reopen()
      expect(consent.value).toBeNull()
    } finally {
      Object.defineProperty(window, 'localStorage', { value: original, configurable: true })
    }
  })
})
