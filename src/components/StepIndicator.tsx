import type { Step } from '../lib/types'

const STEPS: { step: Step; label: string }[] = [
  { step: 1, label: 'Source provider' },
  { step: 2, label: 'Select playlists' },
  { step: 3, label: 'Destination' },
]

export function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  s.step < current
                    ? 'bg-indigo-600 text-white'
                    : s.step === current
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/20'
                      : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {s.step}
              </div>
              <span
                className={`hidden text-xs font-medium sm:block ${
                  s.step <= current ? 'text-zinc-100' : 'text-zinc-500'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <div className="mx-3 mb-5 h-0.5 flex-1 rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full bg-indigo-600 transition-all ${
                    s.step < current ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
