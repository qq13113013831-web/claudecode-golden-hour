// 「金色黄昏」背景。
// 右边：深色拱窗，窗里有月亮和星星，抱书回望的小克站在光环前（GPT 画的素材，art.js 里是描好的矢量）。
// 右上角垂下星月流苏挂饰，轻轻晃；左下：书堆和烛台，烛光一明一暗。
// 夕阳光晕、暖云、飘落的花瓣和金光点照旧。中间和底部留空给文字。
// 左边空地：花月垂饰从标题栏下沿垂下。底下：雏菊点阵纸纹、正中一朵很淡的线描向日葵、四周压暗、金色细边框。
// 顶上约 40 个单位会被标题栏盖住，挂饰和边框都从那下面开始。
import { lookback, books, charm, candle, pendant } from './art.js'

const r1 = n => Math.round(n * 10) / 10

// 省元素：桌面端每帧会给“把整张图画一遍”计时，3 秒平均超过约 5.5ms 就把场景永久定格。
// 耗时主要跟元素个数走（每个约 2µs），所以重复的小图形都合成一条 path，样式相同的放一起。
// 绕原点转 deg 度
function rot(x, y, deg) {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a)
  return [x * c - y * s, x * s + y * c]
}
// 一组圆 [cx, cy, r] 合成一条 path 的 d
function dots(list) {
  return list.map(([x, y, r]) => `M${r1(x - r)} ${r1(y)}a${r} ${r} 0 1 0 ${r1(2 * r)} 0a${r} ${r} 0 1 0 ${r1(-2 * r)} 0`).join('')
}
// 一个椭圆：中心 (cx, cy)，半轴 rx、ry，长轴方向转 deg 度
function ell(cx, cy, rx, ry, deg) {
  const [ux, uy] = rot(rx, 0, deg)
  return `M${r1(cx - ux)} ${r1(cy - uy)}a${r1(rx)} ${r1(ry)} ${r1(deg)} 1 0 ${r1(2 * ux)} ${r1(2 * uy)}a${r1(rx)} ${r1(ry)} ${r1(deg)} 1 0 ${r1(-2 * ux)} ${r1(-2 * uy)}`
}
// 原点附近定义的折线/曲线点，绕原点转 deg 后平移到 (ox, oy)
function pt(x, y, deg, ox = 0, oy = 0) {
  const [a, b] = rot(x, y, deg)
  return `${r1(a + ox)} ${r1(b + oy)}`
}

// 边框四角的小雏菊：花瓣合成一条 path，花心合成一条
function cornerDaisies(corners, r) {
  let petals = ''
  for (const [x, y] of corners) {
    for (let i = 0; i < 8; i++) {
      const [px, py] = rot(0, -r * 0.55, i * 45)
      petals += ell(x + px, y + py, r * 0.2, r * 0.45, i * 45)
    }
  }
  return `<g class="cdaisy"><path class="p" d="${petals}"/><path class="c" d="${dots(corners.map(([x, y]) => [x, y, r * 0.25]))}"/></g>`
}
// 四角小星的形状，原点在中心
const STAR = 'M0 -11 C1 -3 3 -1 11 0 C3 1 1 3 0 11 C-1 3 -3 1 -11 0 C-3 -1 -1 -3 0 -11 Z'

function embroideredFlower(cx, cy, r, delay) {
  // 八瓣绣花：外圈虚线花瓣，里圈短针，中间金扣。
  let petals = ''
  let inner = ''
  for (let i = 0; i < 8; i++) {
    petals += `<ellipse cx="${cx}" cy="${r1(cy - r * 0.55)}" rx="${r1(r * 0.22)}" ry="${r1(r * 0.46)}" transform="rotate(${i * 45 + 22.5} ${cx} ${cy})"/>`
    inner += `<line x1="${cx}" y1="${r1(cy - r * 0.28)}" x2="${cx}" y2="${r1(cy - r * 0.62)}" transform="rotate(${i * 45 + 22.5} ${cx} ${cy})"/>`
  }
  return `<g class="turn" style="transform-origin:${cx}px ${cy}px;animation-delay:-${delay}s">
    <g class="stitch">${petals}</g>
    <g class="stitch2">${inner}</g>
    <circle cx="${cx}" cy="${cy}" r="${r1(r * 0.2)}" class="button"/>
    <circle cx="${r1(cx - r * 0.05)}" cy="${r1(cy - r * 0.05)}" r="${r1(r * 0.08)}" class="buttonhi"/>
  </g>`
}

function leaf(x, y, angle, size) {
  return `<path class="leaf" d="M0 0 q${size * 0.5} -${size * 0.45} ${size} 0 q-${size * 0.5} ${size * 0.45} -${size} 0 z" transform="translate(${x} ${y}) rotate(${angle})"/>`
}

function sunflowerLine(r) {
  // 细线描的向日葵：两圈尖瓣，中间一圈点。每圈合成一条 path。
  const petal = (a, b, c, d, deg) => `M${pt(0, -a, deg)} Q${pt(b, -c, deg)} ${pt(0, -d, deg)} Q${pt(-b, -c, deg)} ${pt(0, -a, deg)} Z`
  let front = ''
  let back = ''
  for (let i = 0; i < 16; i++) {
    front += petal(r * 0.42, r * 0.13, r * 0.72, r, i * 22.5)
    back += petal(r * 0.4, r * 0.1, r * 0.6, r * 0.78, i * 22.5 + 11.25)
  }
  const seeds = []
  for (let ring = 1; ring <= 3; ring++) {
    const n = ring * 7
    for (let i = 0; i < n; i++) {
      seeds.push([...rot(0, -r1(ring * r * 0.11), r1((360 / n) * i + ring * 9)), 1.6])
    }
  }
  return `<g class="sunflower"><path d="${front}"/><path class="back" d="${back}"/><circle r="${r * 0.38}" class="core"/><g class="seeds"><path d="${dots(seeds)}"/></g></g>`
}

function halo(cx, cy) {
  let rays = ''
  for (let i = 0; i < 72; i++) {
    const long = i % 3 === 0
    rays += `M${pt(0, -(long ? 205 : 215), i * 5)} L${pt(0, -(long ? 290 : 245), i * 5)}`
  }
  const ring = Array.from({ length: 24 }, (_, i) => [...rot(0, -185, i * 15 + 7.5), 3])
  return `<g transform="translate(${cx} ${cy})">
    <circle r="150" class="sundisc"/>
    <g class="halo-spin">
      <g class="rays"><path d="${rays}"/></g>
      <circle r="185" class="ring"/>
      <circle r="198" class="ring thin"/>
      <circle r="232" class="ring thin dash"/>
      <g class="ringdots"><path d="${dots(ring)}"/></g>
    </g>
    <g class="flower-spin">${sunflowerLine(118)}</g>
  </g>`
}

function chain(x, len, swingDelay) {
  // 金链环交替横竖，末端金珠和流苏。
  let links = ''
  for (let i = 0; i < len; i++) {
    const y = i * 20 + 34
    links += i % 2
      ? `<ellipse cx="${x}" cy="${y + 10}" rx="3.5" ry="9.5" class="link"/>`
      : `<ellipse cx="${x}" cy="${y + 10}" rx="7.5" ry="9.5" class="link"/>`
  }
  const top = len * 20 + 34
  return `<g class="swing" style="transform-origin:${x}px 30px;animation-delay:-${swingDelay}s">
    ${links}
    <circle cx="${x}" cy="${top + 9}" r="10" class="bead"/>
    <circle cx="${x - 3}" cy="${top + 6}" r="3" class="beadhi"/>
    <rect x="${x - 10}" y="${top + 19}" width="20" height="7" rx="2" class="tasselband"/>
    <path d="M${x - 9} ${top + 26} L${x + 9} ${top + 26} L${x + 14} ${top + 92} Q${x} ${top + 98} ${x - 14} ${top + 92} Z" class="tassel"/>
    <path d="M${x - 6} ${top + 30} L${x - 9} ${top + 92} M${x} ${top + 30} L${x} ${top + 95} M${x + 6} ${top + 30} L${x + 9} ${top + 92}" class="tasselline"/>
  </g>`
}

function bow(x, y) {
  // 黑棕色蝴蝶结，两条飘带。
  return `<g class="bow" transform="translate(${x} ${y})">
    <path class="ribbon" d="M-8 6 C-22 22 -42 36 -62 48 L-52 52 L-54 62 C-34 50 -16 32 -2 10 Z"/>
    <path class="ribbon" d="M8 6 C22 20 40 32 60 42 L50 47 L53 57 C32 46 16 30 2 10 Z"/>
    <path class="ribbon" d="M0 0 C-20 -26 -62 -30 -66 -4 C-70 22 -26 22 0 0 Z"/>
    <path class="ribbon" d="M0 0 C20 -26 62 -30 66 -4 C70 22 26 22 0 0 Z"/>
    <path class="ribbonfold" d="M-8 -2 C-26 -14 -48 -14 -52 -4 M8 -2 C26 -14 48 -14 52 -4"/>
    <path class="ribbonedge" d="M-62 -4 C-60 -22 -24 -22 -4 -2 M62 -4 C60 -22 24 -22 4 -2"/>
    <rect x="-11" y="-11" width="22" height="22" rx="6" class="knot"/>
    <circle r="5" class="knotflower"/>
  </g>`
}

function cloud(x, y, s, cls) {
  // 层叠的积云：一排圆鼓起来的顶，加一条平的底。
  const puffs = [[-0.9, 0.1, 0.42], [-0.45, -0.18, 0.55], [0.1, -0.3, 0.66], [0.62, -0.12, 0.5], [1.0, 0.1, 0.36]]
  // 边缘靠渐变自己变软（#cg / #cs 外圈淡出），不再套模糊滤镜：模糊在云移动时每帧都要重算，很费。
  const shape = g => puffs.map(([dx, dy, r]) => `<circle cx="${r1(x + dx * s)}" cy="${r1(y + dy * s)}" r="${r1(r * s)}" fill="url(#${g})"/>`).join('')
    + `<ellipse cx="${r1(x)}" cy="${r1(y + 0.2 * s)}" rx="${r1(1.25 * s)}" ry="${r1(0.27 * s)}" fill="url(#${g})"/>`
  return `<g class="${cls}">
    <g class="cloudshade" transform="translate(${r1(s * 0.06)} ${r1(s * 0.1)})">${shape('cs')}</g>
    <g class="cloud">${shape('cg')}</g>
  </g>`
}

function hair() {
  // 从右边缘飘进来的一束橙色长发，每缕从自己的发根轻轻摆。
  // [发根 y, 弯向, 末端 x, 末端 y, 粗细, 颜色, 延迟]
  // 每缕是实心发束：发根宽、发梢尖。先画暗的底层，再画亮的，最后几缕高光。
  const specs = [
    [-120, 0, 1420, 560, 70, 'h2', 0],
    [-60, 1, 1500, 720, 64, 'h2', 2],
    [-100, 1, 1330, 640, 52, 'h0', 1.2],
    [-40, 0, 1450, 860, 58, 'h0', 3],
    [10, 1, 1540, 960, 50, 'h0', 0.6],
    [-80, 0, 1380, 470, 40, 'h1', 2.5],
    [-20, 1, 1290, 780, 30, 'h1', 1.8],
    [30, 0, 1480, 1000, 38, 'h1', 3.6],
    [60, 1, 1580, 880, 30, 'h1', 0.9],
    [-70, 0, 1360, 600, 9, 'hl', 0.4],
    [-10, 1, 1420, 820, 8, 'hl', 2.2],
    [40, 0, 1520, 940, 7, 'hl', 1.4],
  ]
  return specs
    .map(([y0, bend, ex, ey, w, cls, d]) => {
      const sx = 1700
      const dy = ey - y0
      const b = bend ? -170 : 170
      const c1x = sx - 190
      const c1y = r1(y0 + dy * 0.22)
      const c2x = ex + b
      const c2y = r1(y0 + dy * 0.62)
      const shape = `M${sx} ${y0} C${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey} C${r1(c2x + w * 0.9)} ${r1(c2y - w * 0.2)} ${r1(c1x + w * 1.25)} ${c1y} ${sx} ${r1(y0 + w * 1.7)} Z`
      return `<g class="sway" style="transform-origin:${sx}px ${y0}px;animation-delay:-${d}s"><path class="hair ${cls}" d="${shape}"/></g>`
    })
    .join('')
}

function flowerFilled(cx, cy, r) {
  // 发饰上那朵实心向日葵：两层花瓣，棕色花心，金色扣边，一片小叶。
  let outer = ''
  let inner = ''
  for (let i = 0; i < 14; i++) {
    outer += `<ellipse cx="${cx}" cy="${r1(cy - r * 0.62)}" rx="${r1(r * 0.2)}" ry="${r1(r * 0.42)}" transform="rotate(${r1(i * 360 / 14)} ${cx} ${cy})"/>`
    inner += `<ellipse cx="${cx}" cy="${r1(cy - r * 0.5)}" rx="${r1(r * 0.15)}" ry="${r1(r * 0.32)}" transform="rotate(${r1(i * 360 / 14 + 12.8)} ${cx} ${cy})"/>`
  }
  return `<g class="hairflower">
    <path class="fleaf" d="M${cx - r * 0.6} ${cy + r * 0.5} q-${r * 0.7} ${r * 0.1} -${r * 0.9} ${r * 0.6} q${r * 0.6} ${r * 0.1} ${r * 0.9} -${r * 0.6} z"/>
    <g class="fpetal">${outer}</g>
    <g class="fpetal2">${inner}</g>
    <circle cx="${cx}" cy="${cy}" r="${r1(r * 0.36)}" class="fcore"/>
    <circle cx="${cx}" cy="${cy}" r="${r1(r * 0.27)}" class="fring"/>
    <circle cx="${r1(cx - r * 0.1)}" cy="${r1(cy - r * 0.1)}" r="${r1(r * 0.09)}" class="fhi"/>
  </g>`
}

function streamer(x, y, len, dir, delay) {
  // 白底橙花纹的发带，末端剪成燕尾，下面挂金流苏。
  const a = dir * 22
  const body = `M${x - 9} ${y} C${x - 9 + a} ${r1(y + len * 0.33)} ${x - 9 - a} ${r1(y + len * 0.66)} ${x - 9} ${y + len} L${x} ${y + len - 10} L${x + 9} ${y + len} C${x + 9 - a} ${r1(y + len * 0.66)} ${x + 9 + a} ${r1(y + len * 0.33)} ${x + 9} ${y} Z`
  let marks = ''
  for (let t = 0.12; t < 0.9; t += 0.15) {
    const mx = r1(x + dir * 66 * t * (1 - t) * (1 - 2 * t))
    const my = r1(y + len * t)
    marks += `<path class="smark" d="M${mx} ${my - 5} L${mx + 4} ${my} L${mx} ${my + 5} L${mx - 4} ${my} Z"/>`
  }
  const ty = y + len - 4
  return `<g class="swing" style="transform-origin:${x}px ${y}px;animation-delay:-${delay}s">
    <path class="sbody" d="${body}"/>
    ${marks}
    <circle cx="${x}" cy="${ty + 8}" r="5" class="bead"/>
    <rect x="${x - 6}" y="${ty + 12}" width="12" height="5" rx="1.5" class="tasselband"/>
    <path d="M${x - 5} ${ty + 17} L${x + 5} ${ty + 17} L${x + 9} ${ty + 56} Q${x} ${ty + 60} ${x - 9} ${ty + 56} Z" class="gtassel"/>
    <path d="M${x - 3} ${ty + 20} L${x - 5} ${ty + 55} M${x + 3} ${ty + 20} L${x + 5} ${ty + 55}" class="gtasselline"/>
  </g>`
}

function desk(x, y) {
  // 左下角：两本叠着的书，一本立着的太阳纹封面书，书上一个浑天仪。
  const sideBook = (bx, by, w, cls) => `<g class="${cls}">
    <rect x="${bx}" y="${by - 12}" width="${w}" height="12" rx="3" class="cover"/>
    <rect x="${bx + 6}" y="${by - 38}" width="${w - 12}" height="26" class="pages"/>
    <path d="M${bx + 8} ${by - 30} H${bx + w - 8} M${bx + 8} ${by - 22} H${bx + w - 8}" class="pagelines"/>
    <rect x="${bx}" y="${by - 50}" width="${w}" height="12" rx="3" class="cover"/>
    <path d="M${bx + 10} ${by - 44} H${bx + w - 10} M${bx + 10} ${by - 6} H${bx + w - 10}" class="goldline"/>
  </g>`
  let rays = ''
  for (let i = 0; i < 12; i++) {
    rays += `<path d="M0 -14 L3 -24 L0 -30 L-3 -24 Z" transform="rotate(${i * 30})"/>`
  }
  const lean = `<g transform="translate(${x + 300} ${y}) rotate(-9)">
    <rect x="0" y="-150" width="112" height="150" rx="5" class="cover"/>
    <rect x="9" y="-141" width="94" height="132" rx="3" class="goldframe"/>
    <g transform="translate(56 -78)" class="sunemblem"><circle r="11"/>${rays}</g>
    <rect x="112" y="-146" width="7" height="142" class="pages"/>
  </g>`
  const cx = x + 140
  const cy = y - 100 - 74
  const sphere = `<g class="sphere">
    <path d="M${cx - 30} ${y - 100} L${cx + 30} ${y - 100} L${cx + 16} ${y - 112} L${cx - 16} ${y - 112} Z" class="stand"/>
    <path d="M${cx} ${y - 112} V${cy + 66}" class="gold3"/>
    <circle cx="${cx}" cy="${cy}" r="66" class="gold3"/>
    <ellipse cx="${cx}" cy="${cy}" rx="66" ry="18" transform="rotate(-23 ${cx} ${cy})" class="gold2"/>
    <ellipse cx="${cx}" cy="${cy}" rx="66" ry="12" class="gold1"/>
    <g class="spin3d" style="transform-origin:${cx}px ${cy}px"><ellipse cx="${cx}" cy="${cy}" rx="20" ry="66" class="gold2"/></g>
    <g class="spin3d slow" style="transform-origin:${cx}px ${cy}px"><ellipse cx="${cx}" cy="${cy}" rx="46" ry="66" class="gold1"/></g>
    <circle cx="${cx}" cy="${cy}" r="11" class="globe"/>
  </g>`
  return `<g class="desk">${sideBook(x, y, 270, 'b1')}${sideBook(x + 22, y - 50, 230, 'b2')}${sphere}${lean}</g>`
}

function daisy(cx, cy, r, n, cls) {
  // 剪纸风的白色小花：一圈圆头花瓣，橙色花心。
  let p = ''
  for (let i = 0; i < n; i++) {
    p += `<ellipse cx="${cx}" cy="${r1(cy - r * 0.6)}" rx="${r1(r * 0.2)}" ry="${r1(r * 0.42)}" transform="rotate(${r1((360 / n) * i)} ${cx} ${cy})"/>`
  }
  return `<g class="${cls}"><g class="dpetal">${p}</g><circle cx="${cx}" cy="${cy}" r="${r1(r * 0.3)}" class="dcore"/></g>`
}

function figure() {
  // 小克的剪纸风半身像：头微微低着朝左，刘海挡住眼睛。
  // 局部坐标约 0..560 × 0..700，只用几种纯色，阴影是剪出来的色块。
  return `<g class="fig">
    <path class="fH" d="M150 180 C140 80 220 30 290 35 C370 40 420 110 425 200 C428 300 450 420 500 520 C520 560 545 600 560 640 C520 625 495 600 480 585 C495 630 510 670 530 700 L380 700 C360 620 340 520 330 430 Z"/>
    <path class="fH2" d="M360 260 C380 360 410 460 470 560 C430 520 395 450 375 360 Z"/>
    <path class="fH2" d="M400 520 C420 600 440 650 460 700 L430 700 C420 640 405 580 400 520 Z"/>
    <path class="fH" d="M420 300 C470 330 520 350 580 350 C530 365 480 360 430 335 Z"/>
    <path class="fH" d="M445 420 C500 450 550 470 610 466 C550 488 495 480 450 450 Z"/>

    <path class="fS" d="M225 320 L295 290 L300 430 L240 440 Z"/>
    <path class="fS2" d="M236 330 L298 302 L300 362 C280 368 256 362 236 350 Z"/>
    <path class="fW" d="M90 520 C130 460 200 430 250 430 C320 428 390 450 440 500 C470 560 480 640 490 700 L70 700 C75 630 80 570 90 520 Z"/>
    <path class="fW2" d="M250 430 C230 470 215 560 210 700 L180 700 C188 580 205 480 232 432 Z"/>
    <path class="fC" d="M70 700 C75 600 85 540 100 515 C135 470 190 447 232 440 C212 505 198 600 194 700 Z"/>
    <path class="fC" d="M302 438 C352 444 402 462 440 500 C470 560 482 640 492 700 L332 700 C330 600 320 505 302 438 Z"/>
    <path class="fC2" d="M100 515 C120 560 128 630 126 700 L104 700 C106 630 102 570 92 528 Z"/>
    ${daisy(150, 610, 30, 8, 'emb')}
    <path class="fW" d="M222 446 L225 432 q8 -11 16 0 q8 -11 16 0 q8 -11 16 0 q8 -11 16 0 q8 -11 16 0 L308 448 Z"/>

    <path class="fD" d="M265 455 C235 422 192 428 198 456 C204 482 242 476 265 455 Z"/>
    <path class="fD" d="M265 455 C295 422 338 428 332 456 C326 482 288 476 265 455 Z"/>
    <path class="fD" d="M258 462 L232 545 L250 536 L260 550 L270 464 Z"/>
    <path class="fD" d="M272 462 L302 540 L285 534 L277 550 L264 464 Z"/>
    ${daisy(265, 455, 24, 9, 'brooch')}

    <path class="fS" d="M172 150 C158 205 162 270 186 318 C198 342 214 354 228 352 C252 348 286 322 306 292 L314 170 Z"/>
    <path class="fS2" d="M172 150 L314 170 L312 214 C270 205 220 200 168 210 Z"/>
    <path class="eye" d="M186 240 Q202 251 222 242"/>
    <path class="fH" d="M140 175 C160 120 240 100 322 140 L318 215 L296 172 L282 252 L258 178 L238 264 L222 176 L198 272 L190 188 L170 252 L160 196 Z"/>
    <path class="fH" d="M150 170 C128 250 132 360 112 480 C108 520 100 560 92 590 C125 545 148 470 158 400 C168 330 172 250 170 180 Z"/>
    <path class="fH2" d="M138 300 C132 380 122 450 108 520 C128 470 140 400 146 330 Z"/>
    <path class="fH" d="M180 262 C172 330 176 400 160 470 C182 420 194 360 194 300 Z"/>
    <path class="fH2" d="M200 70 C240 50 300 55 345 82 C300 76 250 76 210 92 Z"/>

    <path class="fD" d="M352 100 L382 205 L367 200 L360 216 L344 104 Z"/>
    <path class="fD" d="M357 100 L404 178 L389 179 L386 194 L349 104 Z"/>
    <path class="fD" d="M348 98 C372 50 418 52 414 82 C410 108 372 112 348 98 Z"/>
    <path class="fD" d="M348 98 C334 52 296 46 300 74 C303 98 326 104 348 98 Z"/>
    ${daisy(340, 100, 40, 10, 'hairflower2')}

    <path class="fG" d="M302 294 L308 304 L302 314 L296 304 Z"/>
    <path class="fGl" d="M302 314 V336"/>
    <path class="fG" d="M297 336 H307 L310 372 Q302 376 294 372 Z"/>
  </g>`
}

export function buildScene() {
  const petals = [
    [1250, 0, 1], [1340, 4, 0.8], [1450, 8, 1.2], [1530, 2, 0.9], [1180, 11, 0.7],
    [1400, 14, 1.1], [1110, 6, 0.8], [1570, 17, 1], [1300, 19, 0.6],
    [1000, 9, 0.9], [1490, 12.5, 0.75], [1220, 16, 1.1],
  ]
    // 位置放在外层 g 上：CSS 动画的 transform 会覆盖元素自己的 transform 属性
    .map(([x, d, s], i) => `<g class="fall" style="animation-delay:-${d}s;animation-duration:${18 + (i % 4) * 3}s"><g transform="translate(${x} 0) scale(${r1(s * 1.3)})"><path class="petal p${i % 3}" d="M0 0 C6 -12 18 -12 22 0 C18 12 6 12 0 0 Z" style="animation-delay:-${d * 0.7}s"/></g></g>`)
    .join('')

  const sparkles = [
    [1170, 110, 0, 1], [1250, 380, 1.2, 0.8], [1555, 420, 2.1, 1], [1470, 470, 0.6, 0.7], [1090, 260, 2.8, 0.8],
    // 左半边（侧栏挡住 x<242，所以都放在 270 以右）
    [300, 416, 1.6, 1.1], [472, 240, 0.4, 0.9], [352, 528, 2.4, 0.85], [620, 520, 1, 0.7], [420, 130, 3, 0.8], [760, 330, 1.9, 0.75],
  ]
    .map(([x, y, d, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><path class="spark" d="${STAR}" style="animation-delay:-${d}s"/></g>`)
    .join('')

  // 满天小星：固定种子的伪随机，每次生成都一样；四颗里一颗会闪，其余三档亮度静止
  let seed = 20261115
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  // 随机数的取用顺序和以前一样，星星位置不变；只是合成几条 path
  const twinkleGroups = [[], [], [], []]
  const stillGroups = [[], [], []]
  for (let i = 0; i < 140; i++) {
    const x = r1(250 + rnd() * 1350), y = r1(50 + rnd() * 720), r = r1(i % 12 === 5 ? 2.8 + rnd() * 0.8 : 1.1 + rnd() * 1.8)
    if (i % 4 === 0) twinkleGroups[Math.min(3, Math.floor(rnd() * 4))].push([x, y, r])
    else stillGroups[i % 3].push([x, y, r])
  }
  // 会闪的分四拨，相位错开 1 秒
  const liveStars = twinkleGroups.map((g, k) => `<path class="star" d="${dots(g)}" style="animation-delay:-${k}s"/>`).join('')
  const stillStars = stillGroups.map((g, k) => `<path class="sd s${k}" d="${dots(g)}"/>`).join('')

  // 人物身边升起的小光点 [x, 起点 y, 半径, 延迟, 时长]
  const motes = [[1230, 900, 2.6, 0, 9], [1300, 820, 2, 3.5, 11], [1560, 860, 2.4, 1.2, 10], [1520, 700, 1.8, 6, 8],
    [1260, 650, 2, 7.5, 12], [1580, 560, 1.6, 2.2, 9], [1350, 960, 2.2, 5, 10], [1450, 920, 1.8, 8.4, 9]]
    .map(([x, y, r, d, t]) => `<circle class="mote" cx="${x}" cy="${y}" r="${r}" style="animation-delay:-${d}s;animation-duration:${t}s"/>`)
    .join('')

  // 拱窗里的小星星
  const archStars = [[1230, 470, 1.6], [1330, 300, 1.2], [1540, 380, 1.8], [1475, 315, 1.1], [1225, 600, 1.2], [1535, 540, 1.4]]
    .map(([x, y, r], i) => `<circle class="astar" cx="${x}" cy="${y}" r="${r}" style="animation-delay:-${(i * 1.3) % 5}s"/>`)
    .join('')

  // 两层共用的开头：<svg>、样式和渐变定义
  const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMaxYMin slice">
<style>
  .base { fill: #f7efe3; }
  .sun0 { stop-color: #ffd79a; } .sun1 { stop-color: #f6a56a; } .sun2 { stop-color: #f7efe3; }
  .sundisc { fill: #ffe2b0; opacity: .55; }
  .cloud { opacity: .92; } .cl0 { stop-color: #fff8ee; }
  .cloudshade { opacity: .6; } .cs0 { stop-color: #f3c29a; }
  .rays path { fill: none; stroke: #d39a40; stroke-width: 1.3; opacity: .5; }
  .ring { fill: none; stroke: #cf9638; stroke-width: 2.5; opacity: .8; }
  .ring.thin { stroke-width: 1; opacity: .55; }
  .ring.dash { stroke-dasharray: 2 8; stroke-width: 2; }
  .ringdots path { fill: #cf9638; opacity: .85; }
  .sunflower path { fill: none; stroke: #d9813f; stroke-width: 1.4; opacity: .55; }
  .sunflower path.back { opacity: .35; }
  .sunflower .core { fill: none; stroke: #b8702e; stroke-width: 1.4; opacity: .5; }
  .sunflower .seeds path { fill: #b8702e; opacity: .45; }
  .sunflower g.seeds path { stroke: none; }
  .stitch ellipse { fill: none; stroke: #e0773e; stroke-width: 3; stroke-dasharray: 7 5; stroke-linecap: round; opacity: .55; }
  .stitch2 line { stroke: #e9a04a; stroke-width: 2; stroke-linecap: round; opacity: .55; }
  .button { fill: #d39a40; } .buttonhi { fill: #fff3d6; opacity: .85; }
  .vine { fill: none; stroke: #d39a40; stroke-width: 2.4; stroke-linecap: round; opacity: .5; }
  .vine.thin { stroke-width: 1.4; }
  .leaf { fill: none; stroke: #d39a40; stroke-width: 1.8; opacity: .5; }
  .link { fill: none; stroke: #c48c30; stroke-width: 3; }
  .bead { fill: #e0773e; } .beadhi { fill: #ffd2a8; }
  .tassel { fill: #e0773e; } .tasselline { stroke: #b4552a; stroke-width: 1.4; fill: none; }
  .tasselband { fill: #c48c30; }
  .ribbon { fill: #33241e; } .ribbonfold { fill: none; stroke: #5a4136; stroke-width: 2; }
  .ribbonedge { fill: none; stroke: #e0773e; stroke-width: 1.5; stroke-dasharray: 3 4; opacity: .8; }
  .knot { fill: #2a1d18; } .knotflower { fill: #e0773e; }
  .petal.p0 { fill: #f08a4b; } .petal.p1 { fill: #f7a467; } .petal.p2 { fill: #e9b44c; }
  .spark { fill: #e3a93c; }
  .star { fill: #ffe8b8; opacity: 0; }
  .sd { fill: #f6dfc7; opacity: 0; }
  .panel { fill: #ecd9bf; opacity: .85; } .sliver { fill: #e8803f; opacity: .8; }
  .fH { fill: #e8803f; } .fH2 { fill: #cf6a30; }
  .fS { fill: #f7e4cb; } .fS2 { fill: #ebcdac; }
  .fW { fill: #fbf4e8; } .fW2 { fill: #efe2cd; }
  .fD { fill: #2e211c; }
  .eye { fill: none; stroke: #2e211c; stroke-width: 4; stroke-linecap: round; }
  .dpetal ellipse { fill: #fbf5ea; } .dcore { fill: #e8803f; }
  .fC { fill: #dfc6a2; } .fC2 { fill: #ccb08a; }
  .emb .dpetal ellipse { fill: #e8803f; } .emb .dcore { fill: #d9a84a; }
  .fG { fill: #d9a84a; } .fGl { stroke: #d9a84a; stroke-width: 2; }
  .hair { opacity: .92; }
  .hair.h0 { fill: #e8743b; } .hair.h1 { fill: #f2904f; } .hair.h2 { fill: #c9592b; } .hair.hl { fill: #ffcf9e; opacity: .8; }
  .fpetal ellipse { fill: #f08a3a; } .fpetal2 ellipse { fill: #f7a75e; }
  .fcore { fill: #8a5a2b; } .fring { fill: none; stroke: #e2b04e; stroke-width: 2; stroke-dasharray: 2 3; } .fhi { fill: #f5d29a; }
  .fleaf { fill: #8aa04e; }
  .sbody { fill: #fbf6ef; stroke: #e6cfb2; stroke-width: 1.2; }
  .smark { fill: #e8803f; }
  .gtassel { fill: #d9a84a; } .gtasselline { stroke: #a87a2a; stroke-width: 1.2; fill: none; }
  .desk .cover { fill: #5a3526; } .desk .b2 .cover { fill: #7a3f22; }
  .desk .pages { fill: #f6ead6; } .desk .pagelines { stroke: #dcc6a4; stroke-width: 1; }
  .desk .goldline { stroke: #d9a84a; stroke-width: 1.5; }
  .desk .goldframe { fill: none; stroke: #d9a84a; stroke-width: 1.5; }
  .sunemblem { fill: #d9a84a; }
  .gold3 { fill: none; stroke: #c99236; stroke-width: 3.5; }
  .gold2 { fill: none; stroke: #c99236; stroke-width: 2.2; }
  .gold1 { fill: none; stroke: #c99236; stroke-width: 1.4; opacity: .8; }
  .stand { fill: #c99236; } .globe { fill: #e8803f; }
  .arch { fill: #2e211c; } .archline { fill: none; stroke: #e0773e; stroke-width: 3; opacity: .75; }
  .astar { fill: #f6dfc7; animation: twinkle 5s ease-in-out infinite; }
  .moon { fill: #f6dfc7; opacity: .9; }
  .glow0 { stop-color: #ffb060; } .glow { animation: flame 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes flame { 0%,100% { opacity: .55; transform: scale(.92); } 40% { opacity: 1; transform: scale(1.06); } 70% { opacity: .75; transform: scale(.97); } }
  /* 第二层火光：周期 1.7s 跟 2.6s 错开，关键帧不均匀，叠起来像火苗在跳 */
  .flick { animation: flick 1.7s linear infinite; transform-box: fill-box; transform-origin: 50% 70%; }
  @keyframes flick { 0% { opacity: .72; transform: scale(1); } 13% { opacity: .86; transform: scale(1.08, 1.04); } 21% { opacity: .68; transform: scale(.95); } 38% { opacity: .8; transform: scale(1.03); } 52% { opacity: .64; transform: scale(.93, .97); } 61% { opacity: .84; transform: scale(1.06); } 80% { opacity: .7; transform: scale(.98); } 100% { opacity: .72; transform: scale(1); } }
  /* 流星：只在夜里出现，大部分时间藏着 */
  .meteors { display: none; }
  .meteor { opacity: 0; animation: meteor 9s linear infinite; }
  .meteor.m2 { animation-duration: 14s; animation-delay: -6s; }
  .mhead { fill: #fff3dc; }
  /* 划过约 1 秒，其余时间藏着 */
  @keyframes meteor { 0% { transform: translateX(0); opacity: 0; } 2% { opacity: 1; } 11% { transform: translateX(-560px); opacity: 0; } 100% { transform: translateX(-560px); opacity: 0; } }
  /* 人物：从脚下往上的呼吸（肩膀微微抬起），外面再套一层很慢的左右轻摆，两个周期错开 */
  @keyframes breath2 { 0%,100% { transform: scale(1, 1); } 45% { transform: scale(1.005, 1.013); } }
  @keyframes bodysway { 0%,100% { transform: rotate(-.45deg); } 50% { transform: rotate(.55deg); } }
  .breath { animation: breath2 5.5s ease-in-out infinite; transform-origin: 1402px 1000px; }
  /* 摆动和呼吸是同一组画面，呼吸本来就每帧重画它，摆动不多花力气 */
  .bodysway { animation: bodysway 12s ease-in-out infinite; transform-origin: 1402px 1000px; }
  /* 发间小花和耳坠偶尔闪一下 */
  .fglint { fill: #fff3d6; animation: glint 6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  /* 她身边慢慢升起的小光点 */
  @keyframes rise { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: .85; } 80% { opacity: .5; } 100% { transform: translateY(-170px); opacity: 0; } }
  .mote { fill: #ffd39a; animation: rise 9s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) { .bodysway, .fglint, .mote { animation: none; } .mote { opacity: 0; } }
  .hang { animation: swing 7s ease-in-out infinite; transform-origin: 1436px 36px; }
  .hang2 { animation: swing 8.5s ease-in-out infinite; animation-delay: -3s; transform-origin: 374px 34px; }
  .dots { fill: #d39a40; opacity: .16; }
  .watermark .sunflower path { stroke: #d39a40; opacity: .13; stroke-width: 1.6; }
  .watermark .sunflower path.back { opacity: .08; }
  .watermark .sunflower .core { stroke: #d39a40; opacity: .1; }
  .watermark .sunflower .seeds path { fill: #d39a40; opacity: .1; }
  .vig0 { stop-color: #b98a5c; }
  .frame { fill: none; stroke: #cf9638; stroke-width: 1.6; opacity: .6; }
  .frame.in { stroke-width: .8; opacity: .4; }
  .cdaisy .p { fill: #fbf1e2; } .cdaisy .c { fill: #e0773e; }
  @media (prefers-reduced-motion: reduce) { .hang2 { animation: none; } }
  @media (prefers-reduced-motion: reduce) { .astar, .glow, .breath, .hang { animation: none; } }

  @media (prefers-color-scheme: dark) {
    .base { fill: #1d1613; }
    /* 压暗的橙会被看成砖红，所以色相往黄挪一点（约 20° → 27°），对上小克的发色 */
    .sun0 { stop-color: #a0581a; } .sun1 { stop-color: #4e2e14; } .sun2 { stop-color: #1d1613; }
    .sundisc { fill: #d9792e; opacity: .34; }
    .cloud { opacity: .7; } .cl0 { stop-color: #33251f; }
    .cloudshade { opacity: .4; } .cs0 { stop-color: #6e3a22; }
    .rays path { stroke: #e9b44c; opacity: .42; }
    .ring { stroke: #e9b44c; opacity: .8; } .ring.thin { opacity: .5; }
    .ringdots path { fill: #e9b44c; opacity: .8; }
    .sunflower path { stroke: #f0a050; opacity: .45; }
    .sunflower .core { stroke: #e9b44c; opacity: .4; }
    .sunflower .seeds path { fill: #e9b44c; opacity: .4; }
  .stitch ellipse { opacity: .4; } .stitch2 line { opacity: .35; }
    .button { opacity: .6; } .buttonhi { opacity: .4; }
    .vine, .leaf { stroke: #c9963e; opacity: .35; }
    .ribbon { fill: #4a3028; } .ribbonfold { stroke: #6b4a3c; } .knot { fill: #3a241d; }
    .star { animation: twinkle 4s ease-in-out infinite; }
    .sd.s0 { opacity: .7; } .sd.s1 { opacity: .92; } .sd.s2 { opacity: .45; }
    .panel { fill: #2a1f1a; opacity: .95; } .sliver { fill: #c9612d; opacity: .7; }
    .hair { opacity: .72; } .hair.hl { opacity: .5; }
    .sbody { fill: #e9ddcc; stroke: #8a6a52; }
    .desk .cover { fill: #3e261c; } .desk .b2 .cover { fill: #5a2e1a; }
    .desk .pages { fill: #cdbba0; } .desk .pagelines { stroke: #a08868; }
    .gold3, .gold2, .gold1 { stroke: #d9a84a; }
    .arch { fill: #2a1d18; } .archline { stroke: #c9612d; opacity: .8; }
    .glow0 { stop-color: #ff9a40; }
    .meteors { display: inline; }
    .dots { fill: #e9b44c; opacity: .1; }
    .watermark .sunflower path { stroke: #e9b44c; opacity: .09; }
    .watermark .sunflower path.back { opacity: .06; }
    .vig0 { stop-color: #070403; }
    .frame { stroke: #d9a84a; opacity: .5; } .frame.in { opacity: .3; }
    .cdaisy .p { fill: #f6dfc7; }
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes spinback { to { transform: rotate(-360deg); } }
  @keyframes breathe { 0%,100% { opacity: .45; transform: scale(.97); } 50% { opacity: .7; transform: scale(1.03); } }
  @keyframes drift { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-36px); } }
  @keyframes drift2 { 0%,100% { transform: translateX(0); } 50% { transform: translateX(28px); } }
  @keyframes swing { 0%,100% { transform: rotate(-2.5deg); } 50% { transform: rotate(2.5deg); } }
  @keyframes turn { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
  @keyframes fall { 0% { transform: translate(0,-30px); opacity: 0; } 8% { opacity: .9; } 85% { opacity: .8; } 100% { transform: translate(-260px,1040px); opacity: 0; } }
  @keyframes flutter { 0%,100% { transform: translateX(-18px) rotate(-30deg); } 50% { transform: translateX(18px) rotate(40deg); } }
  @keyframes glint { 0%,100% { opacity: 0; transform: scale(.3) rotate(0deg); } 50% { opacity: .95; transform: scale(1) rotate(45deg); } }
  @keyframes twinkle { 0%,100% { opacity: .12; } 50% { opacity: .9; } }

  /* 省帧率：SVG 里的动画不走显卡合成，每更新一次就整片重画。
     慢动画用 steps 定在 30 次/秒（屏幕的一半）：外圈每次只挪约 .3px，看着连贯，重画量减半。
     试过 6 次/秒，外圈一次跳近 2px，会一顿一顿。 */
  .halo-spin { animation: spin 180s steps(5400) infinite; }
  .flower-spin { animation: spinback 240s steps(7200) infinite; }
  .clouds-a { animation: drift 46s steps(1380) infinite; }
  .clouds-b { animation: drift2 38s steps(1140) infinite; }
  .sundisc { animation: breathe 8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .swing { animation: swing 6s ease-in-out infinite; }
  .turn { animation: turn 9s ease-in-out infinite; }
  .fall { animation: fall 20s linear infinite; }
  .petal { animation: flutter 3.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  /* 金色四角星一直亮着，只是轻轻明暗、微微缩放，不会消失 */
  @keyframes shimmer { 0%,100% { opacity: .6; transform: scale(.85); } 50% { opacity: 1; transform: scale(1.05); } }
  .spark { animation: shimmer 4.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes hairsway { 0%,100% { transform: rotate(-1.6deg); } 50% { transform: rotate(1.8deg); } }
  @keyframes spin3d { 0% { transform: scaleX(1); } 50% { transform: scaleX(-1); } 100% { transform: scaleX(1); } }
  .sway { animation: hairsway 7s ease-in-out infinite; }
  .spin3d { animation: spin3d 12s linear infinite; }
  .spin3d.slow { animation-duration: 20s; animation-direction: reverse; }
  @media (prefers-reduced-motion: reduce) { .sway, .spin3d { animation: none; } }
  @media (prefers-reduced-motion: reduce) {
    .halo-spin, .flower-spin, .sundisc, .clouds-a, .clouds-b, .swing, .turn, .fall, .petal, .spark, .star, .flick { animation: none; }
    .meteors { display: none; }
    .fall { opacity: 0; } .spark { opacity: .6; }
  }
</style>
<defs>
  <radialGradient id="sun" cx="1350" cy="420" r="680" gradientUnits="userSpaceOnUse">
    <stop offset="0" class="sun0"/><stop offset=".4" class="sun1" stop-opacity=".45"/><stop offset="1" class="sun2" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" class="sun1" stop-opacity=".18"/><stop offset=".35" class="sun2" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="glow"><stop offset="0" class="glow0" stop-opacity=".55"/><stop offset="1" class="glow0" stop-opacity="0"/></radialGradient>
  <radialGradient id="cg"><stop offset=".78" class="cl0"/><stop offset="1" class="cl0" stop-opacity="0"/></radialGradient>
  <radialGradient id="cs"><stop offset=".78" class="cs0"/><stop offset="1" class="cs0" stop-opacity="0"/></radialGradient>
  <radialGradient id="glow2"><stop offset="0" stop-color="#ffd08a" stop-opacity=".6"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></radialGradient>
  <linearGradient id="mtail" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="150" y2="0">
    <stop offset="0" stop-color="#fff3dc" stop-opacity=".95"/><stop offset=".25" stop-color="#f2c47a" stop-opacity=".6"/><stop offset="1" stop-color="#e9b44c" stop-opacity="0"/>
  </linearGradient>
  <pattern id="dots" width="96" height="96" patternUnits="userSpaceOnUse">
    <g class="dots" transform="translate(24 24)"><ellipse rx="2" ry="5.5"/><ellipse rx="2" ry="5.5" transform="rotate(60)"/><ellipse rx="2" ry="5.5" transform="rotate(120)"/></g>
    <g class="dots" transform="translate(72 72)"><ellipse rx="2" ry="5.5"/><ellipse rx="2" ry="5.5" transform="rotate(60)"/><ellipse rx="2" ry="5.5" transform="rotate(120)"/></g>
  </pattern>
  <radialGradient id="vig" cx="800" cy="480" r="980" gradientUnits="userSpaceOnUse">
    <stop offset=".55" class="vig0" stop-opacity="0"/><stop offset="1" class="vig0" stop-opacity=".55"/>
  </radialGradient>
  <filter id="soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
</defs>
`

  // 底层：不动的东西。这一张画一次就不用再重画
  const still = `
<rect class="base" width="1600" height="1000"/>
<rect width="1600" height="1000" fill="url(#edge)"/>
<rect width="1600" height="1000" fill="url(#sun)"/>
<rect width="1600" height="1000" fill="url(#dots)"/>
<rect width="1600" height="1000" fill="url(#vig)"/>
${stillStars}
<path class="arch" d="M1187 1010 L1187 445 A205 205 0 0 1 1597 445 L1597 1010 Z"/>
<path class="archline" d="M1167 1010 L1167 445 A225 225 0 0 1 1617 445 L1617 1010"/>
<path class="moon" d="M1255 304 a34 34 0 1 0 40 44 a27 27 0 1 1 -40 -44 Z"/>
<rect class="frame" x="252" y="54" width="1336" height="890" rx="12"/>
<rect class="frame in" x="260" y="62" width="1320" height="874" rx="8"/>
${cornerDaisies([[252, 54], [1588, 54], [252, 944], [1588, 944]], 15)}
`

  // 上层：透明底，只放会动的东西（书堆和烛台跟着光晕放这层，光晕要压在书下面）
  const live = `
<g class="watermark" transform="translate(800 520)"><g class="flower-spin">${sunflowerLine(300)}</g></g>
${liveStars}
<!-- 流星：外层 g 定位和角度（尾巴朝右上），内层 g 由 CSS 往 -x 推，也就是往左下划 -->
<g class="meteors">
  <g transform="translate(1120 110) rotate(-24)"><g class="meteor"><path d="M0 -1.4 L150 0 L0 1.4 Z" fill="url(#mtail)"/><circle class="mhead" r="2.4"/></g></g>
  <g transform="translate(820 70) rotate(-30) scale(.8)"><g class="meteor m2"><path d="M0 -1.4 L150 0 L0 1.4 Z" fill="url(#mtail)"/><circle class="mhead" r="2.4"/></g></g>
</g>

<g class="clouds-a">${cloud(1150, 150, 60, '')}${cloud(930, 260, 44, '')}</g>
<g class="clouds-b">${cloud(1010, 90, 40, '')}</g>

<g class="archstars" transform="translate(12 0)">${archStars}</g>
${halo(1392, 532)}
<g class="bodysway"><g class="breath"><g transform="translate(1151 340) scale(1.02)">${lookback.svg}
  <g transform="translate(323 63)"><path class="fglint" d="${STAR}"/></g>
  <g transform="translate(356 140) scale(.6)"><path class="fglint" d="${STAR}" style="animation-delay:-2.7s"/></g>
  <g transform="translate(291 186) scale(.7)"><path class="fglint" d="${STAR}" style="animation-delay:-4.4s"/></g>
</g></g></g>
${motes}
<g class="hang"><g transform="translate(1335 36) scale(.7)">${charm.svg}</g></g>
<g class="hang2"><g transform="translate(320 34) scale(.86)">${pendant.svg}</g></g>

<circle class="glow" cx="425" cy="642" r="82" fill="url(#glow)"/>
<circle class="flick" cx="425" cy="630" r="44" fill="url(#glow2)"/>
<g transform="translate(264 734)">${books.svg}</g>
<g transform="translate(362 632) scale(.9)">${candle.svg}</g>

${petals}
${sparkles}
`

  return {
    still: `${head}${still}</svg>`,
    live: `${head}${live}</svg>`,
    // 一张图的版本：两层叠不起来时退回用它
    full: `${head}${still}${live}</svg>`,
  }
}
