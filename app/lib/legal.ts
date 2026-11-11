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

export interface LegalTocEntry {
  id: string
  label: string
}

// Sommaire d'une page légale : les libellés sont les vrais titres de section
// du texte (jamais réécrits), les ancres sont numérotées dans l'ordre. Le même
// index sert à poser l'`id` sur le titre correspondant dans la page.
export function legalToc(titles: string[], prefix = 'section'): LegalTocEntry[] {
  return titles.map((label, index) => ({ id: `${prefix}-${index + 1}`, label }))
}

// Date d'entrée en vigueur des modifications annoncées des CGU (article 8 :
// badge GP Pro ; article 12ter : informations fiscales DAC7) et de la
// politique de confidentialité (obligation fiscale DAC7). L'article 18 des CGU
// impose de prévenir les utilisateurs au moins 30 jours avant cette date.
//
// À COMPLÉTER par le propriétaire, une seule fois pour les deux langues, au
// format AAAA-MM-JJ (par exemple '2027-01-15'). Tant qu'elle vaut null, les
// textes affichent le marqueur `legal.effectiveDatePending`. Après l'avoir
// remplie, mettre à jour les références e2e (tests/e2e/__fixtures__/legal/).
export const LEGAL_CHANGES_EFFECTIVE_DATE: string | null = null

// Date en toutes lettres (« 15 janvier 2027 », « 15 January 2027 »), ou le
// marqueur tant que la date n'est pas fixée. Une date mal écrite ou impossible
// fait échouer le rendu : mieux vaut un build cassé qu'une date fausse en ligne.
export function formatEffectiveDate(isoDate: string | null, locale: string, pending: string): string {
  if (isoDate === null) return pending
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  const date = match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) : null
  if (!match || !date || date.toISOString().slice(0, 10) !== isoDate) {
    throw new Error(`Date d'entrée en vigueur invalide « ${isoDate} » : format attendu AAAA-MM-JJ`)
  }
  const options = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' } as const
  if (locale === 'fr') {
    const day = date.getUTCDate()
    const rest = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
    return `${day === 1 ? '1er' : day} ${rest}`
  }
  return new Intl.DateTimeFormat('en-GB', options).format(date)
}
