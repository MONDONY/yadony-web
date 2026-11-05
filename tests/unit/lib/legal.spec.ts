import { describe, it, expect } from 'vitest'
import { legalToc, renderLegalArticles } from '@/lib/legal'

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
