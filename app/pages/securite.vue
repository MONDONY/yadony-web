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
    <PageHero :title="t('trust.title')" :lead="t('trust.lead')" />
    <UiSection tone="white">
      <UiContainer>
        <ProseBlock>
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
