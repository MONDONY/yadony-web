export const siteName = 'Yadony'
export const siteUrl = 'https://yadony.com'
export const contactEmail = 'contact@yadony.com'

// Chaque store a son propre drapeau : un bouton dont la fiche est publiée
// pointe vers elle, l'autre ouvre une fenêtre « bientôt disponible » au lieu
// d'un lien mort. L'app Android est en ligne sur Google Play depuis le
// 2026-10-20 ; l'app iOS est encore en examen chez Apple. Passer appStoreLive
// à true le jour où Apple publie la fiche (l'identifiant ci-dessous est déjà
// le bon).
export const playStoreLive = true
export const appStoreLive = false
export const appStoreUrl = 'https://apps.apple.com/app/id6797821239'
export const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.yadony.yadony'

// Phase de bêta test : un bandeau en haut du site invite les visiteurs à
// rejoindre le groupe WhatsApp des testeurs. Passer betaTesting à false le
// jour de la sortie publique fait disparaître le bandeau sans toucher au
// reste du header.
export const betaTesting = true
export const betaWhatsAppGroupUrl = 'https://chat.whatsapp.com/CUFkMmCsEJC0L2bNmQLFQH'
