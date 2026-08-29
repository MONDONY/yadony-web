<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'

defineI18nRoute({ paths: { fr: '/cgu', en: '/terms' } })

const { t, locale } = useI18n()
const route = useRoute()

useSeoMeta(
  buildSeoMeta({
    title: t('legal.cgu.seo.title'),
    description: t('legal.cgu.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

const sections = [
  'object',
  'account',
  'sender',
  'traveler',
  'price',
  'cancellation',
  'dispute',
  'termination',
  'law',
] as const
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <h1 class="max-w-[24ch] text-display-xl">{{ t('legal.cgu.title') }}</h1>
      <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t('legal.cgu.intro') }}</p>

      <ProseBlock class="mt-12">
        <template v-for="key in sections" :key="key">
          <h2>{{ t(`legal.cgu.sections.${key}.title`) }}</h2>
          <p>{{ t(`legal.cgu.sections.${key}.text`) }}</p>
        </template>
      </ProseBlock>
    </UiContainer>
  </UiSection>
</template>
