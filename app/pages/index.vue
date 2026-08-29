<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { organizationJsonLd, mobileAppJsonLd, faqJsonLd } from '@/lib/structured-data'

const { t, tm, rt, locale } = useI18n()
const route = useRoute()

useSeoMeta(
  buildSeoMeta({
    title: t('home.seo.title'),
    description: t('home.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

const faqItems = (tm('home.faq.items') as unknown[]).map((raw) => {
  const entry = raw as { question: unknown; answer: unknown }
  return { question: rt(entry.question as never), answer: rt(entry.answer as never) }
})

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
    <HeroDownload />
    <ProblemComparison />
    <TrackingWalkthrough />
    <TrustPillars />
    <TravelerBanner />
    <HomeFaq />
    <DownloadCta />
  </div>
</template>
