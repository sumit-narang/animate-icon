import { useState, useRef, useCallback } from 'react'
import { Squircle } from '@squircle-js/react'
import SVGUploader from './components/SVGUploader'
import SVGPreview from './components/SVGPreview'
import AnimationControls from './components/AnimationControls'
import ExportPanel from './components/ExportPanel'
import MobilePanel from './components/MobilePanel'

const DEFAULT_CONFIG = {
  type: 'spin',
  trigger: 'auto',
  easing: 'power2.inOut',
  duration: 1.2,
  delay: 0,
  stagger: 0.08,
  intensity: 1,
  loop: true,
  yoyo: false,
  strokeColor: '#6366f1',
  strokeWidth: 2,
}

export default function App() {
  const [svgString, setSvgString]       = useState(null)
  const [fileName, setFileName]         = useState('')
  const [config, setConfig]             = useState(DEFAULT_CONFIG)
  const [isPlaying, setIsPlaying]       = useState(false)
  const [panelHovered, setPanelHovered] = useState(false)
  const [canvasDragging, setCanvasDragging] = useState(false)
  const dots = { opacity: 0.2, spacing: 26, radius: 1 }
  const previewRef    = useRef(null)
  const canvasInputRef = useRef(null)

  const handleUpload = (text, name) => { setSvgString(text); setFileName(name); setIsPlaying(false) }
  const handlePlay   = useCallback(() => previewRef.current?.play(),  [])
  const handlePause  = useCallback(() => previewRef.current?.pause(), [])

  const readCanvasFile = (file) => {
    if (!file || (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml')) return
    const reader = new FileReader()
    reader.onload = (e) => handleUpload(e.target.result, file.name)
    reader.readAsText(file)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>

      {/* ── Mobile-only fixed header ─────────────────────────── */}
      <div className="mobile-header">
        <div>
          <h1 style={{ fontSize: '15px', fontWeight: 600, lineHeight: 1, color: 'rgba(var(--color-base),var(--op-heading,0.85))' }}>
            SVG Icon Animator
          </h1>
          <p style={{ fontSize: '12px', marginTop: '6px', color: 'rgba(var(--color-base),var(--op-desc,0.7))' }}>
            Upload, animate, and export SVG icons
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => canvasInputRef.current?.click()}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginRight: '8px' }}
          >
            <img src="/upload.svg" alt="Upload" style={{ width: 'auto', height: '21px', display: 'block' }} />
          </button>
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={!svgString}
            style={{ background: 'none', border: 'none', padding: 0, cursor: svgString ? 'pointer' : 'not-allowed' }}
          >
            <img
              src={!svgString ? '/disabled-play.svg' : isPlaying ? '/pause.svg' : '/play.svg'}
              alt={isPlaying ? 'Pause' : 'Play'}
              style={{ width: '24px', height: '24px', display: 'block' }}
            />
          </button>
        </div>
      </div>

      {/* ── Layout ──────────────────────────────────────────── */}
      <div className="layout-root" style={{ display: 'flex', height: '100vh', boxSizing: 'border-box' }}>

        {/* ── Controls panel ─────────────────────────────────── */}
        <div className="layout-panel" style={{ width: '260px', flexShrink: 0, margin: '12px 0 12px 12px', display: 'flex', flexDirection: 'column' }}>
          <Squircle cornerRadius={20} cornerSmoothing={1}
            className="panel-squircle-outer"
            style={{ flex: 1, background: '#e4e4e7', padding: '1px', display: 'flex', flexDirection: 'column' }}
          >
            <Squircle cornerRadius={20} cornerSmoothing={1}
              className="panel-squircle-inner"
              style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column', minHeight: 0 }}
            >
              {/* Desktop controls */}
              <div
                className="desktop-controls"
                style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
                onMouseEnter={() => setPanelHovered(true)}
                onMouseLeave={() => setPanelHovered(false)}
              >
                <div className="desktop-title" style={{ padding: '16px 16px 14px' }}>
                  <h1 style={{ fontSize: '15px', fontWeight: 600, lineHeight: 1, color: 'rgba(var(--color-base),var(--op-heading,0.85))' }}>
                    SVG Icon Animator
                  </h1>
                  <p style={{ fontSize: '12px', marginTop: '6px', color: 'rgba(var(--color-base),var(--op-desc,0.7))' }}>
                    Upload, animate, and export SVG icons
                  </p>
                </div>
                <div style={{ height: '1px', background: 'rgba(var(--color-base),var(--op-section-div,0.06))' }} />
                <div className={`flex-1 overflow-y-auto panel-scroll${panelHovered ? ' panel-scroll-visible' : ''}`}>
                  <div className="px-4 pt-4 pb-4" style={{ borderBottom: '1px solid rgba(var(--color-base),var(--op-section-div,0.06))' }}>
                    <SVGUploader onUpload={handleUpload} />
                  </div>
                  <AnimationControls
                    config={config}
                    onChange={setConfig}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    isPlaying={isPlaying}
                    hasSVG={!!svgString}
                  />
                  <ExportPanel
                    config={config}
                    previewRef={previewRef}
                    hasSVG={!!svgString}
                    fileName={fileName}
                  />
                  <div style={{ height: '32px' }} />
                </div>
              </div>

              {/* Mobile controls */}
              <div className="mobile-controls">
                <MobilePanel
                  config={config}
                  onChange={setConfig}
                  previewRef={previewRef}
                  hasSVG={!!svgString}
                  fileName={fileName}
                />
              </div>
            </Squircle>
          </Squircle>
        </div>

        {/* ── Preview canvas ─────────────────────────────────── */}
        <main className="layout-canvas" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div
            style={{
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              margin: '12px 12px 12px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-canvas)',
              backgroundImage: `radial-gradient(circle, rgba(var(--color-base),${dots.opacity}) ${dots.radius}px, transparent ${dots.radius}px)`,
              backgroundSize: `${dots.spacing}px ${dots.spacing}px`,
            }}
          >
            {/* Filename pill */}
            {fileName && (
              <div style={{ position: 'absolute', top: '12px', left: 0, right: 0, zIndex: 10, display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', overflow: 'hidden', height: '28px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-panel)' }}>
                  <span style={{ pointerEvents: 'none', whiteSpace: 'nowrap', fontFamily: 'monospace', paddingLeft: '9px', paddingRight: '27px', color: 'rgba(var(--color-base),var(--op-label,0.65))', fontSize: '14px', letterSpacing: '-0.1px' }}>
                    {fileName}
                  </span>
                  <button
                    onClick={() => { setSvgString(null); setFileName(''); setIsPlaying(false) }}
                    style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" strokeWidth="1.8" strokeLinecap="round" stroke="rgba(var(--color-base),0.4)">
                      <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {!svgString && (
              <div
                style={{ position: 'absolute', inset: 0, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => canvasInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setCanvasDragging(true) }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setCanvasDragging(false) }}
                onDrop={(e) => { e.preventDefault(); setCanvasDragging(false); readCanvasFile(e.dataTransfer.files[0]) }}
              >
                <input ref={canvasInputRef} type="file" accept=".svg,image/svg+xml" style={{ display: 'none' }}
                  onChange={(e) => { readCanvasFile(e.target.files[0]); e.target.value = '' }} />
                <div className="upload-empty-state" style={{ position: 'absolute', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', pointerEvents: 'none' }}>
                  <img src="/upload.svg" alt="" />
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(var(--color-base),0.85)' }}>
                      {canvasDragging ? 'Drop SVG here' : 'Upload SVG'}
                    </p>
                    <p style={{ fontSize: '12px', marginTop: '4px', color: 'rgba(var(--color-base),0.5)' }}>Drag & drop or click to browse</p>
                  </div>
                </div>
              </div>
            )}

            {svgString && (
              <>
                {config.trigger !== 'auto' && (
                  <div style={{ position: 'absolute', bottom: '24px', left: 0, right: 0, zIndex: 10, display: 'flex', justifyContent: 'center' }}>
                    <span style={{ fontSize: '14px', color: 'rgba(var(--color-base),0.5)' }}>
                      {config.trigger === 'hover' ? 'Hover to animate' : 'Click to animate'}
                    </span>
                  </div>
                )}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                  <div style={{ width: '240px', height: '240px' }}>
                    <SVGPreview svgString={svgString} config={config} onPlayStateChange={setIsPlaying} previewRef={previewRef} />
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

      </div>
    </div>
  )
}
