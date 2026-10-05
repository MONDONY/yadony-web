<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { classer, statutPeriode } from '@/lib/classement/score'
import type { ClassementData } from '@/lib/classement/types'
import donnees from '@/data/classement.json'

defineI18nRoute({ paths: { fr: '/classement', en: '/leaderboard' } })

const { t, locale } = useI18n()
const route = useRoute()

useSeoMeta(
  buildSeoMeta({
    title: t('contest.seo.title'),
    description: t('contest.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)
// Page temporaire qui affiche des prénoms : jamais indexée.
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const data = donnees as ClassementData
const lignes = computed(() => classer(data.testeurs))

// Le HTML est figé au build : on part de l'heure de la mise à jour, puis on
// passe à l'heure réelle une fois monté (une page générée à 19 h doit afficher
// « En cours » à 21 h).
const maintenant = ref(new Date(data.miseAJour ?? data.debut))
onMounted(() => {
  maintenant.value = new Date()
})

const statut = computed(() => statutPeriode(data.debut, data.fin, maintenant.value))

const dateDebut = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(new Date(data.debut)),
)
</script>

<template>
  <div class="bg-sand">
    <ContestHero :debut="data.debut" :fin="data.fin" :maintenant="maintenant" />

    <UiContainer>
      <template v-if="lignes.length">
        <ContestPodium :lignes="lignes" />
        <ContestTable :lignes="lignes" :mise-a-jour="data.miseAJour" />
      </template>
      <p
        v-else
        data-testid="contest-empty"
        class="relative -mt-12 rounded-card border border-line bg-surface p-6 text-ink-muted shadow-[0_12px_32px_-16px_rgb(10_20_48/0.25)]"
      >
        {{ t(`contest.empty.${statut}`, { date: dateDebut }) }}
      </p>

      <div class="mt-10">
        <ContestRules />
      </div>
    </UiContainer>
  </div>
</template>
