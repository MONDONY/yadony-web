<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { LegalTocEntry } from '@/lib/legal'

// Mise en page commune des textes légaux (CGU, confidentialité, mentions
// légales, cookies, suppression de compte) : fil d'Ariane, titre, puis un
// sommaire à côté du texte. Le texte juridique lui-même arrive par le slot,
// tel quel ; chaque page pose un `id` sur ses titres de section, repris par le
// sommaire. Sans entrée, la page se rend sans sommaire.
defineProps<{
  title: string
  updated?: string
  toc: LegalTocEntry[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()

// Sur grand écran le sommaire est toujours déplié (colonne fixe) ; en dessous
// de lg (1024 px) il se replie derrière un bouton pour ne pas repousser le
// texte. La liste reste dans le HTML prérendu dans les deux cas.
const open = ref(false)
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <nav :aria-label="t('legal.layout.breadcrumb')" class="text-sm text-ink-muted">
        <ol class="flex list-none flex-wrap items-center gap-x-2 gap-y-1">
          <li><NuxtLink :to="localePath('/')" class="inline-flex min-h-11 items-center hover:text-ink">{{ t('legal.layout.home') }}</NuxtLink></li>
          <li aria-hidden="true">›</li>
          <li>{{ t('legal.layout.legal') }}</li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" class="font-semibold text-ink">{{ title }}</li>
        </ol>
      </nav>

      <h1 class="mt-6 max-w-[24ch] text-display-xl text-balance">{{ title }}</h1>
      <p v-if="updated" data-testid="legal-updated" class="mt-4 text-sm text-ink-muted">{{ updated }}</p>

      <div
        class="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8"
        :class="toc.length ? 'lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14' : ''"
      >
        <nav
          v-if="toc.length"
          :aria-label="t('legal.layout.toc')"
          class="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-8rem)] lg:self-start lg:overflow-y-auto"
        >
          <button
            type="button"
            class="flex min-h-11 w-full items-center justify-between gap-3 whitespace-nowrap rounded-btn border border-line px-4 text-sm font-semibold transition-[background-color,transform] duration-micro ease-dony hover:bg-sand active:scale-[0.98] lg:hidden"
            :aria-expanded="open"
            aria-controls="sommaire-legal"
            @click="open = !open"
          >
            <span>{{ t('legal.layout.tocToggle') }}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              class="size-4 shrink-0 transition-transform duration-micro ease-dony"
              :class="open ? 'rotate-180' : ''"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            ><path d="M5 8l5 5 5-5" /></svg>
          </button>
          <ol
            id="sommaire-legal"
            data-testid="legal-toc-list"
            class="mt-2 list-none gap-1 lg:mt-0 lg:block"
            :class="open ? 'grid' : 'hidden'"
          >
            <li v-for="entry in toc" :key="entry.id">
              <a
                :href="`#${entry.id}`"
                class="flex min-h-11 items-center rounded-el px-3 text-sm text-ink-muted transition-colors duration-micro ease-dony hover:bg-sand hover:text-ink"
                @click="open = false"
              >{{ entry.label }}</a>
            </li>
          </ol>
        </nav>

        <div class="min-w-0 [overflow-wrap:anywhere] [&_h2]:scroll-mt-24 [&_h2:first-child]:mt-0">
          <slot />
        </div>
      </div>
    </UiContainer>
  </UiSection>
</template>
