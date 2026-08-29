import { describe, it, expect } from 'vitest'
import { resolveRole } from '@/lib/roles'

describe('resolveRole', () => {
  it('reconnaît voyageur', () => {
    expect(resolveRole('voyageur')).toBe('voyageur')
  })

  it('reconnaît expediteur', () => {
    expect(resolveRole('expediteur')).toBe('expediteur')
  })

  it('ignore la casse', () => {
    expect(resolveRole('Voyageur')).toBe('voyageur')
  })

  it('retombe sur expediteur pour une valeur inconnue', () => {
    expect(resolveRole('pilote')).toBe('expediteur')
  })

  it('retombe sur expediteur pour undefined, null ou un tableau', () => {
    expect(resolveRole(undefined)).toBe('expediteur')
    expect(resolveRole(null)).toBe('expediteur')
    expect(resolveRole(['voyageur'])).toBe('expediteur')
  })
})
