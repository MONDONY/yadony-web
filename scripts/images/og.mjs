// Cartes de partage (Open Graph, 1200 × 630) des pages parcours : fond sable
// uni, logo, titre de la page, capture de l'app et pose de Dony. Générées en
// local (`pnpm og`) et versionnées dans public/og/ : le build ne les refait pas.
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = new URL('../../', import.meta.url).pathname
const W = 1200
const H = 630

const cards = [
  { file: 'expediteur', kicker: 'Envoyer un colis', title: ['Envoyer un colis en Afrique,', "avec quelqu'un de confiance"], screen: 'parcel-tracking', pose: 'hello', lead: "Paiement bloqué jusqu'à la livraison" },
  { file: 'voyageur', kicker: 'Devenir voyageur', title: ['Vendez vos kilos,', 'rentabilisez votre voyage'], screen: 'my-trips', pose: 'travel', lead: 'Payé à la livraison, en toute sécurité' },
  { file: 'billets', kicker: "Billets d'avion", title: ['Votre billet moins cher,', 'sans surveiller les prix'], screen: 'flights-found', pose: 'search', lead: "Alertes de prix vers l'Afrique" },
]

const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, '&#39;')

function textLayer(card) {
  const lines = card.title
    .map((line, i) => `<text x="72" y="${292 + i * 68}" font-size="56" font-weight="800" fill="#0A2540">${escape(line)}</text>`)
    .join('')
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica Neue, Arial, sans-serif">
    <rect x="72" y="176" width="${card.kicker.length * 11.5 + 42}" height="44" rx="22" fill="#FCF0E9"/>
    <text x="92" y="205" font-size="22" font-weight="700" fill="#93421B">${escape(card.kicker)}</text>
    ${lines}
    <text x="72" y="470" font-size="26" fill="#5B6B7F">${escape(card.lead)}</text>
    <rect x="72" y="512" width="236" height="56" rx="14" fill="#B95524"/>
    <text x="100" y="548" font-size="22" font-weight="700" fill="#FFFFFF">Télécharger l'app</text>
  </svg>`)
}

async function phone(screen) {
  const width = 300
  const height = 600
  // Capture recadrée par le haut : le bas de l'écran déborde de la carte.
  const resized = await sharp(join(ROOT, `public/img/app/${screen}-960.webp`))
    .resize(width - 20, height - 20, { fit: 'cover', position: 'top' })
    .png()
    .toBuffer()
  const shot = await sharp(resized)
    .composite([{ input: Buffer.from(`<svg width="${width - 20}" height="${height - 20}"><rect width="100%" height="100%" rx="34" fill="#fff"/></svg>`), blend: 'dest-in' }])
    .png()
    .toBuffer()
  const frame = Buffer.from(`<svg width="${width}" height="${height}"><rect width="100%" height="100%" rx="44" fill="#0A1430"/></svg>`)
  return sharp(frame).composite([{ input: shot, left: 10, top: 10 }]).png().toBuffer()
}

for (const card of cards) {
  const logo = await sharp(join(ROOT, 'public/logos/logo-yadony-480.webp')).resize(null, 52).png().toBuffer()
  const dony = await sharp(join(ROOT, `public/img/dony/${card.pose}-640.webp`)).resize(200).png().toBuffer()
  await sharp({ create: { width: W, height: H, channels: 4, background: '#F7F3ED' } })
    .composite([
      { input: logo, left: 72, top: 72 },
      { input: textLayer(card), left: 0, top: 0 },
      { input: await phone(card.screen), left: 820, top: 60 },
      { input: dony, left: 700, top: 400 },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(ROOT, `public/og/${card.file}.jpg`))
  console.log(`public/og/${card.file}.jpg`)
}

