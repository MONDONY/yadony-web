<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { openLinkAppUrl, parseOpenLink } from '@/lib/open-link'

defineI18nRoute({ paths: { fr: '/ouvrir', en: '/open' } })

const { t, locale } = useI18n()
const route = useRoute()

const seoTitle = t('openLink.seo.title')
useSeoMeta({
  ...buildSeoMeta({
    title: seoTitle,
    description: t('openLink.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
  title: seoTitle,
  ogTitle: seoTitle,
})

// Page de repli des boutons des e-mails : rien à indexer (exclue du sitemap,
// cf. nuxt.config.ts). Quand l'app est installée, iOS et Android ouvrent le
// lien directement dans l'app et cette page ne s'affiche jamais.
useHead({ meta: [{ name: 'robots', content: 'noindex, follow' }] })

// La page est prérendue sans paramètres : on ne lit la requête qu'une fois
// montée, comme /parrainage, pour garder HTML servi et premier rendu client
// identiques.
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
const link = computed(() => (mounted.value ? parseOpenLink(route.query) : null))
</script>

<template>
  <section class="bg-sand py-14 sm:py-20">
    <UiContainer>
      <div
        class="mx-auto max-w-md rounded-card bg-surface p-6 text-center shadow-[0_1px_2px_rgb(10_20_48/0.06),0_12px_32px_-12px_rgb(10_20_48/0.18)] sm:p-8"
      >
        <h1 class="text-balance font-display text-3xl font-bold tracking-tight text-navy-deep sm:text-4xl">
          {{ t('openLink.title') }}
        </h1>
        <p class="mt-4 text-pretty text-ink-muted">
          {{ mounted && !link ? t('openLink.invalid') : t('openLink.lead') }}
        </p>

        <a
          v-if="link"
          :href="openLinkAppUrl(link)"
          class="mt-6 flex w-full items-center justify-center rounded-el bg-invite px-7 py-3.5 text-base font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-invite/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-invite"
          data-testid="open-link-app"
        >
          {{ t('openLink.openApp') }}
        </a>

        <div class="mt-8 flex justify-center">
          <StoreBadges />
        </div>

        <p v-if="link" class="mt-6 text-pretty text-sm text-ink-muted">
          {{ t('openLink.install') }}
        </p>
      </div>
    </UiContainer>
  </section>
</template>
