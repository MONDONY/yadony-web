<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { parseSearchQuery, suggestCities, type SearchQuery } from '@/lib/public-search'

const props = defineProps<{ modelValue: SearchQuery }>()
const emit = defineEmits<{
  'update:modelValue': [query: SearchQuery]
  submit: [query: SearchQuery]
}>()

const { t } = useI18n()
const uid = useId()
const MIN_KG_FILTER = 16

// Brouillon local : la frappe ne touche ni l'adresse ni la recherche. La valeur
// ne sort du formulaire qu'après `parseSearchQuery`, jamais en l'état brut.
const draft = ref<SearchQuery>({ ...props.modelValue })
const priceOpen = ref(props.modelValue.maxPrix !== undefined)

// Le champ « Prix max » reste dans l'état choisi par l'utilisateur tant que la
// valeur de l'adresse ne change pas : ouvert et vide, il ne doit pas se replier
// quand la requête revient sans prix.
watch(
  () => props.modelValue,
  (value, previous) => {
    draft.value = { ...value }
    if (value.maxPrix !== previous?.maxPrix) priceOpen.value = value.maxPrix !== undefined
  },
)

const departSuggestions = computed(() => suggestCities(draft.value.depart))
const arriveeSuggestions = computed(() => suggestCities(draft.value.arrivee))

// `parseSearchQuery` lit des paramètres d'adresse, donc des chaînes.
function toRaw(q: SearchQuery): Record<string, string> {
  return {
    depart: q.depart,
    arrivee: q.arrivee,
    quand: q.quand,
    minKg: q.minKg === undefined ? '' : String(q.minKg),
    maxPrix: q.maxPrix === undefined || Number.isNaN(q.maxPrix) ? '' : String(q.maxPrix),
    urgent: q.urgent ? '1' : '',
    mode: q.mode ?? '',
    page: '0', // une nouvelle recherche repart de la première page
  }
}

function submit() {
  const query = parseSearchQuery(toRaw(draft.value))
  draft.value = { ...query }
  emit('update:modelValue', query)
  emit('submit', query)
}

function toggle(apply: (query: SearchQuery) => void) {
  apply(draft.value)
  submit()
}

const minKgOn = computed(() => draft.value.minKg === MIN_KG_FILTER)
const urgentOn = computed(() => draft.value.urgent === true)
const planeOn = computed(() => draft.value.mode === 'PLANE')

function toggleMinKg() {
  toggle((q) => {
    if (minKgOn.value) delete q.minKg
    else q.minKg = MIN_KG_FILTER
  })
}

function toggleUrgent() {
  toggle((q) => {
    if (urgentOn.value) delete q.urgent
    else q.urgent = true
  })
}

function togglePlane() {
  toggle((q) => {
    if (planeOn.value) delete q.mode
    else q.mode = 'PLANE'
  })
}

function togglePrice() {
  const wasSet = draft.value.maxPrix !== undefined
  priceOpen.value = !priceOpen.value
  if (!priceOpen.value) {
    delete draft.value.maxPrix
    if (wasSet) submit()
  }
}

function onPriceInput(event: Event) {
  const text = (event.target as HTMLInputElement).value
  if (text === '') delete draft.value.maxPrix
  else draft.value.maxPrix = Number(text)
}

const field =
  'min-h-12 rounded-field border border-line bg-surface px-4 py-2.5 text-base text-ink ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
const chipBase =
  'inline-flex min-h-11 items-center whitespace-nowrap rounded-pill border px-4 text-sm font-semibold ' +
  'transition-[color,background-color,border-color,transform] duration-micro ease-dony active:scale-[0.96] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
const chipOff = 'border-line bg-surface text-ink hover:bg-sand'
const chipOn = 'border-primary bg-primary-soft text-primary'

const chips = computed(() => [
  { key: 'minKg', label: t('search.form.minKg', { kg: MIN_KG_FILTER }), on: minKgOn.value, click: toggleMinKg },
  { key: 'maxPrice', label: t('search.form.maxPrice'), on: priceOpen.value, click: togglePrice },
  { key: 'urgent', label: t('search.form.urgent'), on: urgentOn.value, click: toggleUrgent },
  { key: 'plane', label: t('search.form.plane'), on: planeOn.value, click: togglePlane },
])
</script>

<template>
  <form role="search" :aria-label="t('search.form.label')" class="grid gap-4" @submit.prevent="submit">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
      <div>
        <label :for="`${uid}-depart`" class="mb-1.5 block text-sm font-semibold text-ink">{{ t('search.form.from') }}</label>
        <input
          :id="`${uid}-depart`"
          v-model="draft.depart"
          name="depart"
          type="text"
          maxlength="80"
          autocomplete="off"
          :list="`${uid}-depart-list`"
          :class="[field, 'w-full']"
        >
        <datalist :id="`${uid}-depart-list`">
          <option v-for="name in departSuggestions" :key="name" :value="name" />
        </datalist>
      </div>
      <div>
        <label :for="`${uid}-arrivee`" class="mb-1.5 block text-sm font-semibold text-ink">{{ t('search.form.to') }}</label>
        <input
          :id="`${uid}-arrivee`"
          v-model="draft.arrivee"
          name="arrivee"
          type="text"
          maxlength="80"
          autocomplete="off"
          :list="`${uid}-arrivee-list`"
          :class="[field, 'w-full']"
        >
        <datalist :id="`${uid}-arrivee-list`">
          <option v-for="name in arriveeSuggestions" :key="name" :value="name" />
        </datalist>
      </div>
      <div>
        <label :for="`${uid}-quand`" class="mb-1.5 block text-sm font-semibold text-ink">{{ t('search.form.when') }}</label>
        <select :id="`${uid}-quand`" v-model="draft.quand" name="quand" :class="[field, 'w-full']">
          <option value="">{{ t('search.form.whenAny') }}</option>
          <option value="ce-mois">{{ t('search.form.whenMonth') }}</option>
          <option value="3-mois">{{ t('search.form.whenThreeMonths') }}</option>
        </select>
      </div>
      <UiButton type="submit" size="lg" class="w-full whitespace-nowrap">{{ t('search.form.submit') }}</UiButton>
    </div>

    <div role="group" :aria-label="t('search.form.filters')" class="flex flex-wrap items-center gap-2">
      <button
        v-for="chip in chips"
        :key="chip.key"
        type="button"
        :aria-pressed="chip.on ? 'true' : 'false'"
        :class="[chipBase, chip.on ? chipOn : chipOff]"
        @click="chip.click"
      >{{ chip.label }}</button>
      <div v-if="priceOpen" class="flex w-full items-center gap-2 sm:w-auto">
        <label :for="`${uid}-prix`" class="sr-only">{{ t('search.form.maxPriceField') }}</label>
        <input
          :id="`${uid}-prix`"
          name="maxPrix"
          type="number"
          inputmode="decimal"
          min="1"
          step="any"
          :value="draft.maxPrix ?? ''"
          :class="[field, 'w-36']"
          @input="onPriceInput"
        >
        <span aria-hidden="true" class="whitespace-nowrap text-sm font-semibold text-ink">€/kg</span>
      </div>
    </div>
  </form>
</template>
