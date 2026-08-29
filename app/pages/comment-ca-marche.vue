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
    <UiSection tone="white">
      <UiContainer>
        <h1 class="max-w-[20ch] text-display-xl">{{ t('howItWorks.title') }}</h1>
        <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t('howItWorks.lead') }}</p>
        <RoleTabs :model-value="role" class="mt-10" @update:model-value="setRole" />
        <JourneySteps :role="role" />
      </UiContainer>
    </UiSection>
    <DownloadCta />
  </div>
</template>
