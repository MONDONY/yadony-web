<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Role } from '@/lib/roles'

const props = defineProps<{ role: Role }>()
const { t, tm, rt } = useI18n()

// Un tutoriel filmé par parcours, lancé à la demande depuis l'onglet.
const tutorials: Record<Role, string> = {
  expediteur: 'tuto-envoyer-colis',
  voyageur: 'tuto-publier-trajet',
}

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
  <div
    :id="`panneau-${role}`"
    role="tabpanel"
    :aria-labelledby="`onglet-${role}`"
    class="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-10"
  >
    <ol class="divide-y divide-line border-y border-line lg:col-span-7">
      <li v-for="step in steps" :key="step.number" class="grid gap-3 py-8 sm:grid-cols-[5rem_1fr] sm:gap-8">
        <p class="font-display text-sm font-bold text-ink-muted tabular-nums">{{ step.number }}</p>
        <div>
          <h3 class="font-display text-xl font-semibold">{{ step.title }}</h3>
          <p class="mt-2 max-w-prose text-ink-muted">{{ step.text }}</p>
        </div>
      </li>
    </ol>

    <aside data-tutorial class="lg:col-span-5">
      <div class="mx-auto w-[260px] sm:w-[290px] lg:sticky lg:top-32">
        <h3 class="font-display text-lg font-semibold text-balance">{{ t(`howItWorks.${role}.video.title`) }}</h3>
        <p class="mt-1 text-sm text-ink-muted">{{ t(`howItWorks.${role}.video.duration`) }}</p>
        <UiPhoneVideoPlayer
          class="mt-5"
          :src="`/video/${tutorials[role]}.mp4`"
          :poster="`/video/${tutorials[role]}-poster.jpg`"
          :label="t(`howItWorks.${role}.video.label`)"
        />
      </div>
    </aside>
  </div>
</template>
