<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTexts } from '@/composables/useTexts'
import { donyPose, type DonyPoseId } from '@/lib/media'

const { t } = useI18n()
const { items } = useTexts()
const localePath = useLocalePath()
const promises = items<{ title: string; text: string; cta: string }>('landing.promises.items')

// Même ordre que les textes : envoyer un colis, vendre ses kilos, puis les
// alertes de prix (Yadony ne vend pas de billets, il prévient).
const targets: Array<{ to: string; pose: DonyPoseId; tone: string }> = [
  { to: '/envoyer-colis', pose: 'padlock', tone: 'bg-primary-soft' },
  { to: '/devenir-voyageur', pose: 'travel', tone: 'bg-accent-soft' },
  { to: '/billets-avion', pose: 'price-alert', tone: 'bg-sand' },
]
</script>

<template>
  <section class="bg-bg py-14 sm:py-20">
    <UiContainer>
      <p class="font-display text-sm font-bold uppercase tracking-[0.16em] text-accent-text">{{ t('landing.promises.kicker') }}</p>
      <h2 class="mt-3 max-w-[20ch] text-display-lg text-ink">{{ t('landing.promises.title') }}</h2>
      <ul class="mt-12 grid list-none gap-6 md:grid-cols-3">
        <UiReveal
          v-for="(item, index) in promises"
          :key="item.title"
          as="li"
          :delay="index * 60"
        >
          <NuxtLink
            :to="localePath(targets[index]!.to)"
            class="group flex h-full flex-col rounded-card border border-line bg-surface p-7 shadow-sm transition-[transform,box-shadow] duration-base ease-dony hover:-translate-y-1 hover:shadow-md"
          >
            <span class="grid h-40 place-items-center rounded-card" :class="targets[index]!.tone">
              <UiPicture :image="donyPose(targets[index]!.pose)" alt="" sizes="160px" class="w-36 transition-transform duration-slow ease-dony group-hover:-rotate-3 group-hover:scale-105 [&_img]:h-auto [&_img]:w-full" />
            </span>
            <h3 class="mt-6 font-display text-2xl font-bold text-ink">{{ item.title }}</h3>
            <p class="mt-3 flex-1 text-ink-muted">{{ item.text }}</p>
            <span class="mt-6 inline-flex items-center gap-2 font-semibold text-primary">
              {{ item.cta }}
              <span aria-hidden="true" class="transition-transform duration-micro ease-dony group-hover:translate-x-1">→</span>
            </span>
          </NuxtLink>
        </UiReveal>
      </ul>
    </UiContainer>
  </section>
</template>
