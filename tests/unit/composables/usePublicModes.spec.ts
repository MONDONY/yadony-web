import { afterEach, describe, expect, it, vi } from 'vitest'
import { usePublicModes } from '@/composables/usePublicModes'

afterEach(() => vi.unstubAllGlobals())

describe('usePublicModes', () => {
  it('lit la configuration publique du site', () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { transportModes: 'PLANE,ROAD' } }))
    expect(usePublicModes().value).toEqual(['PLANE', 'ROAD'])
  })

  it('variable absente : avion seul', () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ public: {} }))
    expect(usePublicModes().value).toEqual(['PLANE'])
  })
})
