import { describe, expect, it } from 'vitest'
import { PROD_API_BASE, STAGING_API_BASE, resolveApiBase } from '@/lib/api-base'

describe('resolveApiBase', () => {
  it('vise la production pour un build local', () => {
    expect(resolveApiBase({})).toBe(PROD_API_BASE)
  })

  it('vise la production pour la branche main de Cloudflare Pages', () => {
    expect(resolveApiBase({ CF_PAGES_BRANCH: 'main' })).toBe(PROD_API_BASE)
  })

  it('vise staging pour un aperçu de branche', () => {
    expect(resolveApiBase({ CF_PAGES_BRANCH: 'feature/web-recherche' })).toBe(STAGING_API_BASE)
  })

  it('laisse NUXT_PUBLIC_API_BASE l’emporter, même sur un aperçu', () => {
    expect(resolveApiBase({ NUXT_PUBLIC_API_BASE: 'https://api.test/api/v1', CF_PAGES_BRANCH: 'feature/x' }))
      .toBe('https://api.test/api/v1')
  })

  it('ignore un NUXT_PUBLIC_API_BASE vide', () => {
    expect(resolveApiBase({ NUXT_PUBLIC_API_BASE: '', CF_PAGES_BRANCH: 'main' })).toBe(PROD_API_BASE)
  })
})
