<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { buildSeoMeta } from '@/lib/seo'
import { LEGAL_CHANGES_EFFECTIVE_DATE, formatEffectiveDate, legalToc, renderLegalArticles } from '@/lib/legal'
import { contactEmail } from '@/lib/site'

defineI18nRoute({ paths: { fr: '/confidentialite', en: '/privacy' } })

const { t, tm, rt, locale } = useI18n()
const route = useRoute()

useSeoMeta(
  buildSeoMeta({
    title: t('legal.confidentialite.seo.title'),
    description: t('legal.confidentialite.seo.description'),
    path: route.path,
    locale: locale.value as 'fr' | 'en',
  }),
)

// Date d'entrée en vigueur des dernières modifications (constante unique de
// lib/legal.ts), ou le marqueur à compléter tant qu'elle n'est pas fixée.
const effectiveDate = computed(() =>
  formatEffectiveDate(LEGAL_CHANGES_EFFECTIVE_DATE, locale.value, t('legal.effectiveDatePending')),
)

const articles = computed(() =>
  renderLegalArticles(tm('legal.confidentialite.articles') as unknown[], (message) =>
    rt(message as never, { email: contactEmail, effectiveDate: effectiveDate.value }),
  ),
)

const toc = computed(() => legalToc(articles.value.map(article => article.title)))
</script>

<template>
  <LegalLayout :title="t('legal.confidentialite.title')" :toc="toc">
    <p class="max-w-prose text-lg text-ink-muted">{{ t('legal.confidentialite.intro') }}</p>

    <ProseBlock class="mt-12">
      <template v-for="(article, articleIndex) in articles" :key="article.title">
        <h2 :id="toc[articleIndex]?.id">{{ article.title }}</h2>
        <template v-for="(block, index) in article.blocks" :key="index">
          <h3 v-if="block.sub">{{ block.sub }}</h3>
          <p v-for="paragraph in block.p" :key="paragraph">{{ paragraph }}</p>
          <ul v-if="block.ul.length">
            <li v-for="item in block.ul" :key="item">{{ item }}</li>
          </ul>
        </template>
      </template>
    </ProseBlock>
  </LegalLayout>
</template>
