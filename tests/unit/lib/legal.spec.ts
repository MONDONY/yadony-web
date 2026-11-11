import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'
import { LEGAL_CHANGES_EFFECTIVE_DATE, formatEffectiveDate, legalToc, renderLegalArticles } from '@/lib/legal'
import { en, fr } from '../helpers/messages'

// Le rendu réel passe par rt() de vue-i18n ; ici l'identité suffit pour
// vérifier la mise en forme structurelle.
const identity = (message: unknown) => String(message)

describe('renderLegalArticles', () => {
  it('rend un article complet avec sous-titre, paragraphes et liste', () => {
    const result = renderLegalArticles(
      [
        {
          title: 'Article 1',
          blocks: [{ sub: 'Sous-titre', p: ['Premier', 'Second'], ul: ['a', 'b'] }],
        },
      ],
      identity,
    )
    expect(result).toEqual([
      {
        title: 'Article 1',
        blocks: [{ sub: 'Sous-titre', p: ['Premier', 'Second'], ul: ['a', 'b'] }],
      },
    ])
  })

  it('normalise les champs absents (sub null, listes vides)', () => {
    const result = renderLegalArticles([{ title: 'Article 2', blocks: [{ p: ['Texte'] }] }], identity)
    expect(result[0]?.blocks[0]).toEqual({ sub: null, p: ['Texte'], ul: [] })
  })

  it('tolère un article sans blocs', () => {
    const result = renderLegalArticles([{ title: 'Vide' }], identity)
    expect(result[0]?.blocks).toEqual([])
  })
})

describe('legalToc', () => {
  it('numérote les ancres dans l’ordre des titres, sans les réécrire', () => {
    expect(legalToc(['Article 1. Accès', 'Article 2. Paiement'])).toEqual([
      { id: 'section-1', label: 'Article 1. Accès' },
      { id: 'section-2', label: 'Article 2. Paiement' },
    ])
  })

  it('accepte un préfixe d’ancre propre à la page', () => {
    expect(legalToc(['Éditeur'], 'mention')).toEqual([{ id: 'mention-1', label: 'Éditeur' }])
  })

  it('renvoie un sommaire vide pour un texte sans titre', () => {
    expect(legalToc([])).toEqual([])
  })
})

describe('formatEffectiveDate', () => {
  const pending = '[DATE À COMPLÉTER]'

  it('affiche le marqueur tant que la date n’est pas fixée', () => {
    expect(formatEffectiveDate(null, 'fr', pending)).toBe(pending)
    expect(formatEffectiveDate(null, 'en', pending)).toBe(pending)
  })

  it('écrit la date en toutes lettres dans chaque langue', () => {
    expect(formatEffectiveDate('2027-01-15', 'fr', pending)).toBe('15 janvier 2027')
    expect(formatEffectiveDate('2027-01-15', 'en', pending)).toBe('15 January 2027')
  })

  it('écrit « 1er » pour le premier jour du mois en français', () => {
    expect(formatEffectiveDate('2027-02-01', 'fr', pending)).toBe('1er février 2027')
    expect(formatEffectiveDate('2027-02-01', 'en', pending)).toBe('1 February 2027')
  })

  it('refuse une date mal écrite ou impossible plutôt que d’afficher une date fausse', () => {
    expect(() => formatEffectiveDate('15/01/2027', 'fr', pending)).toThrow(/AAAA-MM-JJ/)
    expect(() => formatEffectiveDate('2027-02-30', 'fr', pending)).toThrow(/AAAA-MM-JJ/)
    expect(() => formatEffectiveDate('2027-13-01', 'en', pending)).toThrow(/AAAA-MM-JJ/)
  })

  it('la date d’entrée en vigueur du dépôt est vide ou valide', () => {
    expect(() => formatEffectiveDate(LEGAL_CHANGES_EFFECTIVE_DATE, 'fr', pending)).not.toThrow()
  })
})

// Le rendu réel des pages passe la date par le paramètre nommé `effectiveDate`
// de rt() : on vérifie le mécanisme avec vue-i18n et les vrais fichiers.
describe('date d’entrée en vigueur dans les textes légaux', () => {
  const documents = ['legal.cgu.articles'] as const

  function strings(value: unknown): string[] {
    if (typeof value === 'string') return [value]
    if (Array.isArray(value)) return value.flatMap(strings)
    if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
    return []
  }

  function at(messages: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown>)?.[key], messages)
  }

  it.each(documents)('%s cite la date au même nombre d’endroits en français et en anglais', (path) => {
    const count = (messages: unknown) => strings(at(messages, path)).join('\n').split('{effectiveDate}').length - 1
    expect(count(fr)).toBeGreaterThan(0)
    expect(count(en)).toBe(count(fr))
  })

  it.each([
    ['fr', '[DATE D\'ENTRÉE EN VIGUEUR À COMPLÉTER'],
    ['en', '[EFFECTIVE DATE TO BE COMPLETED'],
  ] as const)('en %s, la date passe par rt() et le marqueur s’affiche tant qu’elle manque', (locale, marker) => {
    const i18n = createI18n({ legacy: false, locale, messages: { fr, en } })
    const { t, tm, rt } = i18n.global
    const effectiveDate = formatEffectiveDate(null, locale, t('legal.effectiveDatePending'))
    expect(effectiveDate.startsWith(marker)).toBe(true)
    for (const path of documents) {
      const rendered = renderLegalArticles(tm(path) as unknown[], message => rt(message as never, { effectiveDate }))
      const text = strings(rendered).join('\n')
      expect(text).toContain(effectiveDate)
      expect(text).not.toContain('{effectiveDate}')
    }
  })
})
