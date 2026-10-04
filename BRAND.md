# Achaki — identidade visual

Conceito aprovado: etiqueta de oferta com uma lupa recortada, representando descobrir achadinhos. Os SVGs são uma reconstrução vetorial da proposta visual aprovada. Símbolo e letras são curvas, sem fontes externas. Os recortes são transparentes.

## Cores e temas

- Azul principal: `#0735DE`
- Azul para fundo escuro: `#7896FF`
- Texto / fundo escuro: `#0B1023`
- Texto claro / fundo claro: `#F8F9FC`

`frontend/public/brand/preview.svg` apresenta as duas versões.

## Arquivos (em frontend/public e admin/public)

- `brand/logos/logo-light.svg`: assinatura para fundo claro.
- `brand/logos/logo-dark.svg`: assinatura para fundo escuro.
- `brand/logos/logo.svg`: tema automático do sistema. Para tema escolhido no app, use o componente Brand.
- `brand/logos/logo-white.svg` / `brand/logos/logo-black.svg`: monocromáticas.
- `brand/marks/brand-mark.svg` / `brand/marks/brand-mark-dark.svg`: símbolo transparente.
- `icons/favicons/favicon.svg`: adapta-se ao tema do sistema; PNG de 32 px como fallback.
- `icons/pwa/icon-192.png` / `icons/pwa/icon-512.png`: ícones PWA com fundo azul e símbolo branco.
- `icons/pwa/icon-maskable-512.png`: variante Android com margem para recorte.
- `icons/pwa/apple-touch-icon.png`: ícone de 180 px.
- `icons/favicons/mask-icon.svg`: símbolo monocromático do Safari.

Os ícones instalados mantêm o fundo azul nos dois temas; não dependem da troca de tema do sistema.

A raiz de `public` contém apenas `manifest.webmanifest` e `sw.js`. A marca fica em `brand/` (logos, símbolos e preview), e os ícones em `icons/` (favicons, PWA e sprite da interface).

## React

Importe `Brand` de `src/components/Brand`. Use `<Brand />` para seguir o sistema, `<Brand theme="light" />` ou `<Brand theme="dark" />` para uma escolha explícita, e `<Brand symbolOnly />` para o símbolo. O padrão também respeita `data-theme="light|dark"` num elemento ancestral, como o html. Ajuste a largura com className. O componente está disponível nos dois apps; o seletor de tema do produto ainda não foi implementado.

## Regeneração

Execute `node scripts/generate-brand.mjs` na raiz para gerar todos os SVGs a partir de uma única fonte. Os PNGs são renderizados a partir de app-icon.svg e app-icon-maskable.svg. Preserve margens e proporções; não adicione sombra, contorno ou outros elementos ao símbolo.

Os manifests e favicons estão conectados nos dois apps. O service worker guarda apenas os assets públicos de marca; não oferece navegação offline e não guarda respostas de API.
