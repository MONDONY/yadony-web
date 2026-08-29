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

/**
 * Chemins des endonymes, exemptés du contrôle « plus aucun français dans
 * `en.json` ».
 *
 * Un nom de langue s'écrit dans sa propre langue : « Français » reste
 * « Français » dans la version anglaise, cédille comprise, et « English »
 * reste « English » dans la version française. C'est la convention attendue
 * par les lecteurs d'écran et par les utilisateurs, et elle a été tranchée à
 * la relecture de la tâche 6.
 *
 * L'exemption porte sur le chemin de la clé, jamais sur la valeur : une phrase
 * française oubliée ailleurs dans le fichier reste détectée, et personne ne
 * peut faire passer un texte non traduit en le faisant ressembler à un
 * endonyme.
 */
const endonymPaths = new Set(['language.fr', 'language.en'])

/**
 * Chemins des identifiants techniques, eux aussi exemptés du contrôle.
 *
 * Les `id` de la FAQ ne sont pas du texte : ils ne sont jamais affichés et
 * n'apparaissent pas dans le HTML généré. `HomeFaq.vue` les transmet à
 * `UiAccordion`, qui les utilise comme `:key` du `v-for`. Ils restent donc
 * identiques dans les deux langues, pour qu'une question précise puisse être
 * désignée indépendamment de la locale — ancre partageable si le composant en
 * expose une un jour, événement d'analytique, test de bout en bout qui vérifie
 * la même entrée en français et en anglais. Les traduire ferait diverger les
 * deux fichiers sans bénéfice pour personne.
 *
 * L'exemption ne crée pas d'angle mort : le test « conserve les identifiants
 * de FAQ identiques entre les deux langues » les épingle un par un sur
 * `fr.json`, donc aucun texte ne peut se cacher derrière ces chemins.
 */
const identifierPaths = new Set(
  Array.from({ length: 8 }, (_, index) => `home.faq.items[${index}].id`),
)

/** Chemins dont la valeur est volontairement identique dans les deux fichiers. */
const untranslatedPaths = new Set([...endonymPaths, ...identifierPaths])

/**
 * Marqueurs de texte resté en français : mots-outils qui n'existent pas en
 * anglais (bornés sur les limites de mot pour ne pas se déclencher au milieu
 * d'un mot anglais) et lettres accentuées, absentes de la copie anglaise.
 */
const frenchMarkers: RegExp[] = [
  /\b(le|la|les|un|une|des|du|au|aux|vous|votre|nous|notre|dans|avec|pour|est|sont|qui|que|ce|cette|ne|pas)\b/i,
  /[àâäçéèêëîïôöùûü]/i,
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

  it('écrit chaque nom de langue dans sa propre langue', () => {
    for (const [, messages] of locales) {
      const values = new Map(flattenEntries(messages))
      expect(values.get('language.fr')).toBe('Français')
      expect(values.get('language.en')).toBe('English')
    }
  })

  it('conserve les identifiants de FAQ identiques entre les deux langues', () => {
    const frValues = new Map(flattenEntries(fr))
    const enValues = new Map(flattenEntries(en))
    for (const path of identifierPaths) {
      expect(enValues.get(path)).toBe(frValues.get(path))
    }
  })

  it('en.json ne contient plus de texte resté en français', () => {
    const untranslated = flattenEntries(en)
      .filter(([path]) => !untranslatedPaths.has(path))
      .filter(([, value]) => typeof value === 'string' && frenchMarkers.some(marker => marker.test(value)))
      .map(([path, value]) => `${path} → ${String(value)}`)
    expect(untranslated).toEqual([])
  })
})
