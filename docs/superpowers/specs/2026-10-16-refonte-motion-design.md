# Spec — Refonte motion design de yadony.com

**Date :** 2026-10-16
**Repo :** `yadony-web`, branche `feature/refonte-motion-design`
**Statut :** design validé par le propriétaire en conversation (« je te laisse faire du début jusqu'à la fin »)
**Prérequis :** PR #83 (`fix/seo-indexation`), dont cette branche part

---

## 1. Objectif

Faire **télécharger l'app Yadony**. Le site raconte, en images et en animations,
ce que l'app permet, autour de trois promesses :

1. **Voyager moins cher** : recherche de billets et alertes de prix (« Vols trouvés sous votre prix »).
2. **Vendre ses kilos** : le voyageur publie son trajet et vend l'espace de sa valise.
3. **Envoyer un colis en sécurité** : voyageur vérifié, paiement bloqué jusqu'à la livraison, suivi en temps réel.

**Contrainte de premier rang : ne rien perdre en référencement.** Le diagnostic
Search Console du 2026-10-12 (6 pages indexées sur 42) a été traité par la PR #83 ;
la refonte ne doit casser aucune URL et doit améliorer la vitesse (accueil
actuel : 3,85 Mo, performance Lighthouse 0,89–0,94).

### Décisions du propriétaire

| Sujet | Décision |
|---|---|
| Action principale | Télécharger l'app (stores ; fenêtre « bientôt disponible » + bêta WhatsApp tant que `storesLive` est faux) |
| Promesse d'accroche | Une seule promesse qui réunit tout : « Ton voyage au pays, rentabilisé. » |
| Narration | Deux parcours racontés : voyageur (Aminata) et expéditeur (Moussa), qui se croisent à la négociation |
| Illustrations | La mascotte **Dony** (colis-valise bleu, scotch orange, baskets) guide le site, mêlée aux vraies captures de l'app et à des animations vectorielles légères |
| Couleurs | Design system de l'app : bleu `#0B5FFF`, accent terracotta, sable ; **aucun dégradé** |
| Billets d'avion | Promesse principale : `flights_enabled` sera actif en production à la sortie du site |
| Vidéos existantes | Conservées toutes les quatre, chargées au clic seulement |
| Pages GP | Oui : le terme « GP » est visé |
| Stack | Évolution du site Nuxt 4 actuel (pas de réécriture) |

### Hors périmètre

- Blog et guides (« arnaque GP colis », etc.) : plus tard.
- Pages billets par corridor (`/billets-avion/paris-dakar`) : plus tard.
- Toute donnée dynamique (prix réels, trajets réels) : le site reste 100 % statique.

---

## 2. Ce que l'app fait (source de vérité du contenu)

Inventaire tiré de `dony_app` le 2026-10-16. Le site ne promet rien que l'app ne fasse.

**Voyageur**
- Billets : recherche aller simple ou aller-retour, « Direct uniquement », tri moins cher / plus rapide / direct, « Bons plans pour vous », **Alerte prix** puis « Vols trouvés », réservation chez le partenaire (Aviasales).
- Publier un trajet en 3 étapes (Trajet, Lieux & capacité, Prix & conditions) : avion, voiture ou bateau, escales, voyage à plusieurs étapes, date limite de dépôt, ce que j'accepte / refuse, devise de publication.
- **Trois formules de prix** : prix au kilo, « J'accepte les propositions de prix » (négociable), **grille de prix par article** ; badge « Prix ferme ».
- Trajets récurrents, modèles de trajet, brouillons, affiche partageable avec QR code.
- Demandes reçues, **négociation** (contre-offres par tours), acceptation ou refus motivé.
- Encaissement : carte (Stripe), espèces (commission prélevée), mobile money (Orange Money, Wave, MTN, Moov) ; versement Stripe ou mobile money.
- Prise en charge : scan du QR, photo géolocalisée, validation des étapes, **hors ligne** compris.
- Arrivée : « Arrivé à destination », prévenir les destinataires (WhatsApp, SMS, appel, message).
- Livraison contre le **code de retrait à 6 chiffres** ; paiement libéré ; statistiques (revenus, kg vendus).

**Expéditeur**
- Recherche liste + carte, filtres (date, note, kilos, prix, urgent, identité vérifiée…), recherche « en une phrase », alertes de corridor, « Me prévenir si de la place se libère ».
- Réserver sur un trajet, ou **publier une demande d'envoi** (« J'ouvre aux offres » ou « Je fixe mon prix »), avec photos et destinataire.
- **Négociation dans les deux sens** : l'expéditeur propose sur un trajet, le voyageur propose sur une demande.
- Paiement **bloqué jusqu'à la livraison** (carte, mobile money, portefeuille ; espèces sans séquestre).
- QR du colis, code de retrait, lien de suivi, suivi en temps réel (Remis → En vol → Arrivé → Livré), notation.

**Destinataire** : page web de suivi **sans compte**, ou l'app (« Colis à recevoir », écrire au voyageur), remise contre le code.

**Confiance** : identité vérifiée (Didit ou Stripe Identity), séquestre, photo géolocalisée à chaque étape, code de remise, litiges, blocage, numéro masqué, appels dans l'app.

**Couverture** : départs Europe, Royaume-Uni, Suisse, Canada, États-Unis ; arrivées dans 14 pays (UEMOA + CEMAC) ; devises EUR, USD, CAD, GBP, CHF, XOF, XAF.

---

## 3. Architecture des pages

URLs existantes **inchangées**. Nouvelles pages en gras.

| URL FR | URL EN | Rôle | Requêtes visées |
|---|---|---|---|
| `/` | `/en` | Accueil, promesse unique, parcours croisé | « Yadony », « envoyer colis Afrique voyageur » |
| `/envoyer-colis` | `/en/send-a-parcel` | **Devient le parcours expéditeur** + liste des corridors | « envoyer colis Afrique », « envoi colis particulier » |
| **`/devenir-voyageur`** | **`/en/become-a-traveler`** | Parcours voyageur | « vendre ses kilos de bagage », « rentabiliser sa valise » |
| **`/billets-avion`** | **`/en/flight-deals`** | Billets + alertes de prix | « billet avion Paris Dakar pas cher », « alerte prix vol Afrique » |
| `/envoyer-colis/{from}-{to}` | `/en/send-a-parcel/{from}-{to}` | 12 corridors (5 existants + 7) | « envoyer colis Paris Dakar »… |
| **`/gp/{from}-{to}`** | — (FR seulement) | 4 pages GP | « GP Paris Dakar », « GP Abidjan »… |
| `/comment-ca-marche`, `/tarifs`, `/securite`, `/a-propos`, `/contact`, légales | inchangées | Restylées | — |

**Corridors (12)** : Paris, Lyon, Marseille × Dakar, Abidjan, Bamako, Douala.
Nouveaux : `paris-bamako`, `lyon-dakar`, `lyon-bamako`, `lyon-douala`,
`marseille-dakar`, `marseille-abidjan`, `marseille-douala`.
Chaque page a un contenu **unique** (communauté, aéroports, durée de vol,
retrait sur place, FAQ propre) : pas de gabarit répété à l'identique.

**Pages GP (4, FR)** : `/gp/paris-dakar`, `/gp/paris-abidjan`, `/gp/paris-bamako`,
`/gp/paris-douala`. Angle : « les GP, en vérifié » — ce qu'est un GP, les risques
habituels (pas de trace, paiement d'avance, colis perdu), ce que Yadony ajoute.
Canonical propre, liées depuis la page corridor correspondante. Le terme GP
n'ayant pas d'équivalent anglais, pas de version EN ; le sélecteur de langue y
renvoie vers le corridor anglais.

**Maillage interne** : accueil → 3 pages parcours → corridors → GP ; chaque
corridor renvoie aux 3 corridors voisins (même départ ou même arrivée).

---

## 4. Contenus des pages

### 4.1 Accueil

1. **Haut de page** — bandeau « Colis, kilos et billets vers l'Afrique » ; H1 « Ton voyage au pays, rentabilisé. » ; sous-titre « Billets moins chers, kilos vendus, colis livrés en sécurité. Tout dans Yadony. » ; boutons stores + « Yadony en 1 minute ». Visuel : iPhone qui fait défiler 3 écrans (Vols trouvés → Mes trajets → Colis arrivé), mot mis en avant synchronisé ; Dony salue ; ligne Paris → Dakar qui se dessine avec un avion.
2. **Les trois promesses** — 3 cartes (Voyage moins cher, Vends tes kilos, Envoie en sécurité), une pose de Dony chacune, lien vers la page parcours.
3. **Vidéo « Yadony en une minute »**.
4. **Parcours croisé** (section signature) — 8 étapes : alerte et billet ; publication + 3 formules de prix ; recherche ou demande ; négociation ; paiement bloqué ; remise QR ; vol ; livraison avec code et paiement libéré.
5. **Confiance** — 4 piliers.
6. **On paie comme chez soi** — moyens de paiement et devises.
7. **Corridors** — carte France → Afrique, liens vers les 12 pages.
8. **Le destinataire** — « Ta maman suit le colis sans installer l'app ».
9. **FAQ** (JSON-LD FAQPage).
10. **Dernier appel** — Dony en fête, vidéo promo, stores, QR code de téléchargement (desktop).

### 4.2 `/envoyer-colis` — parcours de Moussa

Recherche (liste, carte, filtres, « en une phrase ») **ou** demande publiée
(« J'ouvre aux offres » / « Je fixe mon prix ») → négociation → paiement bloqué
(moyens de paiement) → remise QR → suivi en temps réel → livraison et notation.
Encart destinataire. Tuto vidéo « envoyer un colis ». Liste des corridors. FAQ.

### 4.3 `/devenir-voyageur` — parcours d'Aminata

Billet (renvoi vers `/billets-avion`) → publication en 3 étapes (avion, voiture,
bateau ; plusieurs étapes) → **3 formules de prix** (cartes qui se retournent ;
exemple de grille : téléphone, ordinateur, carton de vêtements) → affiche
partageable → négociation → paiement garanti → scan hors ligne → arrivée et
prévenir les destinataires → livraison et versement (Stripe, mobile money) →
statistiques. Tuto vidéo « publier un trajet ». FAQ voyageur.

### 4.4 `/billets-avion`

Recherche, bons plans, **alerte de prix** (animation : la courbe de prix descend
sous le seuil, notification), « Vols trouvés sous votre prix », réservation chez
le partenaire. Lien « Et vends tes kilos sur ce vol » → `/devenir-voyageur`. FAQ.
Mention honnête : Yadony ne vend pas de billets, il trouve et alerte ; l'achat
se fait chez le partenaire.

### 4.5 Règles éditoriales

- Tutoiement sur les pages marketing, comme les maquettes validées ; vouvoiement conservé sur les pages légales.
- Aucun chiffre inventé (nombre d'utilisateurs, avis) ; aucun faux témoignage ; les prix sont présentés comme des exemples.
- Nom public **Yadony** ; **Dony** désigne uniquement la mascotte.
- Chaque texte existe en FR et EN (clés i18n, aucun texte en dur).

---

## 5. Design system

### 5.1 Tokens — alignés sur le design system de l'app

Source de vérité : `dony_app/lib/core/design/tokens/` (consigne du propriétaire :
« respecte notre design system de l'app »). Le site reprend les mêmes valeurs.

| Token CSS | Valeur app | Usage |
|---|---|---|
| `--primary` | `#0B5FFF` (blue500) | CTA, liens, focus, actifs |
| `--primary-hover` / `--primary-press` | `#0A4DD9` / `#083CAB` | Survol / appui |
| `--primary-soft` | `#EDF2FF` (blue50) | Fond de pastilles actives |
| `--navy` / `--navy-deep` | `#062B7D` / `#041D54` (blue800/900) | Sections sombres, pied de page |
| `--accent` | `#D96A3A` (terra500) | Accent chaud : aplats, avion, ligne de trajet |
| `--accent-soft` | `#FCF0E9` (terra50) | Fond accent |
| `--accent-text` | `#93421B` (terra700) | Texte accentué sur fond clair (contraste AA) |
| `--bg` | `#FAFAF8` (neutral50) | Fond de page |
| `--surface` | `#FFFFFF` | Cartes |
| `--sand` / `--sand-deep` | `#F7F3ED` / `#EDE6D8` | Sections chaleureuses |
| `--ink` | `#0A2540` (ink800) | Texte principal |
| `--ink-muted` | `#54504A` (neutral600) | Texte secondaire |
| `--line` | `#E8E5DF` (neutral200) | Bordures |
| `--success` | `#0E8A5F` | Accord, livré |
| `--warning` / `--error` | `#E8A23B` / `#D9342B` | États |

Rayons : cartes 16, boutons 14, champs 12, pastilles 20, feuilles 24, badges 999.
Espacements : 4, 8, 12, 16, 20, 24, 32, 48. Zone cliquable ≥ 44 px.
Ombres : celles de `DonyShadow` (encre `#0A2540` à 4–16 %, ombre bleue « brand » sous les boutons pleins).
L'orange du logo n'apparaît que dans le logo et la mascotte.

Interdits : `linear-gradient`, `radial-gradient`, `conic-gradient` (vérifié par un test).

### 5.2 Typographie

Polices de l'app déjà embarquées : Plus Jakarta Sans (titres), Hanken Grotesk
(texte). Chiffres tabulaires pour les prix et codes. `text-wrap: balance` sur
les titres.

### 5.3 Visuels

- **Dony** : 10 poses existantes (`dony_app/assets/mascotte`), converties en AVIF + WebP à 2 tailles. 11 poses supplémentaires fournies plus tard par le propriétaire (prompts donnés en conversation) ; chaque emplacement a une pose de repli existante, la nouvelle pose remplace le fichier sans toucher au code.
- **Captures** : 26 captures iPhone (`~/Desktop/dony/image_front`). Traitement obligatoire avant publication : noms et photos de vrais testeurs remplacés par des profils fictifs, QR codes réels floutés ou remplacés, bouton 🐞 et mention « TestFlight » retirés. Les originaux ne sont **jamais** commités ; seules les sorties anonymisées le sont.
- **Animations vectorielles** (SVG inline) : ligne de trajet, avion, carte France → Afrique, bulles de négociation, cadenas, frise de suivi, courbe de prix.
- Captures EN : les écrans de l'app sont en français ; sur les pages EN, les éléments animés en HTML/SVG (bulles, frise, notification) sont traduits, les captures restent telles quelles.

---

## 6. Système de motion

**Pas de bibliothèque d'animation** (GSAP écarté : 40 Ko de JS pour ce qu'IntersectionObserver, `position: sticky` et les transitions CSS font déjà).

- **Révélations** : `UiRevealOnScroll` existant, enrichi (variantes `up`, `scale`, `stagger`).
- **Scènes à étapes** (`UiScrollScene`) : conteneur `sticky` + une liste d'étapes ; un IntersectionObserver fixe l'étape active ; les visuels passent d'un état à l'autre par transitions CSS (`transform`, `opacity`, `clip-path`, `stroke-dashoffset`). Les étapes sont des sections HTML normales, lisibles sans JS.
- **Mobile (< 1024 px)** : pas d'épinglage ; chaque étape porte son propre visuel, animé à l'entrée dans l'écran.
- **Animations continues** (avion, défilement des logos, flottement de Dony) : CSS `@keyframes`, mises en pause hors écran (`animation-play-state` via IntersectionObserver).
- **Hydratation paresseuse** : les sections animées sous la ligne de flottaison utilisent l'hydratation à la visibilité de Nuxt (`hydrate-on-visible`).
- **`prefers-reduced-motion`** : aucune animation ; tout le contenu et l'état final de chaque scène visibles.
- Durées de l'app (`DonyDuration`) : 150 / 220 / 320 / 480 ms, courbe `cubic-bezier(0.2, 0.8, 0.2, 1)` (`DonyCurve.easeOut`), décalage 60 ms × index ; on n'anime que `transform`, `opacity`, `clip-path`, `stroke-dashoffset` (CLS = 0).

---

## 7. Référencement et performance

- HTML prérendu, un H1 par page, title/description uniques, canonical + hreflang (PR #83), sitemap mis à jour (nouvelles pages, GP sans alternate EN).
- JSON-LD : `Organization`, `MobileApplication` (accueil), `FAQPage` (pages avec FAQ), `BreadcrumbList` (corridors, GP, pages parcours).
- Images : `<picture>` AVIF/WebP, `width`/`height` explicites, `loading="lazy"` sauf l'image du haut de page (`fetchpriority="high"`), `alt` descriptifs.
- Vidéos : `preload="none"` + poster, chargées au clic.
- Budgets Lighthouse (accueil, mobile) : SEO 1, accessibilité ≥ 0,95, performance ≥ 0,95, poids total ≤ 1 Mo, JS ≤ 100 Ko.
- Images Open Graph par page parcours.

---

## 8. Tests

- **Unitaires (Vitest, ≥ 90 % sur `app/lib/**` et `app/composables/**`)** : données corridors (12, slugs uniques, voisins), GP, structured data (BreadcrumbList), composable de scène (étape active), sélection des poses de Dony.
- **E2E (Playwright, desktop + mobile)** : chaque page 200 sans erreur console, un H1 ; en `reduced-motion`, le texte de toutes les étapes est visible ; la scène change d'étape au défilement ; sitemap = fichiers `.html` + canonical (spec existante étendue) ; aucune clé i18n brute affichée.
- **Accessibilité (axe)** sur les nouvelles pages.
- **Garde-fous** : aucun dégradé dans le CSS ; aucune image > 200 Ko dans `public/` hors vidéos et posters ; aucun nom public « Dony » pour désigner l'app.
- **Lighthouse** sur l'accueil et une page parcours.

---

## 9. Livraison

Une seule PR (un site à moitié refondu serait incohérent en production), en
commits ordonnés : images → design system → motion → accueil → pages parcours →
corridors et GP → pages restylées → tests et budgets. La fusion déploie en
production : elle reste soumise au feu vert du propriétaire, après celle de la
PR #83.
