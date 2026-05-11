import { useState } from 'react'
import { Squircle } from '@squircle-js/react'
import ExportPanel from './ExportPanel'

const ANIMATION_TYPES = [
  { id: 'spin', label: 'Spin' }, { id: 'draw', label: 'Draw' },
  { id: 'bounce', label: 'Bounce' }, { id: 'pulse', label: 'Pulse' },
  { id: 'fade', label: 'Fade' }, { id: 'wiggle', label: 'Wiggle' },
  { id: 'shake', label: 'Shake' }, { id: 'flip', label: 'Flip' },
]
const EASINGS = [
  { value: 'power1.inOut',        label: 'Smooth' },
  { value: 'power2.inOut',        label: 'Ease In-Out' },
  { value: 'power3.inOut',        label: 'Strong' },
  { value: 'linear',              label: 'Linear' },
  { value: 'elastic.out(1, 0.4)', label: 'Elastic' },
  { value: 'bounce.out',          label: 'Bounce' },
  { value: 'back.out(1.7)',       label: 'Back' },
  { value: 'circ.inOut',          label: 'Circular' },
]
const TRIGGERS = [
  { id: 'auto',  label: 'Auto' },
  { id: 'hover', label: 'Hover' },
  { id: 'click', label: 'Click' },
]

const B = 'var(--color-base)'
const rowText = { color: `rgba(${B}, var(--op-label, 0.65))`, fontSize: '14px', letterSpacing: '-0.1px' }

function LDivider() {
  return <div style={{ marginLeft: '12px', marginRight: '10px', height: '1px', background: `rgba(${B}, var(--op-divider, 0.05))` }} />
}

function LContainer({ children }) {
  const items = Array.isArray(children) ? children.flat().filter(Boolean) : [children]
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', background: `rgba(${B}, var(--op-surface, 0.08))` }}>
      {items.map((child, i) => (
        <div key={i}>
          {i > 0 && <LDivider />}
          {child}
        </div>
      ))}
    </div>
  )
}

function LRow({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '40px', paddingLeft: '12px', paddingRight: '10px' }}>
      <span style={rowText}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{children}</div>
    </div>
  )
}

function LSliderRow({ label, value, min, max, step, unit, onChange }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '40px', paddingLeft: '12px', paddingRight: '10px',
      background: `linear-gradient(to right, rgba(${B}, var(--op-track, 0.14)) ${pct}%, transparent ${pct}%)`,
    }}>
      <span style={{ position: 'relative', zIndex: 10, pointerEvents: 'none', ...rowText }}>{label}</span>
      <span style={{ position: 'relative', zIndex: 10, pointerEvents: 'none', ...rowText }}>{value}{unit}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
    </div>
  )
}

function LSelect({ value, onChange, options }) {
  const label = options.find(o => o.value === value)?.label ?? ''
  return (
    <div className="l-select" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', overflow: 'hidden', height: '28px', background: 'var(--bg-card)', borderRadius: '8px' }}>
      <span style={{ pointerEvents: 'none', whiteSpace: 'nowrap', paddingLeft: '9px', paddingRight: '27px', ...rowText }}>{label}</span>
      <div style={{ pointerEvents: 'none', position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)' }}>
        <img src="/dropdown.svg" alt="" style={{ height: '13px' }} />
      </div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  )
}

function LToggle({ value, onChange }) {
  return (
    <Squircle asChild cornerRadius={10} cornerSmoothing={1}>
      <button
        onClick={() => onChange(!value)}
        style={{
          position: 'relative', width: '32px', height: '20px', flexShrink: 0, cursor: 'pointer', border: 'none',
          background: value ? '#5c5c60' : '#c8c8cc',
          boxShadow: value
            ? 'inset 0 2px 4px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(255,255,255,0.06), 0 1px 3px rgba(0,0,0,0.2)'
            : 'inset 0 2px 4px rgba(0,0,0,0.18), inset 0 -1px 2px rgba(255,255,255,0.3), 0 1px 3px rgba(0,0,0,0.1)',
          transition: 'background 200ms',
        }}
      >
        <span style={{
          position: 'absolute', width: '16px', height: '16px', top: '2px', left: '2px', borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 32%, #ffffff 0%, #e4e4e4 100%)',
          boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.95), inset 0 -2px 4px rgba(0,0,0,0.14), 0 3px 7px rgba(0,0,0,0.32), 0 1px 2px rgba(0,0,0,0.18)',
          transform: value ? 'translateX(12px)' : 'translateX(0)', transition: 'transform 200ms',
        }} />
      </button>
    </Squircle>
  )
}

const TABS = [
  { id: 'configure', label: 'Configure', icon: '/bottom-configure.svg' },
  { id: 'timing',    label: 'Timing',    icon: '/bottom-timing.svg' },
  { id: 'playback',  label: 'Playback',  icon: '/bottom-playback.svg' },
  { id: 'export',    label: 'Export',    icon: '/bottom-export.svg' },
]

export default function MobilePanel({ config, onChange, previewRef, hasSVG, fileName }) {
  const [activeTab, setActiveTab] = useState('configure')
  const set = (key, val) => onChange({ ...config, [key]: val })

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Tab content */}
      <div style={{ overflowY: 'auto', padding: '12px' }}>
        {activeTab === 'configure' && (
          <LContainer>
            <LRow label="Animation">
              <LSelect value={config.type} onChange={v => set('type', v)} options={ANIMATION_TYPES.map(t => ({ value: t.id, label: t.label }))} />
            </LRow>
            <LRow label="Trigger">
              <LSelect value={config.trigger} onChange={v => set('trigger', v)} options={TRIGGERS.map(t => ({ value: t.id, label: t.label }))} />
            </LRow>
            <LRow label="Easing">
              <LSelect value={config.easing} onChange={v => set('easing', v)} options={EASINGS.map(e => ({ value: e.value, label: e.label }))} />
            </LRow>
          </LContainer>
        )}

        {activeTab === 'timing' && (
          <LContainer>
            <LSliderRow label="Duration"  value={config.duration}  min={0.2} max={5}   step={0.1}  unit="s" onChange={v => set('duration', v)} />
            <LSliderRow label="Delay"     value={config.delay}     min={0}   max={3}   step={0.1}  unit="s" onChange={v => set('delay', v)} />
            <LSliderRow label="Stagger"   value={config.stagger}   min={0}   max={1}   step={0.05} unit="s" onChange={v => set('stagger', v)} />
            <LSliderRow label="Intensity" value={config.intensity} min={0.2} max={3}   step={0.1}  unit="×" onChange={v => set('intensity', v)} />
          </LContainer>
        )}

        {activeTab === 'playback' && (
          <LContainer>
            <LRow label="Loop"><LToggle value={config.loop} onChange={v => set('loop', v)} /></LRow>
            <LRow label="Yoyo"><LToggle value={config.yoyo} onChange={v => set('yoyo', v)} /></LRow>
          </LContainer>
        )}

        {activeTab === 'export' && (
          <ExportPanel config={config} previewRef={previewRef} hasSVG={hasSVG} fileName={fileName} bare />
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderTop: `1px solid rgba(${B}, 0.06)` }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '8px 0 10px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <img src={tab.icon} alt="" style={{ width: '22px', height: '22px', opacity: activeTab === tab.id ? 1 : 0.35 }} />
            <span style={{ fontSize: '11px', fontWeight: activeTab === tab.id ? 600 : 400, color: `rgba(${B}, ${activeTab === tab.id ? 0.85 : 0.4})` }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

    </div>
  )
}
