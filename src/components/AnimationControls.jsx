import { useState } from 'react'
import { Squircle } from '@squircle-js/react'

const ANIMATION_TYPES = [
  { id: 'draw',   label: 'Draw' },
  { id: 'spin',   label: 'Spin' },
  { id: 'bounce', label: 'Bounce' },
  { id: 'pulse',  label: 'Pulse' },
  { id: 'fade',   label: 'Fade' },
  { id: 'wiggle', label: 'Wiggle' },
  { id: 'shake',  label: 'Shake' },
  { id: 'flip',   label: 'Flip' },
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

const ORIGINS = [
  { value: 'center',       label: 'Center' },
  { value: 'top',          label: 'Top' },
  { value: 'bottom',       label: 'Bottom' },
  { value: 'left',         label: 'Left' },
  { value: 'right',        label: 'Right' },
  { value: 'top-left',     label: 'Top Left' },
  { value: 'top-right',    label: 'Top Right' },
  { value: 'bottom-left',  label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
]

const DIRECTIONS = [
  { value: 'normal',  label: 'Normal' },
  { value: 'reverse', label: 'Reverse' },
]

const B = 'var(--color-base)'
const rowText = { color: `rgba(${B}, var(--op-label, 0.65))`, fontSize: '0.875rem', letterSpacing: '-0.1px' }

function LDivider() {
  return <div style={{ marginLeft: '12px', marginRight: '10px', height: '1px', background: `rgba(${B}, var(--op-divider, 0.05))` }} />
}

function LContainer({ children }) {
  const items = Array.isArray(children) ? children.flat().filter(Boolean) : [children]
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: `rgba(${B}, var(--op-surface, 0.08))` }}>
      {items.map((child, i) => (
        <div key={i}>
          {i > 0 && <LDivider />}
          {child}
        </div>
      ))}
    </div>
  )
}

function LSection({ title, children, open, onToggle }) {
  return (
    <div>
      <div style={{ height: '1px', background: `rgba(${B}, var(--op-section-div, 0.06))` }} />
      <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2.5">
        <span className="text-sm font-medium" style={{ color: `rgba(${B}, var(--op-heading, 0.85))` }}>{title}</span>
        <img src={import.meta.env.BASE_URL + 'arrow.svg'} alt="" style={{ height: '7px' }} className={`transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  )
}

function LRow({ label, children }) {
  return (
    <div className="flex items-center justify-between" style={{ height: '40px', paddingLeft: '12px', paddingRight: '10px' }}>
      <span style={rowText}>{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

function LSliderRow({ label, value, min, max, step, unit, onChange }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div
      className="relative flex items-center justify-between"
      style={{
        height: '40px',
        paddingLeft: '12px',
        paddingRight: '10px',
        background: `linear-gradient(to right, rgba(${B}, var(--op-track, 0.14)) ${pct}%, transparent ${pct}%)`,
      }}
    >
      <span className="relative z-10 pointer-events-none" style={rowText}>{label}</span>
      <span className="relative z-10 pointer-events-none tabular-nums" style={{ ...rowText, color: `rgba(${B}, var(--op-value, 0.65))` }}>{value}{unit}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  )
}

function LSelect({ value, onChange, options }) {
  const label = options.find(o => o.value === value)?.label ?? ''
  return (
    <div className="l-select relative inline-flex items-center overflow-hidden" style={{ height: '28px', background: 'var(--bg-card)', borderRadius: '8px' }}>
      <span className="pointer-events-none whitespace-nowrap" style={{ paddingLeft: '9px', paddingRight: '27px', ...rowText }}>{label}</span>
      <div className="pointer-events-none absolute" style={{ right: '9px', top: '50%', transform: 'translateY(-50%)' }}>
        <img src={import.meta.env.BASE_URL + 'dropdown.svg'} alt="" style={{ height: '13px' }} />
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
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
        className="relative flex-shrink-0 cursor-pointer"
        style={{
          width: '32px',
          height: '20px',
          background: value ? '#5c5c60' : '#c8c8cc',
          boxShadow: value
            ? 'inset 0 2px 4px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(255,255,255,0.06), 0 1px 3px rgba(0,0,0,0.2)'
            : 'inset 0 2px 4px rgba(0,0,0,0.18), inset 0 -1px 2px rgba(255,255,255,0.3), 0 1px 3px rgba(0,0,0,0.1)',
          transition: 'background 200ms',
        }}
      >
        <span
          className="absolute rounded-full"
          style={{
            width: '16px',
            height: '16px',
            top: '2px',
            left: '2px',
            background: 'radial-gradient(circle at 38% 32%, #ffffff 0%, #e4e4e4 100%)',
            boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.95), inset 0 -2px 4px rgba(0,0,0,0.14), 0 3px 7px rgba(0,0,0,0.32), 0 1px 2px rgba(0,0,0,0.18)',
            transform: value ? 'translateX(12px)' : 'translateX(0)',
            transition: 'transform 200ms',
          }}
        />
      </button>
    </Squircle>
  )
}

export default function AnimationControls({ config, onChange, onPlay, onPause, isPlaying, hasSVG }) {
  const set = (key, val) => onChange({ ...config, [key]: val })
  const [open, setOpen] = useState({ config: true, timing: true, playback: false })
  const toggle = k => setOpen(p => ({ ...p, [k]: !p[k] }))

  return (
    <div className="pb-2">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-sm font-medium" style={{ color: `rgba(${B}, var(--op-heading, 0.85))` }}>Controls</span>
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={!hasSVG}
          title={isPlaying ? 'Pause' : 'Play'}
          className={hasSVG ? 'cursor-pointer' : 'cursor-not-allowed'}
        >
          <img
            src={import.meta.env.BASE_URL + (!hasSVG ? 'disabled-play.svg' : isPlaying ? 'pause.svg' : 'play.svg')}
            alt={isPlaying ? 'Pause' : 'Play'}
            style={{ width: '24px', height: '24px' }}
          />
        </button>
      </div>

      {/* Configuration */}
      <LSection title="Configuration" open={open.config} onToggle={() => toggle('config')}>
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
          <LRow label="Anchor">
            <LSelect value={config.origin} onChange={v => set('origin', v)} options={ORIGINS.map(o => ({ value: o.value, label: o.label }))} />
          </LRow>
        </LContainer>
      </LSection>

      {/* Timing */}
      <LSection title="Timing" open={open.timing} onToggle={() => toggle('timing')}>
        <LContainer>
          <LSliderRow label="Duration"  value={config.duration}  min={0.2} max={5}   step={0.1}  unit="s"  onChange={v => set('duration', v)} />
          <LSliderRow label="Delay"     value={config.delay}     min={0}   max={3}   step={0.1}  unit="s"  onChange={v => set('delay', v)} />
          <LSliderRow label="Stagger"   value={config.stagger}   min={0}   max={1}   step={0.05} unit="s"  onChange={v => set('stagger', v)} />
          <LSliderRow label="Intensity" value={config.intensity} min={0.2} max={3}   step={0.1}  unit="×"  onChange={v => set('intensity', v)} />
        </LContainer>
      </LSection>

      {/* Playback */}
      <LSection title="Playback" open={open.playback} onToggle={() => toggle('playback')}>
        <LContainer>
          <LRow label="Loop"><LToggle value={config.loop} onChange={v => set('loop', v)} /></LRow>
          {!config.loop && (
            <LSliderRow label="Repeat" value={config.repeat} min={0} max={10} step={1} unit="×" onChange={v => set('repeat', v)} />
          )}
          <LSliderRow label="Repeat Delay" value={config.repeatDelay} min={0} max={3} step={0.1} unit="s" onChange={v => set('repeatDelay', v)} />
          <LRow label="Direction">
            <LSelect value={config.direction} onChange={v => set('direction', v)} options={DIRECTIONS.map(d => ({ value: d.value, label: d.label }))} />
          </LRow>
          <LRow label="Yoyo"><LToggle value={config.yoyo} onChange={v => set('yoyo', v)} /></LRow>
        </LContainer>
      </LSection>
    </div>
  )
}
