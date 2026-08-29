<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'

defineI18nRoute({ paths: { fr: '/securite', en: '/trust-and-safety' } })

const { t, locale } = useI18n()
const route = useRoute()

useSeoMeta(
  buildSeoMeta({
    title: t('trust.seo.title'),
    description: t('trust.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

const sections = ['identity', 'escrow', 'cap', 'tracking', 'dispute', 'data', 'limits'] as const
</script>

<template>
  <div>
    <UiSection tone="white">
      <UiContainer>
        <h1 class="max-w-[24ch] text-display-xl">{{ t('trust.title') }}</h1>
        <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t('trust.lead') }}</p>

        <ProseBlock class="mt-12">
          <template v-for="key in sections" :key="key">
            <h2>{{ t(`trust.sections.${key}.title`) }}</h2>
            <p>{{ t(`trust.sections.${key}.text`) }}</p>
          </template>
        </ProseBlock>
      </UiContainer>
    </UiSection>

    <DownloadCta />
  </div>
</template>
