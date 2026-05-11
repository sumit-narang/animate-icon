import { useState } from 'react'

export default function ToggleDebugger() {
  const [width, setWidth] = useState(32)

  const height = 20
  const knobSize = 14
  const offset = 3
  const translateX = width - offset * 2 - knobSize

  const pillStyle = (on) => ({
    position: 'relative',
    width,
    height,
    borderRadius: height / 2,
    background: on ? '#000000' : 'rgba(0,0,0,0.2)',
    flexShrink: 0,
  })

  const knobStyle = (on) => ({
    position: 'absolute',
    top: offset,
    left: offset,
    width: knobSize,
    height: knobSize,
    borderRadius: '50%',
    background: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    transform: on ? `translateX(${translateX}px)` : 'translateX(0)',
  })

  return (
    <div className="absolute bottom-3 left-[280px] z-20 bg-white/95 border border-zinc-200 rounded-xl shadow-sm text-xs font-mono">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div style={pillStyle(false)}><div style={knobStyle(false)} /></div>
        <div style={pillStyle(true)}><div style={knobStyle(true)} /></div>
        <input type="range" min={24} max={72} step={1} value={width}
          onChange={e => setWidth(parseFloat(e.target.value))}
          className="w-24 cursor-pointer" />
        <span className="text-zinc-600 w-8">{width}px</span>
      </div>
    </div>
  )
}
