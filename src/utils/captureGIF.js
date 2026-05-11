import GIF from 'gif.js'

const GIF_SIZE = 300
const FPS = 15

function serializeSVGAtSize(svgEl) {
  const clone = svgEl.cloneNode(true)
  clone.setAttribute('width', GIF_SIZE)
  clone.setAttribute('height', GIF_SIZE)
  // Remove inline size overrides that could conflict
  clone.style.removeProperty('width')
  clone.style.removeProperty('height')
  return new XMLSerializer().serializeToString(clone)
}

function renderSVGToCanvas(svgStr, ctx) {
  return new Promise((resolve) => {
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      // White background — GIF has no real alpha support
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, GIF_SIZE, GIF_SIZE)
      ctx.drawImage(img, 0, 0, GIF_SIZE, GIF_SIZE)
      URL.revokeObjectURL(url)
      resolve(true)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(false)
    }
    img.src = url
  })
}

/**
 * Captures GIF by snapshotting the live SVG DOM at regular intervals
 * while the animation is playing. This is the most reliable approach
 * because it captures exactly what's rendered on screen.
 */
export function captureGIF(containerEl, duration, onProgress) {
  return new Promise((resolve, reject) => {
    const svgEl = containerEl?.querySelector('svg')
    if (!svgEl) {
      reject(new Error('No SVG element found in container'))
      return
    }

    const frameDelay = Math.round(1000 / FPS)               // ms between frames
    const captureDuration = Math.min(duration * 1000, 8000) // cap at 8s
    const totalFrames = Math.ceil(captureDuration / frameDelay)

    const canvas = document.createElement('canvas')
    canvas.width = GIF_SIZE
    canvas.height = GIF_SIZE
    const ctx = canvas.getContext('2d')

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: GIF_SIZE,
      height: GIF_SIZE,
      workerScript: '/gif.worker.js',
      background: '#ffffff',
      transparent: null,
      repeat: 0, // 0 = loop forever
    })

    gif.on('finished', (blob) => {
      onProgress?.(100)
      resolve(blob)
    })

    gif.on('error', (err) => {
      reject(err)
    })

    let framesCaptured = 0

    async function captureNextFrame() {
      if (framesCaptured >= totalFrames) {
        // All frames captured — kick off encoding
        onProgress?.(85)
        gif.render()
        return
      }

      const svgStr = serializeSVGAtSize(svgEl)
      const ok = await renderSVGToCanvas(svgStr, ctx)

      if (ok) {
        // copy: true clones the canvas data so gif.js doesn't hold a stale reference
        gif.addFrame(canvas, { copy: true, delay: frameDelay })
      }

      framesCaptured++
      onProgress?.(Math.round((framesCaptured / totalFrames) * 80))

      // Wait exactly one frame interval before the next capture
      setTimeout(captureNextFrame, frameDelay)
    }

    captureNextFrame()
  })
}

export function captureWebM(previewEl, duration, onProgress) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = GIF_SIZE
    canvas.height = GIF_SIZE
    const ctx = canvas.getContext('2d')

    const stream = canvas.captureStream(30)
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
    const chunks = []

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
    recorder.onstop = () => {
      onProgress?.(100)
      resolve(new Blob(chunks, { type: 'video/webm' }))
    }

    recorder.start()

    const startTime = performance.now()
    const captureDuration = Math.min(duration * 1000, 8000)

    function tick() {
      const elapsed = performance.now() - startTime
      if (elapsed >= captureDuration) {
        recorder.stop()
        return
      }

      const svgEl = previewEl?.querySelector('svg')
      if (svgEl) {
        const svgStr = serializeSVGAtSize(svgEl)
        const blob = new Blob([svgStr], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const img = new Image()
        img.onload = () => {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, GIF_SIZE, GIF_SIZE)
          ctx.drawImage(img, 0, 0, GIF_SIZE, GIF_SIZE)
          URL.revokeObjectURL(url)
          onProgress?.(Math.round((elapsed / captureDuration) * 90))
          requestAnimationFrame(tick)
        }
        img.onerror = () => { URL.revokeObjectURL(url); requestAnimationFrame(tick) }
        img.src = url
      } else {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  })
}
