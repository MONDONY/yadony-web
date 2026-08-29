<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'

defineI18nRoute({ paths: { fr: '/confidentialite', en: '/privacy' } })

const { t, locale } = useI18n()
const route = useRoute()

useSeoMeta(
  buildSeoMeta({
    title: t('legal.confidentialite.seo.title'),
    description: t('legal.confidentialite.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

const sections = [
  'responsible',
  'collected',
  'purposes',
  'recipients',
  'retention',
  'rights',
  'cookies',
  'security',
] as const
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <h1 class="max-w-[22ch] text-display-xl">{{ t('legal.confidentialite.title') }}</h1>
      <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t('legal.confidentialite.intro') }}</p>

      <ProseBlock class="mt-12">
        <template v-for="key in sections" :key="key">
          <h2>{{ t(`legal.confidentialite.sections.${key}.title`) }}</h2>
          <p>{{ t(`legal.confidentialite.sections.${key}.text`) }}</p>
        </template>
      </ProseBlock>
    </UiContainer>
  </UiSection>
</template>
