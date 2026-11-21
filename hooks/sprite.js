// 像素小克：橙色长发、向日葵发饰、眼镜、眨一只眼、奶油色开衫、黑色蝴蝶结。
// 每个字符是一个像素，'.' 是透明。

const PALETTE = {
  O: '#e8743b', // 头发
  o: '#c4562a', // 头发暗部
  h: '#f7a467', // 头发高光
  S: '#fde4d2', // 皮肤
  s: '#f3c6aa', // 皮肤暗部
  E: '#6b3a1a', // 眼睛
  e: '#f5b041', // 眼睛高光
  G: '#a8968a', // 眼镜框
  P: '#f6a5a0', // 腮红
  M: '#b0503f', // 嘴
  Y: '#f39c2a', // 向日葵花瓣
  y: '#8a5a2b', // 向日葵花心
  K: '#2e201b', // 黑色蝴蝶结、鞋
  W: '#fbf6ef', // 白衬衫
  C: '#ead9c0', // 开衫
  c: '#cdb595', // 开衫暗部
  B: '#33241e', // 束腰
  g: '#d9a84a', // 金扣子
}

const SPRITE = [
  '......ooOOOOOOoo....YY..',
  '.....oOOhhOOOOOOo..YYYY.',
  '....oOOhhOOOOOOOOoYYyyYY',
  '...oOOhOOOOOOOOOOOYYyyYY',
  '...oOOOOOOOOOOOOOOKYYYY.',
  '..oOOOOOOOOOOOOOOOKKYY..',
  '..oOOOoOOOOOOoOOOOOKK...',
  '..oOOoSSoOOOoSSSoOOOK...',
  '..oOoSSSSSSSSSSSSoOOK...',
  '..oOGGGGGSSSGGGGGSOOo...',
  '..oOGeEEGSSSGSSSGSOOo...',
  '..oOGEEEGGGGGEEEGSOOo...',
  '..oOGGGGGSSSGGGGGSOOo...',
  '..oOSPPSSSSSSSPPSSOOo...',
  '..oOOSSSSSMMSSSSSOOOo...',
  '..oOOoSSSSSSSSSSoOOOo...',
  '..oOOOooSSSSSSooOOOOo...',
  '.oOOCCCWWWKYKWWWCCCOOo..',
  '.oOCCCCWWKKYKKWWCCCCOo..',
  'oOOCCcCWWWKKKWWWCcCCOOo.',
  'oOCCCcCWWWWKWWWWCcCCCOo.',
  'oOCCcCCWWWWWWWWWCCcCCOo.',
  'oOCCcCCBBgBBBBgBBCcCCOo.',
  'oOCCcCCBBBBBBBBBBCcCCOo.',
  'oOCSSCCBBgBBBBgBBCCSSOo.',
  '.oOSSCCBBBBBBBBBBCCSSo..',
  '..oOCCWWWWWWWWWWWCCOo...',
  '...oCCWYWWWWWWYWWCCo....',
  '....CCWWWWWWWWWWWCC.....',
  '......SS......SS........',
  '......SS......SS........',
  '.....KKK.....KKK........',
]

// 眨眼：盖在左眼上的一帧（闭眼），大部分时间透明。
const BLINK = [
  { x: 5, y: 10, w: 3, c: 'S' },
  { x: 5, y: 11, w: 3, c: 'E' },
]

function pixels(rows, px) {
  let out = ''
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      let run = 1
      while (x + run < row.length && row[x + run] === ch) run++
      if (ch !== '.') {
        out += `<rect x="${x * px}" y="${y * px}" width="${run * px}" height="${px}" fill="${PALETTE[ch]}"/>`
      }
      x += run
    }
  })
  return out
}

// 一朵像素向日葵（7×7）。
const FLOWER = [
  '..Y.Y..',
  '.YYYYY.',
  'YYyyyYY',
  '.YyyyY.',
  'YYyyyYY',
  '.YYYYY.',
  '..Y.Y..',
]

export function buildScene() {
  const px = 9
  const w = SPRITE[0].length * px
  const hgt = SPRITE.length * px
  const blink = BLINK.map(b => `<rect x="${b.x * px}" y="${b.y * px}" width="${b.w * px}" height="${px}" fill="${PALETTE[b.c]}"/>`).join('')

  const flower = (x, y, size, cls) =>
    `<g class="${cls}" transform="translate(${x} ${y})">${pixels(FLOWER, size)}</g>`

  // 花瓣：从右上角往下飘的小方块。
  const petals = [
    [1380, 0, 0], [1460, 0, 3], [1300, 0, 6], [1520, 0, 9], [1240, 0, 12], [1420, 0, 15],
    [80, 0, 2], [180, 0, 8], [40, 0, 13],
  ]
    .map(([x, y, d], i) => `<rect class="petal" x="${x}" y="${y}" width="10" height="10" fill="${i % 2 ? '#f39c2a' : '#f7a467'}" style="animation-delay:-${d}s"/>`)
    .join('')

  // 针织纹：淡淡的菱形格，铺满整个背景。
  const knit = `<pattern id="knit" width="32" height="32" patternUnits="userSpaceOnUse">
    <path d="M0 16 L16 0 L32 16 L16 32 Z" fill="none" stroke="#e2cfb3" stroke-width="2" class="knit"/>
  </pattern>`

  const spriteX = 1600 - w - 70
  const spriteY = 470

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMaxYMid slice" shape-rendering="crispEdges">
<style>
  .base { fill: #f6eee2; }
  .knit { stroke: #eadbc4; }
  .shadow { fill: #e2cfb3; }
  @media (prefers-color-scheme: dark) {
    .base { fill: #1e1714; }
    .knit { stroke: #2a201b; }
    .shadow { fill: #120d0b; }
  }
  @keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
  @keyframes blink { 0%,92%,100% { opacity: 0; } 94%,97% { opacity: 1; } }
  @keyframes fall { 0% { transform: translate(0,-20px) rotate(0deg); opacity: 0; } 10% { opacity: .9; } 100% { transform: translate(-120px,1040px) rotate(360deg); opacity: 0; } }
  @keyframes sway { 0%,100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
  .bob { animation: bob 2.4s steps(2) infinite; }
  .blink { animation: blink 4.5s infinite; }
  .petal { animation: fall 18s linear infinite; transform-box: fill-box; }
  .sway { animation: sway 5s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
  @media (prefers-reduced-motion: reduce) { .bob, .blink, .petal, .sway { animation: none; } .petal { opacity: 0; } }
</style>
<defs>${knit}</defs>
<rect class="base" width="1600" height="1000"/>
<rect width="1600" height="1000" fill="url(#knit)" opacity=".7"/>
${petals}
${flower(40, 40, 8, 'sway')}
${flower(120, 110, 6, 'sway')}
${flower(1500, 40, 7, 'sway')}
<rect class="shadow" x="${spriteX + 30}" y="${spriteY + hgt - 4}" width="${w - 80}" height="10" rx="0" opacity=".6"/>
<g transform="translate(${spriteX} ${spriteY})">
  <g class="bob">
    ${pixels(SPRITE, px)}
    <g class="blink">${blink}</g>
  </g>
</g>
</svg>`
}
