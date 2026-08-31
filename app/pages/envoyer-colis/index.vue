<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { corridors } from '@/lib/corridors'

defineI18nRoute({ paths: { fr: '/envoyer-colis', en: '/send-a-parcel' } })

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

useSeoMeta(
  buildSeoMeta({
    title: t('corridorPages.hub.seo.title'),
    description: t('corridorPages.hub.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)
</script>

<template>
  <div>
    <PageHero :title="t('corridorPages.hub.title')" :lead="t('corridorPages.hub.lead')" />

    <UiSection tone="white">
      <UiContainer>
        <h2 class="sr-only">{{ t('corridorPages.hub.listLabel') }}</h2>
        <ul class="grid list-none gap-6 sm:grid-cols-2">
          <li v-for="corridor in corridors" :key="corridor.slug">
            <NuxtLink
              :to="localePath(`/envoyer-colis/${corridor.slug}`)"
              class="group flex h-full flex-col rounded-card bg-sand p-8 transition-[background-color,transform] duration-150 hover:bg-sand-deep active:scale-[0.98]"
            >
              <p class="font-display text-2xl font-bold">
                {{ corridor.from }} → {{ corridor.to }}
              </p>
              <p class="mt-2 flex-1 text-ink-muted">
                {{ t(`corridorPages.pages.${corridor.key}.lead`) }}
              </p>
              <p class="mt-6 font-semibold text-primary group-hover:underline">
                {{ t('corridorPages.hub.cardCta') }} →
              </p>
            </NuxtLink>
          </li>
        </ul>
      </UiContainer>
    </UiSection>

    <DownloadCta />
  </div>
</template>
