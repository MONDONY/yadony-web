import { describe, it, expect } from 'vitest'
import { en, fr } from '../helpers/messages'

// Page publique de suppression de compte (app/pages/suppression-compte.vue),
// exigée par Google Play : elle doit expliquer les deux voies (dans l'app et
// sans l'app) avec le vrai chemin de l'application, sinon la fiche store
// renvoie vers des instructions fausses.
type Article = { title: string, blocks: Array<{ sub?: string, p?: string[], ul?: string[] }> }

const pageOf = (messages: typeof fr | typeof en) =>
  (messages as unknown as { legal: { suppressionCompte: { title: string, intro: string, articles: Article[] } } })
    .legal.suppressionCompte

const textOf = (articles: Article[]) =>
  articles
    .flatMap(({ title, blocks }) => [title, ...blocks.flatMap(b => [b.sub ?? '', ...(b.p ?? []), ...(b.ul ?? [])])])
    .join('\n')

describe('page de suppression de compte', () => {
  it.each([
    ['fr', fr, ['« Moi »', 'Menu', '« Supprimer mon compte »', '« Pause 30 jours »', '« Supprimer définitivement »', '« Annuler la suppression »']],
    ['en', en, ['“Profile”', 'Menu', '“Delete my account”', '“30-day pause”', '“Delete permanently”', '“Cancel deletion”']],
  ] as const)('%s décrit le parcours réel de l’application', (_lang, messages, labels) => {
    const text = textOf(pageOf(messages).articles)
    for (const label of labels) expect(text).toContain(label)
    // L'ancien chemin faux passait par les paramètres.
    expect(text).not.toMatch(/Paramètres\s*→|Settings\s*→/)
  })

  it.each([['fr', fr], ['en', en]] as const)('%s permet de demander la suppression sans l’app', (_lang, messages) => {
    const text = textOf(pageOf(messages).articles)
    expect(text).toContain("dpo{'@'}yadony.com")
    expect(text).toContain('94120 Fontenay-sous-Bois')
  })

  it('garde la même structure dans les deux langues', () => {
    const shape = (articles: Article[]) => articles.map(a => a.blocks.map(b => [b.p?.length ?? 0, b.ul?.length ?? 0]))
    expect(shape(pageOf(en).articles)).toEqual(shape(pageOf(fr).articles))
    expect(pageOf(fr).articles).toHaveLength(5)
  })

  it.each([['fr', fr], ['en', en]] as const)('%s n’emploie aucun tiret cadratin', (_lang, messages) => {
    const page = pageOf(messages)
    expect(`${page.title}\n${page.intro}\n${textOf(page.articles)}`).not.toContain('—')
  })
})
