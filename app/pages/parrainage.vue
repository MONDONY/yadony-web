<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { parseReferralCode } from '@/lib/referral'

defineI18nRoute({ paths: { fr: '/parrainage', en: '/referral' } })

const { t, tm, rt, locale } = useI18n()
const route = useRoute()

useSeoMeta(
  buildSeoMeta({
    title: t('referral.seo.title'),
    description: t('referral.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

// Le code vient de `?code=` (réécriture de /r/{code}, cf. public/_redirects).
// La page est prérendue sans lui : on ne le lit qu'une fois monté, pour que
// le HTML servi et le premier rendu client restent identiques.
const code = ref<string | null>(null)
onMounted(() => {
  code.value = parseReferralCode(route.query.code)
})

const copied = ref(false)
async function copy() {
  if (!code.value) return
  try {
    await navigator.clipboard.writeText(code.value)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Presse-papiers refusé (contexte non sécurisé, permission) : le code
    // reste affiché et sélectionnable, rien d'autre à faire.
  }
}

const steps = computed(() => (tm('referral.steps') as unknown[]).map(step => rt(step as never)))
</script>

<template>
  <div>
    <PageHero :title="t('referral.title')" :lead="t('referral.lead')" />

    <UiSection tone="white">
      <UiContainer>
        <div
          v-if="code"
          class="max-w-xl rounded-card border border-line bg-sand p-6 sm:p-8"
          data-testid="referral-code"
        >
          <p class="font-display text-sm font-bold uppercase tracking-[0.18em] text-primary">
            {{ t('referral.codeLabel') }}
          </p>
          <p class="mt-3 select-all break-all font-display text-4xl font-bold tracking-[0.12em] text-navy-deep">
            {{ code }}
          </p>
          <div class="mt-6 flex flex-wrap items-center gap-3">
            <UiButton variant="primary" @click="copy">
              {{ copied ? t('referral.copied') : t('referral.copy') }}
            </UiButton>
            <span class="text-sm text-ink-muted" aria-live="polite">
              {{ copied ? t('referral.copiedHint') : '' }}
            </span>
          </div>
        </div>

        <p v-else class="max-w-prose text-ink-muted" data-testid="referral-no-code">
          {{ t('referral.noCode') }}
        </p>

        <h2 class="mt-12 max-w-[24ch] text-display-md">{{ t('referral.stepsTitle') }}</h2>
        <ol class="mt-6 max-w-2xl list-decimal space-y-3 pl-6 text-ink-muted">
          <li v-for="(step, index) in steps" :key="index">{{ step }}</li>
        </ol>

        <p class="mt-8 max-w-prose text-sm text-ink-muted">{{ t('referral.note') }}</p>

        <div class="mt-10">
          <StoreBadges size="lg" />
        </div>
      </UiContainer>
    </UiSection>
  </div>
</template>
