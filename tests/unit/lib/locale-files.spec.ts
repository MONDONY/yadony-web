import { describe, it, expect } from 'vitest'
import fr from '../../../i18n/locales/fr.json'
import en from '../../../i18n/locales/en.json'

function flatten(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? flatten(value as Record<string, unknown>, path)
      : [path]
  })
}

describe('fichiers de locale', () => {
  it('fr et en exposent exactement les mêmes clés', () => {
    const frKeys = flatten(fr).sort()
    const enKeys = flatten(en).sort()
    expect(enKeys).toEqual(frKeys)
  })

  it('ne contient aucune valeur vide', () => {
    const empties = Object.entries(fr).filter(([, v]) => v === '')
    expect(empties).toEqual([])
  })
})
