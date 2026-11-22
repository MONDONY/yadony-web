import { describe, it, expect } from 'vitest'
import { en, fr } from '../helpers/messages'

type Block = { sub?: string; p?: string[]; ul?: string[] }
type Article = { title: string; blocks: Block[] }

/** Article 7 « Paiement » (index 6), qui porte la clause des frais d'annulation de l'expéditeur. */
function payment(messages: unknown): Article {
  const legal = (messages as { legal: { cgu: { articles: Article[] } } }).legal
  return legal.cgu.articles[6]!
}

function allText(article: Article): string {
  return article.blocks.flatMap((b) => [b.sub ?? '', ...(b.p ?? []), ...(b.ul ?? [])]).join('\n')
}

const locales: Array<[string, unknown, string, string[]]> = [
  [
    'fr',
    fr,
    "Frais d'annulation à la charge de l'expéditeur",
    ['aucun frais', '10 %', '20 %', '30 %'],
  ],
  [
    'en',
    en,
    'Cancellation fee charged to the sender',
    ['no fee', '10%', '20%', '30%'],
  ],
]

describe('CGU, article 7 : frais d\'annulation de l\'expéditeur', () => {
  it.each(locales)('%s : la clause existe avec le barème 0 / 10 / 20 / 30 % et le plafond de 30 €', (_l, messages, sub, tiers) => {
    const block = payment(messages).blocks.find((b) => b.sub === sub)
    expect(block, `sous-titre « ${sub} » absent`).toBeDefined()
    const tiersText = (block!.ul ?? []).join('\n')
    for (const t of tiers) expect(tiersText).toContain(t)
    expect(block!.ul).toHaveLength(4)
    expect(allText(payment(messages))).toMatch(/30\s?€|€30/)
  })

  it.each(locales)('%s : la clause nomme les trois cas et les exemptions, sans frais pour le voyageur', (l, messages) => {
    const text = allText(payment(messages))
    if (l === 'fr') {
      expect(text).toContain('Le voyageur ne paie jamais de frais d\'annulation')
      expect(text).toContain('paiement en espèces')
      expect(text).toContain('trajet reporté par le voyageur')
      expect(text).toContain('article 18')
    } else {
      expect(text).toContain('The traveller never pays a cancellation fee')
      expect(text).toContain('cash payment')
      expect(text).toContain('trip rescheduled by the traveller')
      expect(text).toContain('article 18')
    }
  })

  it.each(locales)('%s : plus aucune promesse de remboursement intégral sans réserve', (l, messages) => {
    const text = allText(payment(messages))
    if (l === 'fr') {
      expect(text).not.toContain("Si l'expéditeur annule avant la remise, il est remboursé intégralement.")
      expect(text).toContain("sous réserve des frais d'annulation à la charge de l'expéditeur")
    } else {
      expect(text).not.toContain('If the sender cancels before handover, they are refunded in full.')
      expect(text).toContain('subject to the cancellation fee charged to the sender')
    }
  })

  /**
   * Garde-fou de publication : tant que la date d'entrée en vigueur n'est pas écrite, ce test est rouge et
   * la PR ne peut pas être fusionnée. Les CGU sont en ligne environ une minute après la fusion, et l'article 18
   * impose d'informer les utilisateurs au moins 30 jours avant toute modification.
   */
  it.each(locales)('%s : la date d\'entrée en vigueur est renseignée', (_l, messages) => {
    const text = allText(payment(messages))
    expect(text).not.toMatch(/À FIXER|TO BE SET/)
  })
})
