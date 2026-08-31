<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const localePath = useLocalePath()

const corridors = [
  { key: 'dakar', slug: 'paris-dakar' },
  { key: 'abidjan', slug: 'lyon-abidjan' },
  { key: 'bamako', slug: 'marseille-bamako' },
  { key: 'douala', slug: 'paris-douala' },
] as const
</script>

<template>
  <UiSection tone="sand">
    <UiContainer>
      <h2 class="max-w-[26ch] text-display-lg">{{ t('home.corridors.title') }}</h2>
      <p class="mt-5 max-w-prose text-lg text-ink-muted">{{ t('home.corridors.lead') }}</p>

      <ul class="mt-12 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="(corridor, index) in corridors" :key="corridor.key">
          <UiRevealOnScroll :delay="index * 80" class="h-full">
            <NuxtLink
              :to="localePath(`/envoyer-colis/${corridor.slug}`)"
              class="flex h-full flex-col rounded-card bg-surface p-6 shadow-[0_1px_2px_rgb(10_37_64/0.06),0_8px_24px_-12px_rgb(10_37_64/0.12)] transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <p class="font-display text-lg font-bold">
                {{ t(`home.corridors.routes.${corridor.key}.route`) }}
              </p>
              <p class="mt-2 flex-1 text-sm text-ink-muted">
                {{ t(`home.corridors.routes.${corridor.key}.text`) }}
              </p>
            </NuxtLink>
          </UiRevealOnScroll>
        </li>
      </ul>

      <i18n-t keypath="home.corridors.outro" tag="p" class="mt-10 max-w-prose text-ink-muted" scope="global">
        <template #pricing>
          <NuxtLink :to="localePath('/tarifs')" class="font-semibold text-primary underline underline-offset-2">
            {{ t('home.corridors.outroPricing') }}
          </NuxtLink>
        </template>
        <template #howItWorks>
          <NuxtLink :to="localePath('/comment-ca-marche')" class="font-semibold text-primary underline underline-offset-2">
            {{ t('home.corridors.outroHow') }}
          </NuxtLink>
        </template>
      </i18n-t>
    </UiContainer>
  </UiSection>
</template>
