<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { renderLegalArticles } from '@/lib/legal'

// Page publique exigée par Google Play : l'utilisateur doit pouvoir demander
// la suppression de son compte et de ses données sans l'application.
// L'ancienne adresse /legal/account-deletion y est redirigée (public/_redirects).
defineI18nRoute({ paths: { fr: '/suppression-compte', en: '/delete-account' } })

const { t, tm, rt, locale } = useI18n()
const route = useRoute()
const p = useLocalePath()

useSeoMeta(
  buildSeoMeta({
    title: t('legal.suppressionCompte.seo.title'),
    description: t('legal.suppressionCompte.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

const articles = computed(() =>
  renderLegalArticles(tm('legal.suppressionCompte.articles') as unknown[], (message) =>
    rt(message as never),
  ),
)
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <h1 class="max-w-[22ch] text-display-xl">{{ t('legal.suppressionCompte.title') }}</h1>
      <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t('legal.suppressionCompte.intro') }}</p>

      <ProseBlock class="mt-12">
        <template v-for="article in articles" :key="article.title">
          <h2>{{ article.title }}</h2>
          <template v-for="(block, index) in article.blocks" :key="index">
            <h3 v-if="block.sub">{{ block.sub }}</h3>
            <p v-for="paragraph in block.p" :key="paragraph">{{ paragraph }}</p>
            <ul v-if="block.ul.length">
              <li v-for="item in block.ul" :key="item">{{ item }}</li>
            </ul>
          </template>
        </template>
        <p>
          <NuxtLink
            :to="p('/confidentialite')"
            class="font-semibold text-ink underline underline-offset-2 hover:text-accent-hover"
          >{{ t('legal.suppressionCompte.privacyLink') }}</NuxtLink>
        </p>
      </ProseBlock>
    </UiContainer>
  </UiSection>
</template>
