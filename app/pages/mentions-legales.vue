<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'

defineI18nRoute({ paths: { fr: '/mentions-legales', en: '/legal-notice' } })

const { t, locale } = useI18n()
const route = useRoute()

useSeoMeta(
  buildSeoMeta({
    title: t('legal.mentionsLegales.seo.title'),
    description: t('legal.mentionsLegales.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

const sections = ['editor', 'publication', 'hosting', 'ip', 'liability', 'report'] as const
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <h1 class="max-w-[20ch] text-display-xl">{{ t('legal.mentionsLegales.title') }}</h1>

      <ProseBlock class="mt-10">
        <template v-for="key in sections" :key="key">
          <h2>{{ t(`legal.mentionsLegales.sections.${key}.title`) }}</h2>
          <p>{{ t(`legal.mentionsLegales.sections.${key}.text`) }}</p>
        </template>
      </ProseBlock>
    </UiContainer>
  </UiSection>
</template>
