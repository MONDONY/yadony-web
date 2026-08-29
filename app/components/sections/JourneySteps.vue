<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Role } from '@/lib/roles'

const props = defineProps<{ role: Role }>()
const { tm, rt } = useI18n()

const steps = computed(() =>
  (tm(`howItWorks.${props.role}.steps`) as unknown[]).map((raw, index) => {
    const entry = raw as { title: unknown; text: unknown }
    return {
      number: String(index + 1).padStart(2, '0'),
      title: rt(entry.title as never),
      text: rt(entry.text as never),
    }
  }),
)
</script>

<template>
  <ol
    :id="`panneau-${role}`"
    role="tabpanel"
    :aria-labelledby="`onglet-${role}`"
    class="mt-12 divide-y divide-line border-y border-line"
  >
    <li v-for="step in steps" :key="step.number" class="grid gap-3 py-8 sm:grid-cols-[5rem_1fr] sm:gap-8">
      <p class="font-display text-sm font-bold text-ink-muted tabular-nums">{{ step.number }}</p>
      <div>
        <h3 class="font-display text-xl font-semibold">{{ step.title }}</h3>
        <p class="mt-2 max-w-prose text-ink-muted">{{ step.text }}</p>
      </div>
    </li>
  </ol>
</template>
