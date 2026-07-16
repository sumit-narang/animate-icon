const EASING_TO_CSS = {
  'power1.inOut': 'ease',
  'power2.inOut': 'ease-in-out',
  'power3.inOut': 'cubic-bezier(0.65, 0, 0.35, 1)',
  'linear': 'linear',
  'elastic.out(1, 0.4)': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'bounce.out': 'cubic-bezier(0.36, 0.07, 0.19, 0.97)',
  'back.out(1.7)': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'circ.inOut': 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
}

// transform-origin anchor mappings (shared by preview + generators)
export const ORIGIN_GSAP = {
  center: '50% 50%',
  top: '50% 0%',
  bottom: '50% 100%',
  left: '0% 50%',
  right: '100% 50%',
  'top-left': '0% 0%',
  'top-right': '100% 0%',
  'bottom-left': '0% 100%',
  'bottom-right': '100% 100%',
}
export const ORIGIN_CSS = {
  center: 'center',
  top: 'center top',
  bottom: 'center bottom',
  left: 'left center',
  right: 'right center',
  'top-left': 'left top',
  'top-right': 'right top',
  'bottom-left': 'left bottom',
  'bottom-right': 'right bottom',
}

function originCss(config) {
  return ORIGIN_CSS[config.origin] ?? 'center'
}
function originGsap(config) {
  return ORIGIN_GSAP[config.origin] ?? '50% 50%'
}

function cssEase(config) {
  if (config.easing === 'custom') {
    const [a, b, c, d] = config.customEase ?? [0.4, 0, 0.2, 1]
    return `cubic-bezier(${a}, ${b}, ${c}, ${d})`
  }
  return EASING_TO_CSS[config.easing] ?? 'ease-in-out'
}

// GSAP ease as a code string. Custom eases reference a CustomEase created in the header.
function gsapEase(config) {
  return config.easing === 'custom' ? 'customEase' : `'${config.easing}'`
}
function gsapCustomEaseHeader(config) {
  if (config.easing !== 'custom') return ''
  const [a, b, c, d] = config.customEase ?? [0.4, 0, 0.2, 1]
  return `import { CustomEase } from 'gsap/CustomEase'
gsap.registerPlugin(CustomEase)

const customEase = CustomEase.create('custom', 'M0,0 C${a},${b} ${c},${d} 1,1')
`
}

function cssIterations(config) {
  return config.loop ? 'infinite' : String((config.repeat ?? 0) + 1)
}

function cssDirection(config) {
  const rev = config.direction === 'reverse'
  if (config.yoyo) return rev ? 'alternate-reverse' : 'alternate'
  return rev ? 'reverse' : 'normal'
}

// CSS animations can't pause between iterations — flag it so the export is honest.
function repeatDelayNote(config) {
  return config.repeatDelay > 0
    ? `/* Note: repeat delay (${config.repeatDelay}s) isn't supported by CSS animations — use the GSAP export for that. */\n\n`
    : ''
}

function gsapRepeat(config) {
  return config.loop ? -1 : (config.repeat ?? 0)
}
// GSAP: play a (looping) animation in reverse by seeking to the end and inverting time.
function gsapReverse(varName, config) {
  return config.direction === 'reverse'
    ? `\n\n${varName}.progress(1).timeScale(-1) // play in reverse`
    : ''
}

export function generateCSS(config) {
  const { type, duration, strokeColor, strokeWidth, stagger, intensity } = config
  const ease = cssEase(config)
  const iter = cssIterations(config)
  const dir  = cssDirection(config)
  const org  = originCss(config)
  const note = repeatDelayNote(config)

  switch (type) {
    case 'draw':
      return `${note}/* 1. Measure each path's length in JS:
   el.style.setProperty('--len', el.getTotalLength()) */

.icon path,
.icon circle,
.icon rect,
.icon ellipse,
.icon line,
.icon polyline,
.icon polygon {
  fill: none;
  stroke: ${strokeColor};
  stroke-width: ${strokeWidth}px;
  stroke-dasharray: var(--len, 200);
  stroke-dashoffset: var(--len, 200);
  animation: svg-draw ${duration}s ${ease} ${iter} ${dir} forwards;
}

@keyframes svg-draw {
  to { stroke-dashoffset: 0; }
}

/* Stagger each child (optional) */
.icon :nth-child(1) { animation-delay: 0s; }
.icon :nth-child(2) { animation-delay: ${stagger}s; }
.icon :nth-child(3) { animation-delay: ${stagger * 2}s; }
/* …add more as needed */`

    case 'spin':
      return `${note}.icon {
  transform-box: fill-box;
  transform-origin: ${org};
  animation: svg-spin ${duration}s linear ${iter} ${dir};
}

@keyframes svg-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}`

    case 'bounce': {
      const dist = Math.round(20 * intensity)
      return `${note}.icon {
  transform-box: fill-box;
  transform-origin: ${org};
  animation: svg-bounce ${duration}s ${ease} ${iter} ${dir};
}

@keyframes svg-bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-${dist}px); }
}`
    }

    case 'pulse': {
      const s = (1 + 0.25 * intensity).toFixed(2)
      return `${note}.icon {
  transform-box: fill-box;
  transform-origin: ${org};
  animation: svg-pulse ${duration}s ${ease} ${iter} ${dir};
}

@keyframes svg-pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(${s}); }
}`
    }

    case 'fade':
      return `${note}.icon {
  animation: svg-fade ${duration}s ${ease} ${iter} ${dir};
}

@keyframes svg-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}`

    case 'wiggle': {
      const deg = Math.round(15 * intensity)
      return `${note}.icon {
  transform-box: fill-box;
  transform-origin: ${org};
  animation: svg-wiggle ${duration}s ${ease} ${iter} ${dir};
}

@keyframes svg-wiggle {
  0%   { transform: rotate(0deg); }
  25%  { transform: rotate(${deg}deg); }
  75%  { transform: rotate(-${deg}deg); }
  100% { transform: rotate(0deg); }
}`
    }

    case 'shake': {
      const dist = Math.round(8 * intensity)
      return `${note}.icon {
  animation: svg-shake ${duration}s ${ease} ${iter} ${dir};
}

@keyframes svg-shake {
  0%, 100% { transform: translateX(0); }
  16%  { transform: translateX(${dist}px); }
  33%  { transform: translateX(-${dist}px); }
  50%  { transform: translateX(${dist}px); }
  66%  { transform: translateX(-${dist}px); }
  83%  { transform: translateX(${dist}px); }
}`
    }

    case 'flip':
      return `${note}.icon {
  transform-box: fill-box;
  transform-origin: ${org};
  animation: svg-flip ${duration}s ${ease} ${iter} ${dir};
}

@keyframes svg-flip {
  from { transform: rotateY(0deg); }
  to   { transform: rotateY(360deg); }
}`

    default:
      return '/* No CSS generated for this animation type */'
  }
}

export function generateGSAP(config) {
  const { type, duration, delay, stagger, strokeColor, strokeWidth, intensity, repeatDelay } = config
  const repeat = gsapRepeat(config)
  const ease = gsapEase(config)
  const org = originGsap(config)
  const rd = repeatDelay || 0

  const header = `import gsap from 'gsap'
${gsapCustomEaseHeader(config)}
const icon = document.querySelector('.icon') // your SVG element
`

  switch (type) {
    case 'draw':
      return `${header}
const paths = icon.querySelectorAll('path, circle, rect, ellipse, line, polyline, polygon')

// Set up draw effect
paths.forEach((el) => {
  const len = el.getTotalLength()
  el.style.fill = 'none'
  el.style.stroke = '${strokeColor}'
  el.style.strokeWidth = '${strokeWidth}px'
  el.style.strokeDasharray = len
  el.style.strokeDashoffset = len
})

// Animate
const tl = gsap.timeline({ repeat: ${repeat}, repeatDelay: ${rd}, yoyo: ${config.yoyo}, delay: ${delay} })

paths.forEach((el, i) => {
  tl.to(el, {
    strokeDashoffset: 0,
    duration: ${duration},
    ease: ${ease},
  }, i * ${stagger})
})${gsapReverse('tl', config)}`

    case 'spin':
      return `${header}
gsap.set(icon, { transformOrigin: '${org}', transformBox: 'fill-box' })

const anim = gsap.to(icon, {
  rotation: 360,
  duration: ${duration},
  ease: 'none',
  repeat: ${repeat},
  repeatDelay: ${rd},
  delay: ${delay},
})${gsapReverse('anim', config)}`

    case 'bounce': {
      const dist = 20 * intensity
      return `${header}
gsap.set(icon, { transformOrigin: '${org}', transformBox: 'fill-box' })

const anim = gsap.to(icon, {
  y: ${-dist},
  duration: ${(duration / 2).toFixed(2)},
  ease: 'power2.out',
  yoyo: true,
  repeat: ${repeat < 0 ? -1 : repeat * 2 + 1},
  repeatDelay: ${rd},
  delay: ${delay},
})${gsapReverse('anim', config)}`
    }

    case 'pulse': {
      const s = 1 + 0.25 * intensity
      return `${header}
gsap.set(icon, { transformOrigin: '${org}', transformBox: 'fill-box' })

const anim = gsap.to(icon, {
  scale: ${s.toFixed(2)},
  duration: ${(duration / 2).toFixed(2)},
  ease: 'power2.inOut',
  yoyo: true,
  repeat: ${repeat < 0 ? -1 : repeat * 2 + 1},
  repeatDelay: ${rd},
  delay: ${delay},
})${gsapReverse('anim', config)}`
    }

    case 'fade':
      return `${header}
const anim = gsap.fromTo(icon,
  { opacity: 0 },
  {
    opacity: 1,
    duration: ${duration},
    ease: ${ease},
    repeat: ${repeat},
    repeatDelay: ${rd},
    yoyo: ${config.yoyo || config.loop},
    delay: ${delay},
  }
)${gsapReverse('anim', config)}`

    case 'wiggle': {
      const deg = 15 * intensity
      return `${header}
gsap.set(icon, { transformOrigin: '${org}', transformBox: 'fill-box' })

const tl = gsap.timeline({ repeat: ${repeat}, repeatDelay: ${rd}, delay: ${delay} })
tl.to(icon, { rotation: ${deg},   duration: ${(duration / 4).toFixed(2)}, ease: 'power1.inOut' })
  .to(icon, { rotation: ${-deg},  duration: ${(duration / 2).toFixed(2)}, ease: 'power1.inOut' })
  .to(icon, { rotation: 0,        duration: ${(duration / 4).toFixed(2)}, ease: 'power1.inOut' })${gsapReverse('tl', config)}`
    }

    case 'shake': {
      const dist = 8 * intensity
      return `${header}
const tl = gsap.timeline({ repeat: ${repeat}, repeatDelay: ${rd}, delay: ${delay} })
tl.to(icon, { x:  ${dist},  duration: ${(duration / 6).toFixed(2)}, ease: 'power1.inOut' })
  .to(icon, { x: ${-dist},  duration: ${(duration / 3).toFixed(2)}, ease: 'power1.inOut' })
  .to(icon, { x:  ${dist},  duration: ${(duration / 3).toFixed(2)}, ease: 'power1.inOut' })
  .to(icon, { x:  0,        duration: ${(duration / 6).toFixed(2)}, ease: 'power1.inOut' })${gsapReverse('tl', config)}`
    }

    case 'flip':
      return `${header}
gsap.set(icon, { transformOrigin: '${org}', transformBox: 'fill-box' })

const anim = gsap.to(icon, {
  rotationY: 360,
  duration: ${duration},
  ease: ${ease},
  repeat: ${repeat},
  repeatDelay: ${rd},
  yoyo: ${config.yoyo},
  delay: ${delay},
})${gsapReverse('anim', config)}`

    default:
      return '// No GSAP code for this animation type'
  }
}

/**
 * Generates a standalone SVG string with CSS animation embedded inside a <style> block.
 * - For "draw": uses actual getTotalLength() values from the live DOM elements.
 * - For all others: applies animation to the root <svg> element.
 *
 * @param {SVGElement} liveSvgEl  - The live SVG element in the DOM (for getTotalLength)
 * @param {string}     svgString  - Original SVG text (used as a clean base)
 * @param {object}     config     - Animation config
 * @returns {string|null}          - Serialized SVG string, or null on parse error
 */
export function generateEmbeddedSVG(liveSvgEl, svgString, config) {
  const { type, duration, delay, stagger, intensity, strokeColor, strokeWidth } = config

  const ease = cssEase(config)
  const iter = cssIterations(config)
  const dir  = cssDirection(config)
  const org  = originCss(config)

  // Parse a clean copy of the SVG (no GSAP inline styles)
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svg = doc.documentElement

  if (svg.tagName === 'parsererror' || !svg.querySelector) return null

  const EL_SELECTOR = 'path, circle, rect, line, polyline, polygon, ellipse'
  let css = ''

  if (type === 'draw') {
    const liveEls  = [...liveSvgEl.querySelectorAll(EL_SELECTOR)]
    const freshEls = [...svg.querySelectorAll(EL_SELECTOR)]

    freshEls.forEach((el, i) => {
      const len = liveEls[i]?.getTotalLength ? liveEls[i].getTotalLength() : 200
      const cls = `_sa${i}`
      el.setAttribute('class', [el.getAttribute('class'), cls].filter(Boolean).join(' '))
      el.setAttribute('fill', 'none')
      el.setAttribute('stroke', strokeColor)
      el.setAttribute('stroke-width', strokeWidth)
      el.setAttribute('stroke-dasharray', len)
      el.setAttribute('stroke-dashoffset', len)
      const d = ((i * stagger) + delay).toFixed(2)
      css += `._sa${i}{animation:_draw ${duration}s ${ease} ${iter} ${dir} both;animation-delay:${d}s}\n`
    })

    css += `@keyframes _draw{to{stroke-dashoffset:0}}`

  } else {
    svg.setAttribute('class', [svg.getAttribute('class'), '_sa'].filter(Boolean).join(' '))

    switch (type) {
      case 'spin':
        css = `._sa{transform-box:fill-box;transform-origin:${org};animation:_spin ${duration}s linear ${iter} ${dir}}` +
              `@keyframes _spin{to{transform:rotate(360deg)}}`
        break

      case 'bounce': {
        const dist = Math.round(20 * intensity)
        css = `._sa{transform-box:fill-box;transform-origin:${org};animation:_bounce ${duration}s ${ease} ${iter} ${dir}}` +
              `@keyframes _bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-${dist}px)}}`
        break
      }

      case 'pulse': {
        const s = (1 + 0.25 * intensity).toFixed(2)
        css = `._sa{transform-box:fill-box;transform-origin:${org};animation:_pulse ${duration}s ${ease} ${iter} ${dir}}` +
              `@keyframes _pulse{0%,100%{transform:scale(1)}50%{transform:scale(${s})}}`
        break
      }

      case 'fade':
        css = `._sa{animation:_fade ${duration}s ${ease} ${iter} ${dir}}` +
              `@keyframes _fade{from{opacity:0}to{opacity:1}}`
        break

      case 'wiggle': {
        const deg = Math.round(15 * intensity)
        css = `._sa{transform-box:fill-box;transform-origin:${org};animation:_wiggle ${duration}s ${ease} ${iter} ${dir}}` +
              `@keyframes _wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(${deg}deg)}75%{transform:rotate(${-deg}deg)}}`
        break
      }

      case 'shake': {
        const dist = Math.round(8 * intensity)
        css = `._sa{animation:_shake ${duration}s ${ease} ${iter} ${dir}}` +
              `@keyframes _shake{0%,100%{transform:translateX(0)}16%{transform:translateX(${dist}px)}33%{transform:translateX(${-dist}px)}50%{transform:translateX(${dist}px)}66%{transform:translateX(${-dist}px)}83%{transform:translateX(${dist}px)}}`
        break
      }

      case 'flip':
        css = `._sa{transform-box:fill-box;transform-origin:${org};animation:_flip ${duration}s ${ease} ${iter} ${dir}}` +
              `@keyframes _flip{from{transform:rotateY(0)}to{transform:rotateY(360deg)}}`
        break

      default:
        css = '/* animation not supported for embedded SVG */'
    }
  }

  // Inject <style> as first child of <svg>
  const styleEl = doc.createElementNS('http://www.w3.org/2000/svg', 'style')
  styleEl.textContent = css
  svg.insertBefore(styleEl, svg.firstChild)

  return new XMLSerializer().serializeToString(svg)
}
