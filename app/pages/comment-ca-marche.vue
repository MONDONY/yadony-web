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

const role = computed<Role>(() => resolveRole(route.query.role))

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
    <PageHero :title="t('howItWorks.title')" :lead="t('howItWorks.lead')" />
    <VideoIntro />
    <UiSection tone="white">
      <UiContainer>
        <RoleTabs :model-value="role" @update:model-value="setRole" />
        <JourneySteps :role="role" />
      </UiContainer>
    </UiSection>
    <DownloadCta />
  </div>
</template>
