// Messages complets d'une langue, tels que Nuxt les assemble à partir des
// fichiers déclarés dans nuxt.config.ts (i18n.locales[].files). Les clés de
// premier niveau ne se chevauchent pas d'un fichier à l'autre : une simple
// fusion superficielle suffit.
import frCommon from '../../../i18n/locales/fr.json'
import frLanding from '../../../i18n/locales/fr/landing.json'
import frJourneys from '../../../i18n/locales/fr/journeys.json'
import frCorridors from '../../../i18n/locales/fr/corridors.json'
import frGp from '../../../i18n/locales/fr/gp.json'
import enCommon from '../../../i18n/locales/en.json'
import enLanding from '../../../i18n/locales/en/landing.json'
import enJourneys from '../../../i18n/locales/en/journeys.json'
import enCorridors from '../../../i18n/locales/en/corridors.json'

export const fr = { ...frCommon, ...frLanding, ...frJourneys, ...frCorridors, ...frGp }
export const en = { ...enCommon, ...enLanding, ...enJourneys, ...enCorridors }
