import { describe, it, expect } from 'vitest'
import fr from '../../../i18n/locales/fr.json'
import en from '../../../i18n/locales/en.json'

/**
 * Aplatit une arborescence de traduction en couples [chemin, valeur].
 *
 * Les tableaux sont parcourus comme les objets, avec leur index dans le chemin
 * (`home.faq.items[3].question`). Sans cela, `home.faq.items`,
 * `howItWorks.*.steps` et `about.paragraphs` seraient traités comme des
 * feuilles opaques : un `en.json` amputé d'une question de la FAQ passerait au
 * vert, ce qui est exactement le scénario que ce test doit interdire avant la
 * traduction anglaise de la tâche 12.
 */
function flattenEntries(value: unknown, path = ''): Array<[string, unknown]> {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenEntries(item, `${path}[${index}]`))
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      flattenEntries(child, path ? `${path}.${key}` : key),
    )
  }
  return [[path, value]]
}

function flatten(value: unknown): string[] {
  return flattenEntries(value).map(([path]) => path)
}

const locales: Array<[string, unknown]> = [
  ['fr', fr],
  ['en', en],
]

describe('fichiers de locale', () => {
  it('fr et en exposent exactement les mêmes clés', () => {
    const frKeys = flatten(fr).sort()
    const enKeys = flatten(en).sort()
    expect(enKeys).toEqual(frKeys)
  })

  it.each(locales)('%s ne contient aucune valeur vide', (_name, messages) => {
    const empties = flattenEntries(messages)
      .filter(([, value]) => typeof value !== 'string' || value.trim() === '')
      .map(([path]) => path)
    expect(empties).toEqual([])
  })

  it('conserve les collections dont la taille est imposée par la spec', () => {
    for (const [, messages] of locales) {
      const paths = flatten(messages)
      expect(paths.filter(p => p.startsWith('home.faq.items[')).length).toBe(8 * 3)
      expect(paths.filter(p => p.startsWith('howItWorks.expediteur.steps[')).length).toBe(5 * 2)
      expect(paths.filter(p => p.startsWith('howItWorks.voyageur.steps[')).length).toBe(5 * 2)
    }
  })
})
