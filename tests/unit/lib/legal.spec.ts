import { describe, it, expect } from 'vitest'
import { renderLegalArticles } from '@/lib/legal'

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
