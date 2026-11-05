<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { organizationJsonLd, mobileAppJsonLd, faqJsonLd } from '@/lib/structured-data'
import { useTexts } from '@/composables/useTexts'

const { t, locale } = useI18n()
const route = useRoute()
const { items } = useTexts()

useSeoMeta(
  buildSeoMeta({
    title: t('landing.seo.title'),
    description: t('landing.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

const faqItems = items<{ question: string; answer: string }>('home.faq.items')

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(organizationJsonLd()) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(mobileAppJsonLd()) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(faqJsonLd(faqItems)) },
  ],
})
</script>

<template>
  <div>
    <!-- Haut de page hydraté tout de suite : le formulaire doit répondre dès
         l'affichage. Les prochains départs sont lus par le navigateur après
         l'hydratation (rien de voyageur dans le HTML prérendu) et la section
         disparaît tant que l'API ne répond pas bien. -->
    <HomeSearchHero />
    <HomeUpcoming />
    <!-- Sous la ligne de flottaison : HTML prérendu tout de suite (robots,
         lecteurs sans JS), JavaScript chargé et hydraté à l'approche de
         l'écran seulement, pour ne pas retarder l'affichage du haut de page. -->
    <LazyHomeHandoff hydrate-on-visible />
    <LazyHomeTraveler hydrate-on-visible />
    <LazyHomeTutorials hydrate-on-visible />
    <LazyHomeToday hydrate-on-visible />
    <LazyHomeTrust hydrate-on-visible />
    <LazyHomeFaq hydrate-on-visible />
    <!-- Hydraté tout de suite : le bouton « Télécharger » de l'en-tête y mène
         directement, le premier clic sur les badges ne doit pas se perdre. -->
    <DownloadCta />
  </div>
</template>
