import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// The lens and its handle are transparent cuts in the tag, not white overlays.
const tag = 'M58 9 78 7Q88 6 88 17L87 36Q87 42 83 46L47 82Q40 89 33 82L10 59Q3 52 10 45L43 13Q48 9 58 9Z'
const cuts = 'M81 20a5.5 5.5 0 1 0-11 0 5.5 5.5 0 1 0 11 0ZM61 49a16 16 0 1 0-32 0 16 16 0 1 0 32 0Z'
const handle = 'M53 58 72 77'
const blue = '#0735DE', ink = '#0B1023', light = '#F8F9FC', darkBlue = '#7896FF'
const symbol = (color, id = 'cut') => `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="96" height="96"><path d="${tag}" fill="white"/><path d="${cuts}" fill="black"/><path d="${handle}" fill="none" stroke="black" stroke-width="8"/></mask></defs><path d="${tag}" fill="${color}" mask="url(#${id})"/>`
// Outlined custom geometric lettering: no installed font or network dependency.
const a = 'M0 35C0 21 8 13 20 13C26 13 30 15 33 19V15H46V57H33V52C30 56 26 59 20 59C8 59 0 50 0 35ZM13 36C13 43 17 47 23 47S33 43 33 36S29 25 23 25S13 29 13 36Z'
const c = 'M91 22 82 30C79 26 76 25 72 25C66 25 62 29 62 36S66 47 72 47C76 47 80 45 82 42L92 50C87 56 81 59 72 59C58 59 49 50 49 36S58 13 72 13C80 13 87 16 91 22Z'
const h = 'M97 0H111V19C114 15 119 13 125 13C137 13 143 20 143 33V57H129V35C129 28 127 25 122 25C115 25 111 29 111 36V57H97Z'
const k = 'M198 0H212V31L226 15H243L224 35L244 57H227L212 39V57H198Z'
const i = 'M249 15H263V57H249ZM264 3a8 8 0 1 0-16 0 8 8 0 1 0 16 0Z'
const word = (color) => `<g fill="${color}" fill-rule="evenodd" transform="translate(109 19)"><path d="${a}"/><path d="${c}"/><path d="${h}"/><path d="${a}" transform="translate(147)"/><path d="${k}"/><path d="${i}"/></g>`
const svg = (body, box = '0 0 384 96', title = 'Achaki') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" role="img" aria-label="${title}">${body}</svg>\n`
const logo = (s, w) => svg(symbol(s) + word(w))
const auto = '<style>.mark{color:#0735DE}.word{color:#0B1023}@media(prefers-color-scheme:dark){.mark{color:#7896FF}.word{color:#F8F9FC}}</style>'
const assets = {
  'brand/logos/logo.svg': svg(auto + `<g class="mark">${symbol('currentColor')}</g><g class="word">${word('currentColor')}</g>`),
  'brand/logos/logo-light.svg': logo(blue, ink),
  'brand/logos/logo-dark.svg': logo(darkBlue, light),
  'brand/logos/logo-white.svg': logo('#FFFFFF', '#FFFFFF'),
  'brand/logos/logo-black.svg': logo(ink, ink),
  'brand/marks/brand-mark.svg': svg(symbol(blue), '0 0 96 96'),
  'brand/marks/brand-mark-dark.svg': svg(symbol(darkBlue), '0 0 96 96'),
  'icons/favicons/favicon.svg': svg(auto + `<g class="mark">${symbol('currentColor')}</g>`, '0 0 96 96'),
  'icons/favicons/mask-icon.svg': svg(symbol('#000000'), '0 0 96 96'),
  'icons/pwa/app-icon.svg': svg(`<rect width="512" height="512" fill="${blue}"/><g transform="translate(74 74) scale(3.7916667)">${symbol('#FFFFFF')}</g>`, '0 0 512 512'),
  // All meaningful pixels remain inside the central 80% safe-zone circle.
  'icons/pwa/app-icon-maskable.svg': svg(`<rect width="512" height="512" fill="${blue}"/><g transform="translate(112 112) scale(3)">${symbol('#FFFFFF')}</g>`, '0 0 512 512'),
}

for (const app of ['frontend', 'admin']) {
  const out = resolve(root, app, 'public')
  mkdirSync(out, { recursive: true })
  for (const [name, source] of Object.entries(assets)) {
    mkdirSync(dirname(resolve(out, name)), { recursive: true })
    writeFileSync(resolve(out, name), source)
  }
}

const preview = svg(`<rect width="1200" height="740" fill="${light}"/><rect y="370" width="1200" height="370" fill="${ink}"/><g transform="translate(160 110) scale(2.2)">${symbol(blue, 'light')}${word(ink)}</g><g transform="translate(160 480) scale(2.2)">${symbol(darkBlue, 'dark')}${word(light)}</g>`, '0 0 1200 740')
writeFileSync(resolve(root, 'frontend/public/brand/preview.svg'), preview)
console.log('Brand SVGs generated for frontend and admin.')
