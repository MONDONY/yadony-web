import { describe, it, expect } from 'vitest'
import { LEGAL_CHANGES_EFFECTIVE_DATE, formatEffectiveDate, legalToc, renderLegalArticles } from '@/lib/legal'

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

