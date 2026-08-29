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
  nitro: {
    prerender: { crawlLinks: true, routes: ['/'], failOnError: true },
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
