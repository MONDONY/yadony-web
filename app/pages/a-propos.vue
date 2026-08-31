<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'

defineI18nRoute({ paths: { fr: '/a-propos', en: '/about' } })

const { t, tm, rt, locale } = useI18n()
const route = useRoute()

useSeoMeta(
  buildSeoMeta({
    title: t('about.seo.title'),
    description: t('about.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

const paragraphs = computed(() => (tm('about.paragraphs') as unknown[]).map(paragraph => rt(paragraph as never)))
</script>

<template>
  <div>
    <PageHero :title="t('about.title')" />
    <UiSection tone="white">
      <UiContainer>
        <ProseBlock>
          <p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p>
        </ProseBlock>
      </UiContainer>
    </UiSection>

    <DownloadCta />
  </div>
</template>
