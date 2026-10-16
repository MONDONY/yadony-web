<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useInView } from '@/composables/useInView'

// Apparition au défilement, en amélioration progressive : le HTML prérendu
// est visible tel quel (robots, visiteurs sans JS). L'état « hidden » n'est
// posé qu'au montage, et jamais si le visiteur demande moins d'animations.
const props = withDefaults(
  defineProps<{
    as?: string
    variant?: 'up' | 'scale' | 'fade' | 'left' | 'right'
    delay?: number
  }>(),
  { as: 'div', variant: 'up', delay: 0 },
)

const el = ref<HTMLElement | null>(null)
const { inView } = useInView(el, { once: true })
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const state = computed(() => {
  if (!mounted.value) return undefined
  return inView.value ? 'shown' : 'hidden'
})
</script>

<template>
  <component
    :is="props.as"
    ref="el"
    class="reveal"
    :class="`reveal-${props.variant}`"
    :data-state="state"
    :style="{ '--reveal-delay': `${props.delay}ms` }"
  >
    <slot />
  </component>
</template>
