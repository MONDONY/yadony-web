<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Locale } from '@/lib/locale'
import { betaTesting } from '@/lib/site'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const open = ref(false)

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
  { to: '/billets-avion', label: t('nav.flights') },
  { to: '/comment-ca-marche', label: t('nav.howItWorks') },
  { to: '/tarifs', label: t('nav.pricing') },
  { to: '/securite', label: t('nav.trust') },
])
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
    <BetaBanner v-if="betaTesting" />
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

        <!-- Six liens ne tiennent sur une ligne qu'à partir de 1280 px (xl) ;
             en dessous, ils passent dans le menu déroulant. -->
        <nav class="hidden items-center gap-7 xl:flex" :aria-label="t('nav.mainLabel')">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="localePath(link.to)"
            class="text-sm font-medium text-ink-muted transition-colors duration-micro ease-dony hover:text-ink"
            active-class="!text-primary"
          >{{ link.label }}</NuxtLink>
        </nav>

        <div class="flex items-center gap-3">
          <LanguageSwitcher :href="switchHref" :target-locale="targetLocale" :label="switchLabel" />
          <UiButton :to="`${localePath('/')}#telecharger`" variant="accent" class="hidden sm:inline-flex">
            {{ t('nav.download') }}
          </UiButton>
          <button
            type="button"
            class="min-h-11 rounded-btn border border-line px-4 text-sm font-medium transition-colors duration-micro ease-dony hover:bg-sand xl:hidden"
            :aria-expanded="open"
            aria-controls="menu-mobile"
            @click="open = !open"
          >{{ t('nav.menu') }}</button>
        </div>
      </div>

      <nav v-show="open" id="menu-mobile" class="grid gap-1 border-t border-line py-4 xl:hidden" :aria-label="t('nav.mobileLabel')">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="localePath(link.to)"
          class="flex min-h-11 items-center rounded-el px-3 font-medium text-ink transition-colors duration-micro ease-dony hover:bg-sand"
          active-class="bg-primary-soft !text-primary"
          @click="open = false"
        >{{ link.label }}</NuxtLink>
      </nav>
    </UiContainer>
  </header>
</template>
