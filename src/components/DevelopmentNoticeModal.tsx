import { useState } from 'react'

const DISMISSED_KEY = 'pt_dev_notice_dismissed'

interface DevelopmentNoticeModalProps {
  open: boolean
  onClose: () => void
}

export function DevelopmentNoticeModal({ open, onClose }: DevelopmentNoticeModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  if (!open) return null

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(DISMISSED_KEY, 'true')
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Development notice"
        className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
      >
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.3 3.9l-8.1 14a2 2 0 001.8 3h16.9a2 2 0 001.8-3l-8.1-14a2 2 0 00-3.5 0z"
            />
          </svg>
          <span className="font-semibold">Development stage app</span>
        </div>

        <h2 className="mt-4 text-lg font-semibold text-white">Heads up</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          This app is still in its development stage. As a result, some features
          may require approval before they can be used. Thank you for trying it
          out!
        </p>

        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-indigo-500"
          />
          Don't show this again
        </label>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClose}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}