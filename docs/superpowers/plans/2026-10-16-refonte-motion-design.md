# Refonte motion design de yadony.com — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** refaire yadony.com en site raconté et animé (parcours voyageur et expéditeur guidés par la mascotte Dony), aligné sur le design system de l'app, sans perdre une URL ni un point de référencement.

**Architecture:** évolution du site Nuxt 4 prérendu. Le motion repose sur des primitives maison (IntersectionObserver, `position: sticky`, transitions CSS, SVG inline), sans bibliothèque. Les images sont produites une fois par un script (`sharp`) en AVIF et WebP, et référencées par un registre typé (`app/lib/media.ts`). Les textes vivent dans des fichiers de locale découpés par domaine.

**Tech Stack:** Nuxt 4, Vue 3.5, Tailwind 3, @nuxtjs/i18n 10, @nuxtjs/sitemap, Vitest + happy-dom, Playwright + axe, Lighthouse CI, sharp (devDependency).

**Spec:** `docs/superpowers/specs/2026-10-16-refonte-motion-design.md`

## Global Constraints

- URLs existantes inchangées ; chaque URL du sitemap = un fichier `.html` servi en 200 avec une canonical égale à elle-même (`tests/e2e/seo-indexation.spec.ts`).
- Tokens = design system de l'app (`dony_app/lib/core/design/tokens/`) : primary `#0B5FFF`, accent `#D96A3A`, ink `#0A2540`, sable `#F7F3ED`, rayons carte 16 / bouton 14 / champ 12 / pastille 20 / feuille 24, durées 150 / 220 / 320 / 480 ms, courbe `cubic-bezier(0.2, 0.8, 0.2, 1)`, décalage 60 ms.
- Aucun dégradé (`linear-gradient`, `radial-gradient`, `conic-gradient`) dans `app/`.
- Aucun texte en dur : toute chaîne visible passe par une clé i18n présente en FR et en EN (sauf pages GP, FR seulement).
- Nom public « Yadony » ; « Dony » = la mascotte uniquement.
- Pas de bibliothèque d'animation ; JS total de l'accueil ≤ 100 Ko, poids ≤ 1 Mo.
- `prefers-reduced-motion: reduce` : aucun mouvement, contenu et état final visibles.
- Aucun chiffre inventé, aucun faux témoignage ; captures anonymisées (noms, photos, QR, 🐞, « TestFlight »).
- Couverture Vitest ≥ 90 % sur `app/lib/**` et `app/composables/**`.

## Review Focus

1. **Visiteur sans JS ou robot** : tout le texte des 8 étapes du parcours croisé est dans le HTML prérendu et visible → test e2e `javaScriptEnabled: false` sur l'accueil (Task 6).
2. **Téléphone étroit (360 px)** : la scène épinglée ne doit pas déborder ni cacher d'étape → test e2e mobile qui compte les titres d'étapes visibles (Task 6).
3. **Mouvement réduit** : l'état final de chaque visuel (accord de négociation, cadenas ouvert, frise pleine) est visible → test e2e `reducedMotion: 'reduce'` (Task 6).
4. **Page anglaise** : aucune clé i18n brute (`home.`, `journey.`) affichée sur `/en`, `/en/become-a-traveler`, `/en/flight-deals` → test e2e (Task 12).
5. **Image manquante** (pose de Dony pas encore fournie) : le registre retombe sur une pose existante, jamais d'image cassée → test unitaire `donyPose('price-alert')` (Task 1).

---

## Structure des fichiers

```
scripts/images/build.mjs               # sources → public/img/** (AVIF + WebP, 2 largeurs)
assets-src/app/*.png                   # captures ANONYMISÉES (originaux jamais commités)
assets-src/dony/*.png                  # poses de Dony
public/img/app/*, public/img/dony/*    # sorties générées (commitées)
app/lib/media.ts                       # registre typé des écrans et poses
app/lib/journeys.ts                    # étapes des parcours (clés, écran, pose, visuel)
app/lib/corridors.ts                   # 12 corridors + voisins
app/lib/gp.ts                          # 4 pages GP
app/lib/structured-data.ts             # + breadcrumbJsonLd
app/composables/useInView.ts           # visibilité + mouvement réduit
app/composables/useScrollSteps.ts      # étape active d'une scène
app/components/ui/UiPicture.vue        # <picture> AVIF/WebP
app/components/ui/UiPhone.vue          # iPhone CSS avec fondu entre écrans
app/components/ui/UiReveal.vue         # remplace UiRevealOnScroll (variantes)
app/components/ui/UiScrollScene.vue    # scène épinglée à étapes
app/components/art/*.vue               # SVG animés (route, carte, négociation, cadenas, frise, courbe, formules)
app/components/journey/*.vue           # étape, scène croisée, scène d'un parcours
app/components/home/*.vue              # sections de l'accueil
i18n/locales/{fr,en}/*.json            # locales découpées par domaine
```

---

### Task 1 : Pipeline d'images et registre `media.ts`

**Files:**
- Create: `scripts/images/build.mjs`, `assets-src/app/*.png`, `assets-src/dony/*.png`, `app/lib/media.ts`, `app/components/ui/UiPicture.vue`
- Modify: `package.json` (script `images`, devDependency `sharp`)
- Test: `tests/unit/lib/media.spec.ts`, `tests/unit/lib/public-assets.spec.ts`

**Interfaces:**
- Produces:
  - `type AppScreenId = 'flights-hub' | 'flight-alerts' | 'flights-found' | 'search-map' | 'search-list' | 'trip-detail' | 'traveler-profile' | 'publish-trip' | 'trip-drafts' | 'my-trips' | 'requests-list' | 'request-detail' | 'negotiation' | 'price-talks' | 'chat' | 'scan' | 'follow-parcel' | 'my-parcels' | 'parcel-ticket' | 'parcel-tracking' | 'wallet' | 'mobile-money'`
  - `type DonyPoseId = 'hello' | 'search' | 'travel' | 'waiting' | 'success' | 'celebration' | 'welcome' | 'no-result' | 'publish' | 'handover' | 'price-alert' | 'ticket' | 'scale' | 'price-grid' | 'handshake' | 'padlock' | 'scan' | 'window' | 'delivery' | 'id-card' | 'download'`
  - `appScreen(id): { base: string; width: 1170; height: 2532 }`, `donyPose(id): { base: string; width: number; height: number }` (repli sur une pose existante), `srcset(base, format)`.
  - `<UiPicture :image :alt :sizes :eager />`

- [ ] **Step 1 : anonymiser les captures.** Script Pillow ponctuel (hors dépôt, dans le scratchpad) : pour chaque capture retenue, peindre la couleur de fond sur le 🐞, sur « TestFlight » et sur chaque nom/avatar réel, puis réécrire un prénom fictif (Aminata K., Moussa D., Fatou S., Ibrahim T.) en Plus Jakarta Sans de même graisse ; flouter les QR codes. Sortie : `assets-src/app/<id>.png`. Vérifier chaque sortie visuellement.
- [ ] **Step 2 : copier les poses** de `dony_app/assets/mascotte/*.png` et des scènes `dony_app/assets/illustrations/{envoie_colis,publier_trajet}.png` vers `assets-src/dony/`.
- [ ] **Step 3 : test qui échoue** (`media.spec.ts`) : chaque `AppScreenId` et `DonyPoseId` résout une base ; `donyPose('price-alert').base` = pose de repli tant que le fichier n'existe pas ; `srcset` produit `…-480.avif 480w, …-960.avif 960w`.
- [ ] **Step 4 : `build.mjs`** : pour chaque source, `sharp` → `public/img/<dir>/<id>-{480,960}.{avif,webp}` (qualité AVIF 55, WebP 75), puis écrit `app/lib/media-manifest.json` (`{ id: { width, height } }`). `media.ts` lit ce manifeste.
- [ ] **Step 5 : test de garde** (`public-assets.spec.ts`) : aucun fichier de `public/img/**` > 200 Ko.
- [ ] **Step 6 :** `pnpm images && pnpm test` au vert, puis commit `feat(media): pipeline d'images AVIF/WebP et registre typé`.

### Task 2 : Tokens du design system et suppression des dégradés

**Files:**
- Modify: `app/assets/css/tokens.css`, `tailwind.config.ts`, `app/components/ui/UiButton.vue`, `app/components/StoreBadges.vue`, `app/components/sections/HeroDownload.vue` (puis supprimé en Task 5), tout fichier contenant un dégradé
- Test: `tests/unit/lib/no-gradient.spec.ts`

**Interfaces:**
- Produces : classes Tailwind `bg-primary`, `bg-primary-soft`, `bg-accent`, `bg-accent-soft`, `text-accent-text`, `bg-bg`, `bg-sand`, `bg-navy`, `bg-navy-deep`, `text-ink`, `text-ink-muted`, `border-line`, `text-success` ; rayons `rounded-card` (16), `rounded-btn` (14), `rounded-field` (12), `rounded-pill` (20), `rounded-sheet` (24) ; ombres `shadow-xs|sm|md|lg|brand` ; `transition-timing-function: ease-dony` ; durées `duration-micro|base|slow|page`. Variante `UiButton` `accent` remplace `orange`.

- [ ] **Step 1 : test qui échoue** : parcourt `app/**/*.{vue,css,ts}` et échoue sur `/(linear|radial|conic)-gradient\(/`.
- [ ] **Step 2 :** réécrire `tokens.css` avec les valeurs de la spec §5.1 (canaux RGB pour l'alpha Tailwind) ; étendre `tailwind.config.ts` (couleurs, `borderRadius`, `boxShadow` reprenant `DonyShadow`, `transitionTimingFunction.dony`, `transitionDuration`).
- [ ] **Step 3 :** remplacer `orange` par `accent` dans `UiButton`/`StoreBadges` ; retirer les dégradés.
- [ ] **Step 4 :** tests + `pnpm generate` au vert ; commit `feat(design): tokens du design system de l'app, sans dégradé`.

### Task 3 : Primitives de motion

**Files:**
- Create: `app/composables/useInView.ts`, `app/composables/useScrollSteps.ts`, `app/components/ui/UiReveal.vue`, `app/components/ui/UiScrollScene.vue`, `app/components/ui/UiPhone.vue`
- Modify: `app/assets/css/main.css` (keyframes `dony-float`, `dony-draw`, `dony-marquee`, `dony-pulse` ; règles reveal ; mouvement réduit)
- Delete: `app/components/ui/UiRevealOnScroll.vue`, `app/components/ui/UiPhoneFrame.vue` (remplacés)
- Test: `tests/unit/composables/useInView.spec.ts`, `tests/unit/composables/useScrollSteps.spec.ts`, `tests/unit/components/UiScrollScene.spec.ts`

**Interfaces:**
- `useInView(target: Ref<Element|null>, opts?: { once?: boolean; rootMargin?: string; threshold?: number }): { inView: Ref<boolean>; reducedMotion: Ref<boolean> }` — `reducedMotion` vrai ⇒ `inView` vrai d'office.
- `useScrollSteps(stepEls: Ref<Element[]>, opts?: { rootMargin?: string }): { active: Ref<number> }` — l'étape dont le centre traverse la ligne médiane de l'écran devient active ; ne recule jamais sous 0 ni au-delà du dernier index.
- `<UiReveal as="div" variant="up|scale|fade" :delay>` — SSR visible, classe initiale posée au montage seulement.
- `<UiScrollScene :steps="n" v-slot="{ active }">` slots `visual` (sticky ≥ lg) et `step-<i>` ; sous lg, rend chaque étape suivie de son visuel (`#visual` reçoit `active = i`).
- `<UiPhone :screens="AppScreenId[]" :active="number" :alt-keys="string[]" :eager>` — superpose les écrans, fondu `opacity` 320 ms.

- [ ] **Step 1 : tests qui échouent** (IntersectionObserver simulé dans `tests/setup.ts`) : `useInView` passe à vrai à l'intersection, reste vrai avec `once`, vrai d'office si `matchMedia('(prefers-reduced-motion: reduce)')` ; `useScrollSteps` met `active` à l'index intersecté le plus récent ; `UiScrollScene` rend `n` étapes et passe `active`.
- [ ] **Step 2 :** implémenter ; migrer les usages de `UiRevealOnScroll` vers `UiReveal`.
- [ ] **Step 3 :** tests au vert, couverture ≥ 90 % ; commit `feat(motion): primitives de révélation, scène à étapes et téléphone`.

### Task 4 : Illustrations SVG animées

**Files:**
- Create: `app/components/art/ArtRouteLine.vue` (ligne Paris → ville qui se dessine, avion qui la suit), `ArtCorridorMap.vue` (France → 4 capitales, liens), `ArtNegotiation.vue` (bulles offre / contre-offre / accord selon `step` 0–3), `ArtPadlock.vue` (`locked: boolean`), `ArtTrackingTimeline.vue` (`progress` 0–4 : Remis, En vol, Arrivé, Livré), `ArtPriceCurve.vue` (courbe qui passe sous le seuil + notification), `ArtPriceModes.vue` (3 cartes qui se retournent : kilo, négociable, grille), `ArtPaymentMarquee.vue` (Carte, Wave, Orange Money, MTN MoMo, Moov, portefeuille, espèces)
- Test: `tests/unit/components/ArtNegotiation.spec.ts`, `ArtTrackingTimeline.spec.ts`

**Interfaces:** chaque composant reçoit ses états par props et ne lit aucun observer lui-même ; tous les libellés passent par props ou `t()` ; `aria-hidden="true"` sur le SVG décoratif, texte équivalent dans le DOM de l'étape.

- [ ] **Step 1 : tests qui échouent** : `ArtNegotiation` à `step=3` affiche le libellé d'accord ; `ArtTrackingTimeline` à `progress=2` marque 3 jalons faits.
- [ ] **Step 2 :** implémenter en SVG inline, couleurs par `currentColor`/tokens, animations par transitions sur `stroke-dashoffset`, `transform`, `opacity`.
- [ ] **Step 3 :** commit `feat(art): illustrations SVG animées des parcours`.

### Task 5 : Locales découpées et contenus de l'accueil

**Files:**
- Modify: `nuxt.config.ts` (`files: ['fr/common.json','fr/home.json','fr/journeys.json','fr/corridors.json','fr/gp.json', …]`), déplacer `i18n/locales/fr.json` → `fr/common.json` (idem EN), `tests/unit/lib/locale-files.spec.ts`
- Create: `i18n/locales/{fr,en}/home.json`, `{fr,en}/journeys.json`

- [ ] **Step 1 :** adapter `locale-files.spec.ts` pour fusionner les fichiers d'une langue et vérifier la parité des clés FR/EN (GP exclu de la parité).
- [ ] **Step 2 :** écrire les textes de l'accueil (spec §4.1) et des deux parcours (étapes, titres, textes, alt des écrans) en FR et EN, tutoiement, sans chiffre inventé.
- [ ] **Step 3 :** commit `feat(i18n): locales par domaine, textes de l'accueil et des parcours`.

### Task 6 : Accueil

**Files:**
- Create: `app/lib/journeys.ts`, `app/components/home/{HomeHero,HomePromises,HomeVideo,HomeTrust,HomePayments,HomeCorridors,HomeRecipient,HomeFinalCta}.vue`, `app/components/journey/{JourneyStep,JourneyCrossed}.vue`
- Modify: `app/pages/index.vue`, `app/components/sections/HomeFaq.vue`
- Delete (code mort après remplacement, avec leurs tests) : `HeroDownload`, `ProblemComparison`, `TrackingWalkthrough`, `TravelerBanner`, `TrustPillars`, `CorridorsSeo` s'ils n'ont plus d'appelant (vérifier par grep)
- Test: `tests/unit/lib/journeys.spec.ts`, `tests/e2e/home.spec.ts`

**Interfaces:**
- `journeys.ts` : `type JourneyStep = { id: string; actor: 'traveler'|'sender'|'both'; screen?: AppScreenId; pose?: DonyPoseId; art?: 'priceCurve'|'priceModes'|'negotiation'|'padlock'|'route'|'timeline' }` ; `crossedJourney: JourneyStep[]` (8 étapes), `travelerJourney`, `senderJourney`.

- [ ] **Step 1 : tests qui échouent** : `crossedJourney` a 8 étapes aux ids uniques, chaque `screen` existe dans le registre ; e2e : un H1, 8 titres d'étapes présents **sans JS**, visibles en `reducedMotion`, visibles sur Pixel 5 ; l'étape active change au défilement sur desktop.
- [ ] **Step 2 :** implémenter les sections (spec §4.1), haut de page visible sans attendre d'animation, image du téléphone `eager` + `fetchpriority="high"`, sections sous la ligne de flottaison en `hydrate-on-visible`.
- [ ] **Step 3 :** e2e au vert ; commit `feat(home): accueil raconté, parcours croisé animé`.

### Task 7 : Page parcours expéditeur `/envoyer-colis`

**Files:** Modify `app/pages/envoyer-colis/index.vue` ; Create `app/components/journey/JourneyScene.vue` (scène d'un seul parcours, réutilisée en Task 8) ; Test `tests/e2e/journeys.spec.ts`

- [ ] Étapes `senderJourney` (spec §4.2), encart destinataire, tuto vidéo `tuto-envoyer-colis` au clic, grille des 12 corridors, FAQ + JSON-LD FAQPage + BreadcrumbList. E2E : H1, étapes présentes sans JS. Commit `feat(envoyer-colis): parcours expéditeur raconté`.

### Task 8 : Pages `/devenir-voyageur` et `/billets-avion`

**Files:** Create `app/pages/devenir-voyageur.vue` (`defineI18nRoute({ paths: { fr: '/devenir-voyageur', en: '/become-a-traveler' } })`), `app/pages/billets-avion.vue` (`fr: '/billets-avion', en: '/flight-deals'`) ; Modify `nitro.prerender.routes` si besoin ; Test `tests/e2e/journeys.spec.ts`

- [ ] Voyageur (spec §4.3) avec `ArtPriceModes` et tuto `tuto-publier-trajet` ; billets (spec §4.4) avec `ArtPriceCurve`, mention partenaire. FAQ + JSON-LD. E2E sur les deux langues. Commit `feat(parcours): pages voyageur et billets d'avion`.

### Task 9 : 12 corridors et voisins

**Files:** Modify `app/lib/corridors.ts` (7 corridors, `neighbors(corridor, n = 3)`), `app/pages/envoyer-colis/[slug].vue` (voisins, fil d'Ariane, visuel `ArtRouteLine`, lien GP) ; Create `i18n/locales/{fr,en}/corridors.json` (contenu unique des 12) ; Modify `app/lib/structured-data.ts` (`breadcrumbJsonLd(items: { name: string; path: string }[])`) ; Test `tests/unit/lib/corridors.spec.ts`, `structured-data.spec.ts`

- [ ] Tests : 12 corridors, slugs uniques, `neighbors` ne renvoie jamais le corridor lui-même et privilégie même départ ou même arrivée ; `breadcrumbJsonLd` produit des `ListItem` positionnés avec URL absolues. Contenus FR/EN uniques (communauté, aéroports, durée de vol vérifiable, retrait sur place, 3 questions de FAQ propres). Commit `feat(corridors): 12 corridors, voisins et fil d'Ariane`.

### Task 10 : Pages GP

**Files:** Create `app/lib/gp.ts`, `app/pages/gp/[slug].vue` (FR seulement : `defineI18nRoute({ paths: { fr: '/gp/[slug]' }, locales: ['fr'] })`), `i18n/locales/fr/gp.json` ; Modify `nuxt.config.ts` (prérendu `/gp/*`, sitemap) ; Test `tests/unit/lib/gp.spec.ts`, e2e

- [ ] 4 pages `paris-dakar`, `paris-abidjan`, `paris-bamako`, `paris-douala` : « les GP, en vérifié », liées depuis le corridor ; pas d'alternate EN ; canonical propre. Commit `feat(gp): pages GP vérifiés`.

### Task 11 : En-tête, pied de page et pages restylées

**Files:** Modify `SiteHeader.vue` (liens : Envoyer un colis, Devenir voyageur, Billets d'avion, Comment ça marche, Tarifs, Sécurité), `SiteFooter.vue` (toutes les pages, corridors, GP), `PageHero.vue`, `comment-ca-marche.vue` (deux parcours résumés + 2 tutos), `tarifs.vue`, `securite.vue`, `a-propos.vue`, `contact.vue`, `error.vue`

- [ ] Restyle sur les tokens, Dony sur les pages clés, aucun texte en dur. Commit `feat(pages): en-tête, pied de page et pages restylés`.

### Task 12 : SEO, budgets et vérification finale

**Files:** Modify `nuxt.config.ts` (sitemap : nouvelles pages, GP sans alternate), `lighthouserc.json` (accueil + `/devenir-voyageur`), `public/og/*` (images OG des pages parcours), `tests/e2e/navigation.spec.ts`, `a11y.spec.ts`, `i18n.spec.ts` ; Create `tests/e2e/no-raw-keys.spec.ts`

- [ ] E2E : toutes les pages en 200 sans erreur console, axe sans violation, aucune clé brute en EN, sitemap cohérent (spec existante). Lighthouse : SEO 1, a11y ≥ 0,95, perf ≥ 0,95, ≤ 1 Mo, JS ≤ 100 Ko.
- [ ] `pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm generate && pnpm e2e && pnpm lighthouse`.
- [ ] PR, CI verte, fusion (déploiement autorisé par le propriétaire le 2026-10-16), vérification en ligne des URLs et canonicals.
