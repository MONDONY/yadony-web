<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { MAX_DECLARED_VALUE_EUR } from '@/lib/pricing'

defineI18nRoute({ paths: { fr: '/tarifs', en: '/pricing' } })

const { t, locale } = useI18n()
const route = useRoute()

useSeoMeta(
  buildSeoMeta({
    title: t('pricing.seo.title'),
    description: t('pricing.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)
</script>

<template>
  <div>
    <UiSection tone="white">
      <UiContainer>
        <h1 class="max-w-[18ch] text-display-xl">{{ t('pricing.title') }}</h1>
        <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t('pricing.lead') }}</p>

        <div class="mt-12 max-w-2xl">
          <PricingExample />
        </div>

        <p class="mt-8 max-w-prose text-sm text-ink-muted">
          {{ t('pricing.cap', { amount: MAX_DECLARED_VALUE_EUR }) }}
        </p>
      </UiContainer>
    </UiSection>

    <UiSection tone="sand">
      <UiContainer>
        <h2 class="max-w-[22ch] text-display-lg">{{ t('pricing.comparison.title') }}</h2>
        <p class="mt-5 max-w-prose text-ink-muted">{{ t('pricing.comparison.text') }}</p>
      </UiContainer>
    </UiSection>

    <DownloadCta />
  </div>
</template>
