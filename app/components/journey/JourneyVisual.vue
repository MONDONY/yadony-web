<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSequence } from '@/composables/useSequence'
import { useTexts } from '@/composables/useTexts'
import { donyPose } from '@/lib/media'
import type { JourneyStep } from '@/lib/journeys'

// Visuel d'une étape de parcours : un téléphone avec un ou plusieurs écrans
// de l'app, ou une illustration animée. `active` lance l'animation (tracé,
// bulles, jalons) ; une pose de Dony accompagne l'étape quand elle en a une.
const props = defineProps<{ step: JourneyStep; active: boolean; eager?: boolean }>()

const { t } = useI18n()
const { list, items } = useTexts()
const active = toRef(props, 'active')

const screens = computed(() => [props.step.screen ?? []].flat())
const { index: screenIndex } = useSequence(active, Math.max(screens.value.length, 1), 2600)
const { index: negotiationStep } = useSequence(active, 4, 900)
const { index: timelineStep } = useSequence(active, 4, 800)

const alts = computed(() => screens.value.map(id => t(`journeys.screens.${id}`)))
const art = 'landing.crossed.art'
</script>

<template>
  <div class="relative flex w-full justify-center">
    <div v-if="screens.length" class="w-[240px] sm:w-[270px] lg:[@media(max-height:860px)]:w-[200px]">
      <UiPhone
        :screens="screens"
        :alts="alts"
        :active="screens.length > 1 ? screenIndex : 0"
        :eager="eager"
        :tone="screens[0] === 'scan' ? 'dark' : 'light'"
        sizes="270px"
      />
    </div>
    <ArtPriceCurve
      v-else-if="step.art === 'priceCurve'"
      :drawn="active"
      :threshold="t(`${art}.priceCurve.threshold`)"
      :notification="t(`${art}.priceCurve.notification`)"
      :detail="t(`${art}.priceCurve.detail`)"
    />
    <ArtPriceModes
      v-else-if="step.art === 'priceModes'"
      :modes="items<{ title: string; example: string }>(`${art}.priceModes`)"
      :flipped="active"
    />
    <ArtNegotiation
      v-else-if="step.art === 'negotiation'"
      :sender="t(`${art}.negotiation.sender`)"
      :traveler="t(`${art}.negotiation.traveler`)"
      :messages="list(`${art}.negotiation.messages`) as [string, string, string]"
      :agreed="t(`${art}.negotiation.agreed`)"
      :step="negotiationStep"
    />
    <ArtPadlock
      v-else-if="step.art === 'padlock'"
      :locked="true"
      :amount="t(`${art}.padlock.amount`)"
      :caption="t(`${art}.padlock.locked`)"
    />
    <div v-else-if="step.art === 'route'" class="w-full max-w-md rounded-sheet bg-surface p-6 shadow-lg">
      <ArtRouteLine :from="t(`${art}.route.from`)" :to="t(`${art}.route.to`)" :drawn="active" />
    </div>
    <div v-else-if="step.art === 'timeline'" class="flex w-full max-w-md flex-col items-center gap-6">
      <ArtTrackingTimeline :labels="list(`${art}.timeline`)" :progress="timelineStep" />
      <ArtPadlock
        :locked="timelineStep < 3"
        :amount="t(`${art}.padlock.amount`)"
        :caption="timelineStep < 3 ? t(`${art}.padlock.locked`) : t(`${art}.padlock.released`)"
      />
    </div>

    <UiPicture
      v-if="step.pose"
      :image="donyPose(step.pose)"
      alt=""
      sizes="128px"
      class="animate-float pointer-events-none absolute -bottom-10 right-0 w-16 sm:-bottom-4 sm:-right-2 sm:w-28 lg:-right-6 [&_img]:h-auto [&_img]:w-full"
    />
  </div>
</template>
