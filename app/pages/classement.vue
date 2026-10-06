<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { classer, instantInitial, localeDates, statutPeriode } from '@/lib/classement/score'
import type { ClassementData } from '@/lib/classement/types'
import { normaliserPremiers } from '@/lib/classement/premiers'
import donnees from '@/data/classement.json'
import donneesPhase1 from '@/data/classement-phase1.json'
import donneesDefis from '@/data/defis.json'
import type { Defi } from '@/lib/classement/defis'

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
const premiers = computed(() => normaliserPremiers(data.premiers, data.testeurs))
const defis = donneesDefis.defis as Defi[]
const lignes = computed(() => classer(data.testeurs, data.premiers, defis))
const noms = computed(() => Object.fromEntries(data.testeurs.map(t => [t.id, t.nom])))

// Le HTML est figé au build : on part de l'heure de la mise à jour (ou juste
// avant le début), puis on suit l'heure réelle une fois monté, minute par
// minute, pour qu'un onglet ouvert avant 20 h 30 passe à « En cours ».
const maintenant = ref(instantInitial(data))
// La phase 1 n'est jamais rendue côté serveur : elle attend l'heure du visiteur.
const monte = ref(false)
let minuteur: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  monte.value = true
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
      <ContestDefis :defis="defis" :maintenant="maintenant" :noms="noms" />

      <template v-if="lignes.length">
        <ContestPodium :lignes="lignes" :chevauche="!defis.length" />
        <ContestTable :lignes="lignes" :mise-a-jour="data.miseAJour" :premiers="premiers" />
      </template>
      <p
        v-else
        data-testid="contest-empty"
        :class="defis.length ? 'mt-6' : '-mt-12'" class="relative rounded-card border border-line bg-surface p-6 text-ink-muted shadow-[0_12px_32px_-16px_rgb(10_20_48/0.25)]"
      >
        {{ t(`contest.empty.${statut}`, { date: dateDebut }) }}
      </p>

      <ContestPhase1 :donnees="donneesPhase1" :maintenant="monte ? maintenant : null" />

      <div class="mt-10">
        <ContestRules :premiers="premiers" />
      </div>
    </UiContainer>
  </div>
</template>
