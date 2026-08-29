import { siteUrl } from './site'

export type Locale = 'fr' | 'en'

export const locales: Locale[] = ['fr', 'en']
export const defaultLocale: Locale = 'fr'

export function absoluteUrl(path: string): string {
  const withoutQuery = path.replace(/\?.*$/, '')
  const trimmed = withoutQuery.replace(/\/+$/, '')
  return `${siteUrl}${trimmed === '' ? '/' : trimmed}`
}
