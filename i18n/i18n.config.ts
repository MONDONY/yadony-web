export default defineI18nConfig(() => ({
  legacy: false,
  numberFormats: {
    fr: { currency: { style: 'currency', currency: 'EUR' } },
    en: { currency: { style: 'currency', currency: 'EUR' } },
  },
}))
