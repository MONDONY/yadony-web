<script setup lang="ts">
// Auparavant, ce composant masquait son contenu (`opacity-0`) tant que
// JavaScript n'avait pas confirmé la visibilité via un IntersectionObserver.
// Deux essais pour corriger cela ont été écartés :
//
// 1. Rendre visible par défaut uniquement au premier rendu, puis masquer au
//    montage pour rejouer l'animation : ça fonctionne pour le contenu déjà à
//    l'écran, mais pour le contenu sous la ligne de flottaison, ça revient à
//    passer de `opacity-100` (HTML statique, hydraté tel quel) à
//    `opacity-0` juste après le montage — un vrai fondu de sortie, pas
//    seulement un changement d'état invisible pour l'utilisateur. En pratique
//    ça produit un flash observable et, mesuré avec `@axe-core/playwright`,
//    ça fait tomber `axe` en pleine transition CSS : le contraste est alors
//    calculé sur une couleur de texte partiellement fondue dans le fond
//    (ex. contraste mesuré à 2.2 au lieu de ~4.7), un faux positif
//    intermittent mais bien réel, reproduit à plusieurs reprises en local.
// 2. Ne masquer que si un IntersectionObserver confirme que l'élément est
//    hors écran au montage : même défaut — le passage visible → invisible
//    reste une transition CSS animée, donc le même bug se reproduit.
//
// Le seul état sans course ni flash est : toujours visible, aucune
// animation. Le bloc central du site (le parcours QR) reste ainsi
// intégralement présent dans le HTML généré ET dans le DOM après
// hydratation, sans dépendre du timing de JavaScript. Correction plutôt que
// décoration : voir le rapport de la vague de correctifs pour le détail.
</script>

<template>
  <div><slot /></div>
</template>
