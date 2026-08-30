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
 * vert, ce qui est exactement le scénario que ce test doit interdire.
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
 * Endonymes : un nom de langue s'écrit dans sa propre langue. « Français »
 * reste « Français » dans la version anglaise, cédille comprise, et « English »
 * reste « English » dans la version française. C'est la convention attendue par
 * les lecteurs d'écran et par les utilisateurs, tranchée à la relecture de la
 * tâche 6.
 */
const endonymPaths = ['language.fr', 'language.en']

/**
 * Identifiants techniques : les `id` de la FAQ ne sont pas du texte. Ils ne
 * sont jamais affichés et n'apparaissent pas dans le HTML généré ;
 * `HomeFaq.vue` les transmet à `UiAccordion`, qui les utilise comme `:key` du
 * `v-for`. Ils restent identiques dans les deux langues pour qu'une question
 * précise puisse être désignée indépendamment de la locale — ancre partageable
 * si le composant en expose une un jour, événement d'analytique, test de bout
 * en bout couvrant la même entrée en français et en anglais.
 */
const identifierPaths = Array.from({ length: 8 }, (_, index) => `home.faq.items[${index}].id`)

/**
 * Valeurs qui s'écrivent pareil dans les deux langues : deux mots communs au
 * français et à l'anglais, et le nom de la marque affiché dans la colonne
 * « Canal » du tableau comparatif.
 */
const sameWordPaths = ['nav.contact', 'nav.menu', 'home.problem.rows.yadony.channel']

/**
 * Noms propres invariants : les corridors sont des paires de villes
 * (« Paris → Dakar ») qui s'écrivent pareil dans les deux langues, la marque
 * « Yadony » / « Yadony Pro » ne se traduit pas, et l'adresse « Paris,
 * France » non plus.
 */
const properNounPaths = [
  'home.corridors.routes.dakar.route',
  'home.corridors.routes.abidjan.route',
  'home.corridors.routes.bamako.route',
  'home.corridors.routes.douala.route',
  'footer.company.name',
  'footer.company.line2',
  'footer.proTitle',
  // Un numéral seul s'écrit pareil dans les deux langues.
  'home.hero.stats.scans.figure',
  // L'adresse du siège social ne se traduit pas.
  'footer.company.line1',
  // « Commission » s'écrit pareil dans les deux langues (sous-titre de
  // l'article 7 des CGU).
  'legal.cgu.articles[6].blocks[3].sub',
]

/**
 * Tous les chemins dont la valeur est légitimement identique dans les deux
 * fichiers. Cette liste n'est pas devinée : elle a été établie en lançant la
 * comparaison ci-dessous sur les 244 feuilles, puis en justifiant chaque
 * entrée. Ajouter un chemin ici doit rester un acte délibéré et argumenté.
 */
const sharedValuePaths = new Set([
  ...endonymPaths,
  ...identifierPaths,
  ...sameWordPaths,
  ...properNounPaths,
])

/**
 * Chemins exemptés du second filet à base de marqueurs, en plus des chemins
 * partagés ci-dessus.
 *
 * La politique de confidentialité anglaise nomme la CNIL par son nom complet,
 * « Commission nationale de l'informatique et des libertés (CNIL) ». C'est un
 * nom propre : il ne se traduit pas et n'a pas de version anglaise officielle.
 * Il porte donc un accent et le mot « des », qui déclencheraient les marqueurs.
 * C'est bien le test qui s'adapte au contenu juridique, jamais l'inverse.
 */
const markerExemptPaths = new Set([
  ...sharedValuePaths,
  'legal.confidentialite.sections.rights.text',
  // « Côte d'Ivoire » est un nom propre : il garde son accent circonflexe
  // dans la version anglaise (l'exonyme « Ivory Coast » n'est pas la forme
  // officielle du pays).
  'home.corridors.routes.abidjan.text',
  // Textes légaux anglais citant des noms propres accentués qui ne se
  // traduisent pas : « Côte d'Ivoire » et « RCS Créteil » (registre du
  // commerce du siège social).
  'legal.mentionsLegales.sections.editor.text',
  'legal.cgu.articles[13].blocks[1].p[0]',
  'legal.cgu.articles[20].blocks[0].ul[4]',
  'legal.confidentialite.articles[7].blocks[3].p[0]',
  'legal.confidentialite.articles[10].blocks[1].p[1]',
])

/**
 * Marqueurs de français résiduel. Filet **secondaire** : il attrape une chaîne
 * partiellement retraduite, cas que la comparaison avec `fr.json` laisse passer
 * puisque la valeur y diffère déjà de sa source. La garantie de complétude,
 * elle, est portée par le test « traduit chaque valeur de en.json ».
 *
 * La liste de mots-outils est une heuristique et le reste : elle ne détecte pas
 * toutes les phrases françaises possibles. Trois mots français en ont été
 * retirés parce qu'ils existent aussi en anglais et produiraient des faux
 * positifs : `plus`, `pour` (verbe) et `aux` (« aux input »).
 */
const frenchMarkers: RegExp[] = [
  /\b(le|la|les|un|une|des|du|au|vous|votre|nous|notre|dans|avec|est|sont|qui|que|ce|cette|ne|pas)\b/i,
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

  /**
   * Garantie principale de complétude de la traduction.
   *
   * Une chaîne non traduite est exactement une chaîne restée identique à sa
   * source : la comparaison chemin par chemin avec `fr.json` est donc
   * déterministe et exhaustive, là où une recherche de marqueurs français ne
   * pouvait être qu'une heuristique — elle laissait passer des phrases entières
   * sans accent ni mot-outil, comme « Quatre scans entre Paris et Dakar ».
   */
  it('traduit chaque valeur de en.json', () => {
    const frValues = new Map(flattenEntries(fr))
    const untranslated = flattenEntries(en)
      .filter(([path]) => !sharedValuePaths.has(path))
      .filter(([path, value]) => value === frValues.get(path))
      .map(([path, value]) => `${path} → ${String(value)}`)
    expect(untranslated).toEqual([])
  })

  it('ne laisse pas de français résiduel dans une valeur de en.json', () => {
    const suspicious = flattenEntries(en)
      .filter(([path]) => !markerExemptPaths.has(path))
      .filter(([, value]) => typeof value === 'string' && frenchMarkers.some(marker => marker.test(value)))
      .map(([path, value]) => `${path} → ${String(value)}`)
    expect(suspicious).toEqual([])
  })
})
