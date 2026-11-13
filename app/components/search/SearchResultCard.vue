<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { siteUrl } from '@/lib/site'
import type { Locale } from '@/lib/locale'
import TransportIcon from '@/components/ui/TransportIcon.vue'
import {
  cardPriceUnit,
  formatArrivalRange,
  formatCapacity,
  formatCardPrice,
  formatDepartureDate,
  type PublicAnnouncementCard,
} from '@/lib/public-search'

// `headingLevel` : niveau du titre du trajet, un cran sous le titre de la
// section qui porte la carte (h2 : niveau 3, h3 : niveau 4).
const props = withDefaults(defineProps<{ card: PublicAnnouncementCard; headingLevel?: 3 | 4 }>(), { headingLevel: 3 })

const { t, locale } = useI18n()

// Tout vient des champs de l'API, rendu comme du texte (jamais v-html).
const lang = computed(() => locale.value as Locale)
const date = computed(() => formatDepartureDate(props.card.departureDate, lang.value))
const MODES = ['PLANE', 'CAR', 'TRAIN', 'BUS', 'BOAT', 'OTHER']
const mode = computed(() => {
  const value = props.card.transportMode
  return value !== undefined && MODES.includes(value) ? t(`search.card.mode.${value}`) : ''
})
// Bateau : fourchette d'arrivée estimée, seule ligne propre à un mode.
const arrival = computed(() => formatArrivalRange(props.card, lang.value, (key, params) => t(key, params)))
const capacity = computed(() => formatCapacity(props.card, lang.value))
const price = computed(() => formatCardPrice(props.card, lang.value))
const priceText = computed(() => {
  const unit = cardPriceUnit(props.card)
  if (unit === 'kg') return `${price.value}${t('search.card.perKg')}`
  if (unit === 'm3') return `${price.value}${t('search.card.perM3')}`
  return price.value
})
const name = computed(() => props.card.traveler.displayName)
const initial = computed(() => Array.from(name.value.trim())[0]?.toUpperCase() ?? '?')
const rating = computed(() => {
  const value = props.card.traveler.averageRating
  if (value === undefined || !(value > 0)) return ''
  return new Intl.NumberFormat(lang.value === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: 1 }).format(value)
})
const trips = computed(() => props.card.traveler.totalTrips ?? 0)
// Page publique de l'annonce (redirigée par le site vers l'API), même onglet.
const detailsHref = computed(() => `${siteUrl}/annonce/${encodeURIComponent(props.card.id)}`)
const labelArgs = computed(() => ({ name: name.value, from: props.card.departureCity, to: props.card.arrivalCity }))

// La boîte « Pour réserver » n'est montée qu'à la première demande : une liste
// de résultats ne porte pas autant de boîtes que de cartes.
const handoffMounted = ref(false)
const handoffOpen = ref(false)

function request() {
  handoffMounted.value = true
  handoffOpen.value = true
}
</script>

<template>
  <article class="flex min-h-44 flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-sm">
    <header class="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
      <component :is="`h${headingLevel}`" class="font-display text-lg font-bold text-ink">
        {{ card.departureCity }} → {{ card.arrivalCity }}
      </component>
      <span
        v-if="card.urgent"
        class="inline-flex min-h-7 items-center rounded-pill bg-accent-soft px-3 text-sm font-bold text-accent-text"
      >{{ t('search.card.urgent') }}</span>
    </header>

    <p class="flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
      <span>{{ date }}</span>
      <template v-if="mode">
        <span aria-hidden="true">·</span>
        <span data-mode class="inline-flex items-center gap-1">
          <TransportIcon :mode="card.transportMode" class="size-4 shrink-0" />{{ mode }}
        </span>
      </template>
      <template v-if="capacity">
        <span aria-hidden="true">·</span>
        <span data-capacity>{{ capacity }}</span>
      </template>
      <template v-if="arrival">
        <span aria-hidden="true">·</span>
        <span data-arrival>{{ arrival }}</span>
      </template>
      <template v-if="price">
        <span aria-hidden="true">·</span>
        <span data-price class="font-semibold text-ink">{{ priceText }}</span>
      </template>
    </p>

    <div class="flex items-center gap-3">
      <span
        data-initial
        aria-hidden="true"
        class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display text-base font-bold text-primary"
      >{{ initial }}</span>
      <div class="min-w-0">
        <p class="truncate font-semibold text-ink">{{ name }}</p>
        <p class="flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
          <span v-if="rating" class="inline-flex items-center gap-1">
            <svg aria-hidden="true" viewBox="0 0 20 20" class="size-4 fill-accent" focusable="false"><path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8z" /></svg>
            <span class="sr-only">{{ t('search.card.rating', { rating }) }}</span>
            <span aria-hidden="true">{{ rating }}</span>
          </span>
          <span v-if="trips > 0">{{ t('search.card.trips', { count: trips }, trips) }}</span>
          <span v-if="card.traveler.identityVerified" class="font-semibold text-primary-hover">{{ t('search.card.verified') }}</span>
        </p>
      </div>
    </div>

    <footer class="mt-auto flex flex-wrap items-center gap-3">
      <button
        type="button"
        :aria-label="t('search.card.requestLabel', labelArgs)"
        class="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-btn bg-primary px-5 text-sm font-semibold text-white shadow-brand transition-[color,background-color,transform] duration-micro ease-dony hover:bg-primary-hover active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        @click="request"
      >{{ t('search.card.request') }}</button>
      <a
        :href="detailsHref"
        :aria-label="t('search.card.detailsLabel', labelArgs)"
        class="inline-flex min-h-11 items-center whitespace-nowrap px-2 text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >{{ t('search.card.details') }}</a>
    </footer>

    <AppHandoff v-if="handoffMounted" :card="card" :open="handoffOpen" @close="handoffOpen = false" />
  </article>
</template>
