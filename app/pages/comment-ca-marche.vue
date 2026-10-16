<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { resolveRole, type Role } from '@/lib/roles'
import { buildSeoMeta } from '@/lib/seo'

defineI18nRoute({
  paths: { fr: '/comment-ca-marche', en: '/how-it-works' },
})

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const localePath = useLocalePath()
const role = computed<Role>(() => resolveRole(route.query.role))

const more = [
  { to: '/envoyer-colis', key: 'howItWorks.more.sender' },
  { to: '/devenir-voyageur', key: 'howItWorks.more.traveler' },
  { to: '/billets-avion', key: 'howItWorks.more.flights' },
]

function setRole(next: Role) {
  router.replace({ query: next === 'expediteur' ? {} : { role: next } })
}

useSeoMeta(
  buildSeoMeta({
    title: t('howItWorks.seo.title'),
    description: t('howItWorks.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)
</script>

<template>
  <div>
    <PageHero :title="t('howItWorks.title')" :lead="t('howItWorks.lead')" pose="travel" :pose-alt="t('howItWorks.donyAlt')" />
    <VideoIntro />
    <UiSection tone="white">
      <UiContainer>
        <RoleTabs :model-value="role" @update:model-value="setRole" />
        <JourneySteps :role="role" />
      </UiContainer>
    </UiSection>
    <UiSection tone="sand">
      <UiContainer>
        <h2 class="text-display-lg text-balance">{{ t('howItWorks.more.title') }}</h2>
        <ul class="mt-8 grid list-none gap-4 sm:grid-cols-3">
          <UiReveal v-for="(link, index) in more" :key="link.to" as="li" :delay="index * 60">
            <NuxtLink
              :to="localePath(link.to)"
              class="group flex min-h-20 items-center justify-between gap-4 rounded-card bg-surface p-6 font-display text-lg font-bold text-ink shadow-sm transition-shadow duration-base ease-dony hover:shadow-md"
            >
              {{ t(link.key) }}
              <span aria-hidden="true" class="text-primary transition-transform duration-base ease-dony group-hover:translate-x-1">→</span>
            </NuxtLink>
          </UiReveal>
        </ul>
      </UiContainer>
    </UiSection>
    <DownloadCta />
  </div>
</template>
