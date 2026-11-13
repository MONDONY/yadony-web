<script setup lang="ts">
import { computed } from 'vue'

// Frise de suivi du colis (Remis → En route → Arrivé → Livré), comme dans
// l'écran « Mes colis » de l'app. `progress` = index du dernier jalon atteint.
const props = defineProps<{ labels: string[]; progress: number }>()

const fill = computed(() => {
  const steps = Math.max(props.labels.length - 1, 1)
  return `${((Math.min(props.progress, steps) / steps) * 100).toFixed(2)}%`
})
</script>

<template>
  <div class="w-full max-w-md rounded-card bg-surface p-6 shadow-md">
    <div class="relative mx-4 h-1.5 rounded-full bg-line">
      <div
        data-fill
        class="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-page ease-dony"
        :style="{ width: fill }"
      />
      <svg
        data-glyph="parcel"
        viewBox="0 0 24 24"
        class="absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-page ease-dony"
        :style="{ left: fill }"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="4" fill="rgb(var(--accent))" />
        <rect x="10" y="5" width="4" height="14" fill="rgb(var(--primary))" />
      </svg>
    </div>
    <ol class="mt-6 grid list-none text-center text-xs font-semibold" :style="{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }">
      <li v-for="(label, index) in labels" :key="label" :data-done="index <= progress" class="flex flex-col items-center gap-2">
        <span
          class="grid size-7 place-items-center rounded-full border-2 transition-colors duration-base"
          :class="index <= progress ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-ink-muted'"
        >
          <svg v-if="index <= progress" viewBox="0 0 20 20" class="size-3.5" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m4 10.5 4 4 8-9" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </span>
        <span :class="index <= progress ? 'text-primary' : 'text-ink-muted'">{{ label }}</span>
      </li>
    </ol>
  </div>
</template>
