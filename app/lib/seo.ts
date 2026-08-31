import { siteName } from './site'
import { absoluteUrl, type Locale } from './locale'

export interface SeoInput {
  title: string
  description: string
  path: string
  locale: Locale
  image?: string
}

export interface SeoMeta {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogUrl: string
  ogType: 'website'
  ogLocale: string
  twitterCard: 'summary_large_image'
}

const OG_LOCALES: Record<Locale, string> = { fr: 'fr_FR', en: 'en_GB' }

export function buildSeoMeta(input: SeoInput): SeoMeta {
  const title = input.title === siteName ? siteName : `${input.title} — ${siteName}`
  const image = absoluteUrl(input.image ?? '/og/default.png')

  return {
    title,
    description: input.description,
    ogTitle: title,
    ogDescription: input.description,
    ogImage: image,
    ogUrl: absoluteUrl(input.path),
    ogType: 'website',
    ogLocale: OG_LOCALES[input.locale],
    twitterCard: 'summary_large_image',
  }
}
