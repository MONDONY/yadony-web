import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { test, expect } from './fixtures'

// Garde-fou de l'indexation Google. Cloudflare Pages sert un dossier
// `tarifs/index.html` en redirigeant `/tarifs` vers `/tarifs/` (308), alors
// que le sitemap et la canonical publient `/tarifs` : Google ne trouvait
// aucune adresse stable et laissait 30 pages sur 42 hors de l'index. Chaque
// URL du sitemap doit donc exister en fichier `.html` (servi en 200 sans
// redirection) et porter une canonical égale à elle-même.
const OUTPUT = join(process.cwd(), '.output/public')

async function sitemapUrls(request: import('@playwright/test').APIRequestContext): Promise<string[]> {
  const xml = await (await request.get('/sitemap.xml')).text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]!)
}

test('chaque URL du sitemap est un fichier .html, jamais un dossier index', async ({ request }) => {
  const urls = await sitemapUrls(request)
  expect(urls.length).toBeGreaterThan(0)
  for (const url of urls) {
    const path = new URL(url).pathname
    if (path === '/') continue
    expect(existsSync(join(OUTPUT, `${path}.html`)), `${path}.html`).toBe(true)
    expect(existsSync(join(OUTPUT, path, 'index.html')), `${path}/index.html`).toBe(false)
  }
})

test('chaque URL du sitemap répond en 200 avec une canonical égale à elle-même', async ({ request }) => {
  for (const url of await sitemapUrls(request)) {
    const path = new URL(url).pathname
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status(), path).toBe(200)
    const canonical = (await response.text()).match(/rel="canonical" href="([^"]+)"/)?.[1]
    expect(canonical?.replace(/\/$/, ''), path).toBe(url.replace(/\/$/, ''))
  }
})
