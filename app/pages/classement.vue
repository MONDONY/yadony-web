<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { classer, instantInitial, localeDates, statutPeriode } from '@/lib/classement/score'
import type { ClassementData } from '@/lib/classement/types'
import donnees from '@/data/classement.json'
import donneesPhase1 from '@/data/classement-phase1.json'

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

// Le HTML est figé au build : on part de l'heure de la mise à jour (ou juste
// avant le début), puis on suit l'heure réelle une fois monté, minute par
// minute, pour qu'un onglet ouvert avant 20 h 30 passe à « En cours ».
const maintenant = ref(instantInitial(data))
let minuteur: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  maintenant.value = new Date()
  minuteur = setInterval(() => {
    maintenant.value = new Date()
  }, 60_000)
})
onBeforeUnmount(() => clearInterval(minuteur))

const statut = computed(() => statutPeriode(data.debut, data.fin, maintenant.value))

const dateDebut = computed(() =>
  new Intl.DateTimeFormat(localeDates(locale.value), {
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

      <ContestPhase1 :donnees="donneesPhase1" />

      <div class="mt-10">
        <ContestRules />
      </div>
    </UiContainer>
  </div>
</template>
