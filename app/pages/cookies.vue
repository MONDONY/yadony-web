<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'

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
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <h1 class="max-w-[22ch] text-display-xl">{{ t('legal.cookies.title') }}</h1>
      <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t('legal.cookies.intro') }}</p>

      <ProseBlock class="mt-12">
        <template v-for="key in sections" :key="key">
          <h2>{{ t(`legal.cookies.sections.${key}.title`) }}</h2>
          <p>{{ t(`legal.cookies.sections.${key}.text`) }}</p>
        </template>
      </ProseBlock>

      <UiButton variant="primary" class="mt-10" @click="reopen">
        {{ t('legal.cookies.manageCta') }}
      </UiButton>
    </UiContainer>
  </UiSection>
</template>
