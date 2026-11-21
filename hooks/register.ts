import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { buildScene } from './scene.js'

// 暖橙：白天是奶油色的纸配暖橙，晚上是暖炭色配橙色的光。
const { theme, problems } = makeColors({
  label: '金色黄昏',
  // 从月窗背景取色：accent 是小克的发色，warning 是金线色。
  roles: { accent: '#e5733a', danger: '#b8323a', success: '#5b8a3c', warning: '#d9a84a', pro: '#8a5fb0' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#f0e8dc',
        'surface-1': '#f5eee4',
        'surface-2': '#faf6ef',
        'text-primary': '#2b2118',
        'text-secondary': '#54463a',
        'text-muted': '#6b5b4d',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        // 底色往背景的夜色靠：偏红棕，不发灰
        // 从背景画实测取色：色相 24°、饱和度约 .2，只按亮度分档，让界面像画的一部分
        'surface-0': '#1c1511',
        'surface-1': '#231b16',
        'surface-2': '#28201b',
        'surface-3': '#2c241e',
        'text-primary': '#f4ebe1',
        'text-secondary': '#d3c6bb',
        'text-muted': '#ae9f93',
      },
    },
  },
})

// 背景：夕阳、金色光环、暖云、金链流苏、开衫绣花、飘落的花瓣（见 scene.js）。
const SCENE = buildScene()

// 面板不磨砂（blur 0），底色再薄一点（.45 会把画洗淡），只够托住文字。
const LOOK: ThemeSetArgs = { colors: theme, backdrop: { scene: 'golden-hour', glass: { blur: 0, opacity: 0.25 } } }

export const register: Register = on => {
  // 设过的主题对之后才连上的桌面端也有效，所以热重载时报"没连上"不用管，也不挂到状态栏。
  // 注意：$ 只能在 hook 里直接用，不能传给自己写的函数，引擎会拒绝加载。
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    await $.theme.set(LOOK)
    $.ui.status(undefined)

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    // 试过 Box 里叠两张 Svg（SCENE.still + SCENE.live）：桌面端画出来动画全停了，所以只用一张
    return h(Svg, { source: SCENE.full, alt: '金色黄昏：拱窗里抱书回望的小克、星月挂饰、书堆和烛台', isInteractive: true })
  })
}
