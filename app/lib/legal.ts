// Rendu des documents légaux structurés (CGU, politique de confidentialité).
// Les textes officiels sont stockés dans les fichiers de locale sous forme
// d'articles : { title, blocks: [{ sub?, p: [], ul?: [] }] }. Cette fonction
// les convertit en structures rendues, prêtes pour le template.

export interface LegalBlock {
  sub: string | null
  p: string[]
  ul: string[]
}

export interface LegalArticle {
  title: string
  blocks: LegalBlock[]
}

type RenderMessage = (message: unknown) => string

export function renderLegalArticles(raw: unknown[], render: RenderMessage): LegalArticle[] {
  return raw.map((entry) => {
    const article = entry as { title: unknown; blocks?: unknown[] }
    return {
      title: render(article.title),
      blocks: (article.blocks ?? []).map((blockRaw) => {
        const block = blockRaw as { sub?: unknown; p?: unknown[]; ul?: unknown[] }
        return {
          sub: block.sub === undefined ? null : render(block.sub),
          p: (block.p ?? []).map(render),
          ul: (block.ul ?? []).map(render),
        }
      }),
    }
  })
}
