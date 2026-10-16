<script setup lang="ts">
// Négociation dans l'app : offre, contre-offre, ajustement, puis accord.
// Les bulles alternent entre l'expéditeur (gauche) et la voyageuse (droite)
// et apparaissent selon l'étape (0 à 3). Tout le texte est dans le DOM.
const props = defineProps<{
  sender: string
  traveler: string
  messages: [string, string, string]
  agreed: string
  step: number
}>()

const side = (index: number) => (index % 2 === 0 ? 'sender' : 'traveler')
</script>

<template>
  <div class="w-full max-w-sm rounded-sheet bg-surface p-5 shadow-lg">
    <div class="flex items-center justify-between text-sm font-semibold text-ink-muted">
      <span class="flex items-center gap-2">
        <span class="grid size-8 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">{{ props.sender.slice(0, 1) }}</span>
        {{ props.sender }}
      </span>
      <span class="flex items-center gap-2">
        {{ props.traveler }}
        <span class="grid size-8 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent-text">{{ props.traveler.slice(0, 1) }}</span>
      </span>
    </div>
    <ul class="mt-5 flex list-none flex-col gap-3">
      <li
        v-for="(message, index) in props.messages"
        :key="index"
        data-bubble
        :data-shown="props.step >= index"
        class="max-w-[78%] rounded-card px-4 py-3 text-[15px] font-semibold tabular-nums transition-[opacity,translate] duration-slow ease-dony"
        :class="[
          side(index) === 'sender' ? 'self-start rounded-bl-[6px] bg-primary text-white' : 'self-end rounded-br-[6px] bg-sand text-ink',
          props.step >= index ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        ]"
      >{{ message }}</li>
    </ul>
    <p
      data-agreed
      :data-shown="props.step >= 3"
      class="mt-5 flex items-center justify-center gap-2 rounded-pill bg-success/10 px-4 py-2.5 text-sm font-bold text-success transition-[opacity,scale] duration-slow ease-dony"
      :class="props.step >= 3 ? 'scale-100 opacity-100' : 'scale-90 opacity-0'"
    >
      <svg viewBox="0 0 20 20" class="size-4" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m4 10.5 4 4 8-9" stroke-linecap="round" stroke-linejoin="round" /></svg>
      {{ props.agreed }}
    </p>
  </div>
</template>
