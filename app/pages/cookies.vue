<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { legalToc } from '@/lib/legal'

defineI18nRoute({ paths: { fr: '/cookies', en: '/cookies' } })

const { t, locale } = useI18n()
const route = useRoute()
const { reopen } = useCookieConsent()

useSeoMeta(
  buildSeoMeta({
    title: t('legal.cookies.seo.title'),
    description: t('legal.cookies.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

const sections = ['what', 'current', 'storage', 'manage'] as const

const toc = computed(() =>
  legalToc(sections.map(key => t(`legal.cookies.sections.${key}.title`))),
)
</script>

<template>
  <LegalLayout :title="t('legal.cookies.title')" :toc="toc">
    <p class="max-w-prose text-lg text-ink-muted">{{ t('legal.cookies.intro') }}</p>

    <ProseBlock class="mt-12">
      <template v-for="(key, index) in sections" :key="key">
        <h2 :id="toc[index]?.id">{{ t(`legal.cookies.sections.${key}.title`) }}</h2>
        <p>{{ t(`legal.cookies.sections.${key}.text`) }}</p>
      </template>
    </ProseBlock>

    <UiButton variant="primary" class="mt-10" @click="reopen">
      {{ t('legal.cookies.manageCta') }}
    </UiButton>
  </LegalLayout>
</template>
