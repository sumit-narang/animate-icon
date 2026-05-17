import { useState } from 'react'
import { generateCSS, generateGSAP } from '../utils/codeGenerators'
import './ExportPanel.css'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function ExportPanel({ config, previewRef, hasSVG, fileName, bare = false }) {
  const [gifProgress,  setGifProgress]  = useState(null)
  const [webmProgress, setWebmProgress] = useState(null)
  const [cssCopied,       setCssCopied]       = useState(false)
  const [gsapCopied,      setGsapCopied]      = useState(false)
  const [svgCopied,       setSvgCopied]       = useState(false)
  const [svgDownloaded,   setSvgDownloaded]   = useState(false)
  const [gifDownloaded,   setGifDownloaded]   = useState(false)
  const [webmDownloaded,  setWebmDownloaded]  = useState(false)
  const [open,            setOpen]            = useState(false)
  const [category,        setCategory]        = useState('code')

  const baseName = fileName ? fileName.replace(/\.svg$/i, '') : 'animation'
  const copyWith     = async (fn, setFlag) => { await fn(); setFlag(true); setTimeout(() => setFlag(false), 2000) }
  const downloadWith = (fn, setFlag) => { fn(); setFlag(true); setTimeout(() => setFlag(false), 2000) }

  const handleDownloadGIF = async () => {
    if (!previewRef.current?.exportGIF) return
    setGifProgress(0)
    try { const blob = await previewRef.current.exportGIF(p => setGifProgress(p)); if (blob) { downloadBlob(blob, `${baseName}.gif`); setGifDownloaded(true); setTimeout(() => setGifDownloaded(false), 2000) } }
    finally { setGifProgress(null) }
  }

  const handleDownloadWebM = async () => {
    if (!previewRef.current?.exportWebM) return
    setWebmProgress(0)
    try { const blob = await previewRef.current.exportWebM(p => setWebmProgress(p)); if (blob) { downloadBlob(blob, `${baseName}.webm`); setWebmDownloaded(true); setTimeout(() => setWebmDownloaded(false), 2000) } }
    finally { setWebmProgress(null) }
  }

  const handleDownloadSVG = () => {
    const s = previewRef.current?.exportSVG(); if (!s) return
    downloadBlob(new Blob([s], { type: 'image/svg+xml' }), `${baseName}-animated.svg`)
  }

  const categories = [
    {
      id: 'code', label: 'Code',
      buttons: [
        { label: 'Copy CSS',  icon: 'copy', onClick: () => copyWith(() => navigator.clipboard.writeText(generateCSS(config)),  setCssCopied),  copied: cssCopied },
        { label: 'Copy GSAP', icon: 'copy', onClick: () => copyWith(() => navigator.clipboard.writeText(generateGSAP(config)), setGsapCopied), copied: gsapCopied },
      ],
    },
    {
      id: 'svg', label: 'SVG',
      buttons: [
        { label: 'Copy SVG',     icon: 'copy',     onClick: () => copyWith(async () => { const s = previewRef.current?.exportSVG(); if (s) await navigator.clipboard.writeText(s) }, setSvgCopied), copied: svgCopied },
        { label: 'Download SVG', icon: 'download', onClick: () => downloadWith(handleDownloadSVG, setSvgDownloaded), downloaded: svgDownloaded },
      ],
    },
    {
      id: 'raster', label: 'Raster / Video',
      buttons: [
        { label: 'Download GIF',  icon: 'download', onClick: handleDownloadGIF,  busy: gifProgress  !== null && gifProgress  < 100, progress: gifProgress, downloaded: gifDownloaded },
        { label: 'Download WebM', icon: 'download', onClick: handleDownloadWebM, busy: webmProgress !== null && webmProgress < 100, progress: webmProgress, downloaded: webmDownloaded },
      ],
    },
  ]

  const current = categories.find(c => c.id === category)

  const renderContainer = () => (
    <div className="export-container">
      <div className="export-category-row">
        <span className="export-label">Export</span>
        <div className="export-select-wrapper l-select">
          <span className="export-select-text">
            {categories.find(c => c.id === category)?.label}
          </span>
          <div className="export-select-arrow">
            <img src={import.meta.env.BASE_URL + 'dropdown.svg'} alt="" />
          </div>
          <select className="export-select" value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {current.buttons.map(btn => (
        <div key={btn.label} className="export-btn-row">
          <button
            onClick={btn.onClick}
            disabled={!hasSVG || btn.busy}
            className={`export-btn${btn.copied || btn.downloaded ? ' copied' : ''}`}
          >
            {btn.busy && (
              <span className="export-btn-progress" style={{ width: `${btn.progress ?? 0}%` }} />
            )}
            <span className="export-btn-label">
              {btn.busy ? `${btn.progress ?? 0}%` : btn.copied ? 'Copied!' : btn.downloaded ? 'Downloaded!' : btn.label}
            </span>
            <img
              src={import.meta.env.BASE_URL + (btn.copied || btn.downloaded ? 'done.svg' : `${btn.icon}.svg`)}
              alt=""
              className="export-btn-icon"
              style={{ opacity: !hasSVG || btn.busy ? 0.4 : 1 }}
            />
          </button>
        </div>
      ))}
    </div>
  )

  if (bare) return renderContainer()

  return (
    <div>
      <div className="export-divider" />

      <button className="export-header" onClick={() => setOpen(p => !p)}>
        <span className="export-header-title">Export</span>
        <img src={import.meta.env.BASE_URL + 'arrow.svg'} alt="" className={`export-header-arrow ${open ? '' : 'closed'}`} />
      </button>

      {open && (
        <div className="export-body">
          {renderContainer()}
        </div>
      )}
    </div>
  )
}
