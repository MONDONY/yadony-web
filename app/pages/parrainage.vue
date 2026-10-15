<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { parseReferralCode, referralAppLink } from '@/lib/referral'

defineI18nRoute({ paths: { fr: '/parrainage', en: '/referral' } })

const { t, locale } = useI18n()
const route = useRoute()

// Titre tel quel (« Invitation Yadony »), sans le suffixe « | Yadony » que
// buildSeoMeta ajoute : il contient déjà le nom et s'affiche dans l'aperçu
// du lien partagé (WhatsApp, SMS).
const seoTitle = t('referral.seo.title')
useSeoMeta({
  ...buildSeoMeta({
    title: seoTitle,
    description: t('referral.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
  title: seoTitle,
  ogTitle: seoTitle,
})

// Page d'invitation personnelle : rien à indexer (exclue aussi du sitemap,
// cf. nuxt.config.ts). On laisse suivre les liens vers le reste du site.
useHead({ meta: [{ name: 'robots', content: 'noindex, follow' }] })

// Le code vient de `?code=` (redirection de /r/{code}, cf. public/_redirects).
// La page est prérendue sans lui : on ne le lit qu'une fois montée, pour que
// le HTML servi et le premier rendu client restent identiques.
const code = ref<string | null>(null)
onMounted(() => {
  code.value = parseReferralCode(route.query.code)
})

const copied = ref(false)
let copiedTimer: number | undefined
async function copy() {
  if (!code.value) return
  try {
    await navigator.clipboard.writeText(code.value)
    copied.value = true
    window.clearTimeout(copiedTimer)
    copiedTimer = window.setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Presse-papiers refusé (contexte non sécurisé, permission) : le code
    // reste affiché et sélectionnable, rien d'autre à faire.
  }
}
onBeforeUnmount(() => window.clearTimeout(copiedTimer))
</script>

<template>
  <section class="bg-sand py-14 sm:py-20">
    <UiContainer>
      <div
        class="mx-auto max-w-md rounded-card bg-surface p-6 text-center shadow-[0_1px_2px_rgb(10_20_48/0.06),0_12px_32px_-12px_rgb(10_20_48/0.18)] sm:p-8"
      >
        <h1 class="text-balance font-display text-3xl font-bold tracking-tight text-navy-deep sm:text-4xl">
          {{ t('referral.title') }}
        </h1>
        <p class="mt-4 text-pretty text-ink-muted">
          {{ code ? t('referral.lead') : t('referral.leadNoCode') }}
        </p>

        <template v-if="code">
          <div
            class="mt-8 rounded-el border-2 border-dashed border-invite bg-invite-soft px-4 py-5"
            data-testid="referral-code"
          >
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-invite">
              {{ t('referral.codeLabel') }}
            </p>
            <p
              class="mt-2 select-all break-all font-display text-4xl font-bold tabular-nums tracking-[0.12em] text-navy-deep"
            >
              {{ code }}
            </p>
            <button
              type="button"
              class="mt-4 inline-flex items-center justify-center gap-2 rounded-el border border-invite/30 bg-surface px-4 py-2 text-sm font-semibold text-invite transition-[background-color,transform] duration-150 hover:bg-invite-soft active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-invite"
              data-testid="referral-copy"
              @click="copy"
            >
              {{ copied ? t('referral.copied') : t('referral.copy') }}
            </button>
            <span class="sr-only" aria-live="polite">{{ copied ? t('referral.copiedHint') : '' }}</span>
          </div>

          <a
            :href="referralAppLink(code)"
            class="mt-6 flex w-full items-center justify-center rounded-el bg-invite px-7 py-3.5 text-base font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-invite/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-invite"
            data-testid="referral-open-app"
          >
            {{ t('referral.openApp') }}
          </a>
        </template>

        <p v-else class="mt-6 text-sm text-ink-muted" data-testid="referral-no-code">
          {{ t('referral.noCode') }}
        </p>

        <div class="mt-8 flex justify-center">
          <StoreBadges />
        </div>

        <p v-if="code" class="mt-6 text-pretty text-sm text-ink-muted" data-testid="referral-install">
          {{ t('referral.install', { code }) }}
        </p>
      </div>
    </UiContainer>
  </section>
</template>
