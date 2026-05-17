import { useState } from 'react'
import { Squircle } from '@squircle-js/react'

export default function SVGUploader({ onUpload }) {
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [error, setError] = useState('')

  const readFile = (file) => {
    setError('')
    if (!file) return
    if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
      setError('Please upload an SVG file.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => onUpload(e.target.result, file.name)
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    readFile(e.dataTransfer.files[0])
  }

  const handleChange = (e) => {
    readFile(e.target.files[0])
    e.target.value = ''
  }

  return (
    <Squircle asChild cornerRadius={12} cornerSmoothing={1}>
      <label
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false) }}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 select-none p-6 border-2 border-dashed"
        style={{
          borderColor: dragging || hovered
            ? 'rgba(var(--color-base),0.5)'
            : 'rgba(var(--color-base),0.25)',
        }}
      >
        <input
          type="file"
          accept=".svg,image/svg+xml"
          onChange={handleChange}
          className="hidden"
        />

        <img src={import.meta.env.BASE_URL + 'upload.svg'} alt="" className="w-5 h-5" />

        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: 'rgba(var(--color-base),0.85)' }}>
            {dragging ? 'Drop SVG here' : 'Upload SVG'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(var(--color-base),0.5)' }}>Drag & drop or click to browse</p>
        </div>

        {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
      </label>
    </Squircle>
  )
}
