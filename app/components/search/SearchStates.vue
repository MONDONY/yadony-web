<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SearchStatus } from '@/composables/usePublicSearch'
import type { SearchQuery } from '@/lib/public-search'

// Un seul état visible à la fois. `idle` et `ok` ne rendent rien : les
// résultats sont affichés par l'appelant.
const props = defineProps<{ status: SearchStatus; query: SearchQuery }>()
defineEmits<{ retry: [] }>()

const { t } = useI18n()

const route = computed(() => [props.query.depart, props.query.arrivee].filter(Boolean).join(' → '))

const panel = 'rounded-card border border-line bg-surface p-6 text-center'
</script>

<template>
  <div v-if="status === 'loading'" data-state="loading" aria-busy="true" class="grid gap-4">
    <p class="sr-only" role="status">{{ t('search.states.loading') }}</p>
    <div
      v-for="n in 3"
      :key="n"
      data-skeleton
      aria-hidden="true"
      class="min-h-44 rounded-card border border-line bg-sand motion-safe:animate-pulse"
    />
  </div>

  <div v-else-if="status === 'empty'" data-state="empty" role="status" :class="panel">
    <p class="font-display text-xl font-bold text-ink">
      {{ route ? t('search.states.empty.title', { route }) : t('search.states.empty.titleAny') }}
    </p>
    <p class="mx-auto mt-2 max-w-prose text-ink-muted">{{ t('search.states.empty.text') }}</p>
  </div>

  <div v-else-if="status === 'error'" data-state="error" role="status" :class="panel">
    <p class="font-display text-xl font-bold text-ink">{{ t('search.states.error.title') }}</p>
    <p class="mt-2 text-ink-muted">{{ t('search.states.error.text') }}</p>
    <button
      type="button"
      class="mt-5 inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-btn bg-primary px-5 text-sm font-semibold text-white shadow-brand transition-[color,background-color,transform] duration-micro ease-dony hover:bg-primary-hover active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      @click="$emit('retry')"
    >{{ t('search.states.error.retry') }}</button>
  </div>

  <div v-else-if="status === 'rate-limited'" data-state="rate-limited" role="status" :class="panel">
    <p class="font-display text-xl font-bold text-ink">{{ t('search.states.rateLimited.title') }}</p>
    <p class="mt-2 text-ink-muted">{{ t('search.states.rateLimited.text') }}</p>
  </div>
</template>
