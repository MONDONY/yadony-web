<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { useTexts } from '@/composables/useTexts'

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

const localePath = useLocalePath()
const { items } = useTexts()
const pillars = items<{ title: string; text: string }>('landing.trust.items')

const paragraphs = computed(() => (tm('about.paragraphs') as unknown[]).map(paragraph => rt(paragraph as never)))
</script>

<template>
  <div>
    <PageHero :title="t('about.title')" pose="hello" :pose-alt="t('about.donyAlt')" />
    <UiSection tone="white">
      <UiContainer>
        <div class="grid gap-12 lg:grid-cols-12">
          <ProseBlock class="lg:col-span-7">
            <p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p>
          </ProseBlock>
          <aside class="lg:col-span-5">
            <div class="rounded-card bg-sand p-8 lg:sticky lg:top-28">
              <h2 class="font-display text-2xl font-bold text-ink text-balance">{{ t('landing.trust.title') }}</h2>
              <ul class="mt-6 grid list-none gap-5">
                <li v-for="pillar in pillars" :key="pillar.title" class="border-l-4 border-primary pl-4">
                  <p class="font-display font-bold text-ink">{{ pillar.title }}</p>
                  <p class="mt-1 text-sm text-ink-muted">{{ pillar.text }}</p>
                </li>
              </ul>
              <UiButton :to="localePath('/securite')" variant="ghost" class="mt-7">{{ t('landing.trust.cta') }}</UiButton>
            </div>
          </aside>
        </div>
      </UiContainer>
    </UiSection>

    <DownloadCta />
  </div>
</template>
