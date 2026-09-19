// Cloudflare Web Analytics : mesure d'audience sans cookie (exemptée de
// consentement par la CNIL). La balise n'est émise que si le token est fourni
// au moment du build : CF_BEACON_TOKEN=xxx pnpm generate.
// Alternative sans code : activer Web Analytics dans le dashboard Cloudflare
// Pages (injection automatique de la même balise à l'edge).
const cfBeaconToken = process.env.CF_BEACON_TOKEN

export default defineNuxtConfig({
  compatibilityDate: '2026-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxtjs/tailwindcss', '@nuxtjs/i18n', '@nuxtjs/sitemap'],
  components: [{ path: '~/components', pathPrefix: false }],
  typescript: { strict: true, typeCheck: false },
  i18n: {
    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
    langDir: 'locales',
    baseUrl: 'https://yadony.com',
    locales: [
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
      { code: 'en', language: 'en-GB', name: 'English', file: 'en.json' },
    ],
    customRoutes: 'page',
    detectBrowserLanguage: false,
    vueI18n: './i18n.config.ts',
  },
  ssr: true,
  site: { url: 'https://yadony.com', name: 'yadony' },
  sitemap: {
    autoLastmod: false,
    exclude: ['/404'],
    // Le module @nuxtjs/sitemap scinde automatiquement le sitemap en un
    // sitemap-index avec un fichier par langue dès qu'il détecte @nuxtjs/i18n
    // avec plusieurs locales. On force un seul fichier `sitemap.xml` listant
    // les 18 URLs (9 pages x 2 langues) avec leurs alternates hreflang.
    sitemaps: false,
  },
  css: ['~/assets/css/main.css'],
  vite: {
    vue: {
      template: {
        // Les images référencées par un `src` absolu (ex. `/screenshots/...`)
        // vivent dans `public/` et sont servies telles quelles : elles ne
        // doivent jamais être résolues comme un import de module au build.
        // Par défaut, @vitejs/plugin-vue transforme aussi les chemins
        // absolus (includeAbsolute: true en mode build), donc une capture
        // pas encore fournie par le client ferait échouer `pnpm generate`
        // avec une erreur d'import non résolu.
        transformAssetUrls: { includeAbsolute: false },
      },
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      // /parrainage n'est lié depuis aucune page : cible du lien de
      // parrainage partagé par l'app (via /r/{code}, cf. public/_redirects),
      // elle doit être listée ici pour être générée.
      routes: ['/', '/parrainage', '/en/referral'],
      failOnError: true,
    },
  },
  app: {
    head: {
      script: cfBeaconToken
        ? [
            {
              src: 'https://static.cloudflareinsights.com/beacon.min.js',
              defer: true,
              'data-cf-beacon': JSON.stringify({ token: cfBeaconToken }),
            },
          ]
        : [],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        // Icône officielle Yadony (images/ICON.png à la racine du monorepo) :
        // 192 px pour les résultats de recherche Google (multiple de 48 exigé),
        // 32 px pour l'onglet, apple-touch-icon pour iOS.
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/favicon-512.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/hanken-grotesk-latin-wght-normal.woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/plus-jakarta-sans-latin-wght-normal.woff2',
          crossorigin: 'anonymous',
        },
      ],
    },
  },
})
