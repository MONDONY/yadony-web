import { siteName, siteUrl } from './site'
import { absoluteUrl } from './locale'

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/logos/logo-yadony.png`,
  }
}

export function mobileAppJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: siteName,
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Android, iOS',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

export interface BreadcrumbItem {
  name: string
  path: string
}

// Fil d'Ariane (« Accueil › Envoyer un colis › Paris → Dakar ») : Google
// l'affiche à la place de l'URL brute dans ses résultats.
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
