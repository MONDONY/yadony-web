<script setup lang="ts">
import { appScreen, type AppScreenId } from '@/lib/media'
import UiPicture from './UiPicture.vue'

// iPhone dessiné en CSS autour de captures de l'app. Les captures sont
// recadrées sous la barre d'état (scripts/images) : la barre est redessinée
// ici, identique sur tous les écrans. Plusieurs écrans se superposent et
// seul l'écran actif est visible (fondu de 320 ms, DonyDuration.slow).
// Rayons concentriques : extérieur 46 px = intérieur 36 px + 10 px de bord.
withDefaults(
  defineProps<{
    screens: AppScreenId[]
    alts: string[]
    active?: number
    eager?: boolean
    tone?: 'light' | 'dark'
    sizes?: string
  }>(),
  { active: 0, eager: false, tone: 'light', sizes: '(min-width: 1024px) 320px, 72vw' },
)
</script>

<template>
  <figure class="phone relative rounded-[46px] bg-navy-deep p-[10px] shadow-xl">
    <div class="relative overflow-hidden rounded-[36px] bg-surface">
      <div
        class="flex h-[10.5%] min-h-6 items-center justify-between px-[9%] text-[0.72em] font-semibold tabular-nums"
        :class="tone === 'dark' ? 'bg-[#141414] text-white' : 'bg-surface text-ink'"
        aria-hidden="true"
      >
        <span>9:41</span>
        <span class="flex items-center gap-1">
          <svg viewBox="0 0 18 12" class="h-[0.7em] w-auto" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2" width="3" height="10" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
          <svg viewBox="0 0 26 12" class="h-[0.7em] w-auto" fill="none" stroke="currentColor"><rect x="0.5" y="0.5" width="22" height="11" rx="3" /><rect x="2.5" y="2.5" width="16" height="7" rx="1.5" fill="currentColor" stroke="none" /><path d="M24.5 4v4" stroke-width="1.5" stroke-linecap="round" /></svg>
        </span>
      </div>
      <div class="relative">
        <div
          v-for="(id, index) in screens"
          :key="id"
          :data-screen="id"
          :data-active="index === active"
          :aria-hidden="index === active ? undefined : 'true'"
          class="transition-opacity duration-slow ease-dony"
          :class="[index === 0 ? 'relative' : 'absolute inset-0', index === active ? 'opacity-100' : 'opacity-0']"
        >
          <UiPicture
            :image="appScreen(id)"
            :alt="alts[index] ?? ''"
            :eager="eager && index === 0"
            :sizes="sizes"
            class="block [&_img]:h-auto [&_img]:w-full"
          />
        </div>
      </div>
    </div>
  </figure>
</template>
