<script setup lang="ts">
import { donyPose, type DonyPoseId } from '@/lib/media'

// En-tête commun aux pages intérieures : fond sable, même vocabulaire que les
// pages parcours. Dony accompagne le titre quand la page lui donne une pose.
const props = defineProps<{
  title: string
  lead?: string
  pose?: DonyPoseId
  poseAlt?: string
}>()

const image = props.pose ? donyPose(props.pose) : null
</script>

<template>
  <section class="overflow-hidden bg-sand">
    <UiContainer>
      <div class="grid items-center gap-8 py-14 sm:py-20 lg:grid-cols-12">
        <UiReveal class="lg:col-span-8">
          <h1 class="max-w-[22ch] text-display-xl text-balance">{{ title }}</h1>
          <p v-if="lead" class="mt-6 max-w-prose text-lg text-ink-muted text-pretty">{{ lead }}</p>
          <slot />
        </UiReveal>
        <UiReveal v-if="image" variant="scale" :delay="120" class="hidden justify-self-center lg:col-span-4 lg:block">
          <UiPicture
            :image="image"
            :alt="poseAlt ?? ''"
            sizes="240px"
            eager
            class="animate-float w-52 xl:w-60 [&_img]:h-auto [&_img]:w-full"
          />
        </UiReveal>
      </div>
    </UiContainer>
  </section>
</template>
