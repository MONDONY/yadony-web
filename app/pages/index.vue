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
    <HomeHero />
    <HomePromises />
    <HomeVideo />
    <JourneyCrossed />
    <HomeTrust />
    <HomePayments />
    <HomeCorridors />
    <HomeRecipient />
    <HomeFaq />
    <DownloadCta />
  </div>
</template>
