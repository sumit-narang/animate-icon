import { useState, useEffect } from 'react'

export const BASE = '30, 31, 32'
export const c = (varName, fallback) => `rgba(${BASE}, var(${varName}, ${fallback}))`

const GROUPS = [
  {
    label: 'Text',
    tokens: [
      { name: '--op-heading', label: 'Heading', fallback: 0.85 },
      { name: '--op-label',   label: 'Label',   fallback: 0.65 },
      { name: '--op-value',   label: 'Value',   fallback: 0.65 },
      { name: '--op-desc',    label: 'Desc',    fallback: 0.70 },
    ],
  },
  {
    label: 'Background',
    tokens: [
      { name: '--op-surface',     label: 'Surface',     fallback: 0.08 },
      { name: '--op-track',       label: 'Track',       fallback: 0.14 },
      { name: '--op-divider',     label: 'Row divider', fallback: 0.05 },
      { name: '--op-section-div', label: 'Section div', fallback: 0.07 },
    ],
  },
]
const TOKENS = GROUPS.flatMap(g => g.tokens)

export default function ColorDebugger() {
  const [open, setOpen] = useState(true)
  const [values, setValues] = useState(
    Object.fromEntries(TOKENS.map(t => [t.name, t.fallback]))
  )

  useEffect(() => {
    TOKENS.forEach(t => {
      document.documentElement.style.setProperty(t.name, values[t.name])
    })
  }, [values])

  const set = (name, val) => setValues(p => ({ ...p, [name]: val }))

  return (
    <div className="absolute bottom-3 left-[280px] z-20 text-xs font-mono shadow-sm">
      <div className="bg-white/95 border border-zinc-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: `rgb(${BASE})` }} />
            <span className="font-semibold text-zinc-700">#1E1F20</span>
          </div>
          <span className="text-zinc-400">{open ? '▲' : '▼'}</span>
        </button>

        {open && (
          <div className="border-t border-zinc-100 pb-3">
            {GROUPS.map((group, gi) => (
              <div key={group.label}>
                {gi > 0 && <div className="border-t border-zinc-100 mx-3 my-2" />}
                <div className="px-3 pt-2 space-y-2">
                  <span className="text-zinc-300 uppercase tracking-wider" style={{ fontSize: '10px' }}>{group.label}</span>
                  {group.tokens.map(t => (
                    <div key={t.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm shrink-0 border border-zinc-200"
                        style={{ background: `rgba(${BASE}, ${values[t.name]})` }}
                      />
                      <span className="text-zinc-500 w-14 shrink-0">{t.label}</span>
                      <input
                        type="range" min={0} max={1} step={0.01}
                        value={values[t.name]}
                        onChange={e => set(t.name, parseFloat(e.target.value))}
                        className="w-24 cursor-pointer"
                      />
                      <span className="text-zinc-600 w-8 text-right">{values[t.name]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
