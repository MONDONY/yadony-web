<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import type { Locale } from '@/lib/locale'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()
const open = ref(false)
const header = ref<HTMLElement | null>(null)
const menuButton = ref<HTMLButtonElement | null>(null)

// Le menu mobile se referme de lui-même dès que le visiteur passe à autre
// chose : Échap (le focus revient sur le bouton), un appui hors du header, un
// changement de page (retour arrière compris) ou un écran assez large pour
// afficher la navigation en ligne (lg, 1024 px).
function close(restoreFocus = false) {
  if (!open.value) return
  open.value = false
  if (restoreFocus) void nextTick(() => menuButton.value?.focus())
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close(true)
}

function onPointerDown(event: PointerEvent) {
  if (open.value && !header.value?.contains(event.target as Node)) close()
}

let wide: MediaQueryList | undefined
function onWideChange(event: MediaQueryListEvent) {
  if (event.matches) close()
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  wide = window.matchMedia?.('(min-width: 1024px)')
  wide?.addEventListener('change', onWideChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  wide?.removeEventListener('change', onWideChange)
})

watch(() => route.fullPath, () => close())

const targetLocale = computed<Locale>(() => (locale.value === 'fr' ? 'en' : 'fr'))
// Une page sans version dans l'autre langue (pages GP, en français seulement)
// renvoie vers l'accueil de cette langue.
const switchTarget = computed(() => switchLocalePath(targetLocale.value))
const switchHref = computed(() => switchTarget.value || localePath('/', targetLocale.value))
// Sans traduction de la page, le lien mène à l'accueil : son libellé le dit.
const switchLabel = computed(() =>
  t(switchTarget.value ? 'language.switchTo' : 'language.homeIn', { language: t(`language.${targetLocale.value}`) }),
)

const links = computed(() => [
  { to: '/envoyer-colis', label: t('nav.corridors') },
  { to: '/devenir-voyageur', label: t('nav.traveler') },
  { to: '/comment-ca-marche', label: t('nav.howItWorks') },
  { to: '/tarifs', label: t('nav.pricing') },
])
</script>

<template>
  <header ref="header" class="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur" @keydown="onKeydown">
    <UiContainer>
      <div class="flex h-16 items-center justify-between gap-6">
        <NuxtLink :to="localePath('/')" class="shrink-0">
          <img
            src="/logos/logo-yadony-480.webp"
            alt="Yadony"
            width="480"
            height="131"
            class="h-8 w-auto"
            loading="eager"
          >
        </NuxtLink>

        <!-- Quatre liens tiennent sur une ligne dès 1024 px (lg) ; en dessous,
             ils passent dans le menu déroulant. Sécurité et Billets d'avion
             restent joignables depuis le pied de page. -->
        <nav class="hidden items-center gap-7 lg:flex" :aria-label="t('nav.mainLabel')">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="localePath(link.to)"
            class="inline-flex min-h-11 items-center text-sm font-medium text-ink-muted transition-colors duration-micro ease-dony hover:text-ink"
            active-class="!text-primary"
          >{{ link.label }}</NuxtLink>
        </nav>

        <div class="flex items-center gap-3">
          <!-- Sur téléphone, le bouton de téléchargement prend la place du sélecteur
               de langue (repris dans le menu) : c'est l'une des premières choses
               visibles, à toute largeur. -->
          <LanguageSwitcher
            :href="switchHref"
            :target-locale="targetLocale"
            :label="switchLabel"
            class="hidden sm:inline-flex"
          />
          <UiButton :to="`${localePath('/')}#telecharger`" variant="accent" class="whitespace-nowrap !px-4 sm:!px-5">
            <span class="sm:hidden">{{ t('nav.downloadShort') }}</span>
            <span class="hidden sm:inline">{{ t('nav.download') }}</span>
          </UiButton>
          <button
            ref="menuButton"
            type="button"
            class="min-h-11 rounded-btn border border-line px-4 text-sm font-medium transition-[background-color,transform] duration-micro ease-dony hover:bg-sand active:scale-[0.96] lg:hidden"
            :aria-expanded="open"
            aria-controls="menu-mobile"
            @click="open = !open"
          >{{ t('nav.menu') }}</button>
        </div>
      </div>

      <!-- Le panneau se déplie en animant sa hauteur (grid 0fr → 1fr) : une
           transition, donc interrompable à tout moment. Fermé, il est `inert`
           et `invisible` : ses liens sortent de l'ordre de tabulation. Dans
           un téléphone en paysage, la liste défile au lieu de déborder de
           l'écran (le header est sticky). -->
      <div
        class="grid transition-[grid-template-rows,visibility] duration-base ease-dony lg:hidden"
        :class="open ? 'grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'"
        :inert="open ? undefined : true"
        data-testid="menu-mobile-panel"
      >
        <div class="min-h-0 overflow-hidden">
          <nav
            id="menu-mobile"
            class="grid max-h-[calc(100dvh-9rem)] gap-1 overflow-y-auto overscroll-contain border-t border-line py-4"
            :aria-label="t('nav.mobileLabel')"
          >
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="localePath(link.to)"
              class="flex min-h-11 items-center rounded-el px-3 font-medium text-ink transition-colors duration-micro ease-dony hover:bg-sand"
              active-class="bg-primary-soft !text-primary"
              @click="close()"
            >{{ link.label }}</NuxtLink>
            <a
              :href="switchHref"
              :hreflang="targetLocale"
              class="flex min-h-11 items-center rounded-el px-3 font-medium text-ink transition-colors duration-micro ease-dony hover:bg-sand sm:hidden"
            >{{ switchLabel }}</a>
          </nav>
        </div>
      </div>
    </UiContainer>
  </header>
</template>
