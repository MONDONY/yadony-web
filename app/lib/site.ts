export const siteName = 'Yadony'
export const siteUrl = 'https://yadony.com'
export const contactEmail = 'contact@yadony.com'
// Espace des professionnels (pied de page, liste « Yadony aujourd'hui »).
export const proUrl = 'https://pro.yadony.com'

// Chaque store a son propre drapeau : un bouton dont la fiche est publiée
// pointe vers elle, l'autre ouvre une fenêtre « bientôt disponible » au lieu
// d'un lien mort. Sortie commune sur les deux stores le 2026-11-03 : l'app
// iOS 1.0.0 est en ligne sur l'App Store, l'app Android de nouveau publiée
// sur Google Play, et /android mène à sa fiche (public/_redirects).
export const playStoreLive = true
export const appStoreLive = true
export const appStoreUrl = 'https://apps.apple.com/app/id6797821239'
export const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.yadony.yadony'

// Phase de bêta test : un bandeau en haut du site invite les visiteurs à
// rejoindre le groupe WhatsApp des testeurs. Passer betaTesting à false le
// jour de la sortie publique fait disparaître le bandeau sans toucher au
// reste du header.
export const betaTesting = true
export const betaWhatsAppGroupUrl = 'https://chat.whatsapp.com/CUFkMmCsEJC0L2bNmQLFQH'
