<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()

const { t } = useI18n()

useSeoMeta({
  title: t('error.seo.title'),
  description: t('error.seo.description'),
  robots: 'noindex, nofollow',
})
</script>

<template>
  <NuxtLayout>
    <UiSection tone="white">
      <UiContainer>
        <h1 class="text-display-xl">{{ t('error.title') }}</h1>
        <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t('error.lead') }}</p>
        <UiButton to="/" size="lg" class="mt-9">{{ t('error.cta') }}</UiButton>
      </UiContainer>
    </UiSection>
  </NuxtLayout>
</template>
