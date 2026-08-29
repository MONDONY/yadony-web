export default defineNuxtConfig({
  compatibilityDate: '2026-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
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
      routes: ['/'],
      failOnError: true,
      // TEMPORAIRE — routes créées par la tâche 11. Le header et le footer
      // (tâche 6) lient déjà /tarifs, /securite, /a-propos, /contact,
      // /mentions-legales, /cgu et /confidentialite, mais aucune page
      // n'existe encore pour ces chemins : le crawler les suit et échoue
      // en 404. Tant qu'elles n'existent pas, localePath() ne peut pas non
      // plus produire de chemin anglais préfixé pour elles (defineI18nRoute
      // n'a rien à mapper) : le header et le footer de la page /en émettent
      // donc le même chemin français non préfixé, ce qu'on peut vérifier
      // dans la sortie d'erreur de `pnpm generate` avant cette liste —
      // aucune variante /en/... n'y apparaît. Cette liste ne doit donc
      // contenir que ces sept chemins, sans préfixe. Elle doit être vide —
      // et donc supprimée — à la fin de la tâche 11 : si elle existe
      // encore après, c'est qu'une page liée par le header ou le footer
      // manque toujours. (/comment-ca-marche, construite par la tâche 10,
      // a déjà été retirée de cette liste.)
      ignore: [
        '/tarifs',
        '/securite',
        '/a-propos',
        '/contact',
        '/mentions-legales',
        '/cgu',
        '/confidentialite',
      ],
    },
  },
  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/hanken-grotesk-latin-wght-normal.woff2',
          crossorigin: 'anonymous',
        },
      ],
    },
  },
})
