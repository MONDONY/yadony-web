<script setup lang="ts">
// Les trois façons de fixer son prix côté voyageur. Chaque carte se retourne
// pour montrer un exemple ; recto et verso sont tous deux dans le DOM, et en
// mouvement réduit l'exemple s'affiche sous le titre, sans rotation.
defineProps<{ modes: Array<{ title: string; example: string }>; flipped: boolean }>()
</script>

<template>
  <ul class="grid w-full max-w-md list-none gap-4">
    <li
      v-for="(mode, index) in modes"
      :key="mode.title"
      data-mode
      :data-flipped="flipped"
      class="flip-card h-24 [perspective:900px]"
    >
      <div
        class="flip-inner relative h-full transition-transform duration-page ease-dony [transform-style:preserve-3d]"
        :class="flipped ? '[transform:rotateY(180deg)] motion-reduce:[transform:none]' : ''"
        :style="{ transitionDelay: `${index * 120}ms` }"
      >
        <div class="absolute inset-0 flex items-center gap-4 rounded-card border border-line bg-surface px-5 shadow-sm [backface-visibility:hidden]">
          <span class="grid size-11 shrink-0 place-items-center rounded-btn bg-accent-soft font-display text-lg font-bold text-accent-text">{{ index + 1 }}</span>
          <span>
            <span class="block font-display text-lg font-bold text-ink">{{ mode.title }}</span>
            <span class="hidden text-sm text-ink-muted motion-reduce:block">{{ mode.example }}</span>
          </span>
        </div>
        <div class="absolute inset-0 flex flex-col justify-center rounded-card bg-primary px-5 text-white [backface-visibility:hidden] [transform:rotateY(180deg)] motion-reduce:hidden">
          <span class="text-sm font-semibold text-white">{{ mode.title }}</span>
          <span class="font-display text-base font-bold leading-snug sm:text-lg">{{ mode.example }}</span>
        </div>
      </div>
    </li>
  </ul>
</template>
