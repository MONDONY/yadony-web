<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { organizationJsonLd, mobileAppJsonLd } from '@/lib/structured-data'

const { t, locale } = useI18n()
const route = useRoute()

useSeoMeta(
  buildSeoMeta({
    title: t('home.seo.title'),
    description: t('home.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

useHead({
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(organizationJsonLd()) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(mobileAppJsonLd()) },
  ],
})
</script>

<template>
  <div>
    <HeroDownload />
    <ProblemComparison />
    <TrackingWalkthrough />
  </div>
</template>
