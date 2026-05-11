import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { captureGIF, captureWebM } from '../utils/captureGIF'
import { generateEmbeddedSVG } from '../utils/codeGenerators'

function sanitizeSVG(svgString) {
  return svgString.replace(/<script[\s\S]*?<\/script>/gi, '')
}

function getAnimatableEls(svgEl) {
  return [...svgEl.querySelectorAll('path, circle, rect, line, polyline, polygon, ellipse')]
}

function resetStyles(svgEl) {
  if (!svgEl) return
  gsap.set(svgEl, { clearProps: 'all' })
  getAnimatableEls(svgEl).forEach((el) => gsap.set(el, { clearProps: 'all' }))
}

function buildAnimation(svgEl, config) {
  const { type, duration, easing, loop, yoyo, delay, stagger, intensity, strokeColor, strokeWidth } = config
  const els = getAnimatableEls(svgEl)
  if (!els.length) return null

  const repeat = loop ? -1 : 0

  switch (type) {
    case 'draw': {
      els.forEach((el) => {
        const len = el.getTotalLength ? el.getTotalLength() : 200
        el.style.fill = 'none'
        el.style.stroke = strokeColor
        el.style.strokeWidth = strokeWidth + 'px'
        el.style.strokeDasharray = len
        el.style.strokeDashoffset = len
      })
      const tl = gsap.timeline({ repeat, yoyo, delay })
      els.forEach((el, i) => {
        tl.to(el, { strokeDashoffset: 0, duration, ease: easing }, i * stagger)
      })
      return tl
    }
    case 'spin': {
      gsap.set(svgEl, { transformOrigin: '50% 50%', transformBox: 'fill-box' })
      return gsap.to(svgEl, { rotation: 360, duration, ease: 'none', repeat: loop ? -1 : 0, delay })
    }
    case 'bounce': {
      const dist = 20 * intensity
      return gsap.to(svgEl, { y: -dist, duration: duration / 2, ease: 'power2.out', yoyo: true, repeat, delay })
    }
    case 'pulse': {
      const s = 1 + 0.25 * intensity
      gsap.set(svgEl, { transformOrigin: '50% 50%', transformBox: 'fill-box' })
      return gsap.to(svgEl, { scale: s, duration: duration / 2, ease: 'power2.inOut', yoyo: true, repeat, delay })
    }
    case 'fade': {
      return gsap.fromTo(svgEl, { opacity: 0 }, { opacity: 1, duration, ease: easing, repeat, yoyo: yoyo || loop, delay })
    }
    case 'wiggle': {
      const deg = 15 * intensity
      gsap.set(svgEl, { transformOrigin: '50% 100%', transformBox: 'fill-box' })
      const tl = gsap.timeline({ repeat, delay })
      tl.to(svgEl, { rotation: deg,  duration: duration / 4, ease: 'power1.inOut' })
        .to(svgEl, { rotation: -deg, duration: duration / 2, ease: 'power1.inOut' })
        .to(svgEl, { rotation: 0,   duration: duration / 4, ease: 'power1.inOut' })
      return tl
    }
    case 'shake': {
      const dist = 8 * intensity
      const tl = gsap.timeline({ repeat, delay })
      tl.to(svgEl, { x:  dist, duration: duration / 6, ease: 'power1.inOut' })
        .to(svgEl, { x: -dist, duration: duration / 3, ease: 'power1.inOut' })
        .to(svgEl, { x:  dist, duration: duration / 3, ease: 'power1.inOut' })
        .to(svgEl, { x:  0,   duration: duration / 6, ease: 'power1.inOut' })
      return tl
    }
    case 'flip': {
      gsap.set(svgEl, { transformOrigin: '50% 50%', transformBox: 'fill-box' })
      return gsap.to(svgEl, { rotationY: 360, duration, ease: easing, repeat, yoyo, delay })
    }
    default:
      return null
  }
}

export default function SVGPreview({ svgString, config, onPlayStateChange, previewRef }) {
  const containerRef        = useRef(null)
  const animRef             = useRef(null)
  const cleanupListenersRef = useRef(null)
  const stoppedRef          = useRef(false) // true = user explicitly paused/stopped
  const prevSvgRef          = useRef(null)
  const prevTriggerRef      = useRef(config.trigger)
  const configRef           = useRef(config)
  configRef.current = config
  const svgStringRef        = useRef(svgString)
  svgStringRef.current = svgString

  const killAll = () => {
    animRef.current?.kill()
    animRef.current = null
    cleanupListenersRef.current?.()
    cleanupListenersRef.current = null
  }

  const createAnim = (cfg) => {
    const svgEl = containerRef.current?.querySelector('svg')
    if (!svgEl) return null
    resetStyles(svgEl)
    const anim = buildAnimation(svgEl, cfg)
    animRef.current = anim
    return anim
  }

  // Set innerHTML synchronously before the animation effect runs, so querySelector('svg') always finds it
  useLayoutEffect(() => {
    if (!containerRef.current) return
    containerRef.current.innerHTML = sanitizeSVG(svgString)
  }, [svgString])

  useEffect(() => {
    const svgChanged     = svgString      !== prevSvgRef.current
    const triggerChanged = config.trigger !== prevTriggerRef.current
    prevSvgRef.current     = svgString
    prevTriggerRef.current = config.trigger

    // New SVG or trigger switch resets the stopped state → auto-play again
    if (svgChanged || triggerChanged) stoppedRef.current = false

    killAll()

    const { trigger } = config

    if (trigger === 'auto') {
      if (!stoppedRef.current) {
        const anim = createAnim(config)
        if (anim) {
          onPlayStateChange(true)
          if (!config.loop) {
            anim.eventCallback('onComplete', () => onPlayStateChange(false))
          }
        }
      }
    } else {
      onPlayStateChange(false)

      const wrapper = containerRef.current
      if (!wrapper) return

      const handleTrigger = () => {
        const svgEl = wrapper.querySelector('svg')
        if (!svgEl) return
        animRef.current?.kill()
        animRef.current = null
        resetStyles(svgEl)
        const anim = buildAnimation(svgEl, { ...config, loop: false })
        animRef.current = anim
        if (anim) {
          onPlayStateChange(true)
          anim.eventCallback('onComplete', () => onPlayStateChange(false))
        }
      }

      if (trigger === 'hover') {
        const handleLeave = () => {
          animRef.current?.kill()
          animRef.current = null
          const svgEl = wrapper.querySelector('svg')
          if (svgEl) resetStyles(svgEl)
          onPlayStateChange(false)
        }
        wrapper.addEventListener('mouseenter', handleTrigger)
        wrapper.addEventListener('mouseleave', handleLeave)
        cleanupListenersRef.current = () => {
          wrapper.removeEventListener('mouseenter', handleTrigger)
          wrapper.removeEventListener('mouseleave', handleLeave)
        }
      } else {
        wrapper.addEventListener('click', handleTrigger)
        cleanupListenersRef.current = () => wrapper.removeEventListener('click', handleTrigger)
      }
    }

    return killAll
  }, [svgString, config])

  useEffect(() => {
    if (!previewRef) return
    previewRef.current = {
      // Always kill + recreate so play works regardless of whether the previous
      // animation completed, was paused, or never existed
      play: () => {
        stoppedRef.current = false
        killAll()
        const anim = createAnim(configRef.current)
        if (anim) {
          onPlayStateChange(true)
          if (!configRef.current.loop) {
            anim.eventCallback('onComplete', () => onPlayStateChange(false))
          }
        }
      },

      pause: () => {
        stoppedRef.current = true
        animRef.current?.pause()
        onPlayStateChange(false)
      },

      exportGIF: async (onProgress) => {
        const svgEl    = containerRef.current?.querySelector('svg')
        const container = containerRef.current
        if (!svgEl || !container) return null
        killAll()
        resetStyles(svgEl)
        const captureAnim = buildAnimation(svgEl, { ...configRef.current, loop: false, delay: 0 })
        animRef.current = captureAnim
        if (captureAnim) onPlayStateChange(true)
        await new Promise((r) => setTimeout(r, 50))
        const blob = await captureGIF(container, configRef.current.duration, onProgress)
        killAll()
        resetStyles(svgEl)
        const liveAnim = buildAnimation(svgEl, configRef.current)
        animRef.current = liveAnim
        onPlayStateChange(configRef.current.trigger === 'auto' && !!liveAnim)
        return blob
      },

      exportWebM: async (onProgress) => {
        return captureWebM(containerRef.current, configRef.current.duration, onProgress)
      },

      exportSVG: () => {
        const svgEl = containerRef.current?.querySelector('svg')
        if (!svgEl || !svgStringRef.current) return null
        return generateEmbeddedSVG(svgEl, svgStringRef.current, configRef.current)
      },
    }
  })

  return (
    <div
      id="svg-preview-container"
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center ${config.trigger !== 'auto' ? 'cursor-pointer' : ''}`}
    />
  )
}
