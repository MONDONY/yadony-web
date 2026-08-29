# Site vitrine yadony.com — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire le site public `yadony.com` — vitrine bilingue FR/EN, entièrement prérendue, orientée acquisition SEO, présentant l'application mobile dony.

**Architecture:** Nuxt 4 en mode génération statique (`nuxt generate`), Tailwind CSS pour le style, `@nuxtjs/i18n` pour le bilinguisme (français à la racine, anglais sous `/en`), aucune librairie de composants UI. Toute la logique métier (SEO, tarifs, routage de langue, onglets) est extraite dans des fonctions pures testables ; les composants Vue restent presque exclusivement présentationnels. Déploiement statique sur Cloudflare Pages.

**Tech Stack:** Nuxt 4.5, Vue 3.5, TypeScript strict, Tailwind CSS 3 (`@nuxtjs/tailwindcss` 6.x), `@nuxtjs/i18n` 10.x, `@nuxtjs/sitemap` 7.x, Vitest + `@vue/test-utils` + happy-dom, Playwright + axe-core, pnpm, Node 22.

**Spec:** `docs/superpowers/specs/2026-08-29-yadony-web-design.md`

---

## Global Constraints

Ces règles s'appliquent à **toutes** les tâches. Chaque tâche les hérite implicitement.

- **Gestionnaire de paquets : `pnpm`.** Jamais `npm` ni `yarn`. Node 22 (fichier `.nvmrc`).
- **Aucune librairie de composants UI** — ni Nuxt UI, ni shadcn-vue, ni DaisyUI, ni Radix. Les primitives sont écrites à la main. Cette règle vient directement de la contrainte « le site ne doit pas ressembler à une production d'IA ».
- **Aucun texte visible en dur dans un composant `.vue`.** Tout passe par `i18n/locales/fr.json` et `i18n/locales/en.json`. Un composant qui contient une chaîne française littérale est un bug.
- **Aucun lorem ipsum.** Le contenu de remplissage est du texte français réaliste et cohérent avec le produit.
- **Chiffres du produit, à utiliser tels quels :** commission **12 %**, valeur maximale déclarée **500 €**, corridors **Paris, Lyon, Marseille → Dakar, Abidjan, Bamako, Douala**.
- **Couleurs** (issues de `dony_app/lib/core/design/tokens/color_tokens.dart`) : primaire `#0B5FFF`, accent terracotta `#D96A3A`, sable `#F7F3ED`, encre `#0A2540`, texte secondaire `#54504A`, bordure `#E8E5DF`, blanc `#FFFFFF`.
- **Typographie :** titres en Hanken Grotesk, texte courant en Plus Jakarta Sans, auto-hébergées en `woff2`. Jamais de CDN Google Fonts.
- **Terracotta : une seule occurrence par écran maximum.** C'est un accent, pas une couleur de remplissage.
- **Interdits visuels :** hero centré suivi de trois cartes icône/titre/texte, dégradés violet-bleu, effets de lueur, icônes dans un rond pastel, ombres portées molles génériques, photos de banque d'images, formules creuses (« Simple, rapide, sécurisé », « Rejoignez des milliers d'utilisateurs »), chiffres inventés.
- **Animations :** 150 à 250 ms, désactivées sous `prefers-reduced-motion: reduce`. Sans exception.
- **Aucune mise en page ne doit provoquer de défilement horizontal du `body`.** Les blocs larges défilent dans leur propre conteneur `overflow-x: auto`.
- **Couverture de tests : seuils Vitest à 90 %** sur `app/composables/**` et `app/lib/**`. Les pages et les composants purement présentationnels sont exclus de la couverture (configuré en Tâche 1).
- **Git :** jamais de commit direct sur `main`, jamais de ligne `Co-Authored-By` dans un message de commit. Format Conventional Commits.
- **TDD :** le test est écrit et vu échouer avant l'implémentation. Chaque tâche se termine par un commit.

---

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `nuxt.config.ts` | Modules, prérendu, `head` global, configuration i18n |
| `tailwind.config.ts` | Tokens de couleur, familles de police, rayons |
| `app/assets/css/tokens.css` | Variables CSS de couleur |
| `app/assets/css/fonts.css` | Déclarations `@font-face` |
| `app/assets/css/main.css` | Base Tailwind, styles globaux, `prefers-reduced-motion` |
| `app/lib/ui-types.ts` | Types partagés entre composants (`AccordionItem`) |
| `app/lib/seo.ts` | `buildSeoMeta()` — fonction pure, construit les métadonnées d'une page |
| `app/lib/locale.ts` | `localizedPath()`, `alternateLinks()` — fonctions pures de routage de langue |
| `app/lib/pricing.ts` | `computeQuote()` — fonction pure, calcul de l'exemple tarifaire |
| `app/lib/roles.ts` | `resolveRole()` — fonction pure, lit le rôle depuis la query string |
| `app/lib/structured-data.ts` | `organizationJsonLd()`, `mobileAppJsonLd()`, `faqJsonLd()` — fonctions pures |
| `app/components/ui/UiButton.vue` | Bouton et lien stylés, variantes `primary`/`ghost` |
| `app/components/ui/UiSection.vue` | Section de page avec fond blanc ou sable et rythme vertical |
| `app/components/ui/UiContainer.vue` | Conteneur de largeur maximale |
| `app/components/ui/UiAccordion.vue` | Accordéon basé sur `<details>` natif |
| `app/components/ui/UiRevealOnScroll.vue` | Animation d'entrée via `IntersectionObserver` |
| `app/components/layout/SiteHeader.vue` | Navigation principale, sélecteur de langue |
| `app/components/layout/SiteFooter.vue` | Liens légaux, contact, stores |
| `app/components/sections/*.vue` | Un fichier par bloc de page |
| `app/layouts/default.vue` | Assemble header, `<slot/>`, footer |
| `app/pages/*.vue` | Neuf pages, chacune ne fait qu'assembler des sections |
| `i18n/locales/fr.json`, `en.json` | Tout le contenu textuel |
| `tests/unit/**` | Vitest |
| `tests/e2e/**` | Playwright |

---

## Tâche 1 : Initialisation du projet et harnais de test

**Files:**
- Create: `package.json`, `nuxt.config.ts`, `tsconfig.json`, `.nvmrc`, `.gitignore`, `eslint.config.mjs`, `vitest.config.ts`, `tests/setup.ts`, `app/app.vue`, `app/pages/index.vue`, `tests/unit/smoke.spec.ts`

**Interfaces:**
- Consumes: rien.
- Produces: un projet Nuxt 4 qui démarre, se génère en statique, et une commande `pnpm test` qui exécute Vitest avec les seuils de couverture à 90 %.

- [ ] **Step 1: Créer le projet et installer les dépendances**

Depuis la racine du worktree :

```bash
pnpm dlx nuxi@latest init . --force --package-manager pnpm --no-install --no-gitInit
pnpm add nuxt@^4.5.2 vue@^3.5.34 vue-router@^5.0.6
pnpm add -D @nuxt/eslint @nuxtjs/tailwindcss@^6.14.0 typescript @types/node
pnpm add -D vitest @vitest/coverage-v8 @vue/test-utils @vitejs/plugin-vue happy-dom
pnpm install
```

Écrire `.nvmrc` avec le contenu `22`.

- [ ] **Step 2: Écrire `nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  compatibilityDate: '2026-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxtjs/tailwindcss'],
  components: [{ path: '~/components', pathPrefix: false }],
  typescript: { strict: true, typeCheck: false },
  ssr: true,
  css: ['~/assets/css/main.css'],
  nitro: {
    prerender: { crawlLinks: true, routes: ['/'], failOnError: true },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
})
```

- [ ] **Step 3: Écrire `vitest.config.ts`**

Calqué sur `dony-admin/vitest.config.ts`, avec la couverture restreinte au code logique.

```ts
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg', '**/*.webp'],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    exclude: ['node_modules/**', '.nuxt/**', '.output/**', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      all: true,
      include: ['app/lib/**/*.ts', 'app/composables/**/*.ts'],
      exclude: ['**/*.d.ts'],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
})
```

`tests/setup.ts` :

```ts
import { config } from '@vue/test-utils'

config.global.stubs = {
  NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
  ClientOnly: { template: '<slot />' },
}
```

- [ ] **Step 4: Ajouter les scripts dans `package.json`**

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "lint": "eslint .",
    "typecheck": "nuxi typecheck",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

- [ ] **Step 5: Écrire un test de fumée qui échoue**

`tests/unit/smoke.spec.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { siteName } from '@/lib/site'

describe('site metadata', () => {
  it('expose le nom du site', () => {
    expect(siteName).toBe('yadony')
  })
})
```

- [ ] **Step 6: Lancer le test et vérifier qu'il échoue**

Commande : `pnpm test`
Attendu : ÉCHEC, `Failed to resolve import "@/lib/site"`.

- [ ] **Step 7: Implémenter le minimum**

`app/lib/site.ts` :

```ts
export const siteName = 'yadony'
export const siteUrl = 'https://yadony.com'
export const contactEmail = 'contact@yadony.com'
```

- [ ] **Step 8: Lancer le test et vérifier qu'il passe**

Commande : `pnpm test`
Attendu : SUCCÈS, 1 test.

- [ ] **Step 9: Vérifier que le projet se génère**

Créer `app/app.vue` :

```vue
<template>
  <NuxtPage />
</template>
```

Créer `app/pages/index.vue` :

```vue
<template>
  <main>
    <h1>yadony</h1>
  </main>
</template>
```

Commande : `pnpm generate`
Attendu : succès, `.output/public/index.html` existe et contient `yadony`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: initialiser le projet Nuxt 4 avec Vitest et Tailwind"
```

---

## Tâche 2 : Design system — tokens, polices, configuration Tailwind

**Files:**
- Create: `app/assets/css/tokens.css`, `app/assets/css/fonts.css`, `app/assets/css/main.css`, `tailwind.config.ts`, `public/fonts/` (deux `woff2`)
- Modify: `nuxt.config.ts`

**Interfaces:**
- Consumes: le projet de la Tâche 1.
- Produces: les classes Tailwind `bg-sand`, `text-ink`, `text-primary`, `bg-primary`, `text-terra`, `border-line`, `font-display`, `font-sans`, `rounded-card` disponibles dans tout le projet.

- [ ] **Step 1: Récupérer les polices et les copier dans `public/fonts`**

```bash
pnpm add -D @fontsource-variable/hanken-grotesk @fontsource-variable/plus-jakarta-sans
mkdir -p public/fonts
cp node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2 public/fonts/
cp node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2 public/fonts/
ls -la public/fonts
```

Attendu : les deux fichiers `.woff2` sont présents. On les copie plutôt que d'importer le CSS des paquets afin d'avoir des URL stables pour le préchargement.

- [ ] **Step 2: Écrire `app/assets/css/fonts.css`**

```css
@font-face {
  font-family: 'Hanken Grotesk';
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url('/fonts/hanken-grotesk-latin-wght-normal.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+2000-206F, U+20AC, U+2122;
}

@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-display: swap;
  font-weight: 200 800;
  src: url('/fonts/plus-jakarta-sans-latin-wght-normal.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+2000-206F, U+20AC, U+2122;
}
```

- [ ] **Step 3: Écrire `app/assets/css/tokens.css`**

```css
:root {
  --primary: 11 95 255;
  --primary-hover: 10 77 217;
  --terra: 217 106 58;
  --ink: 10 37 64;
  --ink-muted: 84 80 74;
  --sand: 247 243 237;
  --sand-deep: 237 230 216;
  --line: 232 229 223;
  --surface: 255 255 255;
  --success: 12 122 84;
}
```

- [ ] **Step 4: Écrire `app/assets/css/main.css`**

```css
@import './fonts.css';
@import './tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-surface text-ink font-sans antialiased;
    text-rendering: optimizeLegibility;
  }
  h1, h2, h3 {
    @apply font-display tracking-tight;
    text-wrap: balance;
  }
  p {
    text-wrap: pretty;
  }
  :focus-visible {
    @apply outline-2 outline-offset-2 outline-primary;
  }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 5: Écrire `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          hover: 'rgb(var(--primary-hover) / <alpha-value>)',
        },
        terra: 'rgb(var(--terra) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
        },
        sand: {
          DEFAULT: 'rgb(var(--sand) / <alpha-value>)',
          deep: 'rgb(var(--sand-deep) / <alpha-value>)',
        },
        line: 'rgb(var(--line) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2rem, 4.5vw, 3.25rem)', { lineHeight: '1.06', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      borderRadius: { card: '18px', el: '12px' },
      maxWidth: { content: '1200px', prose: '68ch' },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 6: Précharger la police des titres dans `nuxt.config.ts`**

Ajouter dans `app.head.link`, à la suite de l'entrée `favicon` :

```ts
{
  rel: 'preload',
  as: 'font',
  type: 'font/woff2',
  href: '/fonts/hanken-grotesk-latin-wght-normal.woff2',
  crossorigin: 'anonymous',
},
```

- [ ] **Step 7: Vérifier visuellement**

Remplacer temporairement `app/pages/index.vue` par :

```vue
<template>
  <main class="bg-sand min-h-screen p-10">
    <h1 class="text-display-xl text-ink">Envoyer, sans intermédiaire</h1>
    <p class="text-ink-muted mt-4">Commission de <span class="text-terra font-semibold">12 %</span>.</p>
  </main>
</template>
```

Commande : `pnpm dev` puis ouvrir `http://localhost:3000`
Attendu : fond sable, titre en Hanken Grotesk très serré, « 12 % » en terracotta. Vérifier dans l'onglet réseau que les `woff2` sont chargés depuis `/fonts/`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: design system, tokens de couleur et polices auto-hébergées"
```

---

## Tâche 3 : Primitives UI

**Files:**
- Create: `app/components/ui/UiContainer.vue`, `app/components/ui/UiSection.vue`, `app/components/ui/UiButton.vue`, `app/components/ui/UiAccordion.vue`, `app/components/ui/UiRevealOnScroll.vue`
- Test: `tests/unit/components/UiButton.spec.ts`, `tests/unit/components/UiAccordion.spec.ts`

**Interfaces:**
- Consumes: les classes Tailwind de la Tâche 2.
- Produces:
  - `<UiContainer>` — `<div>` centré, `max-w-content`, padding horizontal responsive.
  - `<UiSection tone="white" | "sand">` — `<section>` avec rythme vertical et fond.
  - `<UiButton variant="primary" | "ghost" size="md" | "lg" to?="/path" href?="https://…">` — rend un `<NuxtLink>` si `to`, un `<a>` si `href`, sinon un `<button>`.
  - `<UiAccordion :items="[{ id, question, answer }]">` — liste de `<details>`.
  - `<UiRevealOnScroll>` — enveloppe son slot et lui ajoute la classe `is-visible` quand il entre dans le viewport.

- [ ] **Step 1: Écrire les tests qui échouent**

`tests/unit/components/UiButton.spec.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiButton from '@/components/ui/UiButton.vue'

describe('UiButton', () => {
  it('rend un bouton natif par défaut', () => {
    const wrapper = mount(UiButton, { slots: { default: 'Envoyer' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.text()).toBe('Envoyer')
  })

  it('rend un lien interne quand `to` est fourni', () => {
    const wrapper = mount(UiButton, { props: { to: '/tarifs' }, slots: { default: 'Tarifs' } })
    expect(wrapper.find('a').attributes('href')).toBe('/tarifs')
  })

  it('rend un lien externe sécurisé quand `href` est fourni', () => {
    const wrapper = mount(UiButton, {
      props: { href: 'https://apps.apple.com/app/id0000000000' },
      slots: { default: 'App Store' },
    })
    const anchor = wrapper.find('a')
    expect(anchor.attributes('href')).toBe('https://apps.apple.com/app/id0000000000')
    expect(anchor.attributes('rel')).toBe('noopener noreferrer')
    expect(anchor.attributes('target')).toBe('_blank')
  })

  it('applique la variante ghost', () => {
    const wrapper = mount(UiButton, { props: { variant: 'ghost' }, slots: { default: 'En savoir plus' } })
    expect(wrapper.classes().join(' ')).toContain('border-line')
  })
})
```

`tests/unit/components/UiAccordion.spec.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiAccordion from '@/components/ui/UiAccordion.vue'

const items = [
  { id: 'delai', question: 'Combien de temps prend une livraison ?', answer: 'Entre 2 et 7 jours.' },
  { id: 'prix', question: 'Combien coûte un envoi ?', answer: 'Le voyageur fixe son prix au kilo.' },
]

describe('UiAccordion', () => {
  it('rend un élément details par question', () => {
    const wrapper = mount(UiAccordion, { props: { items } })
    expect(wrapper.findAll('details')).toHaveLength(2)
  })

  it('affiche question et réponse', () => {
    const wrapper = mount(UiAccordion, { props: { items } })
    expect(wrapper.text()).toContain('Combien de temps prend une livraison ?')
    expect(wrapper.text()).toContain('Entre 2 et 7 jours.')
  })

  it('rend toutes les réponses dans le DOM pour rester indexable', () => {
    const wrapper = mount(UiAccordion, { props: { items } })
    expect(wrapper.findAll('details p')).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Lancer les tests et vérifier qu'ils échouent**

Commande : `pnpm test`
Attendu : ÉCHEC, `Failed to resolve import "@/components/ui/UiButton.vue"`.

- [ ] **Step 3: Implémenter `UiContainer.vue`**

```vue
<template>
  <div class="mx-auto w-full max-w-content px-5 sm:px-8 lg:px-12">
    <slot />
  </div>
</template>
```

- [ ] **Step 4: Implémenter `UiSection.vue`**

```vue
<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'white' | 'sand' }>(), { tone: 'white' })
</script>

<template>
  <section
    class="border-t border-line py-20 sm:py-28"
    :class="tone === 'sand' ? 'bg-sand' : 'bg-surface'"
  >
    <slot />
  </section>
</template>
```

Le liseré `border-t border-line` remplace les ombres portées : c'est la séparation nette prévue par la spec.

- [ ] **Step 5: Implémenter `UiButton.vue`**

```vue
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost'
    size?: 'md' | 'lg'
    to?: string
    href?: string
  }>(),
  { variant: 'primary', size: 'md' },
)

const base =
  'inline-flex items-center justify-center gap-2 rounded-el font-semibold ' +
  'transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  ghost: 'border border-line text-ink hover:bg-sand',
} as const

const sizes = { md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' } as const

const classes = [base, variants[props.variant], sizes[props.size]].join(' ')
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="classes"><slot /></NuxtLink>
  <a
    v-else-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :class="classes"
  ><slot /></a>
  <button v-else type="button" :class="classes"><slot /></button>
</template>
```

- [ ] **Step 6: Implémenter `UiAccordion.vue`**

Créer d'abord `app/lib/ui-types.ts` — un bloc `<script setup>` ne peut rien exporter, le type doit donc vivre dans un fichier à part pour être importable par les consommateurs :

```ts
export interface AccordionItem {
  id: string
  question: string
  answer: string
}
```

Puis `app/components/ui/UiAccordion.vue` :

```vue
<script setup lang="ts">
import type { AccordionItem } from '@/lib/ui-types'

defineProps<{ items: AccordionItem[] }>()
</script>

<template>
  <div class="divide-y divide-line border-y border-line">
    <details v-for="item in items" :key="item.id" class="group py-5">
      <summary
        class="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-semibold"
      >
        {{ item.question }}
        <span
          aria-hidden="true"
          class="shrink-0 text-ink-muted transition-transform duration-150 group-open:rotate-45"
        >+</span>
      </summary>
      <p class="mt-3 max-w-prose text-ink-muted">{{ item.answer }}</p>
    </details>
  </div>
</template>
```

Les réponses sont dans le DOM même repliées : `<details>` reste indexable par Google, ce qui est le but recherché.

- [ ] **Step 7: Implémenter `UiRevealOnScroll.vue`**

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const root = ref<HTMLElement | null>(null)
const visible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || typeof IntersectionObserver === 'undefined') {
    visible.value = true
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visible.value = true
          observer?.disconnect()
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  )
  if (root.value) observer.observe(root.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    ref="root"
    class="transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none"
    :class="visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'"
  >
    <slot />
  </div>
</template>
```

- [ ] **Step 8: Lancer les tests et vérifier qu'ils passent**

Commande : `pnpm test`
Attendu : SUCCÈS, 7 tests.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: primitives UI conteneur, section, bouton, accordeon et reveal"
```

---

## Tâche 4 : Logique pure — SEO, routage de langue, données structurées

**Files:**
- Create: `app/lib/seo.ts`, `app/lib/locale.ts`, `app/lib/structured-data.ts`
- Test: `tests/unit/lib/seo.spec.ts`, `tests/unit/lib/locale.spec.ts`, `tests/unit/lib/structured-data.spec.ts`

**Interfaces:**
- Consumes: `siteName`, `siteUrl` de `app/lib/site.ts` (Tâche 1).
- Produces:
  - `buildSeoMeta(input: SeoInput): SeoMeta` où `SeoInput = { title: string; description: string; path: string; locale: 'fr' | 'en'; image?: string }` et `SeoMeta = { title: string; description: string; ogTitle: string; ogDescription: string; ogImage: string; ogUrl: string; ogType: 'website'; ogLocale: string; twitterCard: 'summary_large_image' }`.
  - `canonicalUrl(path: string, locale: 'fr' | 'en'): string`
  - `localizedPath(path: string, locale: 'fr' | 'en'): string`
  - `alternateLinks(path: string): Array<{ rel: 'alternate'; hreflang: string; href: string }>`
  - `organizationJsonLd(): object`, `mobileAppJsonLd(): object`, `faqJsonLd(items: Array<{ question: string; answer: string }>): object`

Ces fonctions sont pures — aucun appel à une API Nuxt. C'est ce qui rend la cible de 90 % de couverture atteignable sans mocker le framework.

- [ ] **Step 1: Écrire `tests/unit/lib/locale.spec.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { localizedPath, canonicalUrl, alternateLinks } from '@/lib/locale'

describe('localizedPath', () => {
  it('laisse le français à la racine', () => {
    expect(localizedPath('/tarifs', 'fr')).toBe('/tarifs')
  })

  it('préfixe l’anglais par /en', () => {
    expect(localizedPath('/tarifs', 'en')).toBe('/en/tarifs')
  })

  it('gère la page d’accueil', () => {
    expect(localizedPath('/', 'fr')).toBe('/')
    expect(localizedPath('/', 'en')).toBe('/en')
  })

  it('normalise une barre oblique finale', () => {
    expect(localizedPath('/tarifs/', 'en')).toBe('/en/tarifs')
  })
})

describe('canonicalUrl', () => {
  it('produit une URL absolue', () => {
    expect(canonicalUrl('/tarifs', 'fr')).toBe('https://yadony.com/tarifs')
    expect(canonicalUrl('/tarifs', 'en')).toBe('https://yadony.com/en/tarifs')
  })
})

describe('alternateLinks', () => {
  it('produit fr, en et x-default', () => {
    const links = alternateLinks('/tarifs')
    expect(links).toEqual([
      { rel: 'alternate', hreflang: 'fr', href: 'https://yadony.com/tarifs' },
      { rel: 'alternate', hreflang: 'en', href: 'https://yadony.com/en/tarifs' },
      { rel: 'alternate', hreflang: 'x-default', href: 'https://yadony.com/tarifs' },
    ])
  })
})
```

- [ ] **Step 2: Écrire `tests/unit/lib/seo.spec.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { buildSeoMeta } from '@/lib/seo'

describe('buildSeoMeta', () => {
  const input = {
    title: 'Tarifs',
    description: 'Commission de 12 %, sans frais cachés.',
    path: '/tarifs',
    locale: 'fr' as const,
  }

  it('suffixe le titre avec le nom du site', () => {
    expect(buildSeoMeta(input).title).toBe('Tarifs — yadony')
  })

  it('ne suffixe pas deux fois la page d’accueil', () => {
    const meta = buildSeoMeta({ ...input, title: 'yadony', path: '/' })
    expect(meta.title).toBe('yadony')
  })

  it('reprend la description en og:description', () => {
    expect(buildSeoMeta(input).ogDescription).toBe('Commission de 12 %, sans frais cachés.')
  })

  it('construit une og:url absolue et localisée', () => {
    expect(buildSeoMeta({ ...input, locale: 'en' }).ogUrl).toBe('https://yadony.com/en/tarifs')
  })

  it('retombe sur l’image Open Graph par défaut', () => {
    expect(buildSeoMeta(input).ogImage).toBe('https://yadony.com/og/default.png')
  })

  it('utilise l’image fournie si elle existe', () => {
    expect(buildSeoMeta({ ...input, image: '/og/tarifs.png' }).ogImage).toBe(
      'https://yadony.com/og/tarifs.png',
    )
  })

  it('mappe la locale au format Open Graph', () => {
    expect(buildSeoMeta(input).ogLocale).toBe('fr_FR')
    expect(buildSeoMeta({ ...input, locale: 'en' }).ogLocale).toBe('en_GB')
  })
})
```

- [ ] **Step 3: Écrire `tests/unit/lib/structured-data.spec.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { organizationJsonLd, mobileAppJsonLd, faqJsonLd } from '@/lib/structured-data'

describe('organizationJsonLd', () => {
  it('déclare une Organization avec son URL et son logo', () => {
    const data = organizationJsonLd() as Record<string, unknown>
    expect(data['@type']).toBe('Organization')
    expect(data.name).toBe('yadony')
    expect(data.url).toBe('https://yadony.com')
    expect(data.logo).toBe('https://yadony.com/logos/logo-yadony.png')
  })
})

describe('mobileAppJsonLd', () => {
  it('déclare une MobileApplication gratuite', () => {
    const data = mobileAppJsonLd() as Record<string, any>
    expect(data['@type']).toBe('MobileApplication')
    expect(data.applicationCategory).toBe('TravelApplication')
    expect(data.offers.price).toBe('0')
  })
})

describe('faqJsonLd', () => {
  it('convertit les questions en FAQPage', () => {
    const data = faqJsonLd([{ question: 'Q1 ?', answer: 'R1.' }]) as Record<string, any>
    expect(data['@type']).toBe('FAQPage')
    expect(data.mainEntity).toHaveLength(1)
    expect(data.mainEntity[0].name).toBe('Q1 ?')
    expect(data.mainEntity[0].acceptedAnswer.text).toBe('R1.')
  })

  it('retourne une liste vide sans question', () => {
    const data = faqJsonLd([]) as Record<string, any>
    expect(data.mainEntity).toEqual([])
  })
})
```

- [ ] **Step 4: Lancer les tests et vérifier qu'ils échouent**

Commande : `pnpm test`
Attendu : ÉCHEC sur les trois fichiers, modules introuvables.

- [ ] **Step 5: Implémenter `app/lib/locale.ts`**

```ts
import { siteUrl } from './site'

export type Locale = 'fr' | 'en'

export const locales: Locale[] = ['fr', 'en']
export const defaultLocale: Locale = 'fr'

function normalize(path: string): string {
  const trimmed = path.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

export function localizedPath(path: string, locale: Locale): string {
  const clean = normalize(path)
  if (locale === defaultLocale) return clean
  return clean === '/' ? '/en' : `/en${clean}`
}

export function canonicalUrl(path: string, locale: Locale): string {
  return `${siteUrl}${localizedPath(path, locale)}`
}

export function alternateLinks(path: string) {
  return [
    { rel: 'alternate' as const, hreflang: 'fr', href: canonicalUrl(path, 'fr') },
    { rel: 'alternate' as const, hreflang: 'en', href: canonicalUrl(path, 'en') },
    { rel: 'alternate' as const, hreflang: 'x-default', href: canonicalUrl(path, 'fr') },
  ]
}
```

- [ ] **Step 6: Implémenter `app/lib/seo.ts`**

```ts
import { siteName, siteUrl } from './site'
import { canonicalUrl, type Locale } from './locale'

export interface SeoInput {
  title: string
  description: string
  path: string
  locale: Locale
  image?: string
}

export interface SeoMeta {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogUrl: string
  ogType: 'website'
  ogLocale: string
  twitterCard: 'summary_large_image'
}

const OG_LOCALES: Record<Locale, string> = { fr: 'fr_FR', en: 'en_GB' }

export function buildSeoMeta(input: SeoInput): SeoMeta {
  const title = input.title === siteName ? siteName : `${input.title} — ${siteName}`
  const image = `${siteUrl}${input.image ?? '/og/default.png'}`

  return {
    title,
    description: input.description,
    ogTitle: title,
    ogDescription: input.description,
    ogImage: image,
    ogUrl: canonicalUrl(input.path, input.locale),
    ogType: 'website',
    ogLocale: OG_LOCALES[input.locale],
    twitterCard: 'summary_large_image',
  }
}
```

- [ ] **Step 7: Implémenter `app/lib/structured-data.ts`**

```ts
import { siteName, siteUrl } from './site'

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/logos/logo-yadony.png`,
  }
}

export function mobileAppJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: siteName,
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Android, iOS',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}
```

- [ ] **Step 8: Lancer les tests et vérifier qu'ils passent**

Commande : `pnpm test -- --coverage`
Attendu : SUCCÈS. La couverture de `app/lib/**` est à 100 %.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: fonctions pures SEO, routage de langue et donnees structurees"
```

---

## Tâche 5 : Internationalisation et contenu français

**Files:**
- Create: `i18n/locales/fr.json`, `i18n/locales/en.json`, `i18n.config.ts`
- Modify: `nuxt.config.ts`
- Test: `tests/unit/lib/locale-files.spec.ts`

**Interfaces:**
- Consumes: `locales`, `defaultLocale` de `app/lib/locale.ts`.
- Produces: `useI18n()` de `vue-i18n` disponible dans tous les composants ; les clés de traduction listées ci-dessous. Le fichier `en.json` est créé avec **les mêmes clés que `fr.json` mais les valeurs françaises**, à traduire en Tâche 12. Cela garantit qu'aucune clé ne manque pendant tout le développement.

- [ ] **Step 1: Installer et configurer le module**

```bash
pnpm add @nuxtjs/i18n@^10
```

Ajouter `'@nuxtjs/i18n'` au tableau `modules` de `nuxt.config.ts` et la configuration :

```ts
i18n: {
  defaultLocale: 'fr',
  strategy: 'prefix_except_default',
  langDir: 'locales',
  locales: [
    { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
    { code: 'en', language: 'en-GB', name: 'English', file: 'en.json' },
  ],
  customRoutes: 'page',
  detectBrowserLanguage: false,
  bundle: { optimizeTranslationDirective: false },
},
```

`detectBrowserLanguage: false` est volontaire : une redirection automatique casserait le prérendu et brouillerait l'indexation.

- [ ] **Step 2: Écrire le test de cohérence des locales, qui échoue**

`tests/unit/lib/locale-files.spec.ts` :

```ts
import { describe, it, expect } from 'vitest'
import fr from '../../../i18n/locales/fr.json'
import en from '../../../i18n/locales/en.json'

function flatten(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? flatten(value as Record<string, unknown>, path)
      : [path]
  })
}

describe('fichiers de locale', () => {
  it('fr et en exposent exactement les mêmes clés', () => {
    const frKeys = flatten(fr).sort()
    const enKeys = flatten(en).sort()
    expect(enKeys).toEqual(frKeys)
  })

  it('ne contient aucune valeur vide', () => {
    const empties = Object.entries(fr).filter(([, v]) => v === '')
    expect(empties).toEqual([])
  })
})
```

- [ ] **Step 3: Lancer le test et vérifier qu'il échoue**

Commande : `pnpm test`
Attendu : ÉCHEC, `Cannot find module '../../../i18n/locales/fr.json'`.

- [ ] **Step 4: Écrire `i18n/locales/fr.json`**

Le contenu rédactionnel complet du site. Extrait de la structure attendue — l'implémenteur complète toutes les sections du site en suivant la section 4 de la spec, avec du texte français réaliste, jamais de lorem ipsum :

```json
{
  "nav": {
    "howItWorks": "Comment ça marche",
    "pricing": "Tarifs",
    "trust": "Sécurité",
    "about": "À propos",
    "contact": "Contact",
    "download": "Télécharger l'app"
  },
  "home": {
    "seo": {
      "title": "Envoyer un colis en Afrique, par un voyageur vérifié",
      "description": "yadony met en relation les voyageurs qui ont de la place dans leur valise et les expéditeurs de la diaspora. Identité vérifiée, paiement séquestre, suivi par QR code."
    },
    "hero": {
      "title": "Votre colis part avec quelqu'un de confiance",
      "lead": "Un voyageur vérifié emporte votre colis Paris → Dakar. Vous payez à la livraison confirmée, pas avant.",
      "appStore": "Télécharger sur l'App Store",
      "playStore": "Disponible sur Google Play"
    },
    "problem": {
      "title": "Trois façons d'envoyer un colis. Une seule est traçable.",
      "columns": { "channel": "Canal", "price": "Prix pour 5 kg", "tracking": "Suivi", "recourse": "Recours" },
      "rows": {
        "whatsapp": { "channel": "Groupe WhatsApp", "price": "Variable", "tracking": "Aucun", "recourse": "Aucun" },
        "carrier": { "channel": "Transporteur classique", "price": "150 € et plus", "tracking": "Complet", "recourse": "Contractuel" },
        "yadony": { "channel": "yadony", "price": "Fixé par le voyageur", "tracking": "QR à chaque étape", "recourse": "Séquestre et litige" }
      }
    }
  }
}
```

Compléter avec les clés `home.tracking`, `home.trust`, `home.traveler`, `home.faq`, `home.download`, `howItWorks`, `pricing`, `trust`, `about`, `contact`, `legal`, `footer`, `language`.

- [ ] **Step 5: Créer `i18n/locales/en.json`**

```bash
cp i18n/locales/fr.json i18n/locales/en.json
```

Les valeurs restent en français jusqu'à la Tâche 12. Le test de cohérence des clés passe dès maintenant, ce qui évite de découvrir des clés manquantes en fin de projet.

- [ ] **Step 6: Lancer le test et vérifier qu'il passe**

Commande : `pnpm test`
Attendu : SUCCÈS.

- [ ] **Step 7: Vérifier le routage bilingue**

Commande : `pnpm dev`, puis ouvrir `http://localhost:3000/` et `http://localhost:3000/en`
Attendu : les deux répondent en 200.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: internationalisation FR/EN et contenu redactionnel francais"
```

---

## Tâche 6 : Layout, header et footer

**Files:**
- Create: `app/components/layout/SiteHeader.vue`, `app/components/layout/SiteFooter.vue`, `app/components/layout/LanguageSwitcher.vue`, `app/layouts/default.vue`
- Modify: `app/app.vue`
- Test: `tests/unit/components/LanguageSwitcher.spec.ts`

**Interfaces:**
- Consumes: `localizedPath` (Tâche 4), clés `nav.*` et `footer.*` (Tâche 5), `UiContainer`, `UiButton` (Tâche 3).
- Produces: `<SiteHeader>`, `<SiteFooter>`, layout `default` utilisé par toutes les pages. `LanguageSwitcher` reçoit `:currentPath` et `:currentLocale` en props et émet des liens vers l'autre langue — il ne lit pas la route lui-même, ce qui le rend testable sans Nuxt.

- [ ] **Step 1: Écrire le test qui échoue**

`tests/unit/components/LanguageSwitcher.spec.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher.vue'

describe('LanguageSwitcher', () => {
  it('pointe vers la page équivalente en anglais quand on est en français', () => {
    const wrapper = mount(LanguageSwitcher, {
      props: { currentPath: '/tarifs', currentLocale: 'fr' },
    })
    expect(wrapper.find('a').attributes('href')).toBe('/en/tarifs')
    expect(wrapper.find('a').text()).toBe('EN')
  })

  it('pointe vers la page équivalente en français quand on est en anglais', () => {
    const wrapper = mount(LanguageSwitcher, {
      props: { currentPath: '/tarifs', currentLocale: 'en' },
    })
    expect(wrapper.find('a').attributes('href')).toBe('/tarifs')
    expect(wrapper.find('a').text()).toBe('FR')
  })

  it('gère la page d’accueil', () => {
    const wrapper = mount(LanguageSwitcher, {
      props: { currentPath: '/', currentLocale: 'fr' },
    })
    expect(wrapper.find('a').attributes('href')).toBe('/en')
  })

  it('annonce la langue cible aux lecteurs d’écran', () => {
    const wrapper = mount(LanguageSwitcher, {
      props: { currentPath: '/', currentLocale: 'fr' },
    })
    expect(wrapper.find('a').attributes('hreflang')).toBe('en')
    expect(wrapper.find('a').attributes('aria-label')).toContain('English')
  })
})
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

Commande : `pnpm test`
Attendu : ÉCHEC, module introuvable.

- [ ] **Step 3: Implémenter `LanguageSwitcher.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { localizedPath, type Locale } from '@/lib/locale'

const props = defineProps<{ currentPath: string; currentLocale: Locale }>()

const target = computed<Locale>(() => (props.currentLocale === 'fr' ? 'en' : 'fr'))
const href = computed(() => localizedPath(props.currentPath, target.value))
const label = computed(() => (target.value === 'en' ? 'English' : 'Français'))
</script>

<template>
  <a
    :href="href"
    :hreflang="target"
    :aria-label="`Lire cette page en ${label}`"
    class="rounded-el border border-line px-3 py-1.5 text-sm font-semibold text-ink-muted transition-colors duration-150 hover:bg-sand hover:text-ink"
  >{{ target.toUpperCase() }}</a>
</template>
```

On utilise un `<a>` natif et non `<NuxtLink>` : le changement de langue doit provoquer un chargement complet, pour que la balise `lang` du document et les métadonnées soient rendues par le serveur.

- [ ] **Step 4: Implémenter `SiteHeader.vue`**

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const route = useRoute()
const open = ref(false)

const unprefixed = computed(() => route.path.replace(/^\/en(?=\/|$)/, '') || '/')

const links = computed(() => [
  { to: '/comment-ca-marche', label: t('nav.howItWorks') },
  { to: '/tarifs', label: t('nav.pricing') },
  { to: '/securite', label: t('nav.trust') },
  { to: '/a-propos', label: t('nav.about') },
])
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
    <UiContainer>
      <div class="flex h-16 items-center justify-between gap-6">
        <NuxtLink :to="locale === 'fr' ? '/' : '/en'" class="font-display text-xl font-bold tracking-tight">
          yadony
        </NuxtLink>

        <nav class="hidden items-center gap-7 md:flex" :aria-label="t('nav.howItWorks')">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="locale === 'fr' ? link.to : `/en${link.to}`"
            class="text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
          >{{ link.label }}</NuxtLink>
        </nav>

        <div class="flex items-center gap-3">
          <LanguageSwitcher :current-path="unprefixed" :current-locale="locale as 'fr' | 'en'" />
          <UiButton :to="locale === 'fr' ? '/#telecharger' : '/en/#telecharger'" class="hidden sm:inline-flex">
            {{ t('nav.download') }}
          </UiButton>
          <button
            type="button"
            class="md:hidden rounded-el border border-line px-3 py-1.5 text-sm"
            :aria-expanded="open"
            aria-controls="menu-mobile"
            @click="open = !open"
          >Menu</button>
        </div>
      </div>

      <nav v-show="open" id="menu-mobile" class="border-t border-line py-4 md:hidden">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="locale === 'fr' ? link.to : `/en${link.to}`"
          class="block py-2.5 text-ink-muted"
          @click="open = false"
        >{{ link.label }}</NuxtLink>
      </nav>
    </UiContainer>
  </header>
</template>
```

- [ ] **Step 5: Implémenter `SiteFooter.vue`**

Footer sur fond sable, en trois colonnes sur desktop et empilées sur mobile : identité et pitch d'une phrase, liens de navigation, liens légaux et contact. Toutes les chaînes viennent de `t('footer.*')`.

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { contactEmail } from '@/lib/site'

const { t, locale } = useI18n()
const p = (path: string) => (locale.value === 'fr' ? path : `/en${path}`)
</script>

<template>
  <footer class="border-t border-line bg-sand">
    <UiContainer>
      <div class="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p class="font-display text-lg font-bold">yadony</p>
          <p class="mt-3 max-w-prose text-sm text-ink-muted">{{ t('footer.pitch') }}</p>
        </div>
        <nav :aria-label="t('footer.navLabel')" class="text-sm">
          <NuxtLink :to="p('/comment-ca-marche')" class="block py-1 text-ink-muted hover:text-ink">{{ t('nav.howItWorks') }}</NuxtLink>
          <NuxtLink :to="p('/tarifs')" class="block py-1 text-ink-muted hover:text-ink">{{ t('nav.pricing') }}</NuxtLink>
          <NuxtLink :to="p('/securite')" class="block py-1 text-ink-muted hover:text-ink">{{ t('nav.trust') }}</NuxtLink>
          <NuxtLink :to="p('/contact')" class="block py-1 text-ink-muted hover:text-ink">{{ t('nav.contact') }}</NuxtLink>
        </nav>
        <nav :aria-label="t('footer.legalLabel')" class="text-sm">
          <NuxtLink :to="p('/mentions-legales')" class="block py-1 text-ink-muted hover:text-ink">{{ t('footer.legalNotice') }}</NuxtLink>
          <NuxtLink :to="p('/cgu')" class="block py-1 text-ink-muted hover:text-ink">{{ t('footer.terms') }}</NuxtLink>
          <NuxtLink :to="p('/confidentialite')" class="block py-1 text-ink-muted hover:text-ink">{{ t('footer.privacy') }}</NuxtLink>
          <a :href="`mailto:${contactEmail}`" class="block py-1 text-ink-muted hover:text-ink">{{ contactEmail }}</a>
        </nav>
      </div>
      <p class="border-t border-line py-6 text-xs text-ink-muted">{{ t('footer.copyright') }}</p>
    </UiContainer>
  </footer>
</template>
```

- [ ] **Step 6: Implémenter `app/layouts/default.vue`**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a href="#contenu" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-el focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
      {{ t('a11y.skipToContent') }}
    </a>
    <SiteHeader />
    <main id="contenu" class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
```

Mettre à jour `app/app.vue` :

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

Ajouter la clé `a11y.skipToContent` (« Aller au contenu ») dans les deux fichiers de locale.

- [ ] **Step 7: Lancer les tests et vérifier qu'ils passent**

Commande : `pnpm test`
Attendu : SUCCÈS, les 4 tests de `LanguageSwitcher` inclus.

- [ ] **Step 8: Vérifier à l'écran**

Commande : `pnpm dev`
Attendu : header collant avec navigation, sélecteur `EN` fonctionnel, footer sable. En 360 px de large, le menu bascule sur le bouton « Menu » et aucun défilement horizontal n'apparaît.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: layout par defaut avec header, footer et selecteur de langue"
```

---

## Tâche 7 : Accueil — hero et comparatif du problème

**Files:**
- Create: `app/components/sections/HeroDownload.vue`, `app/components/sections/ProblemComparison.vue`, `app/components/StoreBadges.vue`, `public/screenshots/.gitkeep`
- Modify: `app/pages/index.vue`, `i18n/locales/fr.json`, `i18n/locales/en.json`

**Interfaces:**
- Consumes: `UiContainer`, `UiSection`, `UiButton`, clés `home.hero.*` et `home.problem.*`.
- Produces: `<HeroDownload>` et `<ProblemComparison>`, sans props — ils lisent leur contenu depuis les locales. `<StoreBadges>` accepte `size?: 'md' | 'lg'`.

- [ ] **Step 1: Créer l'emplacement des captures**

```bash
mkdir -p public/screenshots
touch public/screenshots/.gitkeep
```

Les captures définitives seront fournies par le porteur du projet. En attendant, les emplacements sont dimensionnés avec un `aspect-ratio` fixe et un fond sable, pour que la mise en page ne bouge pas quand les vraies images arriveront. Noms de fichiers attendus : `app-accueil.webp`, `app-depot.webp`, `app-scan.webp`, `app-transit.webp`, `app-livraison.webp`, tous en 1170 × 2532 px.

- [ ] **Step 2: Implémenter `StoreBadges.vue`**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

withDefaults(defineProps<{ size?: 'md' | 'lg' }>(), { size: 'md' })
const { t } = useI18n()

const APP_STORE_URL = 'https://apps.apple.com/app/yadony/id0000000000'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.dony.app'
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <UiButton :href="APP_STORE_URL" :size="size">{{ t('home.hero.appStore') }}</UiButton>
    <UiButton :href="PLAY_STORE_URL" variant="ghost" :size="size">{{ t('home.hero.playStore') }}</UiButton>
  </div>
</template>
```

Les deux URL sont des valeurs de remplacement à remplacer par les fiches réelles (point 3 de la section 8 de la spec). Elles sont volontairement centralisées dans ce seul fichier.

- [ ] **Step 3: Implémenter `HeroDownload.vue`**

Mise en page asymétrique : le texte occupe 7 colonnes sur 12, le téléphone 5 colonnes et déborde vers la droite au-delà du conteneur. Pas de centrage.

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <section class="relative overflow-hidden bg-surface">
    <UiContainer>
      <div class="grid items-center gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div class="lg:col-span-7">
          <h1 class="text-display-xl">{{ t('home.hero.title') }}</h1>
          <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t('home.hero.lead') }}</p>
          <StoreBadges size="lg" class="mt-9" />
          <p class="mt-5 text-sm text-ink-muted">{{ t('home.hero.note') }}</p>
        </div>

        <div class="lg:col-span-5">
          <div class="relative lg:-mr-24 xl:-mr-40">
            <img
              src="/screenshots/app-accueil.webp"
              :alt="t('home.hero.screenshotAlt')"
              width="1170"
              height="2532"
              class="mx-auto w-[260px] rounded-card border border-line bg-sand lg:w-[320px]"
              loading="eager"
              fetchpriority="high"
            >
          </div>
        </div>
      </div>
    </UiContainer>
  </section>
</template>
```

Les marges négatives `-mr-24` et `-mr-40` sont appliquées uniquement à partir de `lg`, donc jamais sur mobile : c'est ce qui garantit l'absence de défilement horizontal sur petit écran, combiné à `overflow-hidden` sur la section.

- [ ] **Step 4: Implémenter `ProblemComparison.vue`**

Un vrai `<table>`, pas trois cartes. Il défile dans son propre conteneur sur mobile.

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const rows = ['whatsapp', 'carrier', 'yadony'] as const
</script>

<template>
  <UiSection tone="sand">
    <UiContainer>
      <h2 class="max-w-[20ch] text-display-lg">{{ t('home.problem.title') }}</h2>

      <div class="mt-10 overflow-x-auto">
        <table class="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-line text-ink-muted">
              <th scope="col" class="py-3 pr-6 font-medium">{{ t('home.problem.columns.channel') }}</th>
              <th scope="col" class="py-3 pr-6 font-medium">{{ t('home.problem.columns.price') }}</th>
              <th scope="col" class="py-3 pr-6 font-medium">{{ t('home.problem.columns.tracking') }}</th>
              <th scope="col" class="py-3 font-medium">{{ t('home.problem.columns.recourse') }}</th>
            </tr>
          </thead>
          <tbody class="tabular-nums">
            <tr
              v-for="row in rows"
              :key="row"
              class="border-b border-line"
              :class="row === 'yadony' ? 'font-semibold text-ink' : 'text-ink-muted'"
            >
              <th scope="row" class="py-4 pr-6 font-normal">{{ t(`home.problem.rows.${row}.channel`) }}</th>
              <td class="py-4 pr-6">{{ t(`home.problem.rows.${row}.price`) }}</td>
              <td class="py-4 pr-6">{{ t(`home.problem.rows.${row}.tracking`) }}</td>
              <td class="py-4">{{ t(`home.problem.rows.${row}.recourse`) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiContainer>
  </UiSection>
</template>
```

- [ ] **Step 5: Assembler `app/pages/index.vue`**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { buildSeoMeta } from '@/lib/seo'
import { alternateLinks } from '@/lib/locale'
import { organizationJsonLd, mobileAppJsonLd } from '@/lib/structured-data'

const { t, locale } = useI18n()

useSeoMeta(
  buildSeoMeta({
    title: t('home.seo.title'),
    description: t('home.seo.description'),
    path: '/',
    locale: locale.value as 'fr' | 'en',
  }),
)

useHead({
  link: alternateLinks('/'),
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(organizationJsonLd()) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(mobileAppJsonLd()) },
  ],
})
</script>

<template>
  <HeroDownload />
  <ProblemComparison />
</template>
```

- [ ] **Step 6: Ajouter les clés de locale manquantes**

Ajouter dans `fr.json` et `en.json` : `home.hero.note` (« Sans frais cachés. Vous ne payez qu'à la livraison confirmée. ») et `home.hero.screenshotAlt` (« Écran d'accueil de l'application yadony montrant les trajets disponibles »).

- [ ] **Step 7: Vérifier les tests et la page**

Commande : `pnpm test && pnpm dev`
Attendu : tests au vert. À l'écran : titre très large aligné à gauche, téléphone débordant à droite sur desktop, tableau lisible et défilant horizontalement sur mobile sans que la page elle-même défile.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: accueil, hero asymetrique et tableau comparatif"
```

---

## Tâche 8 : Accueil — parcours QR

**Files:**
- Create: `app/components/sections/TrackingWalkthrough.vue`
- Modify: `app/pages/index.vue`, `i18n/locales/fr.json`, `i18n/locales/en.json`
- Test: `tests/unit/components/TrackingWalkthrough.spec.ts`

**Interfaces:**
- Consumes: `UiSection`, `UiContainer`, clés `home.tracking.*`.
- Produces: `<TrackingWalkthrough>`, bloc central de l'accueil : quatre étapes présentées en défilement horizontal avec ancrage (`scroll-snap`), légendes numérotées et captures réelles.

- [ ] **Step 1: Écrire le test qui échoue**

`tests/unit/components/TrackingWalkthrough.spec.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import fr from '../../../i18n/locales/fr.json'
import TrackingWalkthrough from '@/components/sections/TrackingWalkthrough.vue'

const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr } })

describe('TrackingWalkthrough', () => {
  it('rend les quatre étapes du parcours', () => {
    const wrapper = mount(TrackingWalkthrough, { global: { plugins: [i18n] } })
    expect(wrapper.findAll('[data-step]')).toHaveLength(4)
  })

  it('numérote les étapes de 1 à 4', () => {
    const wrapper = mount(TrackingWalkthrough, { global: { plugins: [i18n] } })
    const numbers = wrapper.findAll('[data-step-number]').map((n) => n.text())
    expect(numbers).toEqual(['01', '02', '03', '04'])
  })

  it('donne un texte alternatif à chaque capture', () => {
    const wrapper = mount(TrackingWalkthrough, { global: { plugins: [i18n] } })
    const alts = wrapper.findAll('img').map((img) => img.attributes('alt'))
    expect(alts.every((alt) => typeof alt === 'string' && alt.length > 10)).toBe(true)
  })

  it('déclare les dimensions des images pour éviter le décalage de mise en page', () => {
    const wrapper = mount(TrackingWalkthrough, { global: { plugins: [i18n] } })
    for (const img of wrapper.findAll('img')) {
      expect(img.attributes('width')).toBe('1170')
      expect(img.attributes('height')).toBe('2532')
    }
  })
})
```

Ce test impose que le composant soit montable avec un `vue-i18n` réel chargé depuis `fr.json` : si une clé manque, le test le révèle immédiatement.

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

Commande : `pnpm test tests/unit/components/TrackingWalkthrough.spec.ts`
Attendu : ÉCHEC, module introuvable.

- [ ] **Step 3: Ajouter les clés de locale**

Dans `fr.json`, sous `home.tracking` :

```json
"tracking": {
  "title": "Quatre scans entre Paris et Dakar",
  "lead": "À chaque étape, un QR code est scanné. L'expéditeur et le destinataire voient la même chose, au même moment.",
  "steps": {
    "deposit": { "label": "Dépôt à Paris", "text": "Vous remettez le colis au voyageur. Il scanne le QR code, une photo est prise, l'horodatage est enregistré.", "alt": "Écran de dépôt affichant le QR code du colis" },
    "airport": { "label": "Scan à l'aéroport", "text": "Second scan avant l'embarquement. Votre famille reçoit la notification.", "alt": "Écran de scan à l'aéroport avec confirmation d'embarquement" },
    "transit": { "label": "En vol", "text": "Le trajet est visible sur la fiche de suivi partageable par lien.", "alt": "Écran de suivi affichant le colis en transit" },
    "delivery": { "label": "Livraison à Dakar", "text": "Scan final, photo de remise en main propre. Le paiement est alors libéré au voyageur.", "alt": "Écran de livraison avec photo de confirmation de remise" }
  }
}
```

Répercuter les mêmes clés dans `en.json`.

- [ ] **Step 4: Implémenter `TrackingWalkthrough.vue`**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const steps = [
  { key: 'deposit', number: '01', image: '/screenshots/app-depot.webp' },
  { key: 'airport', number: '02', image: '/screenshots/app-scan.webp' },
  { key: 'transit', number: '03', image: '/screenshots/app-transit.webp' },
  { key: 'delivery', number: '04', image: '/screenshots/app-livraison.webp' },
] as const
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <h2 class="max-w-[18ch] text-display-lg">{{ t('home.tracking.title') }}</h2>
      <p class="mt-5 max-w-prose text-lg text-ink-muted">{{ t('home.tracking.lead') }}</p>
    </UiContainer>

    <div
      class="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-6 sm:px-8 lg:px-12"
      role="list"
    >
      <article
        v-for="step in steps"
        :key="step.key"
        data-step
        role="listitem"
        class="w-[268px] shrink-0 snap-start sm:w-[300px]"
      >
        <img
          :src="step.image"
          :alt="t(`home.tracking.steps.${step.key}.alt`)"
          width="1170"
          height="2532"
          loading="lazy"
          decoding="async"
          class="w-full rounded-card border border-line bg-sand"
        >
        <p data-step-number class="mt-5 font-display text-sm font-bold text-terra tabular-nums">
          {{ step.number }}
        </p>
        <h3 class="mt-1 font-display text-lg font-semibold">
          {{ t(`home.tracking.steps.${step.key}.label`) }}
        </h3>
        <p class="mt-2 text-sm text-ink-muted">
          {{ t(`home.tracking.steps.${step.key}.text`) }}
        </p>
      </article>
    </div>
  </UiSection>
</template>
```

Le numéro d'étape en terracotta est **la seule** occurrence de l'accent dans cette section — conforme à la règle « un accent par écran ».

- [ ] **Step 5: Brancher la section sur la page d'accueil**

Dans `app/pages/index.vue`, ajouter `<TrackingWalkthrough />` après `<ProblemComparison />`.

- [ ] **Step 6: Lancer les tests et vérifier qu'ils passent**

Commande : `pnpm test`
Attendu : SUCCÈS, les 4 nouveaux tests inclus.

- [ ] **Step 7: Vérifier le comportement de défilement**

Commande : `pnpm dev`
Attendu : sur desktop, les quatre écrans défilent horizontalement avec ancrage ; sur mobile, le geste est naturel et le `body` ne défile pas horizontalement.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: accueil, parcours QR en defilement horizontal"
```

---

## Tâche 9 : Accueil — garanties, bandeau voyageur, FAQ et bloc de téléchargement

**Files:**
- Create: `app/components/sections/TrustPillars.vue`, `app/components/sections/TravelerBanner.vue`, `app/components/sections/HomeFaq.vue`, `app/components/sections/DownloadCta.vue`
- Modify: `app/pages/index.vue`, `i18n/locales/fr.json`, `i18n/locales/en.json`
- Test: `tests/unit/components/HomeFaq.spec.ts`

**Interfaces:**
- Consumes: `UiAccordion` (Tâche 3), `faqJsonLd` (Tâche 4), `StoreBadges` (Tâche 7).
- Produces: `<TrustPillars>`, `<TravelerBanner>`, `<HomeFaq>` (expose la liste des questions via `defineExpose({ items })` pour permettre au test de vérifier la cohérence avec le JSON-LD), `<DownloadCta>` (ancre `#telecharger`).

- [ ] **Step 1: Écrire le test qui échoue**

`tests/unit/components/HomeFaq.spec.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import fr from '../../../i18n/locales/fr.json'
import HomeFaq from '@/components/sections/HomeFaq.vue'

const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr } })

describe('HomeFaq', () => {
  it('rend huit questions', () => {
    const wrapper = mount(HomeFaq, { global: { plugins: [i18n] } })
    expect(wrapper.findAll('details')).toHaveLength(8)
  })

  it('rend les réponses dans le DOM même repliées, pour l’indexation', () => {
    const wrapper = mount(HomeFaq, { global: { plugins: [i18n] } })
    expect(wrapper.findAll('details p')).toHaveLength(8)
  })

  it('n’ouvre aucune question par défaut', () => {
    const wrapper = mount(HomeFaq, { global: { plugins: [i18n] } })
    expect(wrapper.findAll('details[open]')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

Commande : `pnpm test tests/unit/components/HomeFaq.spec.ts`
Attendu : ÉCHEC, module introuvable.

- [ ] **Step 3: Ajouter les clés de locale**

Sous `home.trust` : `title`, `lead`, et trois piliers `identity`, `escrow`, `insurance`, chacun avec `figure` (le mot ou chiffre mis en avant), `label` et `text`. Valeurs françaises :

- `identity.figure` : « 100 % », `label` : « Identités vérifiées », `text` : « Voyageurs et expéditeurs passent une vérification d'identité Stripe Identity. Aucun compte anonyme sur la plateforme. »
- `escrow.figure` : « 0 € », `label` : « Payé avant livraison », `text` : « Votre paiement est bloqué et n'est versé au voyageur qu'après le scan de livraison confirmé. »
- `insurance.figure` : « 500 € », `label` : « Valeur couverte », `text` : « Chaque colis est couvert jusqu'à 500 € de valeur déclarée, assurance incluse dans la commission. »

Sous `home.traveler` : `title` (« Votre valise a de la place. Elle peut financer une partie du voyage. »), `text`, `cta`.
Sous `home.faq` : `title` et un tableau `items` de huit objets `{ id, question, answer }` couvrant : délai de livraison, prix, objets interdits, moment du paiement, colis perdu, gain du voyageur, contrôle douanier, zones desservies.
Sous `home.download` : `title`, `text`.

- [ ] **Step 4: Implémenter `TrustPillars.vue`**

Traitement éditorial, pas trois cartes : une grille de trois colonnes séparées par des filets verticaux, le chiffre en très grand.

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const pillars = ['identity', 'escrow', 'insurance'] as const
</script>

<template>
  <UiSection tone="sand">
    <UiContainer>
      <h2 class="max-w-[22ch] text-display-lg">{{ t('home.trust.title') }}</h2>
      <p class="mt-5 max-w-prose text-lg text-ink-muted">{{ t('home.trust.lead') }}</p>

      <dl class="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-0">
        <div
          v-for="(pillar, index) in pillars"
          :key="pillar"
          class="sm:px-8"
          :class="index > 0 ? 'sm:border-l sm:border-line' : 'sm:pl-0'"
        >
          <p class="font-display text-4xl font-bold tabular-nums" :class="pillar === 'escrow' ? 'text-terra' : 'text-ink'">
            {{ t(`home.trust.${pillar}.figure`) }}
          </p>
          <dt class="mt-3 font-display text-lg font-semibold">{{ t(`home.trust.${pillar}.label`) }}</dt>
          <dd class="mt-2 text-sm text-ink-muted">{{ t(`home.trust.${pillar}.text`) }}</dd>
        </div>
      </dl>
    </UiContainer>
  </UiSection>
</template>
```

- [ ] **Step 5: Implémenter `TravelerBanner.vue`**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <div class="rounded-card border border-line bg-sand-deep/40 px-8 py-14 sm:px-14">
        <h2 class="max-w-[24ch] text-display-md">{{ t('home.traveler.title') }}</h2>
        <p class="mt-5 max-w-prose text-ink-muted">{{ t('home.traveler.text') }}</p>
        <UiButton
          :to="locale === 'fr' ? '/comment-ca-marche?role=voyageur' : '/en/comment-ca-marche?role=voyageur'"
          size="lg"
          class="mt-8"
        >{{ t('home.traveler.cta') }}</UiButton>
      </div>
    </UiContainer>
  </UiSection>
</template>
```

- [ ] **Step 6: Implémenter `HomeFaq.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AccordionItem } from '@/lib/ui-types'

const { t, tm, rt } = useI18n()

const items = computed<AccordionItem[]>(() =>
  (tm('home.faq.items') as unknown[]).map((raw, index) => {
    const entry = raw as { id: unknown; question: unknown; answer: unknown }
    return {
      id: String(rt(entry.id as never)) || `faq-${index}`,
      question: rt(entry.question as never),
      answer: rt(entry.answer as never),
    }
  }),
)

defineExpose({ items })
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <h2 class="max-w-[18ch] text-display-lg">{{ t('home.faq.title') }}</h2>
      <div class="mt-10 max-w-3xl">
        <UiAccordion :items="items" />
      </div>
    </UiContainer>
  </UiSection>
</template>
```

- [ ] **Step 7: Implémenter `DownloadCta.vue`**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <UiSection id="telecharger" tone="sand">
    <UiContainer>
      <div class="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h2 class="max-w-[16ch] text-display-lg">{{ t('home.download.title') }}</h2>
          <p class="mt-5 max-w-prose text-ink-muted">{{ t('home.download.text') }}</p>
          <StoreBadges size="lg" class="mt-9" />
        </div>
      </div>
    </UiContainer>
  </UiSection>
</template>
```

- [ ] **Step 8: Compléter `app/pages/index.vue`**

Ordre final du template : `HeroDownload`, `ProblemComparison`, `TrackingWalkthrough`, `TrustPillars`, `TravelerBanner`, `HomeFaq`, `DownloadCta`.

Ajouter le JSON-LD de la FAQ au `useHead` existant, en réutilisant les mêmes données que le composant. **Élargir d'abord la déstructuration de `useI18n()` en haut du fichier**, qui ne récupérait que `t` et `locale` :

```ts
const { t, tm, rt, locale } = useI18n()
```

Puis :

```ts
import { faqJsonLd } from '@/lib/structured-data'

const faqItems = (tm('home.faq.items') as unknown[]).map((raw) => {
  const entry = raw as { question: unknown; answer: unknown }
  return { question: rt(entry.question as never), answer: rt(entry.answer as never) }
})
```

Puis ajouter dans le tableau `script` : `{ type: 'application/ld+json', innerHTML: JSON.stringify(faqJsonLd(faqItems)) }`.

- [ ] **Step 9: Lancer les tests et vérifier qu'ils passent**

Commande : `pnpm test`
Attendu : SUCCÈS.

- [ ] **Step 10: Vérifier le JSON-LD généré**

Commande : `pnpm generate` puis `grep -c 'FAQPage' .output/public/index.html`
Attendu : `1`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: accueil, garanties, bandeau voyageur, FAQ et bloc de telechargement"
```

---

## Tâche 10 : Page « Comment ça marche » avec onglets synchronisés à l'URL

**Files:**
- Create: `app/lib/roles.ts`, `app/pages/comment-ca-marche.vue`, `app/components/sections/RoleTabs.vue`, `app/components/sections/JourneySteps.vue`
- Modify: `i18n/locales/fr.json`, `i18n/locales/en.json`
- Test: `tests/unit/lib/roles.spec.ts`, `tests/unit/components/RoleTabs.spec.ts`

**Interfaces:**
- Consumes: `UiSection`, `UiContainer`.
- Produces:
  - `resolveRole(value: unknown): 'expediteur' | 'voyageur'` — retourne `'expediteur'` pour toute valeur non reconnue.
  - `<RoleTabs :model-value="role" @update:model-value="…">` — deux onglets accessibles (`role="tablist"`), pilotés par le parent.
  - `<JourneySteps :role="role">` — cinq étapes numérotées, texte lu dans `howItWorks.{role}.steps`.

- [ ] **Step 1: Écrire `tests/unit/lib/roles.spec.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { resolveRole } from '@/lib/roles'

describe('resolveRole', () => {
  it('reconnaît voyageur', () => {
    expect(resolveRole('voyageur')).toBe('voyageur')
  })

  it('reconnaît expediteur', () => {
    expect(resolveRole('expediteur')).toBe('expediteur')
  })

  it('ignore la casse', () => {
    expect(resolveRole('Voyageur')).toBe('voyageur')
  })

  it('retombe sur expediteur pour une valeur inconnue', () => {
    expect(resolveRole('pilote')).toBe('expediteur')
  })

  it('retombe sur expediteur pour undefined, null ou un tableau', () => {
    expect(resolveRole(undefined)).toBe('expediteur')
    expect(resolveRole(null)).toBe('expediteur')
    expect(resolveRole(['voyageur'])).toBe('expediteur')
  })
})
```

- [ ] **Step 2: Écrire `tests/unit/components/RoleTabs.spec.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import fr from '../../../i18n/locales/fr.json'
import RoleTabs from '@/components/sections/RoleTabs.vue'

const i18n = createI18n({ legacy: false, locale: 'fr', messages: { fr } })

function mountTabs(modelValue: 'expediteur' | 'voyageur') {
  return mount(RoleTabs, { props: { modelValue }, global: { plugins: [i18n] } })
}

describe('RoleTabs', () => {
  it('expose une liste d’onglets accessible', () => {
    const wrapper = mountTabs('expediteur')
    expect(wrapper.find('[role="tablist"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(2)
  })

  it('marque l’onglet actif avec aria-selected', () => {
    const wrapper = mountTabs('voyageur')
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0]!.attributes('aria-selected')).toBe('false')
    expect(tabs[1]!.attributes('aria-selected')).toBe('true')
  })

  it('émet le nouveau rôle au clic', async () => {
    const wrapper = mountTabs('expediteur')
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['voyageur']])
  })

  it('n’émet rien si on clique sur l’onglet déjà actif', async () => {
    const wrapper = mountTabs('expediteur')
    await wrapper.findAll('[role="tab"]')[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
```

- [ ] **Step 3: Lancer les tests et vérifier qu'ils échouent**

Commande : `pnpm test`
Attendu : ÉCHEC sur les deux fichiers, modules introuvables.

- [ ] **Step 4: Implémenter `app/lib/roles.ts`**

```ts
export type Role = 'expediteur' | 'voyageur'

export const roles: Role[] = ['expediteur', 'voyageur']

export function resolveRole(value: unknown): Role {
  if (typeof value !== 'string') return 'expediteur'
  const normalized = value.toLowerCase()
  return normalized === 'voyageur' ? 'voyageur' : 'expediteur'
}
```

- [ ] **Step 5: Implémenter `RoleTabs.vue`**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { roles, type Role } from '@/lib/roles'

const props = defineProps<{ modelValue: Role }>()
const emit = defineEmits<{ 'update:modelValue': [Role] }>()

const { t } = useI18n()

function select(role: Role) {
  if (role !== props.modelValue) emit('update:modelValue', role)
}
</script>

<template>
  <div role="tablist" :aria-label="t('howItWorks.tabsLabel')" class="inline-flex rounded-el border border-line p-1">
    <button
      v-for="role in roles"
      :key="role"
      type="button"
      role="tab"
      :aria-selected="role === modelValue"
      :aria-controls="`panneau-${role}`"
      :id="`onglet-${role}`"
      class="rounded-[9px] px-5 py-2 text-sm font-semibold transition-colors duration-150"
      :class="role === modelValue ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink'"
      @click="select(role)"
    >{{ t(`howItWorks.${role}.tab`) }}</button>
  </div>
</template>
```

- [ ] **Step 6: Implémenter `JourneySteps.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Role } from '@/lib/roles'

const props = defineProps<{ role: Role }>()
const { tm, rt } = useI18n()

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
  <ol
    :id="`panneau-${role}`"
    role="tabpanel"
    :aria-labelledby="`onglet-${role}`"
    class="mt-12 divide-y divide-line border-y border-line"
  >
    <li v-for="step in steps" :key="step.number" class="grid gap-3 py-8 sm:grid-cols-[5rem_1fr] sm:gap-8">
      <p class="font-display text-sm font-bold text-ink-muted tabular-nums">{{ step.number }}</p>
      <div>
        <h3 class="font-display text-xl font-semibold">{{ step.title }}</h3>
        <p class="mt-2 max-w-prose text-ink-muted">{{ step.text }}</p>
      </div>
    </li>
  </ol>
</template>
```

- [ ] **Step 7: Implémenter la page**

`app/pages/comment-ca-marche.vue` :

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { resolveRole, type Role } from '@/lib/roles'
import { buildSeoMeta } from '@/lib/seo'
import { alternateLinks } from '@/lib/locale'

defineI18nRoute({
  paths: { fr: '/comment-ca-marche', en: '/how-it-works' },
})

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const role = computed<Role>(() => resolveRole(route.query.role))

function setRole(next: Role) {
  router.replace({ query: next === 'expediteur' ? {} : { role: next } })
}

useSeoMeta(
  buildSeoMeta({
    title: t('howItWorks.seo.title'),
    description: t('howItWorks.seo.description'),
    path: '/comment-ca-marche',
    locale: locale.value as 'fr' | 'en',
  }),
)
useHead({ link: alternateLinks('/comment-ca-marche') })
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <h1 class="max-w-[20ch] text-display-xl">{{ t('howItWorks.title') }}</h1>
      <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t('howItWorks.lead') }}</p>
      <RoleTabs :model-value="role" class="mt-10" @update:model-value="setRole" />
      <JourneySteps :role="role" />
    </UiContainer>
  </UiSection>
  <DownloadCta />
</template>
```

`router.replace` plutôt que `push` : le changement d'onglet ne doit pas polluer l'historique de navigation.

- [ ] **Step 8: Ajouter les clés de locale**

Sous `howItWorks` : `seo.title`, `seo.description`, `title`, `lead`, `tabsLabel`, puis `expediteur.tab`, `expediteur.steps` (cinq objets `{ title, text }`), `voyageur.tab`, `voyageur.steps` (cinq objets). Contenu français réaliste décrivant les parcours réels du produit : publication ou recherche d'annonce, mise en relation et devis, vérification d'identité, remise et scan, livraison et paiement.

- [ ] **Step 9: Lancer les tests et vérifier qu'ils passent**

Commande : `pnpm test`
Attendu : SUCCÈS, 9 nouveaux tests.

- [ ] **Step 10: Vérifier la synchronisation avec l'URL**

Commande : `pnpm dev`, ouvrir `http://localhost:3000/comment-ca-marche?role=voyageur`
Attendu : l'onglet « Voyageur » est actif au chargement. Cliquer sur « Expéditeur » remet l'URL à `/comment-ca-marche` sans ajouter d'entrée dans l'historique.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: page comment ca marche avec onglets synchronises a l URL"
```

---

## Tâche 11 : Pages Tarifs, Sécurité, À propos, Contact et pages légales

**Files:**
- Create: `app/lib/pricing.ts`, `app/components/sections/PricingExample.vue`, `app/components/ProseBlock.vue`, `app/pages/tarifs.vue`, `app/pages/securite.vue`, `app/pages/a-propos.vue`, `app/pages/contact.vue`, `app/pages/mentions-legales.vue`, `app/pages/cgu.vue`, `app/pages/confidentialite.vue`
- Modify: `i18n/locales/fr.json`, `i18n/locales/en.json`
- Test: `tests/unit/lib/pricing.spec.ts`

**Interfaces:**
- Consumes: toutes les primitives et fonctions pures précédentes.
- Produces:
  - `computeQuote(input: { weightKg: number; pricePerKg: number }): Quote` où `Quote = { travelerPrice: number; commission: number; senderPays: number; travelerEarns: number }`. Commission de 12 % prélevée sur le montant payé par l'expéditeur. Tous les montants sont en euros, arrondis à deux décimales.
  - `<PricingExample>` — affiche la décomposition pour un colis de 5 kg à 12 €/kg.
  - `<ProseBlock>` — conteneur typographique pour les pages de texte long (`max-w-prose`, rythme vertical, styles de titres et de listes).

- [ ] **Step 1: Écrire `tests/unit/lib/pricing.spec.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { computeQuote, COMMISSION_RATE, MAX_DECLARED_VALUE_EUR } from '@/lib/pricing'

describe('constantes tarifaires', () => {
  it('la commission est de 12 %', () => {
    expect(COMMISSION_RATE).toBe(0.12)
  })

  it('la valeur maximale déclarée est de 500 €', () => {
    expect(MAX_DECLARED_VALUE_EUR).toBe(500)
  })
})

describe('computeQuote', () => {
  it('calcule le cas de référence : 5 kg à 12 €/kg', () => {
    const quote = computeQuote({ weightKg: 5, pricePerKg: 12 })
    expect(quote.travelerPrice).toBe(60)
    expect(quote.commission).toBe(7.2)
    expect(quote.senderPays).toBe(67.2)
    expect(quote.travelerEarns).toBe(60)
  })

  it('arrondit à deux décimales', () => {
    const quote = computeQuote({ weightKg: 3, pricePerKg: 9.99 })
    expect(quote.travelerPrice).toBe(29.97)
    expect(quote.commission).toBe(3.6)
    expect(quote.senderPays).toBe(33.57)
  })

  it('retourne des montants nuls pour un poids nul', () => {
    const quote = computeQuote({ weightKg: 0, pricePerKg: 12 })
    expect(quote.senderPays).toBe(0)
    expect(quote.commission).toBe(0)
  })

  it('rejette un poids négatif', () => {
    expect(() => computeQuote({ weightKg: -1, pricePerKg: 12 })).toThrow('weightKg doit être positif')
  })

  it('rejette un prix négatif', () => {
    expect(() => computeQuote({ weightKg: 5, pricePerKg: -3 })).toThrow('pricePerKg doit être positif')
  })
})
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

Commande : `pnpm test tests/unit/lib/pricing.spec.ts`
Attendu : ÉCHEC, `Failed to resolve import "@/lib/pricing"`.

- [ ] **Step 3: Implémenter `app/lib/pricing.ts`**

```ts
export const COMMISSION_RATE = 0.12
export const MAX_DECLARED_VALUE_EUR = 500

export interface QuoteInput {
  weightKg: number
  pricePerKg: number
}

export interface Quote {
  travelerPrice: number
  commission: number
  senderPays: number
  travelerEarns: number
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function computeQuote({ weightKg, pricePerKg }: QuoteInput): Quote {
  if (weightKg < 0) throw new Error('weightKg doit être positif')
  if (pricePerKg < 0) throw new Error('pricePerKg doit être positif')

  const travelerPrice = round2(weightKg * pricePerKg)
  const commission = round2(travelerPrice * COMMISSION_RATE)

  return {
    travelerPrice,
    commission,
    senderPays: round2(travelerPrice + commission),
    travelerEarns: travelerPrice,
  }
}
```

- [ ] **Step 4: Lancer le test et vérifier qu'il passe**

Commande : `pnpm test tests/unit/lib/pricing.spec.ts`
Attendu : SUCCÈS, 7 tests.

- [ ] **Step 5: Implémenter `ProseBlock.vue`**

```vue
<template>
  <div class="max-w-prose [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_li]:mt-2 [&_p]:mt-4 [&_p]:text-ink-muted [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-ink-muted">
    <slot />
  </div>
</template>
```

- [ ] **Step 6: Implémenter `PricingExample.vue`**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computeQuote } from '@/lib/pricing'

const { t, n } = useI18n()
const quote = computeQuote({ weightKg: 5, pricePerKg: 12 })
</script>

<template>
  <div class="rounded-card border border-line">
    <table class="w-full border-collapse text-left text-sm tabular-nums">
      <caption class="border-b border-line px-6 py-5 text-left font-display text-lg font-semibold">
        {{ t('pricing.example.caption') }}
      </caption>
      <tbody>
        <tr class="border-b border-line">
          <th scope="row" class="px-6 py-4 font-normal text-ink-muted">{{ t('pricing.example.travelerPrice') }}</th>
          <td class="px-6 py-4 text-right">{{ n(quote.travelerPrice, 'currency') }}</td>
        </tr>
        <tr class="border-b border-line">
          <th scope="row" class="px-6 py-4 font-normal text-ink-muted">{{ t('pricing.example.commission') }}</th>
          <td class="px-6 py-4 text-right">{{ n(quote.commission, 'currency') }}</td>
        </tr>
        <tr class="border-b border-line font-semibold">
          <th scope="row" class="px-6 py-4">{{ t('pricing.example.senderPays') }}</th>
          <td class="px-6 py-4 text-right text-terra">{{ n(quote.senderPays, 'currency') }}</td>
        </tr>
        <tr>
          <th scope="row" class="px-6 py-4 font-normal text-ink-muted">{{ t('pricing.example.travelerEarns') }}</th>
          <td class="px-6 py-4 text-right">{{ n(quote.travelerEarns, 'currency') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

Déclarer le format monétaire dans `i18n.config.ts` :

```ts
export default defineI18nConfig(() => ({
  legacy: false,
  numberFormats: {
    fr: { currency: { style: 'currency', currency: 'EUR' } },
    en: { currency: { style: 'currency', currency: 'EUR' } },
  },
}))
```

Puis référencer ce fichier dans la configuration i18n de `nuxt.config.ts` via `vueI18n: './i18n.config.ts'`.

- [ ] **Step 7: Implémenter les six pages restantes**

Toutes suivent le même gabarit. Voici `app/pages/tarifs.vue` en entier — les cinq autres s'en déduisent en changeant le chemin, les clés de locale et le corps du template :

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { buildSeoMeta } from '@/lib/seo'
import { alternateLinks } from '@/lib/locale'
import { MAX_DECLARED_VALUE_EUR } from '@/lib/pricing'

defineI18nRoute({ paths: { fr: '/tarifs', en: '/pricing' } })

const { t, locale } = useI18n()

useSeoMeta(
  buildSeoMeta({
    title: t('pricing.seo.title'),
    description: t('pricing.seo.description'),
    path: '/tarifs',
    locale: locale.value as 'fr' | 'en',
  }),
)
useHead({ link: alternateLinks('/tarifs') })
</script>

<template>
  <UiSection tone="white">
    <UiContainer>
      <h1 class="max-w-[18ch] text-display-xl">{{ t('pricing.title') }}</h1>
      <p class="mt-6 max-w-prose text-lg text-ink-muted">{{ t('pricing.lead') }}</p>

      <div class="mt-12 max-w-2xl">
        <PricingExample />
      </div>

      <p class="mt-8 max-w-prose text-sm text-ink-muted">
        {{ t('pricing.cap', { amount: MAX_DECLARED_VALUE_EUR }) }}
      </p>
    </UiContainer>
  </UiSection>

  <UiSection tone="sand">
    <UiContainer>
      <h2 class="max-w-[22ch] text-display-lg">{{ t('pricing.comparison.title') }}</h2>
      <p class="mt-5 max-w-prose text-ink-muted">{{ t('pricing.comparison.text') }}</p>
    </UiContainer>
  </UiSection>

  <DownloadCta />
</template>
```

La clé `pricing.cap` est une chaîne interpolée : `"La valeur déclarée d'un colis est plafonnée à {amount} €, assurance comprise."`. Le plafond vient de `MAX_DECLARED_VALUE_EUR`, jamais écrit en dur dans le texte.

`app/pages/securite.vue` — chemin anglais `/trust-and-safety`. Contenu dans un `<ProseBlock>` : vérification d'identité Stripe Identity, séquestre et libération des fonds après scan de livraison, plafond de valeur déclarée de 500 €, procédure de litige, traitement et durée de conservation des données personnelles. Ton factuel.

`app/pages/a-propos.vue` — chemin anglais `/about`. Récit à la première personne dans un `<ProseBlock>`.

`app/pages/contact.vue` — chemin anglais `/contact`. Adresse `contactEmail`, distinction entre support utilisateur et demandes presse ou partenariats, et un formulaire `name` / `email` / `message`. **Le site étant statique, le formulaire est un `<form method="post">` pointant vers un service externe à configurer, ou à défaut un lien `mailto:` pré-rempli.** Choisir le `mailto:` en V1 : aucun service tiers à intégrer, aucun risque de spam à gérer, et cela n'ajoute pas de dépendance.

`app/pages/mentions-legales.vue`, `app/pages/cgu.vue`, `app/pages/confidentialite.vue` — chemins anglais `/legal-notice`, `/terms`, `/privacy`. Un `<ProseBlock>` par page, contenu lu depuis `legal.*` dans les locales. Les textes définitifs sont fournis par le porteur (point 2 de la section 8 de la spec) ; en attendant, écrire une structure de rubriques complète et réaliste.

- [ ] **Step 8: Vérifier que toutes les pages se génèrent**

Commande : `pnpm generate && find .output/public -name 'index.html' | sort`
Attendu : 18 fichiers — 9 pages en français et 9 en anglais.

- [ ] **Step 9: Lancer tous les tests**

Commande : `pnpm test -- --coverage`
Attendu : SUCCÈS, couverture de `app/lib/**` supérieure à 90 % sur les quatre métriques.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: pages tarifs, securite, a propos, contact et pages legales"
```

---

## Tâche 12 : Traduction anglaise et vérification des hreflang

**Files:**
- Modify: `i18n/locales/en.json`
- Test: `tests/unit/lib/locale-files.spec.ts`

**Interfaces:**
- Consumes: `i18n/locales/fr.json` comme référence de structure.
- Produces: `en.json` intégralement traduit, avec les mêmes clés.

- [ ] **Step 1: Renforcer le test de cohérence**

Ajouter à `tests/unit/lib/locale-files.spec.ts` :

```ts
it('en.json ne contient plus de texte resté en français', () => {
  const serialized = JSON.stringify(en)
  const frenchMarkers = [' le ', ' la ', ' les ', ' vous ', ' votre ', 'ç', 'é', 'è', 'à ']
  const found = frenchMarkers.filter((marker) => serialized.includes(marker))
  expect(found).toEqual([])
})
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

Commande : `pnpm test tests/unit/lib/locale-files.spec.ts`
Attendu : ÉCHEC — `en.json` est encore une copie du français.

- [ ] **Step 3: Traduire `en.json`**

Traduire chaque valeur en anglais britannique. Points d'attention :

- Les montants restent en euros.
- « expéditeur » se traduit par *sender*, « voyageur » par *traveller* (orthographe britannique).
- Les noms de villes ne se traduisent pas.
- Les URL de chemins anglais sont déjà définies par `defineI18nRoute` dans chaque page, pas dans les locales.

Cette traduction sera relue par le porteur (point 5 de la section 8 de la spec).

- [ ] **Step 4: Lancer les tests et vérifier qu'ils passent**

Commande : `pnpm test`
Attendu : SUCCÈS.

- [ ] **Step 5: Vérifier les hreflang dans le HTML généré**

```bash
pnpm generate
grep -o 'hreflang="[^"]*"' .output/public/tarifs/index.html | sort -u
grep -o 'hreflang="[^"]*"' .output/public/en/pricing/index.html | sort -u
```

Attendu : les deux fichiers listent `hreflang="fr"`, `hreflang="en"` et `hreflang="x-default"`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: traduction anglaise complete du site"
```

---

## Tâche 13 : Sitemap, robots.txt, favicon et images Open Graph

**Files:**
- Create: `public/robots.txt`, `public/favicon.svg`, `public/og/default.png`, `public/logos/logo-yadony.png`, `public/_headers`
- Modify: `nuxt.config.ts`

**Interfaces:**
- Consumes: `siteUrl` de `app/lib/site.ts`.
- Produces: `/sitemap.xml` généré au build et listant les 18 pages, `/robots.txt` pointant vers le sitemap, en-têtes de cache pour les polices.

- [ ] **Step 1: Installer le module sitemap**

```bash
pnpm add @nuxtjs/sitemap@^7
```

Ajouter `'@nuxtjs/sitemap'` aux `modules` et la configuration :

```ts
site: { url: 'https://yadony.com', name: 'yadony' },
sitemap: {
  autoLastmod: false,
  exclude: ['/404'],
},
```

- [ ] **Step 2: Copier le logo depuis le monorepo**

```bash
mkdir -p public/logos public/og
cp ../../../../dony_app/assets/logos/logo-yadony.png public/logos/logo-yadony.png
ls -la public/logos
```

Si le chemin relatif ne correspond pas depuis le worktree, utiliser le chemin absolu `/Users/aboubakardiakite/Desktop/dony/dony_app/assets/logos/logo-yadony.png`.

- [ ] **Step 3: Écrire `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://yadony.com/sitemap.xml
```

- [ ] **Step 4: Créer le favicon**

`public/favicon.svg` — un carré arrondi bleu `#0B5FFF` portant un « y » blanc en Hanken Grotesk, tracé en `<path>` pour ne pas dépendre d'une police externe.

- [ ] **Step 5: Créer l'image Open Graph par défaut**

`public/og/default.png`, 1200 × 630 px : fond sable `#F7F3ED`, logo yadony, accroche de l'accueil en Hanken Grotesk, filet terracotta en bas. À produire avec un outil graphique, ou à partir d'une page HTML capturée en 1200 × 630.

- [ ] **Step 6: Écrire `public/_headers` pour Cloudflare Pages**

```
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/_nuxt/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
```

- [ ] **Step 7: Vérifier le sitemap généré**

```bash
pnpm generate
grep -c '<loc>' .output/public/sitemap.xml
```

Attendu : `18`.

- [ ] **Step 8: Vérifier qu'aucune page n'est privée de métadonnées**

```bash
for f in $(find .output/public -name 'index.html'); do
  grep -q '<meta name="description"' "$f" || echo "SANS DESCRIPTION: $f"
done
```

Attendu : aucune sortie.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: sitemap, robots, favicon, image Open Graph et en-tetes de cache"
```

---

## Tâche 14 : Tests de bout en bout, accessibilité et budget de performance

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/navigation.spec.ts`, `tests/e2e/i18n.spec.ts`, `tests/e2e/a11y.spec.ts`, `tests/e2e/responsive.spec.ts`, `lighthouserc.json`
- Modify: `package.json`

**Interfaces:**
- Consumes: le site généré dans `.output/public`.
- Produces: `pnpm e2e` et `pnpm lighthouse` exécutables localement et en intégration continue.

- [ ] **Step 1: Installer Playwright et axe**

```bash
pnpm add -D @playwright/test @axe-core/playwright
pnpm exec playwright install chromium
```

- [ ] **Step 2: Écrire `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'pnpm generate && pnpm exec serve .output/public -l 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
```

Installer le serveur statique : `pnpm add -D serve`.

- [ ] **Step 3: Écrire `tests/e2e/navigation.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

const PAGES = [
  '/', '/comment-ca-marche', '/tarifs', '/securite',
  '/a-propos', '/contact', '/mentions-legales', '/cgu', '/confidentialite',
]

for (const path of PAGES) {
  test(`la page ${path} se charge sans erreur console`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', (err) => errors.push(err.message))

    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
    expect(errors).toEqual([])
  })
}

test('la navigation du header mène aux bonnes pages', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Tarifs' }).first().click()
  await expect(page).toHaveURL('/tarifs')
})

test('les liens de stores pointent vers les magasins officiels', async ({ page }) => {
  await page.goto('/')
  const appStore = page.getByRole('link', { name: /App Store/i }).first()
  const playStore = page.getByRole('link', { name: /Google Play/i }).first()
  await expect(appStore).toHaveAttribute('href', /apps\.apple\.com/)
  await expect(playStore).toHaveAttribute('href', /play\.google\.com/)
})
```

- [ ] **Step 4: Écrire `tests/e2e/i18n.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('le sélecteur de langue conserve la page équivalente', async ({ page }) => {
  await page.goto('/tarifs')
  await page.getByRole('link', { name: /English/i }).click()
  await expect(page).toHaveURL('/en/pricing')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

test('chaque page déclare ses hreflang', async ({ page }) => {
  await page.goto('/tarifs')
  await expect(page.locator('link[hreflang="fr"]')).toHaveCount(1)
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(1)
  await expect(page.locator('link[hreflang="x-default"]')).toHaveCount(1)
})

test('les onglets de rôle sont pilotés par l’URL', async ({ page }) => {
  await page.goto('/comment-ca-marche?role=voyageur')
  await expect(page.getByRole('tab', { name: /voyageur/i })).toHaveAttribute('aria-selected', 'true')
})
```

- [ ] **Step 5: Écrire `tests/e2e/a11y.spec.ts`**

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGES = ['/', '/comment-ca-marche', '/tarifs', '/securite', '/a-propos', '/contact']

for (const path of PAGES) {
  test(`la page ${path} ne présente aucune violation critique`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const serious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(serious.map((v) => `${v.id} sur ${v.nodes.length} noeud(s)`)).toEqual([])
  })
}

test('le lien d’évitement est accessible au clavier', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: /contenu/i })).toBeFocused()
})
```

- [ ] **Step 6: Écrire `tests/e2e/responsive.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

const PAGES = ['/', '/comment-ca-marche', '/tarifs']

for (const path of PAGES) {
  test(`la page ${path} ne défile pas horizontalement en 360 px`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}
```

- [ ] **Step 7: Lancer les tests de bout en bout**

Commande : `pnpm e2e` (ajouter `"e2e": "playwright test"` et `"e2e:ui": "playwright test --ui"` aux scripts)
Attendu : tous verts. Toute violation d'accessibilité remontée doit être corrigée dans les composants concernés, pas contournée dans le test.

- [ ] **Step 8: Configurer le budget Lighthouse**

`lighthouserc.json` :

```json
{
  "ci": {
    "collect": {
      "staticDistDir": ".output/public",
      "url": ["http://localhost/index.html", "http://localhost/tarifs/index.html"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 1 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "total-byte-weight": ["error", { "maxNumericValue": 1000000 }]
      }
    }
  }
}
```

```bash
pnpm add -D @lhci/cli
```

Ajouter le script `"lighthouse": "lhci autorun"`.

- [ ] **Step 9: Lancer Lighthouse**

Commande : `pnpm generate && pnpm lighthouse`
Attendu : les quatre assertions passent. Si la performance est en dessous du seuil, les causes probables sont dans cet ordre : images non converties en `.webp`, absence de `width`/`height` sur une image, préchargement de police manquant.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "test: parcours de bout en bout, accessibilite et budget de performance"
```

---

## Tâche 15 : Intégration continue et déploiement Cloudflare Pages

**Files:**
- Create: `.github/workflows/ci.yml`, `README.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: tous les scripts définis précédemment.
- Produces: une CI qui bloque la fusion si le lint, les types, les tests unitaires, la couverture, les tests de bout en bout ou le budget Lighthouse échouent ; et une documentation de déploiement.

- [ ] **Step 1: Écrire `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test:coverage
      - run: pnpm generate
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm e2e
      - run: pnpm lighthouse
```

- [ ] **Step 2: Vérifier la CI localement**

Commande : `pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm generate && pnpm e2e && pnpm lighthouse`
Attendu : toutes les étapes passent. C'est exactement ce que la CI exécutera.

- [ ] **Step 3: Écrire le `README.md`**

Contenu : présentation en une phrase, prérequis (Node 22, pnpm), commandes de développement, commandes de test, procédure de mise à jour des captures d'écran, et paramètres de déploiement Cloudflare Pages :

- Commande de build : `pnpm generate`
- Répertoire de sortie : `.output/public`
- Version de Node : `22`
- Aucune variable d'environnement requise

Documenter aussi les cinq éléments encore à fournir par le porteur (section 8 de la spec) et l'emplacement où les déposer.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "ci: pipeline de verification et documentation de deploiement"
```

- [ ] **Step 5: Pousser la branche**

```bash
git push -u origin HEAD
```

La connexion du dépôt à Cloudflare Pages est une action manuelle dans le tableau de bord Cloudflare : elle ne peut pas être scriptée depuis ce plan et revient au porteur, avec les paramètres documentés dans le README.

---

## Écarts assumés par rapport à la spec

- **Pas de dossier `app/composables/`.** La spec citait `useSeo` et `useStoreLinks` comme composables. Le plan les remplace par des fonctions pures dans `app/lib/` (`buildSeoMeta`) et par le composant `StoreBadges`. Motif : une fonction pure se teste sans mocker les API de Nuxt, ce qui rend la cible de 90 % de couverture atteignable sans machinerie de test. Le glob de couverture `app/composables/**` reste dans `vitest.config.ts` au cas où un composable apparaîtrait plus tard.
- **Pas de dossier `content/` en V1.** Il ne sera créé qu'à l'arrivée des pages corridors, avec `@nuxt/content`. Un dossier vide n'apporte rien et ne serait pas versionné.

---

## Notes d'exécution

- **Ordre des tâches.** Elles sont séquentielles : chacune s'appuie sur les interfaces produites par les précédentes. Les Tâches 7, 8 et 9 construisent l'accueil par morceaux et peuvent être relues indépendamment.
- **Contenu rédactionnel.** Chaque tâche qui ajoute des clés de locale demande d'écrire du vrai texte français. Ce texte est provisoire jusqu'à relecture par le porteur, mais il ne doit jamais être du remplissage : les tests de bout en bout et le budget Lighthouse s'appuient dessus.
- **Captures d'écran.** Tant que les fichiers `.webp` ne sont pas fournis, les balises `<img>` pointent vers des fichiers absents. Les dimensions étant déclarées, la mise en page reste correcte et les tests passent ; seul le rendu visuel est incomplet. Ne pas remplacer par des images de substitution génériques.
- **Si un test d'accessibilité échoue**, corriger le composant. Ne jamais assouplir l'assertion.
