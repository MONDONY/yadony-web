<script setup lang="ts">
import type { JourneyStep } from '@/lib/journeys'

// Scène d'un parcours : à gauche les étapes (HTML lisible sans JS), à droite
// le visuel de l'étape active, épinglé sur grand écran. Sur téléphone,
// chaque étape porte son visuel, animé à son entrée à l'écran.
defineProps<{
  steps: JourneyStep[]
  texts: Array<{ title: string; text: string }>
  label: string
  stepLabel: (n: number) => string
  actorLabel?: (actor: JourneyStep['actor']) => string
}>()

const actorTone = {
  traveler: 'bg-accent-soft text-accent-text',
  sender: 'bg-primary-soft text-primary',
  both: 'bg-success/10 text-success',
} as const
</script>

<template>
  <UiScrollScene :count="steps.length" :label="label">
    <template #step="{ index, active }">
      <div
        class="border-l-4 pl-5 transition-colors duration-slow ease-dony lg:max-w-md"
        :class="active ? 'border-primary' : 'border-line'"
      >
        <p class="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span class="rounded-pill bg-ink px-3 py-1 text-white tabular-nums">{{ stepLabel(index + 1) }}</span>
          <span v-if="actorLabel" class="rounded-pill px-3 py-1" :class="actorTone[steps[index]!.actor]">{{ actorLabel(steps[index]!.actor) }}</span>
        </p>
        <h3 class="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl">{{ texts[index]?.title }}</h3>
        <p class="mt-3 text-lg text-ink-muted">{{ texts[index]?.text }}</p>
      </div>
    </template>
    <template #visual="{ active, mobile }">
      <JourneyVisualInView v-if="mobile" :step="steps[active]!" />
      <!-- Grand écran : tous les visuels empilés, seul l'actif est visible. -->
      <div v-else class="relative h-full w-full">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="absolute inset-0 flex items-center justify-center transition-[opacity,scale] duration-slow ease-dony"
          :class="index === active ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'"
        >
          <JourneyVisual :step="step" :active="index === active" />
        </div>
      </div>
    </template>
  </UiScrollScene>
</template>
