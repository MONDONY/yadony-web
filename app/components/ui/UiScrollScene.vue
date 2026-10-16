<script setup lang="ts">
import { ref } from 'vue'
import { useScrollSteps } from '@/composables/useScrollSteps'

// Scène racontée au défilement. Sur grand écran, le visuel reste épinglé
// (position: sticky) pendant que les étapes défilent, et change d'état avec
// l'étape active. Sous 1024 px, chaque étape porte son propre visuel, animé
// à son entrée à l'écran. Les étapes sont du HTML ordinaire : tout le texte
// est lisible sans JS.
defineProps<{ count: number; label: string }>()

const steps = ref<Element[]>([])
const { active } = useScrollSteps(steps)

function register(index: number, el: unknown) {
  if (el) steps.value[index] = el as Element
}
</script>

<template>
  <div class="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
    <div class="order-2 hidden lg:block" aria-hidden="true">
      <div class="sticky top-[12vh] flex h-[76vh] items-center justify-center">
        <slot name="visual" :active="active" :mobile="false" />
      </div>
    </div>
    <ol class="order-1 list-none" :aria-label="label">
      <li
        v-for="(_, index) in count"
        :key="index"
        :ref="(el) => register(index, el)"
        class="scene-step py-10 lg:flex lg:min-h-[72vh] lg:items-center lg:py-0"
        :data-active="active === index"
        :aria-current="active === index ? 'step' : undefined"
      >
        <div class="w-full">
          <slot name="step" :index="index" :active="active === index" />
          <div class="mt-8 lg:hidden">
            <slot name="visual" :active="index" :mobile="true" />
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>
