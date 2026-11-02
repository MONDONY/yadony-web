<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { legalToc } from '@/lib/legal'

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

const toc = computed(() =>
  legalToc(sections.map(key => t(`legal.mentionsLegales.sections.${key}.title`))),
)
</script>

<template>
  <LegalLayout :title="t('legal.mentionsLegales.title')" :toc="toc">
    <ProseBlock>
      <template v-for="(key, index) in sections" :key="key">
        <h2 :id="toc[index]?.id">{{ t(`legal.mentionsLegales.sections.${key}.title`) }}</h2>
        <p>{{ t(`legal.mentionsLegales.sections.${key}.text`) }}</p>
      </template>
    </ProseBlock>
  </LegalLayout>
</template>
