# Spec de conception — yadony.com (site vitrine)

**Date :** 2026-08-29
**Auteur :** A-diakite
**Repo :** `yadony-web`
**Statut :** validé, prêt pour le plan d'implémentation

---

## 1. Contexte et objectif

yadony (produit `dony`) est une marketplace P2P mobile qui met en relation des
voyageurs disposant d'espace bagage avec des expéditeurs de la diaspora
africaine, sur le corridor Europe → Afrique subsaharienne (Paris, Lyon,
Marseille → Dakar, Abidjan, Bamako, Douala).

`yadony.com` est le site web public de la société. Il n'existe pas encore : le
repo `yadony-web` est vide hormis un README.

**Objectif prioritaire, tranché avec le porteur du projet : l'acquisition SEO.**
Le site doit capter les recherches organiques de la diaspora (« envoyer un colis
à Dakar », « transporter des bagages Paris Abidjan ») et convertir ce trafic en
téléchargements de l'application. Toutes les décisions techniques en découlent :
rendu statique, métadonnées complètes, budget de performance strict.

**Contrainte explicite du porteur :** le site ne doit pas ressembler à une
production générée par une IA. Cette contrainte est traitée comme une exigence
de conception de premier rang, détaillée en section 5.

### Ce qui n'est pas dans le périmètre V1

- Les pages corridors (`/envoyer-colis/paris-dakar`) — prévues en V2, mais
  l'architecture doit les accueillir sans refonte.
- Le blog et le centre d'aide — V2 ou plus tard.
- Tout contenu dynamique : recherche d'annonces, prix en temps réel, compte
  utilisateur. Le site reste 100 % statique.

---

## 2. Décisions structurantes

| Sujet | Décision | Raison |
|---|---|---|
| Objectif n°1 | Acquisition SEO | Choix du porteur |
| Périmètre V1 | Vitrine minimale, 9 pages | Livrer vite, étendre ensuite |
| Direction artistique | Produit-first (l'app est le héros) | Choix du porteur |
| Captures d'écran | Fournies par le porteur | Rendu supérieur aux captures existantes |
| Langues | Français + anglais | Diaspora francophone et anglophone |
| Stack | Nuxt 4 + Tailwind, prérendu | Cohérence avec `dony-admin` et `dony-pro` |
| Hébergement | Cloudflare Pages | Statique, CDN, latence Afrique correcte |
| Typographie | Celle de l'app mobile | Le site doit refléter l'app téléchargée |

### Justification du choix de stack

Deux alternatives ont été écartées :

- **Astro** — techniquement supérieur pour un site de contenu pur (zéro JS par
  défaut), mais introduirait une quatrième technologie dans le monorepo
  (Flutter, Spring Boot, Nuxt, Astro) sans partage de composants avec
  `dony-pro`. Le gain de performance est marginal face à un Nuxt prérendu.
- **Nuxt en SSR** — nécessiterait un serveur Node à héberger et monitorer, pour
  aucun bénéfice tant qu'il n'y a pas de contenu dynamique.

Nuxt 4 prérendu (`nuxt generate`) produit du HTML statique, réutilise le design
system et les conventions déjà en place dans le monorepo, et laisse la porte
ouverte à `@nuxt/content` pour les corridors de la V2.

---

## 3. Architecture

### Arborescence

```
yadony-web/
├─ app/
│  ├─ components/
│  │  ├─ ui/                 # primitives : Button, Container, Section, Accordion
│  │  └─ sections/           # blocs de page : HeroDownload, TrackingWalkthrough…
│  ├─ layouts/
│  │  └─ default.vue         # header + footer
│  ├─ pages/
│  │  ├─ index.vue
│  │  ├─ comment-ca-marche.vue
│  │  ├─ securite.vue
│  │  ├─ tarifs.vue
│  │  ├─ a-propos.vue
│  │  ├─ contact.vue
│  │  ├─ mentions-legales.vue
│  │  ├─ cgu.vue
│  │  └─ confidentialite.vue
│  ├─ composables/           # useSeo, useStoreLinks
│  ├─ assets/css/
│  │  ├─ tokens.css          # variables CSS de couleur et d'espacement
│  │  └─ fonts.css           # @font-face auto-hébergés
│  └─ app.vue
├─ public/
│  ├─ fonts/                 # woff2 Hanken Grotesk + Plus Jakarta Sans
│  ├─ logos/                 # logo-yadony.svg et .png
│  ├─ screenshots/           # captures fournies par le porteur
│  ├─ og/                    # images Open Graph par page
│  └─ robots.txt
├─ i18n/locales/
│  ├─ fr.json
│  └─ en.json
├─ content/                  # vide en V1, prêt pour les corridors V2
├─ tests/
│  ├─ unit/                  # Vitest
│  └─ e2e/                   # Playwright
├─ nuxt.config.ts
├─ tailwind.config.ts
└─ package.json
```

### Principes de découpage

1. **Une section de page = un composant isolé.** Chaque bloc de l'accueil
   (`HeroDownload`, `ProblemComparison`, `TrackingWalkthrough`, `TrustPillars`,
   `TravelerBanner`, `FaqAccordion`, `DownloadCta`) est un composant autonome :
   il reçoit ses données en props, ne connaît pas la page qui l'utilise, et peut
   être testé seul. Les futures pages corridors réutiliseront ces mêmes blocs.

2. **Aucun texte en dur dans les composants.** Tout passe par les fichiers de
   locale. C'est la condition pour que l'ajout de l'anglais reste gratuit, et
   ça rend les composants testables sans dépendre du contenu rédactionnel.

3. **Pas de librairie de composants UI.** Ni shadcn, ni Nuxt UI, ni DaisyUI. Ces
   kits produisent précisément le rendu générique que le porteur veut éviter.
   Les primitives sont écrites à la main, une poignée suffit.

4. **Un fichier reste petit.** Si un composant de section dépasse ~150 lignes,
   il fait trop de choses et doit être découpé.

### Dépendances

Production : `nuxt@^4`, `vue@^3.5`, `@nuxtjs/tailwindcss`, `@nuxtjs/i18n`,
`@nuxtjs/sitemap`, `@fontsource/hanken-grotesk`, `@fontsource/plus-jakarta-sans`.

Développement : `vitest`, `@vue/test-utils`, `@vitest/coverage-v8`,
`@playwright/test`, `@axe-core/playwright`, `eslint`, `@nuxt/eslint`,
`typescript`.

Aucune librairie d'animation externe : les transitions sont en CSS et via
l'API `IntersectionObserver`.

### Build et déploiement

- `nuxt generate` produit `.output/public`, du HTML statique intégral.
- Déploiement Cloudflare Pages déclenché sur push git.
- Aucune variable d'environnement secrète : le site ne parle à aucune API.
  Les liens de stores et l'adresse de contact vivent dans les fichiers de locale.

---

## 4. Contenu des pages

Neuf pages, chacune déclinée en français et en anglais.

### 4.1 Accueil

Le scroll raconte un envoi de bout en bout.

1. **Hero** — accroche courte (6 à 8 mots), une phrase de contexte, deux boutons
   de store. Le visuel du téléphone est décalé à droite et coupé par le bord de
   la fenêtre. Pas de badge de notation, pas de compteur d'utilisateurs.
2. **Le problème** — comparaison factuelle entre l'envoi via WhatsApp, les
   transporteurs classiques et yadony, sur le prix, le délai et le recours en
   cas de problème. Présentée en tableau, pas en cartes.
3. **Le parcours QR** — bloc central du site. Quatre étapes : dépôt à Paris,
   scan à l'aéroport, en vol, livraison à Dakar avec photo de confirmation.
   Défilement horizontal des captures sur desktop, carrousel sur mobile.
4. **Les trois garanties** — KYC vérifié, paiement séquestre, assurance incluse.
   Traitement éditorial : un chiffre ou un mot mis en avant en terracotta,
   suivi d'une explication courte.
5. **Bandeau voyageur** — fond sable, message dédié à la monétisation de
   l'espace bagage, avec un ordre de grandeur de gain réel.
6. **FAQ** — huit questions en `<details>` natif, donc indexables.
7. **Téléchargement** — boutons de stores et QR code vers l'application.

### 4.2 Comment ça marche

Deux parcours en cinq étapes, Expéditeur et Voyageur, sélectionnés par onglets.
**L'onglet actif est reflété dans l'URL** (`?role=voyageur`) pour être
partageable et indexable ; l'état est lu depuis l'URL au chargement.

### 4.3 Sécurité et confiance

Page différenciante sur ce marché. Contenu : vérification d'identité par Stripe
Identity, séquestre des fonds et libération à la livraison confirmée, plafond de
valeur déclarée à 500 €, procédure de litige, traitement et conservation des
données personnelles. Ton factuel et précis, jamais promotionnel.

### 4.4 Tarifs

Commission de 12 %, présentée avec un exemple chiffré complet : colis de 5 kg
Paris → Dakar, ce que paie l'expéditeur, ce que perçoit le voyageur, ce que
prélève yadony. Comparaison avec le tarif d'un transporteur classique. La
transparence tarifaire est ici l'argument de vente.

### 4.5 À propos

Récit à la première personne de la raison d'être du produit. Page la moins
imitable du site et la plus humaine ; elle porte une part importante de la
crédibilité.

### 4.6 Contact

Adresse email, formulaire minimal (nom, email, message), et séparation claire
entre le support utilisateur et les demandes presse ou partenariats.

### 4.7 à 4.9 Pages légales

Mentions légales, CGU, politique de confidentialité. Contenu fourni par le
porteur ; le site fournit le gabarit de mise en page.

---

## 5. Identité visuelle

### Typographie

- **Titres** : Hanken Grotesk (celle de l'application mobile).
- **Texte courant** : Plus Jakarta Sans.
- Auto-hébergées en `woff2` via Fontsource, avec `font-display: swap` et
  préchargement de la graisse utilisée dans le hero. Pas de CDN Google Fonts —
  coût de performance et exposition RGPD inutiles.
- Titres en `tracking-tight`, tailles fluides via `clamp()`.
- `text-wrap: balance` sur les titres, `text-wrap: pretty` sur les paragraphes.
- Chiffres en `font-variant-numeric: tabular-nums` dans les tableaux de prix.

### Couleurs

Reprises des tokens de l'application (`dony_app/lib/core/design/tokens/color_tokens.dart`) :

- Primaire : bleu `#0B5FFF` — structure, liens, boutons principaux.
- Accent : terracotta `#D96A3A` — **usage rare et intentionnel, un seul par
  écran** : un chiffre clé, un soulignement, une puce d'étape.
- Fonds : blanc `#FFFFFF` et sable `#F7F3ED` en alternance pour rythmer le
  scroll. Pas de gris froid.
- Texte : encre `#0A2540` en principal, `#54504A` en secondaire.
- Bordures : `#E8E5DF`, traits nets de 1 px.

Les tokens sont exposés en variables CSS dans `tokens.css` et consommés par
Tailwind, sur le même modèle que `dony-pro/tailwind.config.ts`.

**Note de divergence assumée :** `dony-pro` et `dony-admin` utilisent Geist et
ont déprécié le terracotta au profit du bleu seul. Ce sont des back-offices
internes. Le site public suit l'identité de l'application mobile, car c'est
celle que le visiteur retrouvera après téléchargement. Cette divergence est
délibérée et documentée ici pour éviter qu'elle soit « corrigée » par erreur.

### Ce qui est explicitement interdit

Formulé en négatif parce que c'est la contrainte du porteur :

- Hero centré suivi de trois cartes icône / titre / paragraphe.
- Dégradés violet-bleu, effets de lueur, arrière-plans en maillage flou.
- Icônes génériques posées dans un rond de couleur pastel.
- Ombres portées molles appliquées uniformément à tous les blocs.
- Formules creuses : « Rejoignez des milliers d'utilisateurs », « Simple,
  rapide, sécurisé », « La solution qu'il vous faut ».
- Photographies de banque d'images montrant des réunions ou des poignées de main.
- Chiffres inventés ou non sourcés.

### Ce qui est fait à la place

- Mise en page asymétrique : le visuel du téléphone déborde de sa colonne et est
  coupé par le bord de la fenêtre.
- Le parcours QR raconté par un défilement horizontal, avec les captures réelles.
- Chiffres réels et vérifiables mis en grand : 12 % de commission, 500 € de
  valeur maximale déclarée, délai moyen de livraison.
- Séparations par bordures nettes de 1 px plutôt que par ombres.
- Micro-animations d'entrée courtes (150 à 250 ms), décalées légèrement dans le
  temps, interruptibles, et désactivées sous `prefers-reduced-motion`.

### Responsive

Mobile-first strict. La cible principale est la diaspora sur Android, souvent en
4G. Points de rupture Tailwind par défaut. Aucune mise en page ne doit provoquer
de défilement horizontal du `body` : les tableaux et blocs larges défilent dans
leur propre conteneur `overflow-x: auto`.

---

## 6. SEO et internationalisation

- **Routage** : le français est servi à la racine (`/`, `/tarifs`), l'anglais
  sous préfixe (`/en/`, `/en/pricing`). Stratégie `prefix_except_default` de
  `@nuxtjs/i18n`.
- **hreflang** : balises réciproques entre les deux langues sur chaque page,
  plus `x-default` pointant vers la version française.
- **Métadonnées** : chaque page définit son `title`, sa `meta description`, son
  URL canonique et son image `og:image` dédiée. Un composable `useSeo` centralise
  la logique ; aucune page ne doit être publiée sans métadonnées propres.
- **Données structurées JSON-LD** : `Organization` sur toutes les pages,
  `MobileApplication` sur l'accueil, `FAQPage` sur le bloc FAQ.
- **sitemap.xml** et **robots.txt** générés au build par `@nuxtjs/sitemap`,
  incluant les deux langues.
- **Sémantique** : un seul `H1` par page, hiérarchie de titres sans saut de
  niveau, images en `.webp` avec `width` et `height` déclarés et attributs `alt`
  rédigés (jamais vides sur une image porteuse de sens).
- **Extension V2** : les corridors seront des fichiers
  `content/corridors/*.md` rendus sur `/envoyer-colis/[slug]`. La configuration
  de prérendu et le sitemap doivent les prendre en compte automatiquement dès
  leur ajout.

---

## 7. Stratégie de test

La règle du monorepo impose 90 % de couverture. Appliquée à un site vitrine,
elle se traduit ainsi.

### Tests unitaires — Vitest et Vue Test Utils

Portent sur les composants qui contiennent une logique réelle :

- Onglets de rôle sur « Comment ça marche » : synchronisation avec l'URL,
  état initial lu depuis le paramètre de requête.
- Accordéon FAQ : ouverture, fermeture, comportement au clavier.
- Exemple de tarif : le calcul affiché est correct pour les valeurs de référence.
- Formulaire de contact : validation des champs et états d'erreur.
- Sélecteur de langue : produit bien l'URL équivalente dans l'autre langue.
- Composable `useSeo` : génère les bonnes balises pour une page donnée.

Les composants purement présentationnels ne sont pas couverts à 100 % :
vérifier qu'une `<section>` affiche le texte qu'on lui passe n'apporte aucune
garantie. **La cible de 90 % porte sur le code logique** (`composables/`,
`components/ui/`, composants à état), et le rapport de couverture le précise
explicitement.

### Tests de bout en bout — Playwright

- Chaque page se charge sans erreur console.
- La navigation du header et du footer mène aux bonnes pages.
- Le basculement FR ↔ EN conserve la page équivalente.
- Les liens de stores pointent vers les bonnes URL.
- L'accueil est utilisable en 360 px de large sans défilement horizontal.

### Accessibilité

- `@axe-core/playwright` sur chaque page : zéro violation critique ou sérieuse.
- Contraste AA vérifié sur toutes les combinaisons texte / fond.
- Navigation clavier complète, focus visible, lien d'évitement vers le contenu.
- `prefers-reduced-motion` respecté par toutes les animations.

### Performance

Lighthouse en intégration continue, seuils bloquants :

- Performance ≥ 95
- SEO = 100
- Accessibilité ≥ 95
- Budget JavaScript < 100 ko, LCP < 2 s en 4G simulée.

### Lint et types

`eslint` et `nuxi typecheck`, alignés sur la configuration de `dony-admin`.

---

## 8. Dépendances externes et points ouverts

Éléments à fournir par le porteur, sans lesquels le site ne peut pas être
publié (mais dont l'absence ne bloque pas le développement — les emplacements
seront créés) :

1. Captures d'écran propres de l'application, prises sur un même appareil avec
   des données de démonstration crédibles.
2. Textes des pages légales : mentions légales, CGU, politique de
   confidentialité.
3. URL réelles des fiches App Store et Google Play.
4. Adresse email de contact et informations légales de la société.
5. Traductions anglaises validées, ou accord pour une première version produite
   côté développement puis relue.

En attendant, le développement se fait avec du contenu français rédigé de façon
réaliste (jamais de lorem ipsum) et des emplacements de captures dimensionnés.

---

## 9. Ordre de construction

1. Initialisation Nuxt 4, Tailwind, tokens, polices, lint, tests.
2. Layout, header, footer, primitives UI.
3. Page d'accueil, section par section.
4. Comment ça marche, Sécurité, Tarifs.
5. À propos, Contact, pages légales.
6. i18n : extraction complète des textes et version anglaise.
7. SEO : métadonnées, JSON-LD, sitemap, images Open Graph.
8. Tests de bout en bout, accessibilité, budget de performance.
9. Configuration du déploiement Cloudflare Pages.

Le détail par étape relève du plan d'implémentation, pas de cette spec.
